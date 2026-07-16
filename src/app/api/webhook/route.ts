import { NextResponse } from 'next/server'
import { Client, Environment, OrdersController } from '@paypal/paypal-server-sdk'
import { Resend } from 'resend'
import { format, parseISO, differenceInCalendarDays } from 'date-fns'
import { supabaseServer } from '@/lib/supabase'

function makePaypalClient() {
    return new Client({
        environment:
            process.env.PAYPAL_ENVIRONMENT === 'production'
                ? Environment.Production
                : Environment.Sandbox,
        clientCredentialsAuthCredentials: {
            oAuthClientId: process.env.PAYPAL_CLIENT_ID!,
            oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
        },
    })
}

export async function POST(request: Request) {
    try {
        const body = await request.text()
        const event = JSON.parse(body) as {
            event_type: string
            resource: {
                id: string
                status?: string
                [key: string]: unknown
            }
        }

        // Only process order-approved events
        if (event.event_type !== 'CHECKOUT.ORDER.APPROVED') {
            return NextResponse.json({ received: true })
        }

        const orderId = event.resource.id
        if (!orderId) return NextResponse.json({ received: true })

        // Capture the PayPal order
        const controller = new OrdersController(makePaypalClient())
        let captureId: string | undefined

        try {
            const { result: capture } = await controller.captureOrder({ id: orderId })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            captureId = (capture?.purchaseUnits?.[0] as any)?.payments?.captures?.[0]?.id as string | undefined
        } catch {
            // Capture failed — leave booking as pending, owner can follow up
            return NextResponse.json({ received: true })
        }

        // Find the booking
        const { data: booking, error: fetchError } = await supabaseServer
            .from('bookings')
            .select('*')
            .eq('paypal_order_id', orderId)
            .single()

        if (fetchError || !booking) return NextResponse.json({ received: true })

        // Idempotency — already confirmed
        if (booking.status === 'confirmed') return NextResponse.json({ received: true })

        // Confirm the booking
        await supabaseServer
            .from('bookings')
            .update({
                status: 'confirmed',
                ...(captureId ? { paypal_capture_id: captureId } : {}),
            })
            .eq('id', booking.id)

        // Send emails (non-blocking — don't fail the webhook if email fails)
        try {
            await sendEmails(booking)
        } catch {
            // Email failure is logged but doesn't affect the response
        }

        return NextResponse.json({ received: true })
    } catch {
        return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
    }
}

async function sendEmails(booking: {
    checkin: string
    checkout: string
    guests: number
    guest_name: string
    guest_email: string
    guest_phone: string
    total_eur: number
    special_requests: string
}) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const from = process.env.RESEND_FROM_EMAIL ?? 'noreply@resend.dev'
    const ownerEmail = process.env.CONTACT_EMAIL ?? ''

    const nights = differenceInCalendarDays(parseISO(booking.checkout), parseISO(booking.checkin))
    const checkinFmt = format(parseISO(booking.checkin), 'd MMM yyyy')
    const checkoutFmt = format(parseISO(booking.checkout), 'd MMM yyyy')
    const totalEur = Math.round(booking.total_eur / 100)

    const { data: settings } = await supabaseServer
        .from('settings')
        .select('whatsapp, contact_email')
        .eq('id', 1)
        .single()

    const waNumber = settings?.whatsapp ? settings.whatsapp.replace(/\D/g, '') : ''
    const contactFooter = `
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:13px;color:#666">
    <p style="margin:0 0 6px"><strong>Need to reach us?</strong></p>
    ${waNumber ? `<p style="margin:0 0 4px">WhatsApp: <a href="https://wa.me/${waNumber}" style="color:#25D366;text-decoration:none">${settings!.whatsapp}</a></p>` : ''}
    ${settings?.contact_email ? `<p style="margin:0">Email: <a href="mailto:${settings.contact_email}" style="color:#3a7a52;text-decoration:none">${settings.contact_email}</a></p>` : ''}
  </div>`

    // Guest confirmation
    await resend.emails.send({
        from,
        to: booking.guest_email,
        subject: `Booking confirmed – Altona North · ${checkinFmt}`,
        html: `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
  <h2 style="color:#1a1a1a">Your booking is confirmed ✓</h2>
  <p>Hi ${booking.guest_name},</p>
  <p>Your stay at <strong>Altona North</strong> is confirmed. Here are your details:</p>
  <table style="width:100%;border-collapse:collapse;margin:20px 0">
    <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Check-in</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600">${checkinFmt} from 15:00</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Check-out</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600">${checkoutFmt} by 11:00</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Guests</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600">${booking.guests}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Nights</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600">${nights}</td></tr>
    <tr><td style="padding:8px 0;color:#666">Total paid</td><td style="padding:8px 0;font-weight:600">€${totalEur}</td></tr>
  </table>
  ${booking.special_requests ? `<p><strong>Special requests:</strong> ${booking.special_requests}</p>` : ''}
  ${contactFooter}
</div>`,
    })

    // Owner notification
    if (ownerEmail) {
        await resend.emails.send({
            from,
            to: ownerEmail,
            subject: `New booking – ${booking.guest_name} · ${checkinFmt}`,
            html: `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
  <h2>New booking confirmed</h2>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="padding:6px 0;color:#666">Guest</td><td style="padding:6px 0;font-weight:600">${booking.guest_name}</td></tr>
    <tr><td style="padding:6px 0;color:#666">Email</td><td style="padding:6px 0">${booking.guest_email}</td></tr>
    <tr><td style="padding:6px 0;color:#666">Phone</td><td style="padding:6px 0">${booking.guest_phone}</td></tr>
    <tr><td style="padding:6px 0;color:#666">Check-in</td><td style="padding:6px 0;font-weight:600">${checkinFmt}</td></tr>
    <tr><td style="padding:6px 0;color:#666">Check-out</td><td style="padding:6px 0;font-weight:600">${checkoutFmt}</td></tr>
    <tr><td style="padding:6px 0;color:#666">Guests</td><td style="padding:6px 0">${booking.guests}</td></tr>
    <tr><td style="padding:6px 0;color:#666">Nights</td><td style="padding:6px 0">${nights}</td></tr>
    <tr><td style="padding:6px 0;color:#666">Total</td><td style="padding:6px 0;font-weight:600">€${totalEur}</td></tr>
    ${booking.special_requests ? `<tr><td style="padding:6px 0;color:#666">Special requests</td><td style="padding:6px 0">${booking.special_requests}</td></tr>` : ''}
  </table>
</div>`,
        })
    }
}
