'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from '@/context/LangContext'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { href: '#about',     key: 'nav_about'     },
  { href: '#amenities', key: 'nav_amenities' },
  { href: '#reviews',   key: 'nav_reviews'   },
  { href: '#location',  key: 'nav_location'  },
  { href: '#contact',   key: 'nav_contact'   },
] as const

export default function Navbar() {
  const { t, lang, setLang } = useTranslation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navClass = `${styles.navbar}${scrolled ? ` ${styles.navbarScrolled}` : ''}`

  return (
    <nav className={navClass}>
      <a href="#" className={styles.navLogo}>
        {t('hero_title')}
      </a>

      <div className={styles.navRight}>
        {NAV_LINKS.map(({ href, key }) => (
          <a key={href} href={href} className={styles.navLink}>
            {t(key)}
          </a>
        ))}

        <div className={styles.langToggle}>
          <button
            className={`${styles.langBtn}${lang === 'en' ? ` ${styles.langBtnActive}` : ''}`}
            onClick={() => setLang('en')}
          >
            EN
          </button>
          <button
            className={`${styles.langBtn}${lang === 'bg' ? ` ${styles.langBtnActive}` : ''}`}
            onClick={() => setLang('bg')}
          >
            BG
          </button>
        </div>

        <a href="#booking" className={`btn-primary ${styles.navCta}`}>
          {t('nav_book')}
        </a>
      </div>
    </nav>
  )
}