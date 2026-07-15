'use client'

import { useState } from 'react'
import { useTranslation } from '@/context/LangContext'
import styles from './Contact.module.css'

const HEADING    = { en: 'Have a question?',  bg: 'Имате въпрос?' }
const INTRO_P    = { en: "We're happy to answer any questions about the property, availability, or local tips before you book.", bg: 'Ще се радваме да отговорим на всякакви въпроси за имота, наличността или местни препоръки преди да резервирате.' }
const WA_NAME    = { en: 'Chat on WhatsApp',  bg: 'Чат в WhatsApp' }
const WA_SUB     = { en: 'Usually replies within the hour', bg: 'Обикновено отговаряме в рамките на час' }
const EMAIL_NAME = { en: 'Send an email',     bg: 'Изпратете имейл' }

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '+359000000000'
const EMAIL     = process.env.NEXT_PUBLIC_CONTACT_EMAIL   ?? 'contact@altonanorth.com'

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function Contact() {
  const { t, lang } = useTranslation()

  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [message, setMessage] = useState('')
  const [status,  setStatus]  = useState<Status>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setName(''); setEmail(''); setMessage('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="section">
      <div className="container">
        <div className={styles.contactGrid}>

          <div className={styles.contactIntro}>
            <div className="section-label">{t('contact_title')}</div>
            <h2 className="section-title">{HEADING[lang]}</h2>
            <div className="section-divider" />
            <p>{INTRO_P[lang]}</p>

            <div className={styles.channels}>
              <a
                href={`https://wa.me/${WA_NUMBER.replace(/\D/g, '')}`}
                className={styles.contactChannel}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('contact_whatsapp')}
              >
                <div className={`${styles.contactChannelIcon} ${styles.contactChannelIconWa}`}>
                  <svg viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <div className={styles.contactChannelName}>{WA_NAME[lang]}</div>
                  <div className={styles.contactChannelSub}>{WA_SUB[lang]}</div>
                </div>
              </a>

              <a href={`mailto:${EMAIL}`} className={styles.contactChannel}>
                <div className={`${styles.contactChannelIcon} ${styles.contactChannelIconEmail}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--sage-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <div className={styles.contactChannelName}>{EMAIL_NAME[lang]}</div>
                  <div className={styles.contactChannelSub}>{EMAIL}</div>
                </div>
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formField}>
              <label className={styles.formLabel} htmlFor="contact-name">
                {t('contact_name')}
              </label>
              <input
                id="contact-name"
                type="text"
                className={styles.formInput}
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel} htmlFor="contact-email">
                {t('contact_email')}
              </label>
              <input
                id="contact-email"
                type="email"
                className={styles.formInput}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel} htmlFor="contact-message">
                {t('contact_message')}
              </label>
              <textarea
                id="contact-message"
                className={`${styles.formInput} ${styles.formTextarea}`}
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className={`btn-primary ${styles.formSubmit}`}
              disabled={status === 'sending'}
            >
              {status === 'sending' ? t('contact_sending') : t('contact_send')}
            </button>

            {status === 'success' && (
              <div className={`${styles.formStatus} ${styles.formStatusSuccess}`}>
                {t('contact_success')}
              </div>
            )}
            {status === 'error' && (
              <div className={`${styles.formStatus} ${styles.formStatusError}`}>
                {t('contact_error')}
              </div>
            )}
          </form>

        </div>
      </div>
    </section>
  )
}