import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { calculatePrice } from '@/lib/pricing'
import type { PricingSettings, PricingOverride } from '@/lib/pricing'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const checkin = searchParams.get('checkin')
    const checkout = searchParams.get('checkout')
    const guests = Number(searchParams.get('guests') ?? 2)

    if (!checkin || !checkout || checkout <= checkin) {
        return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
    }

    try {
        const [settingsRes, pricingRes] = await Promise.all([
            supabaseServer
                .from('settings')
                .select('base_rate, base_occupancy, extra_person_fee, min_nights')
                .eq('id', 1)
                .single(),
            supabaseServer
                .from('pricing')
                .select('date_from, date_to, price_eur, extra_person_fee')
                .order('date_from'),
        ])

        if (!settingsRes.data) {
            return NextResponse.json({ error: 'No settings' }, { status: 500 })
        }

        const settings = settingsRes.data as unknown as PricingSettings
        const overrides = (pricingRes.data ?? []) as unknown as PricingOverride[]

        const { totalEur, nights } = calculatePrice(checkin, checkout, guests, settings, overrides)
        const { totalEur: baseTotalEur } = calculatePrice(checkin, checkout, guests, settings, [])
        const hasSeasonal = totalEur !== baseTotalEur

        return NextResponse.json({ totalEur, nights, hasSeasonal })
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}