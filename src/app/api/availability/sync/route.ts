import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { fetchIcalBlockedDates } from '@/lib/ical'

// Called by Vercel Cron (vercel.json). Vercel automatically passes
// Authorization: Bearer <CRON_SECRET> on every scheduled invocation.
export async function GET(request: Request) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token || token !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const icalUrl = process.env.NEXT_PUBLIC_ICAL_URL
    if (!icalUrl) {
        return NextResponse.json({ error: 'NEXT_PUBLIC_ICAL_URL not configured' }, { status: 500 })
    }

    try {
        const dates = await fetchIcalBlockedDates(icalUrl)

        const { error } = await supabaseServer
            .from('ical_cache')
            .upsert(
                { id: 1, dates, synced_at: new Date().toISOString() },
                { onConflict: 'id' }
            )

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ synced: dates.length })
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 })
    }
}
