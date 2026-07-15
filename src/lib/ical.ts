import { async as icalAsync } from 'node-ical'
import { addDays, format, isBefore, startOfDay } from 'date-fns'

export async function fetchIcalBlockedDates(url: string): Promise<string[]> {
    const data = await icalAsync.fromURL(url)
    const blocked = new Set<string>()

    for (const component of Object.values(data)) {
        if (!component || component.type !== 'VEVENT') continue
        if (!component.start) continue

        const start = startOfDay(new Date(component.start))
        const end = component.end
            ? startOfDay(new Date(component.end))
            : addDays(start, 1)

        // Enumerate from start (inclusive) to end (exclusive).
        // iCal DTEND is non-inclusive — checkout day is not a blocked night.
        let cursor = start
        while (isBefore(cursor, end)) {
            blocked.add(format(cursor, 'yyyy-MM-dd'))
            cursor = addDays(cursor, 1)
        }
    }

    return Array.from(blocked).sort()
}
