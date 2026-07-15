'use client'

import { useState } from 'react'
import { getDaysInMonth, isBefore, startOfToday } from 'date-fns'
import { useTranslation } from '@/context/LangContext'
import styles from './Calendar.module.css'

const MONTHS = {
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  bg: ['Януари','Февруари','Март','Април','Май','Юни','Юли','Август','Септември','Октомври','Ноември','Декември'],
}

const DOWS = {
  en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  bg: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
}

interface Props {
  checkin: string | null
  checkout: string | null
  onCheckinChange: (d: string | null) => void
  onCheckoutChange: (d: string | null) => void
  bookedDates?: string[]
}

export default function Calendar({
  checkin,
  checkout,
  onCheckinChange,
  onCheckoutChange,
  bookedDates = [],
}: Props) {
  const { t, lang } = useTranslation()
  const today = startOfToday()

  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())

  const isCurrentMonth = calYear === today.getFullYear() && calMonth === today.getMonth()

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }

  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  function toDateStr(d: number) {
    return `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  const firstDayOfMonth = new Date(calYear, calMonth, 1)
  const rawDow = firstDayOfMonth.getDay()
  const leadingBlanks = rawDow === 0 ? 6 : rawDow - 1
  const daysInMonth = getDaysInMonth(firstDayOfMonth)

  function getDayClass(d: number): string {
    const ds = toDateStr(d)
    const date = new Date(calYear, calMonth, d)
    if (isBefore(date, today)) return `${styles.calDay} ${styles.calDayPast}`
    if (bookedDates.includes(ds)) return `${styles.calDay} ${styles.calDayBooked}`
    if (ds === checkin) return `${styles.calDay} ${styles.calDayCheckin}`
    if (ds === checkout) return `${styles.calDay} ${styles.calDayCheckout}`
    if (checkin && checkout && ds > checkin && ds < checkout) return `${styles.calDay} ${styles.calDayInrange}`
    return `${styles.calDay} ${styles.calDayAvailable}`
  }

  function selectDate(ds: string) {
    const date = new Date(ds)
    if (isBefore(date, today) || bookedDates.includes(ds)) return

    if (!checkin || (checkin && checkout)) {
      onCheckinChange(ds)
      onCheckoutChange(null)
    } else if (ds > checkin) {
      const hasConflict = bookedDates.some(b => b > checkin && b < ds)
      if (hasConflict) {
        onCheckinChange(ds)
        onCheckoutChange(null)
      } else {
        onCheckoutChange(ds)
      }
    } else {
      onCheckinChange(ds)
      onCheckoutChange(null)
    }
  }

  return (
    <div>
      <div className={styles.calHeader}>
        <button
          className={styles.calNav}
          onClick={prevMonth}
          disabled={isCurrentMonth}
          aria-label="Previous month"
        >
          ←
        </button>
        <div className={styles.calMonth}>{MONTHS[lang][calMonth]} {calYear}</div>
        <button className={styles.calNav} onClick={nextMonth} aria-label="Next month">
          →
        </button>
      </div>

      <div className={styles.calGrid}>
        {DOWS[lang].map((label, i) => (
          <div key={i} className={styles.calDow}>{label}</div>
        ))}

        {Array.from({ length: leadingBlanks }, (_, i) => (
          <div key={`blank-${i}`} className={`${styles.calDay} ${styles.calDayEmpty}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const ds = toDateStr(day)
          return (
            <button
              key={day}
              className={getDayClass(day)}
              onClick={() => selectDate(ds)}
              aria-label={ds}
              aria-pressed={ds === checkin || ds === checkout}
            >
              {day}
            </button>
          )
        })}
      </div>

      <div className={styles.calLegend}>
        <div className={styles.calLegendItem}>
          <div className={`${styles.calLegendDot} ${styles.calLegendDotAvailable}`} />
          <span>{t('booking_available')}</span>
        </div>
        <div className={styles.calLegendItem}>
          <div className={`${styles.calLegendDot} ${styles.calLegendDotSelected}`} />
          <span>{t('booking_selected')}</span>
        </div>
        <div className={styles.calLegendItem}>
          <div className={`${styles.calLegendDot} ${styles.calLegendDotBooked}`} />
          <span>{t('booking_booked')}</span>
        </div>
      </div>
    </div>
  )
}