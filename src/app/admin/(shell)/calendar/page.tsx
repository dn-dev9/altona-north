'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { adminFetch } from '@/lib/adminFetch'
import {
    addDays,
    format,
    getDaysInMonth,
    isBefore,
    parseISO,
    startOfDay,
} from 'date-fns'
import styles from './calendar.module.css'

interface PricedRange {
    id: string
    dateFrom: string
    dateTo: string
    priceEur: number
    label: string
}

interface BookingRaw {
    checkin: string
    checkout: string
}

type DayState = 'past' | 'booked' | 'ical' | 'blocked' | 'priced' | 'available'

function toDateStr(y: number, m: number, d: number): string {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function CalendarPage() {
    const now = new Date()
    const [calYear, setCalYear] = useState(now.getFullYear())
    const [calMonth, setCalMonth] = useState(now.getMonth())
    const [blockedDates, setBlockedDates] = useState<string[]>([])
    const [bookedDates, setBookedDates] = useState<string[]>([])
    const [icalDates, setIcalDates] = useState<string[]>([])
    const [pricedRanges, setPricedRanges] = useState<PricedRange[]>([])
    const [loading, setLoading] = useState(true)

    const [priceFrom, setPriceFrom] = useState('')
    const [priceTo, setPriceTo] = useState('')
    const [priceRate, setPriceRate] = useState('')
    const [priceLabel, setPriceLabel] = useState('')
    const [priceErrors, setPriceErrors] = useState<{ from?: string; to?: string; rate?: string }>({})
    const [priceSubmitting, setPriceSubmitting] = useState(false)

    const [toast, setToast] = useState<string | null>(null)
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    function showToast(msg: string) {
        if (toastTimer.current) clearTimeout(toastTimer.current)
        setToast(msg)
        toastTimer.current = setTimeout(() => setToast(null), 3000)
    }

    useEffect(() => {
        Promise.all([
            adminFetch('/api/admin/dates').then(r => r.json()).catch(() => ({ blockedDates: [] })),
            adminFetch('/api/bookings').then(r => r.json()).catch(() => []),
            fetch('/api/availability').then(r => r.json()).catch(() => ({ unavailableDates: [] })),
            adminFetch('/api/admin/prices').then(r => r.json()).catch(() => []),
        ]).then(([datesData, bookingsData, availData, pricesData]) => {
            setBlockedDates(datesData?.blockedDates ?? [])

            const bookingSet = new Set<string>()
            const bookings: BookingRaw[] = Array.isArray(bookingsData) ? bookingsData : []
            for (const b of bookings) {
                let d = parseISO(b.checkin)
                const checkout = parseISO(b.checkout)
                while (isBefore(d, checkout)) {
                    bookingSet.add(format(d, 'yyyy-MM-dd'))
                    d = addDays(d, 1)
                }
            }
            setBookedDates(Array.from(bookingSet))

            const icalRaw: string[] = availData?.unavailableDates ?? []
            setIcalDates(icalRaw.filter((s: string) => !bookingSet.has(s)))

            setPricedRanges(Array.isArray(pricesData) ? pricesData : [])
        }).finally(() => setLoading(false))
    }, [])

    function getPricedRate(dateStr: string): number | null {
        for (const r of pricedRanges) {
            if (dateStr >= r.dateFrom && dateStr <= r.dateTo) return r.priceEur / 100
        }
        return null
    }

    function getDayState(dateStr: string): DayState {
        const date = parseISO(dateStr)
        if (isBefore(date, startOfDay(new Date()))) return 'past'
        if (bookedDates.includes(dateStr)) return 'booked'
        if (icalDates.includes(dateStr)) return 'ical'
        if (blockedDates.includes(dateStr)) return 'blocked'
        if (getPricedRate(dateStr) !== null) return 'priced'
        return 'available'
    }

    function changeMonth(delta: number) {
        let m = calMonth + delta
        let y = calYear
        if (m > 11) { m = 0; y++ }
        if (m < 0) { m = 11; y-- }
        setCalMonth(m)
        setCalYear(y)
    }

    async function toggleBlock(dateStr: string) {
        const isBlocked = blockedDates.includes(dateStr)
        const action = isBlocked ? 'unblock' : 'block'

        if (isBlocked) {
            setBlockedDates(prev => prev.filter(d => d !== dateStr))
        } else {
            setBlockedDates(prev => [...prev, dateStr])
        }

        try {
            const res = await adminFetch('/api/admin/dates', {
                method: 'POST',
                body: JSON.stringify({ date: dateStr, action }),
            })
            if (!res.ok) throw new Error()
        } catch {
            if (isBlocked) {
                setBlockedDates(prev => [...prev, dateStr])
            } else {
                setBlockedDates(prev => prev.filter(d => d !== dateStr))
            }
            showToast('Failed to update. Please try again.')
        }
    }

    async function handleAddPrice(e: React.FormEvent) {
        e.preventDefault()
        const errors: { from?: string; to?: string; rate?: string } = {}
        if (!priceFrom) errors.from = 'Required'
        if (!priceTo) errors.to = 'Required'
        if (priceFrom && priceTo && priceTo <= priceFrom) errors.to = 'Must be after the start date'
        const rateNum = parseFloat(priceRate)
        if (!priceRate || isNaN(rateNum) || rateNum <= 0) errors.rate = 'Must be a positive number'
        setPriceErrors(errors)
        if (Object.keys(errors).length > 0) return

        setPriceSubmitting(true)
        try {
            const res = await adminFetch('/api/admin/prices', {
                method: 'POST',
                body: JSON.stringify({
                    dateFrom: priceFrom,
                    dateTo: priceTo,
                    priceEur: parseInt(priceRate) * 100,
                    label: priceLabel,
                }),
            })
            if (!res.ok) throw new Error()
            const newRange: PricedRange = await res.json()
            setPricedRanges(prev =>
                [...prev, newRange].sort((a, b) => a.dateFrom.localeCompare(b.dateFrom))
            )
            setPriceFrom('')
            setPriceTo('')
            setPriceRate('')
            setPriceLabel('')
            setPriceErrors({})
        } catch {
            showToast('Failed to add price range. Please try again.')
        } finally {
            setPriceSubmitting(false)
        }
    }

    async function handleDeletePrice(id: string) {
        const snapshot = pricedRanges.find(r => r.id === id)
        setPricedRanges(prev => prev.filter(r => r.id !== id))
        try {
            const res = await adminFetch('/api/admin/prices', {
                method: 'DELETE',
                body: JSON.stringify({ id }),
            })
            if (!res.ok) throw new Error()
        } catch {
            if (snapshot) {
                setPricedRanges(prev =>
                    [...prev, snapshot].sort((a, b) => a.dateFrom.localeCompare(b.dateFrom))
                )
            }
            showToast('Failed to delete. Please try again.')
        }
    }

    const monthStart = new Date(calYear, calMonth, 1)
    const daysInMonth = getDaysInMonth(monthStart)
    const startOffset = (monthStart.getDay() + 6) % 7
    const monthLabel = format(monthStart, 'MMMM yyyy')

    const stateClass: Record<DayState, string> = {
        past: styles.calDayPast,
        booked: styles.calDayBooked,
        ical: styles.calDayIcal,
        blocked: styles.calDayBlocked,
        priced: styles.calDayPriced,
        available: styles.calDayAvailable,
    }

    const sortedRanges = useMemo(
        () => [...pricedRanges].sort((a, b) => a.dateFrom.localeCompare(b.dateFrom)),
        [pricedRanges]
    )

    return (
        <div className={styles.grid}>

            {/* ── Calendar card ── */}
            <div className={styles.calCard}>
                <div className={styles.calCardHeader}>
                    <div className={styles.calCardTitle}>Availability calendar</div>
                    <div className={styles.calNavRow}>
                        <button
                            className={styles.calNavBtn}
                            onClick={() => changeMonth(-1)}
                            aria-label="Previous month"
                        >
                            ←
                        </button>
                        <div className={styles.calMonthLabel}>{monthLabel}</div>
                        <button
                            className={styles.calNavBtn}
                            onClick={() => changeMonth(1)}
                            aria-label="Next month"
                        >
                            →
                        </button>
                    </div>
                </div>

                <div className={styles.calLegend}>
                    <div className={styles.legendItem}>
                        <div className={styles.legendDot} style={{ background: 'var(--offwhite)', border: '1.5px solid var(--border)' }} />
                        Available
                    </div>
                    <div className={styles.legendItem}>
                        <div className={styles.legendDot} style={{ background: '#3a4a3d' }} />
                        Guest booking
                    </div>
                    <div className={styles.legendItem}>
                        <div className={styles.legendDot} style={{ background: '#c8cfc9' }} />
                        Booking.com sync
                    </div>
                    <div className={styles.legendItem}>
                        <div className={styles.legendDot} style={{ background: '#e4d5c5', border: '1.5px solid #d4b89a' }} />
                        Manually blocked
                    </div>
                    <div className={styles.legendItem}>
                        <div className={styles.legendDot} style={{ background: '#eef0eb' }} />
                        Price override
                    </div>
                </div>

                <div className={styles.calGrid}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(dow => (
                        <div key={dow} className={styles.calDow}>{dow}</div>
                    ))}

                    {Array.from({ length: startOffset }, (_, i) => (
                        <div key={`empty-${i}`} className={styles.calDayEmpty} />
                    ))}

                    {Array.from({ length: daysInMonth }, (_, i) => {
                        const d = i + 1
                        const dateStr = toDateStr(calYear, calMonth, d)

                        if (loading) {
                            return (
                                <div key={dateStr} className={`${styles.calDay} ${styles.calDayLoading}`}>
                                    {d}
                                </div>
                            )
                        }

                        const state = getDayState(dateStr)
                        const rate = getPricedRate(dateStr)
                        const clickable = state === 'available' || state === 'blocked' || state === 'priced'

                        return (
                            <div
                                key={dateStr}
                                className={`${styles.calDay} ${stateClass[state]}`}
                                onClick={clickable ? () => toggleBlock(dateStr) : undefined}
                            >
                                {d}
                                {rate !== null && (state === 'booked' || state === 'priced') && (
                                    <span className={styles.calDayPrice}>€{rate}</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ── Right panel ── */}
            <div className={styles.rightPanel}>

                {/* Seasonal pricing */}
                <div className={styles.panel}>
                    <div className={styles.panelTitle}>Seasonal pricing</div>
                    <div className={styles.panelSub}>
                        Set nightly rates for specific date ranges. Overrides the base rate from Settings.
                    </div>

                    <form className={styles.priceForm} onSubmit={handleAddPrice} noValidate>
                        <div className={styles.priceFormTitle}>Add price range</div>
                        <div className={styles.formRow2}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>From</label>
                                <input
                                    type="date"
                                    className={`${styles.formInput}${priceErrors.from ? ` ${styles.formInputError}` : ''}`}
                                    value={priceFrom}
                                    onChange={e => {
                                        setPriceFrom(e.target.value)
                                        setPriceErrors(prev => ({ ...prev, from: undefined }))
                                    }}
                                />
                                {priceErrors.from && (
                                    <span className={styles.formError}>{priceErrors.from}</span>
                                )}
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>To</label>
                                <input
                                    type="date"
                                    className={`${styles.formInput}${priceErrors.to ? ` ${styles.formInputError}` : ''}`}
                                    value={priceTo}
                                    onChange={e => {
                                        setPriceTo(e.target.value)
                                        setPriceErrors(prev => ({ ...prev, to: undefined }))
                                    }}
                                />
                                {priceErrors.to && (
                                    <span className={styles.formError}>{priceErrors.to}</span>
                                )}
                            </div>
                        </div>
                        <div className={styles.formRow2}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Rate (€/night)</label>
                                <input
                                    type="number"
                                    className={`${styles.formInput}${priceErrors.rate ? ` ${styles.formInputError}` : ''}`}
                                    value={priceRate}
                                    onChange={e => {
                                        setPriceRate(e.target.value)
                                        setPriceErrors(prev => ({ ...prev, rate: undefined }))
                                    }}
                                    placeholder="120"
                                    min="1"
                                />
                                {priceErrors.rate && (
                                    <span className={styles.formError}>{priceErrors.rate}</span>
                                )}
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Label</label>
                                <input
                                    type="text"
                                    className={styles.formInput}
                                    value={priceLabel}
                                    onChange={e => setPriceLabel(e.target.value)}
                                    placeholder="August peak"
                                />
                            </div>
                        </div>
                        <button type="submit" className={styles.btnAdd} disabled={priceSubmitting}>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            {priceSubmitting ? 'Adding…' : 'Add price range'}
                        </button>
                    </form>

                    <div className={styles.priceList}>
                        {sortedRanges.length === 0 ? (
                            <div className={styles.emptyPrices}>
                                No price ranges set. Base rate from Settings applies to all dates.
                            </div>
                        ) : (
                            sortedRanges.map(r => (
                                <div key={r.id} className={styles.priceRangeCard}>
                                    <div className={styles.priceRangeInfo}>
                                        <div className={styles.priceRangeLabel}>{r.label}</div>
                                        <div className={styles.priceRangeDates}>
                                            {format(parseISO(r.dateFrom), 'd MMM yyyy')} –{' '}
                                            {format(parseISO(r.dateTo), 'd MMM yyyy')}
                                        </div>
                                    </div>
                                    <div className={styles.priceRangeRate}>
                                        €{r.priceEur / 100} <span>/ night</span>
                                    </div>
                                    <button
                                        className={styles.btnDelete}
                                        onClick={() => handleDeletePrice(r.id)}
                                        aria-label="Delete price range"
                                    >
                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                            <path d="M10 11v6M14 11v6" />
                                            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Manual blocks info */}
                <div className={styles.panel}>
                    <div className={styles.panelTitle}>Manual blocks</div>
                    <div className={styles.panelSub}>
                        Click any available date on the calendar to block it. Click a blocked date to unblock it.
                    </div>
                    <div className={styles.blockInfo}>
                        <strong>Booking.com dates</strong> are synced automatically every 15 minutes and
                        cannot be edited here. To unblock a Booking.com date, cancel it on Booking.com directly.
                    </div>
                </div>
            </div>

            {toast && <div className={styles.toast}>{toast}</div>}
        </div>
    )
}
