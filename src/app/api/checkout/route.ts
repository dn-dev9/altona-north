import { NextResponse } from 'next/server'
import {
    Client,
    Environment,
    OrdersController,
    CheckoutPaymentIntent,
} from '@paypal/paypal-server-sdk'
import { addDays, format, parseISO } from 'date-fns'
import { supabaseServer } from '@/lib/supabase'
import { calculatePrice } from '@/lib/pricing'
import type { PricingSettings, PricingOverride } from '@/lib/pricing'

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
        const body: {
            checkin: string
            checkout: string
            guests: number
            guestName: string
            guestEmail: string
            guestPhone: string
            specialRequests?: string
        } = await request.json()

        const {
            checkin,
            checkout,
            guests,
            guestName,
            guestEmail,
            guestPhone,
            specialRequests = '',
        } = body

        if (!checkin || !checkout || !guests || !guestName || !guestEmail || !guestPhone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }
        if (checkout <= checkin) {
            return NextResponse.json({ error: 'Checkout must be after checkin' }, { status: 400 })
        }

        // Delete abandoned pending bookings older than 1 hour before checking availability
        await supabaseServer
            .from('bookings')
            .delete()
            .eq('status', 'pending')
            .lt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

        // Fetch everything needed in parallel
        const [settingsRes, pricingRes, blockedRes, icalRes, overlapRes] = await Promise.all([
            supabaseServer
                .from('settings')
                .select('base_rate, base_occupancy, extra_person_fee, min_nights')
                .eq('id', 1)
                .single(),
            supabaseServer
                .from('pricing')
                .select('date_from, date_to, price_eur, extra_person_fee')
                .order('date_from'),
            supabaseServer.from('blocked_dates').select('date'),
            supabaseServer.from('ical_cache').select('dates').eq('id', 1).single(),
            // Overlapping bookings: existing.checkin < new.checkout AND existing.checkout > new.checkin
            supabaseServer
                .from('bookings')
                .select('id')
                .in('status', ['confirmed', 'pending'])
                .lt('checkin', checkout)
                .gt('checkout', checkin),
        ])

        if (!settingsRes.data) {
            return NextResponse.json({ error: 'Could not load settings' }, { status: 500 })
        }

        const settings = settingsRes.data as unknown as PricingSettings
        const overrides = (pricingRes.data ?? []) as unknown as PricingOverride[]

        const { totalEur, nights } = calculatePrice(checkin, checkout, guests, settings, overrides)

        if (nights < settings.min_nights) {
            return NextResponse.json(
                { error: `Minimum stay is ${settings.min_nights} night${settings.min_nights > 1 ? 's' : ''}` },
                { status: 400 }
            )
        }

        // Check for overlapping bookings
        if ((overlapRes.data ?? []).length > 0) {
            return NextResponse.json({ error: 'Selected dates are not available' }, { status: 409 })
        }

        // Check blocked + iCal dates
        const blockedSet = new Set<string>([
            ...(blockedRes.data ?? []).map(r => r.date as string),
            ...(icalRes.data?.dates ?? []),
        ])
        for (let i = 0; i < nights; i++) {
            const d = format(addDays(parseISO(checkin), i), 'yyyy-MM-dd')
            if (blockedSet.has(d)) {
                return NextResponse.json({ error: 'Selected dates are not available' }, { status: 409 })
            }
        }

        // Create PayPal order
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
        const controller = new OrdersController(makePaypalClient())

        const { result: paypalOrder } = await controller.createOrder({
            body: {
                intent: CheckoutPaymentIntent.Capture,
                purchaseUnits: [
                    {
                        amount: {
                            currencyCode: 'EUR',
                            value: (totalEur / 100).toFixed(2),
                        },
                        description: `Altona North · ${checkin} → ${checkout} · ${guests} guest${guests !== 1 ? 's' : ''}`,
                    },
                ],
                applicationContext: {
                    brandName: 'Altona North',
                    returnUrl: `${baseUrl}/booking/success?checkin=${checkin}&checkout=${checkout}&guests=${guests}&total=${Math.round(totalEur / 100)}`,
                    cancelUrl: `${baseUrl}/booking/cancel`,
                },
            },
        })

        if (!paypalOrder?.id) {
            return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 })
        }

        // Insert pending booking
        const { error: bookingError } = await supabaseServer.from('bookings').insert({
            checkin,
            checkout,
            guests,
            guest_name: guestName,
            guest_email: guestEmail,
            guest_phone: guestPhone,
            special_requests: specialRequests,
            total_eur: totalEur,
            paypal_order_id: paypalOrder.id,
            status: 'pending',
        })

        if (bookingError) {
            return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
        }

        const approveUrl = paypalOrder.links?.find(l => l.rel === 'approve')?.href
        if (!approveUrl) {
            return NextResponse.json({ error: 'No approval URL from PayPal' }, { status: 500 })
        }

        return NextResponse.json({ url: approveUrl })
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        const body = (err as { body?: unknown }).body
        console.error('[checkout] error:', message, body)
        return NextResponse.json({ error: message || 'PayPal error', detail: body }, { status: 500 })
    }
}
