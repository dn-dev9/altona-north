import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { format, parseISO, differenceInCalendarDays } from 'date-fns'
import { supabaseServer } from '@/lib/supabase'

async function requireAdmin(request: Request) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { data: { user }, error } = await supabaseServer.auth.getUser(token)
    if (error || !user) return null
    return user
}

// Admin: list all bookings newest-first
export async function GET(request: Request) {
    try {
        const user = await requireAdmin(request)
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data, error } = await supabaseServer
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json(data ?? [])
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Public: create a pending booking (called by the checkout route after creating the PayPal order)
export async function POST(request: Request) {
    try {
        const body: {
            checkin: string
            checkout: string
            guests: number
            guest_name: string
            guest_email: string
            guest_phone: string
            special_requests?: string
            total_eur: number
            paypal_order_id?: string
        } = await request.json()

        const { data, error } = await supabaseServer
            .from('bookings')
            .insert({
                checkin: body.checkin,
                checkout: body.checkout,
                guests: body.guests,
                guest_name: body.guest_name,
                guest_email: body.guest_email,
                guest_phone: body.guest_phone,
                special_requests: body.special_requests ?? '',
                total_eur: body.total_eur,
                paypal_order_id: body.paypal_order_id ?? null,
                status: 'pending',
            })
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Admin: update booking status
export async function PATCH(request: Request) {
    try {
        const user = await requireAdmin(request)
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body: { id: string; status: 'confirmed' | 'cancelled' } = await request.json()

        // Fetch current booking to check previous status before updating
        const { data: booking, error: fetchError } = await supabaseServer
            .from('bookings')
            .select('*')
            .eq('id', body.id)
            .single()

        if (fetchError || !booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

        const { error } = await supabaseServer
            .from('bookings')
            .update({ status: body.status })
            .eq('id', body.id)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        // Send cancellation email only when cancelling a previously confirmed booking
        if (body.status === 'cancelled' && booking.status === 'confirmed') {
            try {
                await sendCancellationEmail(booking)
            } catch {
                // Email failure doesn't affect the response
            }
        }

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

async function sendCancellationEmail(booking: {
    checkin: string
    checkout: string
    guests: number
    guest_name: string
    guest_email: string
    total_eur: number
}) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const from = process.env.RESEND_FROM_EMAIL ?? 'noreply@resend.dev'

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

    await resend.emails.send({
        from,
        to: booking.guest_email,
        subject: `Booking cancelled – Altona North · ${checkinFmt}`,
        html: `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
  <h2 style="color:#1a1a1a">Your booking has been cancelled</h2>
  <p>Hi ${booking.guest_name},</p>
  <p>We're sorry to inform you that your reservation at <strong>Altona North</strong> has been cancelled. A full refund of <strong>€${totalEur}</strong> will be returned to your original payment method.</p>
  <table style="width:100%;border-collapse:collapse;margin:20px 0">
    <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Check-in</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600">${checkinFmt}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Check-out</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600">${checkoutFmt}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Nights</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600">${nights}</td></tr>
    <tr><td style="padding:8px 0;color:#666">Refund amount</td><td style="padding:8px 0;font-weight:600">€${totalEur}</td></tr>
  </table>
  <p style="color:#666;font-size:14px">We hope to welcome you another time.</p>
  ${contactFooter}
</div>`,
    })
}