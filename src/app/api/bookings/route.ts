import { NextResponse } from 'next/server'
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

        const { error } = await supabaseServer
            .from('bookings')
            .update({ status: body.status })
            .eq('id', body.id)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}