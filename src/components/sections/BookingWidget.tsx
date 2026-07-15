'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from '@/context/LangContext'
import { supabaseBrowser } from '@/lib/supabase'
import Calendar from '@/components/booking/Calendar'
import GuestSelector from '@/components/booking/GuestSelector'
import PriceSummary from '@/components/booking/PriceSummary'
import styles from './BookingWidget.module.css'

interface Settings {
  max_occupancy: number
  base_rate: number
  base_occupancy: number
  extra_person_fee: number
  min_nights: number
}

const DEFAULT_SETTINGS: Settings = {
  max_occupancy: 4,
  base_rate: 10000,
  base_occupancy: 2,
  extra_person_fee: 1500,
  min_nights: 1,
}

const HEADING = { en: 'Book Altona North', bg: 'Резервирай Алтона Норт' }
const SELECT_DATES = { en: 'Select dates', bg: 'Изберете дати' }
const INTRO_P = {
  en: 'Select your dates on the calendar, choose the number of guests, and proceed to secure payment via PayPal. Your booking is confirmed instantly.',
  bg: 'Изберете датите от календара, посочете броя гости и преминете към сигурно плащане чрез PayPal. Резервацията ви е потвърдена незабавно.',
}

interface Props {
  checkin?: string | null
  checkout?: string | null
  guests?: number
  onCheckinChange?: (d: string | null) => void
  onCheckoutChange?: (d: string | null) => void
  onGuestsChange?: (n: number) => void
}

export default function BookingWidget({
  checkin: checkinProp,
  checkout: checkoutProp,
  guests: guestsProp,
  onCheckinChange,
  onCheckoutChange,
  onGuestsChange,
}: Props) {
  const { t, lang } = useTranslation()

  const [checkinLocal, setCheckinLocal] = useState<string | null>(null)
  const [checkoutLocal, setCheckoutLocal] = useState<string | null>(null)
  const [guestsLocal, setGuestsLocal] = useState(2)

  const controlled = checkinProp !== undefined
  const checkin = controlled ? (checkinProp ?? null) : checkinLocal
  const checkout = controlled ? (checkoutProp ?? null) : checkoutLocal
  const guests = controlled ? (guestsProp ?? 2) : guestsLocal

  const setCheckin = controlled ? (onCheckinChange ?? (() => {})) : setCheckinLocal
  const setCheckout = controlled ? (onCheckoutChange ?? (() => {})) : setCheckoutLocal
  const setGuests = controlled ? (onGuestsChange ?? (() => {})) : setGuestsLocal

  const [bookedDates, setBookedDates] = useState<string[]>([])
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/availability')
        .then(r => r.json())
        .catch(() => ({ bookedDates: [] })),
      supabaseBrowser
        .from('settings')
        .select('max_occupancy, base_rate, base_occupancy, extra_person_fee, min_nights')
        .eq('id', 1)
        .single(),
    ]).then(([availData, settingsResult]) => {
      if (Array.isArray(availData?.bookedDates)) setBookedDates(availData.bookedDates)
      if (settingsResult.data) setSettings(settingsResult.data as Settings)
    }).finally(() => setLoading(false))
  }, [])

  const isRangeValid = Boolean(
    checkin &&
    checkout &&
    !bookedDates.some(d => d >= checkin! && d < checkout!)
  )

  const ctaHref = isRangeValid
    ? `/booking/confirm?checkin=${checkin}&checkout=${checkout}&guests=${guests}`
    : null

  const rateEur = Math.round(settings.base_rate / 100)
  const feeEur = Math.round(settings.extra_person_fee / 100)
  const priceSubNote =
    lang === 'en'
      ? `Base rate for up to ${settings.base_occupancy} guests. €${feeEur} per extra guest per night.`
      : `Базова цена до ${settings.base_occupancy} гости. €${feeEur} за допълнителен гост на нощ.`

  return (
    <section id="booking" className={`section ${styles.booking}`}>
      <div className="container">
        <div className={styles.bookingGrid}>

          <div className={styles.bookingIntro}>
            <div className="section-label">{t('booking_title')}</div>
            <h2 className="section-title">{HEADING[lang]}</h2>
            <div className="section-divider" />
            <div>
              <div className={styles.priceBig}>
                €{rateEur} <span>/ {t('booking_price_per_night')}</span>
              </div>
              <p className={styles.priceSubNote}>{priceSubNote}</p>
            </div>
            <p>{INTRO_P[lang]}</p>
          </div>

          <div className={styles.bookingCard}>
            <div className={styles.bookingSectionTitle}>{SELECT_DATES[lang]}</div>

            {loading ? (
              <div className={styles.calSkeleton} />
            ) : (
              <Calendar
                checkin={checkin}
                checkout={checkout}
                onCheckinChange={setCheckin}
                onCheckoutChange={setCheckout}
                bookedDates={bookedDates}
              />
            )}

            <GuestSelector
              guests={guests}
              onGuestsChange={setGuests}
              max={settings.max_occupancy}
            />

            <PriceSummary
              checkin={checkin}
              checkout={checkout}
              guests={guests}
              baseRate={settings.base_rate}
              baseOccupancy={settings.base_occupancy}
              extraPersonFee={settings.extra_person_fee}
            />

            <a
              href={ctaHref ?? '#booking'}
              className={`btn-primary ${styles.bookingCta}${!ctaHref ? ` ${styles.bookingCtaDisabled}` : ''}`}
              aria-disabled={!ctaHref}
              onClick={!ctaHref ? (e) => e.preventDefault() : undefined}
            >
              {t('booking_cta')}
            </a>
            <p className={styles.priceNote}>{t('booking_price_note')}</p>
          </div>

        </div>
      </div>
    </section>
  )
}
