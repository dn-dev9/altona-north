'use client'

import { useEffect, useRef, useState } from 'react'
import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { adminFetch } from '@/lib/adminFetch'
import styles from './bookings.module.css'

interface Booking {
    id: string
    checkin: string
    checkout: string
    guests: number
    guest_name: string
    guest_email: string
    guest_phone: string
    special_requests: string
    total_eur: number
    status: 'confirmed' | 'pending' | 'cancelled'
    created_at: string
    paypal_order_id: string
}

type FilterType = 'all' | 'upcoming' | 'completed' | 'cancelled'

function StatusBadge({ status }: { status: Booking['status'] }) {
    const cls =
        status === 'confirmed' ? styles.badgeConfirmed
        : status === 'pending' ? styles.badgePending
        : styles.badgeCancelled
    const label =
        status === 'confirmed' ? 'Confirmed'
        : status === 'pending' ? 'Pending'
        : 'Cancelled'
    return (
        <span className={`${styles.badge} ${cls}`}>
            <span className={styles.badgeDot} />
            {label}
        </span>
    )
}

const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
]

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState<FilterType>('all')
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [panelOpen, setPanelOpen] = useState(false)
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        adminFetch('/api/bookings')
            .then(r => { if (!r.ok) throw new Error(); return r.json() })
            .then((data: Booking[]) => setBookings(data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    function openPanel(booking: Booking) {
        if (closeTimer.current) clearTimeout(closeTimer.current)
        setSelectedBooking(booking)
        setPanelOpen(true)
    }

    function closePanel() {
        setPanelOpen(false)
        closeTimer.current = setTimeout(() => setSelectedBooking(null), 300)
    }

    const todayStr = format(new Date(), 'yyyy-MM-dd')

    function filterBookings(f: FilterType): Booking[] {
        switch (f) {
            case 'upcoming':
                return bookings.filter(b => b.checkin >= todayStr && b.status !== 'cancelled')
            case 'completed':
                return bookings.filter(b => b.checkout < todayStr && b.status === 'confirmed')
            case 'cancelled':
                return bookings.filter(b => b.status === 'cancelled')
            default:
                return bookings
        }
    }

    function countFilter(f: FilterType): number {
        return filterBookings(f).length
    }

    const visibleBookings = filterBookings(activeFilter)

    const b = selectedBooking

    return (
        <>
            <div className={`${styles.wrap}${panelOpen ? ` ${styles.wrapOpen}` : ''}`}>
                <div className={styles.listHeader}>
                    <div className={styles.listTitle}>All bookings</div>
                    <div className={styles.filterTabs}>
                        {FILTERS.map(f => (
                            <button
                                key={f.key}
                                className={`${styles.filterTab}${activeFilter === f.key ? ` ${styles.filterTabActive}` : ''}`}
                                onClick={() => setActiveFilter(f.key)}
                            >
                                {f.label}
                                {!loading && ` (${countFilter(f.key)})`}
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
                                <th>Nights</th>
                                <th>Guests</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }, (_, i) => (
                                    <tr key={i}>
                                        <td><div className={`${styles.skeletonCell} ${styles.skeletonCellWide}`} /></td>
                                        <td><div className={`${styles.skeletonCell} ${styles.skeletonCellMed}`} /></td>
                                        <td><div className={`${styles.skeletonCell} ${styles.skeletonCellMed}`} /></td>
                                        <td><div className={`${styles.skeletonCell} ${styles.skeletonCellNarrow}`} /></td>
                                        <td><div className={`${styles.skeletonCell} ${styles.skeletonCellNarrow}`} /></td>
                                        <td><div className={`${styles.skeletonCell} ${styles.skeletonCellMed}`} /></td>
                                        <td><div className={`${styles.skeletonCell} ${styles.skeletonCellMed}`} /></td>
                                    </tr>
                                ))
                            ) : visibleBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={7}>
                                        <div className={styles.emptyState}>
                                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                                <line x1="16" y1="13" x2="8" y2="13" />
                                                <line x1="16" y1="17" x2="8" y2="17" />
                                            </svg>
                                            No bookings found
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                visibleBookings.map(booking => {
                                    const nights = differenceInCalendarDays(
                                        parseISO(booking.checkout),
                                        parseISO(booking.checkin)
                                    )
                                    return (
                                        <tr
                                            key={booking.id}
                                            className={`${styles.row}${selectedBooking?.id === booking.id ? ` ${styles.rowSelected}` : ''}`}
                                            onClick={() => openPanel(booking)}
                                        >
                                            <td>
                                                <div className={styles.guestName}>{booking.guest_name}</div>
                                                <div className={styles.guestSub}>{booking.guest_email}</div>
                                            </td>
                                            <td>
                                                <div className={styles.dateVal}>
                                                    {format(parseISO(booking.checkin), 'd MMM yyyy')}
                                                </div>
                                                <div className={styles.dateSub}>
                                                    {format(parseISO(booking.checkin), 'EEEE')}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.dateVal}>
                                                    {format(parseISO(booking.checkout), 'd MMM yyyy')}
                                                </div>
                                                <div className={styles.dateSub}>
                                                    {format(parseISO(booking.checkout), 'EEEE')}
                                                </div>
                                            </td>
                                            <td>{nights}</td>
                                            <td>{booking.guests}</td>
                                            <td>
                                                <span className={styles.amount}>
                                                    €{(booking.total_eur / 100).toFixed(0)}
                                                </span>
                                            </td>
                                            <td>
                                                <StatusBadge status={booking.status} />
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Slide-out detail panel ── */}
            <div className={`${styles.detailPanel}${panelOpen ? ` ${styles.open}` : ''}`}>
                {b && (
                    <>
                        <div className={styles.detailPanelHeader}>
                            <div className={styles.detailPanelTitle}>{b.guest_name}</div>
                            <button className={styles.closeBtn} onClick={closePanel} aria-label="Close panel">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className={styles.detailPanelBody}>

                            {/* Stay */}
                            <div className={styles.detailSection}>
                                <div className={styles.detailSectionLabel}>Stay</div>
                                <div className={styles.detailDates}>
                                    <div className={styles.detailDateBlock}>
                                        <div className={styles.detailDateLabel}>Check-in</div>
                                        <div className={styles.detailDateVal}>
                                            {format(parseISO(b.checkin), 'd MMM')}
                                        </div>
                                        <div className={styles.detailDateDay}>
                                            {format(parseISO(b.checkin), 'EEEE')}
                                        </div>
                                    </div>
                                    <div>
                                        <div className={styles.detailArrow}>
                                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                                <polyline points="12 5 19 12 12 19" />
                                            </svg>
                                        </div>
                                        <div className={styles.detailNights}>
                                            {differenceInCalendarDays(parseISO(b.checkout), parseISO(b.checkin))} nights
                                        </div>
                                    </div>
                                    <div className={`${styles.detailDateBlock} ${styles.detailDateBlockRight}`}>
                                        <div className={styles.detailDateLabel}>Check-out</div>
                                        <div className={styles.detailDateVal}>
                                            {format(parseISO(b.checkout), 'd MMM')}
                                        </div>
                                        <div className={styles.detailDateDay}>
                                            {format(parseISO(b.checkout), 'EEEE')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Guest details */}
                            <div className={styles.detailSection}>
                                <div className={styles.detailSectionLabel}>Guest details</div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailRowLabel}>
                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        Name
                                    </span>
                                    <span className={styles.detailRowVal}>{b.guest_name}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailRowLabel}>
                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                        Email
                                    </span>
                                    <span className={`${styles.detailRowVal} ${styles.detailRowValNormal}`}>
                                        {b.guest_email}
                                    </span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailRowLabel}>
                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                                        </svg>
                                        Phone
                                    </span>
                                    <span className={`${styles.detailRowVal} ${styles.detailRowValNormal}`}>
                                        {b.guest_phone}
                                    </span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailRowLabel}>
                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M23 21v-2a4 4 0 00-3-3.87" />
                                            <path d="M16 3.13a4 4 0 010 7.75" />
                                        </svg>
                                        Guests
                                    </span>
                                    <span className={styles.detailRowVal}>
                                        {b.guests} {b.guests === 1 ? 'guest' : 'guests'}
                                    </span>
                                </div>
                            </div>

                            {/* Payment */}
                            <div className={styles.detailSection}>
                                <div className={styles.detailSectionLabel}>Payment</div>
                                <div className={styles.detailTotal}>
                                    <span className={styles.detailTotalLabel}>Total paid</span>
                                    <span className={styles.detailTotalVal}>
                                        €{(b.total_eur / 100).toFixed(0)}
                                    </span>
                                </div>
                            </div>

                            {/* Special requests — hidden when empty */}
                            {b.special_requests && (
                                <div className={styles.detailSection}>
                                    <div className={styles.detailSectionLabel}>Special requests</div>
                                    <div className={styles.detailSpecial}>{b.special_requests}</div>
                                </div>
                            )}

                            {/* Status */}
                            <div className={styles.detailSection}>
                                <div className={styles.detailSectionLabel}>Status</div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailRowLabel}>Booking status</span>
                                    <StatusBadge status={b.status} />
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailRowLabel}>Booked on</span>
                                    <span className={`${styles.detailRowVal} ${styles.detailRowValNormal}`}>
                                        {format(parseISO(b.created_at), 'd MMM yyyy, HH:mm')}
                                    </span>
                                </div>
                            </div>

                        </div>

                        <div className={styles.detailActions}>
                            <a
                                href={`https://wa.me/${b.guest_phone.replace(/\s+/g, '')}`}
                                className={styles.btnWa}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                WhatsApp guest
                            </a>
                            <div className={styles.refundNote}>
                                To issue a refund, log into your PayPal account and find this payment.
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}
