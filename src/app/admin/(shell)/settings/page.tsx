'use client'

import { useEffect, useRef, useState } from 'react'
import { adminFetch } from '@/lib/adminFetch'
import styles from './settings.module.css'

interface Settings {
    max_occupancy: number
    base_rate: number
    base_occupancy: number
    extra_person_fee: number
    min_nights: number
    checkin_from: string
    checkin_to: string
    checkout_by: string
    whatsapp: string
    contact_email: string
}

const DEFAULTS: Settings = {
    max_occupancy: 4,
    base_rate: 10000,
    base_occupancy: 2,
    extra_person_fee: 1500,
    min_nights: 1,
    checkin_from: '15:00',
    checkin_to: '23:00',
    checkout_by: '11:00',
    whatsapp: '',
    contact_email: '',
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toastVisible, setToastVisible] = useState(false)
    const [toastMessage, setToastMessage] = useState('Settings saved successfully')
    const [toastError, setToastError] = useState(false)
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        adminFetch('/api/admin/settings')
            .then(r => { if (!r.ok) throw new Error(); return r.json() })
            .then((data: Settings) => setSettings(data))
            .catch(() => setSettings(DEFAULTS))
            .finally(() => setLoading(false))
    }, [])

    function set<K extends keyof Settings>(key: K, value: Settings[K]) {
        setSettings(prev => prev ? { ...prev, [key]: value } : prev)
    }

    function showToast(message: string, isError = false) {
        if (toastTimer.current) clearTimeout(toastTimer.current)
        setToastMessage(message)
        setToastError(isError)
        setToastVisible(true)
        toastTimer.current = setTimeout(() => setToastVisible(false), 3000)
    }

    async function handleSave() {
        if (!settings) return
        setSaving(true)
        try {
            const res = await adminFetch('/api/admin/settings', {
                method: 'POST',
                body: JSON.stringify(settings),
            })
            if (!res.ok) throw new Error()
            showToast('Settings saved successfully')
        } catch {
            showToast('Failed to save. Please try again.', true)
        } finally {
            setSaving(false)
        }
    }

    const s = settings

    return (
        <>
            <div className={styles.page}>

                {/* ── Pricing defaults ── */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionIcon}>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <line x1="12" y1="1" x2="12" y2="23" />
                                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                            </svg>
                        </div>
                        <div>
                            <div className={styles.sectionTitle}>Pricing defaults</div>
                            <div className={styles.sectionSub}>
                                Base rates applied to all dates unless overridden by a seasonal price range in the Calendar.
                            </div>
                        </div>
                    </div>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Base nightly rate</label>
                            {loading ? (
                                <div className={styles.skeletonInput} />
                            ) : (
                                <div className={styles.inputPrefix}>
                                    <span className={styles.inputPrefixSymbol}>€</span>
                                    <input
                                        type="number"
                                        className={styles.formInput}
                                        value={s ? s.base_rate / 100 : ''}
                                        min="1"
                                        onChange={e => set('base_rate', Math.round(Number(e.target.value) * 100))}
                                    />
                                </div>
                            )}
                            <span className={styles.formHint}>Rate for up to the base number of guests below.</span>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Extra person fee / night</label>
                            {loading ? (
                                <div className={styles.skeletonInput} />
                            ) : (
                                <div className={styles.inputPrefix}>
                                    <span className={styles.inputPrefixSymbol}>€</span>
                                    <input
                                        type="number"
                                        className={styles.formInput}
                                        value={s ? s.extra_person_fee / 100 : ''}
                                        min="0"
                                        onChange={e => set('extra_person_fee', Math.round(Number(e.target.value) * 100))}
                                    />
                                </div>
                            )}
                            <span className={styles.formHint}>Charged per guest above the base occupancy.</span>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Base occupancy (guests)</label>
                            {loading ? (
                                <div className={styles.skeletonInput} />
                            ) : (
                                <input
                                    type="number"
                                    className={styles.formInput}
                                    value={s?.base_occupancy ?? ''}
                                    min="1"
                                    onChange={e => set('base_occupancy', Number(e.target.value))}
                                />
                            )}
                            <span className={styles.formHint}>Guests at or below this number pay the base rate.</span>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Minimum nights stay</label>
                            {loading ? (
                                <div className={styles.skeletonInput} />
                            ) : (
                                <input
                                    type="number"
                                    className={styles.formInput}
                                    value={s?.min_nights ?? ''}
                                    min="1"
                                    onChange={e => set('min_nights', Number(e.target.value))}
                                />
                            )}
                            <span className={styles.formHint}>Guests cannot book fewer than this many nights.</span>
                        </div>
                    </div>
                </div>

                {/* ── Property capacity ── */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionIcon}>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                                <path d="M16 3.13a4 4 0 010 7.75" />
                            </svg>
                        </div>
                        <div>
                            <div className={styles.sectionTitle}>Property capacity</div>
                            <div className={styles.sectionSub}>
                                Update this if you add or remove sleeping capacity. Affects the guest selector on the booking widget.
                            </div>
                        </div>
                    </div>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Maximum occupancy (guests)</label>
                            {loading ? (
                                <div className={styles.skeletonInput} />
                            ) : (
                                <input
                                    type="number"
                                    className={styles.formInput}
                                    value={s?.max_occupancy ?? ''}
                                    min="1"
                                    max="20"
                                    onChange={e => set('max_occupancy', Number(e.target.value))}
                                />
                            )}
                            <span className={styles.formHint}>The booking widget will not allow more guests than this.</span>
                        </div>
                    </div>
                </div>

                {/* ── Check-in & check-out ── */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionIcon}>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div>
                            <div className={styles.sectionTitle}>Check-in &amp; check-out</div>
                            <div className={styles.sectionSub}>
                                Shown to guests on the booking confirmation and house rules section.
                            </div>
                        </div>
                    </div>
                    <div className={styles.formGrid3}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Check-in from</label>
                            {loading ? (
                                <div className={styles.skeletonInput} />
                            ) : (
                                <input
                                    type="time"
                                    className={styles.formInput}
                                    value={s?.checkin_from ?? ''}
                                    onChange={e => set('checkin_from', e.target.value)}
                                />
                            )}
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Check-in until</label>
                            {loading ? (
                                <div className={styles.skeletonInput} />
                            ) : (
                                <input
                                    type="time"
                                    className={styles.formInput}
                                    value={s?.checkin_to ?? ''}
                                    onChange={e => set('checkin_to', e.target.value)}
                                />
                            )}
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Check-out by</label>
                            {loading ? (
                                <div className={styles.skeletonInput} />
                            ) : (
                                <input
                                    type="time"
                                    className={styles.formInput}
                                    value={s?.checkout_by ?? ''}
                                    onChange={e => set('checkout_by', e.target.value)}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Contact information ── */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionIcon}>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                            </svg>
                        </div>
                        <div>
                            <div className={styles.sectionTitle}>Contact information</div>
                            <div className={styles.sectionSub}>
                                Used for the WhatsApp floating button, the contact section, and guest confirmation emails.
                            </div>
                        </div>
                    </div>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>WhatsApp number</label>
                            {loading ? (
                                <div className={styles.skeletonInput} />
                            ) : (
                                <input
                                    type="tel"
                                    className={styles.formInput}
                                    value={s?.whatsapp ?? ''}
                                    placeholder="+359 88 123 4567"
                                    onChange={e => set('whatsapp', e.target.value)}
                                />
                            )}
                            <span className={styles.formHint}>Include country code. Used for the WhatsApp button on the site.</span>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Contact email</label>
                            {loading ? (
                                <div className={styles.skeletonInput} />
                            ) : (
                                <input
                                    type="email"
                                    className={styles.formInput}
                                    value={s?.contact_email ?? ''}
                                    placeholder="your@email.com"
                                    onChange={e => set('contact_email', e.target.value)}
                                />
                            )}
                            <span className={styles.formHint}>Receives contact form submissions and booking notifications.</span>
                        </div>
                    </div>
                </div>

                {/* ── Save bar ── */}
                <div className={styles.saveBar}>
                    <span className={styles.saveNote}>Changes apply immediately across the website.</span>
                    <button
                        className={styles.btnSave}
                        onClick={handleSave}
                        disabled={saving || loading}
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {saving ? 'Saving…' : 'Save settings'}
                    </button>
                </div>
            </div>

            {/* ── Toast ── */}
            <div
                className={`${styles.toast}${toastVisible ? ` ${styles.toastVisible}` : ''}${toastError ? ` ${styles.toastError}` : ''}`}
                aria-live="polite"
            >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
                {toastMessage}
            </div>
        </>
    )
}
