'use client'

import { useTranslation } from '@/context/LangContext'
import styles from './Footer.module.css'

const NAV_LINKS = [
  { href: '#about',     key: 'footer_nav_about'     },
  { href: '#amenities', key: 'footer_nav_amenities' },
  { href: '#reviews',   key: 'footer_nav_reviews'   },
  { href: '#location',  key: 'footer_nav_location'  },
  { href: '#contact',   key: 'footer_nav_contact'   },
] as const

const ALSO_LISTED = { en: 'Also listed on', bg: 'Също на' }

export default function Footer() {
  const { t, lang } = useTranslation()

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          <div>
            <div className={styles.footerLogo}>{t('hero_title')}</div>
            <div className={styles.footerTagline}>{t('footer_tagline')}</div>
          </div>

          <div className={styles.footerLinks}>
            {NAV_LINKS.map(({ href, key }) => (
              <a key={href} href={href} className={styles.footerLink}>
                {t(key)}
              </a>
            ))}
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.footerCopy}>
            © 2026 {t('hero_title')}. {t('footer_rights')}
          </div>
          <div className={styles.footerBooking}>
            {ALSO_LISTED[lang]}{' '}
            <a
              href="https://www.booking.com/hotel/bg/altona-north.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Booking.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}