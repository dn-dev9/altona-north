'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { translations, type Lang, type TranslationKey } from '@/lib/translations'

interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey) => string
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null
    if (stored === 'en' || stored === 'bg') setLangState(stored)
  }, [])

  function setLang(next: Lang) {
    setLangState(next)
    localStorage.setItem('lang', next)
    document.documentElement.lang = next
  }

  function t(key: TranslationKey): string {
    return translations[lang][key]
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useTranslation must be used inside LangProvider')
  return ctx
}