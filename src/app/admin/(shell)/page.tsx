'use client'

import { useEffect, useMemo, useState } from 'react'
import {
    addDays,
    differenceInCalendarDays,
    endOfMonth,
    format,
    getDaysInMonth,
    getYear,
    isAfter,
    isBefore,
    parseISO,
    startOfDay,
    startOfMonth,
} from 'date-fns'
import { adminFetch } from '@/lib/adminFetch'
import styles from './dashboard.module.css'

interface Booking {
    id: string
    guest_name: string
    guest_email: string
    guest_phone: string
    guests: number
    checkin: string
    checkout: string
    total_eur: number
    status: 'confirmed' | 'pending' | 'cancelled'
    special_requests: string
}

type Filter = 'all' | 'upcoming' | 'completed' | 'cancelled'

function computeStats(bookings: Booking[]) {
    const now = startOfDay(new Date())
    const thisYear = getYear(now)

    const yearBookings = bookings.filter(
        (b) => getYear(parseISO(b.checkin)) === thisYear
    )
    const confirmed = bookings.filter((b) => b.status === 'confirmed')

    const upcoming = yearBookings.filter(
        (b) =>
            b.status !== 'cancelled' &&
            !isBefore(startOfDay(parseISO(b.checkin)), now)
    ).length

    const completed = yearBookings.filter(
        (b) =>
            b.status === 'confirmed' &&
            isBefore(parseISO(b.checkout), now)
    ).length

    const totalRevenue = yearBookings.reduce((s, b) => s + b.total_eur, 0)
    const confirmedRevenue = yearBookings
        .filter((b) => b.status === 'confirmed')
        .reduce((s, b) => s + b.total_eur, 0)

    // Occupancy this month
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const daysInMonth = getDaysInMonth(now)
    let bookedDays = 0
    let d = monthStart
    while (!isAfter(d, monthEnd)) {
        const isBooked = confirmed.some((b) => {
            const cin = parseISO(b.checkin)
            const cout = parseISO(b.checkout)
            return !isBefore(d, cin) && isBefore(d, cout)
        })
        if (isBooked) bookedDays++
        d = addDays(d, 1)
    }
    const occupancyPct = Math.round((bookedDays / daysInMonth) * 100)

    // Next available date (first day after today with no booking)
    let next = addDays(now, 1)
    for (let i = 0; i < 365; i++) {
        const blocked = bookings.some((b) => {
            const cin = parseISO(b.checkin)
            const cout = parseISO(b.checkout)
            return !isBefore(next, cin) && isBefore(next, cout)
        })
        if (!blocked) break
        next = addDays(next, 1)
    }

    // Next upcoming confirmed check-in
    const nextCheckin =
        confirmed
            .filter(
                (b) =>
                    isAfter(startOfDay(parseISO(b.checkin)), now) ||
                    startOfDay(parseISO(b.checkin)).getTime() === now.getTime()
            )
            .sort(
                (a, b) =>
                    parseISO(a.checkin).getTime() - parseISO(b.checkin).getTime()
            )[0] ?? null

    const daysUntil = nextCheckin
        ? differenceInCalendarDays(parseISO(nextCheckin.checkin), now)
        : 0

    const hasCurrentBooking = confirmed.some((b) => {
        const cin = parseISO(b.checkin)
        const cout = parseISO(b.checkout)
        return !isAfter(cin, now) && isAfter(cout, now)
    })

    return {
        totalBookings: yearBookings.length,
        upcoming,
        completed,
        totalRevenue,
        confirmedRevenue,
        occupancyPct,
        bookedDays,
        daysInMonth,
        nextAvailableDate: next,
        hasCurrentBooking,
        nextCheckin,
        daysUntil,
    }
}

function filterBookings(bookings: Booking[], filter: Filter): Booking[] {
    const now = startOfDay(new Date())
    switch (filter) {
        case 'upcoming':
            return bookings.filter(
                (b) =>
                    b.status !== 'cancelled' &&
                    !isBefore(startOfDay(parseISO(b.checkin)), now)
            )
        case 'completed':
            return bookings.filter(
                (b) => b.status === 'confirmed' && isBefore(parseISO(b.checkout), now)
            )
        case 'cancelled':
            return bookings.filter((b) => b.status === 'cancelled')
        default:
            return bookings
    }
}

function StatusBadge({ status }: { status: Booking['status'] }) {
    const cls =
        status === 'confirmed'
            ? styles.badgeConfirmed
            : status === 'pending'
            ? styles.badgePending
            : styles.badgeCancelled
    const label =
        status === 'confirmed' ? 'Confirmed' : status === 'pending' ? 'Pending' : 'Cancelled'
    return (
        <span className={`${styles.badge} ${cls}`}>
            <span className={styles.badgeDot} />
            {label}
        </span>
    )
}

