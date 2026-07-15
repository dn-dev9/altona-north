'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useTranslation } from '@/context/LangContext'
import styles from './About.module.css'

const IMAGES = [
  '/images/690093504.jpg',
  '/images/690093555.jpg',
  '/images/690093563.jpg',
  '/images/690093569.jpg',
  '/images/690093575.jpg',
  '/images/690093581.jpg',
  '/images/690093588.jpg',
  '/images/690093595.jpg',
  '/images/690093603.jpg',
  '/images/690093612.jpg',
  '/images/690093617.jpg',
  '/images/690093621.jpg',
  '/images/690093627.jpg',
  '/images/690093632.jpg',
  '/images/690093638.jpg',
  '/images/690093643.jpg',
  '/images/690093647.jpg',
  '/images/690093650.jpg',
  '/images/690093656.jpg',
  '/images/690093657.jpg',
  '/images/690093660.jpg',
  '/images/690180244.jpg',
  '/images/690180246.jpg',
  '/images/690180251.jpg',
  '/images/690180252.jpg',
  '/images/690180253.jpg',
  '/images/690192285.jpg',
  '/images/730041920.jpg',
]

const GALLERY = IMAGES.slice(0, 5)

const HEADING = { en: 'A home with a story', bg: 'Дом с история' }

export default function About() {
  const { t, lang } = useTranslation()
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  useEffect(() => {
    document.body.style.overflow = lightboxIdx !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxIdx])

  useEffect(() => {
    if (lightboxIdx === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightboxIdx(null)
      if (e.key === 'ArrowLeft') setLightboxIdx(i => i === null ? 0 : (i + IMAGES.length - 1) % IMAGES.length)
      if (e.key === 'ArrowRight') setLightboxIdx(i => i === null ? 0 : (i + 1) % IMAGES.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIdx])

  return (
    <section id="about" className="section">
      <div className="container">
        <div className={styles.aboutGrid}>
          <div>
            <div className="section-label">{t('about_title')}</div>
            <h2 className="section-title">{HEADING[lang]}</h2>
            <div className="section-divider" />
            <div className={styles.aboutText}>
              <p>{t('about_p1')}</p>
              <p>{t('about_p2')}</p>
              <p>{t('about_p3')}</p>
            </div>
          </div>

          <div className={styles.galleryGrid}>
            {GALLERY.map((src, i) => (
              <div
                key={src}
                className={`${styles.galleryImg}${i === 0 ? ` ${styles.galleryImgTall}` : ''}`}
                onClick={() => setLightboxIdx(i)}
                role="button"
                tabIndex={0}
                aria-label={`${t('hero_title')} — photo ${i + 1}`}
                onKeyDown={(e) => e.key === 'Enter' && setLightboxIdx(i)}
              >
                <Image
                  src={src}
                  alt={`${t('hero_title')} ${i + 1}`}
                  fill
                  sizes="(max-width: 900px) 50vw, 25vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {lightboxIdx !== null && (
        <div
          className={styles.lightbox}
          onClick={() => setLightboxIdx(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            className={styles.lightboxClose}
            onClick={() => setLightboxIdx(null)}
            aria-label="Close"
          >
            ×
          </button>

          <button
            className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIdx(i => i === null ? 0 : (i + IMAGES.length - 1) % IMAGES.length)
            }}
            aria-label="Previous photo"
          >
            ‹
          </button>

          <div className={styles.lightboxImgWrap}>
            <Image
              src={IMAGES[lightboxIdx]}
              alt={`${t('hero_title')} ${lightboxIdx + 1}`}
              fill
              sizes="100vw"
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>

          <button
            className={`${styles.lightboxNav} ${styles.lightboxNext}`}
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIdx(i => i === null ? 0 : (i + 1) % IMAGES.length)
            }}
            aria-label="Next photo"
          >
            ›
          </button>

          <div className={styles.lightboxCounter}>
            {lightboxIdx + 1} / {IMAGES.length}
          </div>
        </div>
      )}
    </section>
  )
}