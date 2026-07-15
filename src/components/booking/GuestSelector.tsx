'use client'

import { useTranslation } from '@/context/LangContext'
import styles from './GuestSelector.module.css'

const MAX_LABEL = { en: 'Max 4 guests', bg: 'Макс. 4 гости' }

interface Props {
  guests: number
  onGuestsChange: (n: number) => void
  min?: number
  max?: number
}

export default function GuestSelector({ guests, onGuestsChange, min = 1, max = 4 }: Props) {
  const { t, lang } = useTranslation()

  return (
    <div className={styles.guestsRow}>
      <div>
        <div className={styles.guestsLabel}>{t('booking_guests')}</div>
        <div className={styles.guestsSub}>{MAX_LABEL[lang]}</div>
      </div>

      <div className={styles.guestsCtrl}>
        <button
          className={styles.guestsBtn}
          onClick={() => onGuestsChange(guests - 1)}
          disabled={guests <= min}
          aria-label="Remove guest"
        >
          −
        </button>
        <span className={styles.guestsCount}>{guests}</span>
        <button
          className={styles.guestsBtn}
          onClick={() => onGuestsChange(guests + 1)}
          disabled={guests >= max}
          aria-label="Add guest"
        >
          +
        </button>
      </div>
    </div>
  )
}