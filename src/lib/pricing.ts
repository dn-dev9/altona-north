import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'

export interface PricingSettings {
    base_rate: number           // cents per night
    base_occupancy: number      // guests included in base rate
    extra_person_fee: number    // cents per extra guest per night
    min_nights: number
}

export interface PricingOverride {
    date_from: string           // YYYY-MM-DD inclusive
    date_to: string             // YYYY-MM-DD inclusive
    price_eur: number           // cents per night
    extra_person_fee: number | null  // null = fall back to settings
}

export interface PriceResult {
    totalEur: number    // cents
    nights: number
}

export function calculatePrice(
    checkin: string,
    checkout: string,
    guests: number,
    settings: PricingSettings,
    overrides: PricingOverride[]
): PriceResult {
    const nights = differenceInCalendarDays(parseISO(checkout), parseISO(checkin))
    const extraGuests = Math.max(0, guests - settings.base_occupancy)

    let totalEur = 0

    for (let i = 0; i < nights; i++) {
        const date = format(addDays(parseISO(checkin), i), 'yyyy-MM-dd')
        const override = overrides.find(o => date >= o.date_from && date <= o.date_to)

        const rate = override ? override.price_eur : settings.base_rate
        const extraFee = override?.extra_person_fee ?? settings.extra_person_fee

        totalEur += rate + extraFee * extraGuests
    }

    return { totalEur, nights }
}
