import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { addDays, format, isBefore, parseISO, startOfDay } from 'date-fns'

function enumerateDates(checkin: string, checkout: string): string[] {
    const dates: string[] = []
    let cursor = startOfDay(parseISO(checkin))
    const end = startOfDay(parseISO(checkout))
    while (isBefore(cursor, end)) {
        dates.push(format(cursor, 'yyyy-MM-dd'))
        cursor = addDays(cursor, 1)
    }
    return dates
}

export async function GET() {
    try {
        const [icalResult, blockedResult, bookingsResult] = await Promise.all([
            supabaseServer.from('ical_cache').select('dates').eq('id', 1).single(),
            supabaseServer.from('blocked_dates').select('date'),
            supabaseServer
                .from('bookings')
                .select('checkin, checkout')
                .in('status', ['confirmed', 'pending']),
        ])

        const icalDates: string[] = icalResult.data?.dates ?? []
        const blockedDates = (blockedResult.data ?? []).map(r => r.date as string)
        const bookingDates = (bookingsResult.data ?? []).flatMap(b =>
            enumerateDates(b.checkin as string, b.checkout as string)
        )

        const bookedSet = new Set([...icalDates, ...blockedDates, ...bookingDates])

        return NextResponse.json({
            bookedDates: Array.from(bookedSet).sort(),
            unavailableDates: icalDates,
        })
    } catch {
        return NextResponse.json({ bookedDates: [], unavailableDates: [] }, { status: 500 })
    }
}