'use client'

import { differenceInCalendarDays } from 'date-fns'
import { useTranslation } from '@/context/LangContext'
import styles from './PriceSummary.module.css'

interface Props {
  checkin: string | null
  checkout: string | null
  guests: number
  baseRate?: number       // cents, default €100
  baseOccupancy?: number  // default 2
  extraPersonFee?: number // cents per extra guest per night, default €15
  grandTotal?: number     // EUR override (from /api/price, includes seasonal pricing)
  hasSeasonal?: boolean   // true when seasonal pricing overrides apply
}

export default function PriceSummary({
  checkin,
  checkout,
  guests,
  baseRate = 10000,
  baseOccupancy = 2,
  extraPersonFee = 1500,
  grandTotal,
  hasSeasonal = false,
}: Props) {
  const { t } = useTranslation()

  if (!checkin || !checkout) {
    return <div className={styles.noDateMsg}>{t('booking_select_dates')}</div>
  }

  const nights = differenceInCalendarDays(new Date(checkout), new Date(checkin))
  const rateEur = baseRate / 100
  const feeEur = extraPersonFee / 100
  const extraGuests = Math.max(0, guests - baseOccupancy)
  const extraTotal = nights * extraGuests * feeEur
  const displayTotal = grandTotal !== undefined ? grandTotal : nights * rateEur + extraTotal
  const nightsSubtotal = grandTotal !== undefined ? grandTotal - extraTotal : nights * rateEur

  const nightsLabel = nights === 1 ? t('booking_nights') : t('booking_nights_plural')

  return (
    <div className={styles.priceSummary}>
      <div className={styles.priceRow}>
        {hasSeasonal
          ? <span>{nights} {nightsLabel}</span>
          : <span>{nights} {nightsLabel} × €{rateEur}</span>
        }
        <span>€{nightsSubtotal}</span>
      </div>

      {extraGuests > 0 && (
        <div className={styles.priceRow}>
          <span>{t('booking_extra_guest')}</span>
          <span>€{extraTotal}</span>
        </div>
      )}

      <div className={`${styles.priceRow} ${styles.priceRowTotal}`}>
        <span>{t('booking_total')}</span>
        <span>€{displayTotal}</span>
      </div>
    </div>
  )
}