export default function DashboardPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<Filter>('all')

    useEffect(() => {
        adminFetch('/api/bookings')
            .then((r) => {
                if (!r.ok) throw new Error('fetch failed')
                return r.json()
            })
            .then((data: Booking[]) => {
                setBookings(
                    data.sort(
                        (a, b) =>
                            parseISO(b.checkin).getTime() - parseISO(a.checkin).getTime()
                    )
                )
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const stats = useMemo(() => computeStats(bookings), [bookings])
    const filtered = useMemo(() => filterBookings(bookings, filter), [bookings, filter])

    const FILTERS: { key: Filter; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'upcoming', label: 'Upcoming' },
        { key: 'completed', label: 'Completed' },
        { key: 'cancelled', label: 'Cancelled' },
    ]

    return (
        <>
            {/* ── Stat cards ── */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <div className={styles.statLabel}>Bookings this year</div>
                    {loading ? (
                        <div className={styles.skeletonVal} />
                    ) : (
                        <div className={styles.statVal}>{stats.totalBookings}</div>
                    )}
                    {loading ? (
                        <div className={styles.skeletonSub} />
                    ) : (
                        <div className={styles.statSub}>
                            {stats.upcoming} upcoming · {stats.completed} completed
                        </div>
                    )}
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconGold}`}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                        </svg>
                    </div>
                    <div className={styles.statLabel}>Revenue this year</div>
                    {loading ? (
                        <div className={styles.skeletonVal} />
                    ) : (
                        <div className={styles.statVal}>€{(stats.totalRevenue / 100).toLocaleString()}</div>
                    )}
                    {loading ? (
                        <div className={styles.skeletonSub} />
                    ) : (
                        <div className={`${styles.statSub} ${styles.statSubUp}`}>
                            ↑ €{(stats.confirmedRevenue / 100).toLocaleString()} confirmed
                        </div>
                    )}
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 00-3-3.87" />
                            <path d="M16 3.13a4 4 0 010 7.75" />
                        </svg>
                    </div>
                    <div className={styles.statLabel}>Occupancy this month</div>
                    {loading ? (
                        <div className={styles.skeletonVal} />
                    ) : (
                        <div className={styles.statVal}>{stats.occupancyPct}%</div>
                    )}
                    {loading ? (
                        <div className={styles.skeletonSub} />
                    ) : (
                        <div className={styles.statSub}>
                            {stats.bookedDays} of {stats.daysInMonth} days booked
                        </div>
                    )}
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <div className={styles.statLabel}>Next available</div>
                    {loading ? (
                        <div className={styles.skeletonVal} />
                    ) : (
                        <div className={styles.statVal} style={{ fontSize: '26px' }}>
                            {format(stats.nextAvailableDate, 'd MMM')}
                        </div>
                    )}
                    {loading ? (
                        <div className={styles.skeletonSub} />
                    ) : (
                        <div className={styles.statSub}>
                            {stats.hasCurrentBooking ? 'After current booking' : 'No current booking'}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Next check-in banner ── */}
            {!loading && stats.nextCheckin && (
                <div className={styles.nextCheckin}>
                    <div>
                        <div className={styles.nextCheckinLabel}>Next check-in</div>
                        <div className={styles.nextCheckinName}>{stats.nextCheckin.guest_name}</div>
                        <div className={styles.nextCheckinDetails}>
                            {stats.nextCheckin.guests}{' '}
                            {stats.nextCheckin.guests === 1 ? 'guest' : 'guests'} ·{' '}
                            {differenceInCalendarDays(
                                parseISO(stats.nextCheckin.checkout),
                                parseISO(stats.nextCheckin.checkin)
                            )}{' '}
                            nights
                            {stats.nextCheckin.special_requests
                                ? ` · Special request: ${stats.nextCheckin.special_requests}`
                                : ''}
                        </div>
                        <div className={styles.nextCheckinBadge}>
                            <svg viewBox="0 0 24 24" width="10" height="10" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" fill="currentColor" />
                            </svg>
                            Confirmed
                        </div>
                    </div>
                    <div className={styles.nextCheckinDate}>
                        <div className={styles.nextCheckinDateVal}>
                            {format(parseISO(stats.nextCheckin.checkin), 'd MMM')}
                        </div>
                        <div className={styles.nextCheckinDateSub}>
                            {stats.daysUntil === 0 ? 'Today' : `in ${stats.daysUntil} days`}
                        </div>
                    </div>
                </div>
            )}

            {!loading && !stats.nextCheckin && (
                <div className={styles.nextCheckin}>
                    <div>
                        <div className={styles.nextCheckinLabel}>Next check-in</div>
                        <div className={styles.nextCheckinName} style={{ opacity: 0.5 }}>
                            No upcoming bookings
                        </div>
                    </div>
                </div>
            )}

            {/* ── Bookings table ── */}
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>All bookings</div>
                <div className={styles.filterTabs}>
                    {FILTERS.map((f) => (
                        <button
                            key={f.key}
                            className={`${styles.filterTab}${filter === f.key ? ` ${styles.filterTabActive}` : ''}`}
                            onClick={() => setFilter(f.key)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.tableWrap}>
                <table>
                    <thead>
                        <tr>
                            <th>Guest</th>
                            <th>Check-in</th>
                            <th>Check-out</th>
                            <th>Guests</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6}>
                                    <div className={styles.emptyState}>Loading bookings…</div>
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6}>
                                    <div className={styles.emptyState}>No bookings found</div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((b) => (
                                <tr key={b.id}>
                                    <td>
                                        <div className={styles.guestName}>{b.guest_name}</div>
                                        <div className={styles.guestSub}>
                                            {b.guest_email}
                                            {b.guest_phone ? ` · ${b.guest_phone}` : ''}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.dateVal}>
                                            {format(parseISO(b.checkin), 'd MMM yyyy')}
                                        </div>
                                        <div className={styles.dateSub}>
                                            {format(parseISO(b.checkin), 'EEEE')}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.dateVal}>
                                            {format(parseISO(b.checkout), 'd MMM yyyy')}
                                        </div>
                                        <div className={styles.dateSub}>
                                            {format(parseISO(b.checkout), 'EEEE')}
                                        </div>
                                    </td>
                                    <td>{b.guests}</td>
                                    <td>
                                        <span className={styles.amount}>€{(b.total_eur / 100).toLocaleString()}</span>
                                    </td>
                                    <td>
                                        <StatusBadge status={b.status} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    )
}