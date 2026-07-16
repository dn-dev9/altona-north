import ICAL from 'ical.js'
import { addDays, format, isBefore, startOfDay } from 'date-fns'

export async function fetchIcalBlockedDates(url: string): Promise<string[]> {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch iCal: ${res.status}`)
    const text = await res.text()

    const comp = new ICAL.Component(ICAL.parse(text))
    const vevents = comp.getAllSubcomponents('vevent')
    const blocked = new Set<string>()

    for (const vevent of vevents) {
        const event = new ICAL.Event(vevent)
        if (!event.startDate) continue

        const start = startOfDay(event.startDate.toJSDate())
        const end = event.endDate
            ? startOfDay(event.endDate.toJSDate())
            : addDays(start, 1)

        // DTEND is exclusive — checkout day is not a blocked night
        let cursor = start
        while (isBefore(cursor, end)) {
            blocked.add(format(cursor, 'yyyy-MM-dd'))
            cursor = addDays(cursor, 1)
        }
    }

    return Array.from(blocked).sort()
}
