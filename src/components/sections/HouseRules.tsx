"use client";

import { useTranslation } from "@/context/LangContext";
import type { TranslationKey } from "@/lib/translations";
import type { Lang } from "@/lib/translations";
import styles from "./HouseRules.module.css";

const SECTION_LABEL = { en: "Before you arrive", bg: "Преди да пристигнете" };

type Inline = { en: string; bg: string };
type TextField = TranslationKey | Inline;

function resolve(f: TextField, t: (k: TranslationKey) => string, lang: Lang): string {
    return typeof f === "object" ? f[lang] : t(f);
}

interface RuleCard {
    icon: React.ReactNode;
    titleKey: TranslationKey;
    time: TextField;
    timeSmall?: boolean;
    note: TextField;
}

const RULES: RuleCard[] = [
    {
        titleKey: "rules_checkin",
        time: "rules_checkin_time",
        note: "rules_checkin_note",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
    },
    {
        titleKey: "rules_checkout",
        time: "rules_checkout_time",
        note: {
            en: "Baggage storage available if you need a late departure.",
            bg: "Съхранение на багаж при по-късно напускане.",
        },
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 8 14" />
            </svg>
        ),
    },
    {
        titleKey: "rules_smoking",
        time: { en: "Inside the house", bg: "Вътре в къщата" },
        timeSmall: true,
        note: "rules_smoking_note",
        icon: (
            <svg viewBox="0 0 24 24">
                <path d="M12 12H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h13" />
                <path d="M18 8c0-2.5-2-2.5-2-5" />
                <path d="m2 2 20 20" />
                <path d="M21 12a1 1 0 0 1 1 1v2a1 1 0 0 1-.5.866" />
                <path d="M22 8c0-2.5-2-2.5-2-5" />
                <path d="M7 12v4" />
            </svg>
        ),
    },
    {
        titleKey: "rules_pets",
        time: { en: "Free of charge", bg: "Безплатно" },
        timeSmall: true,
        note: "rules_pets_note",
        icon: (
            <svg viewBox="0 0 24 24">
                <circle cx="11" cy="4" r="2" />
                <circle cx="18" cy="8" r="2" />
                <circle cx="20" cy="16" r="2" />
                <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
            </svg>
        ),
    },
    {
        titleKey: "rules_children",
        time: { en: "All ages", bg: "Всякаква възраст" },
        timeSmall: true,
        note: "rules_children_note",
        icon: (
            <svg viewBox="0 0 24 24">
                <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
                <path d="M15 12h.01" />
                <path d="M19.38 6.813A9 9 0 0 1 20.8 10.2a2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1" />
                <path d="M9 12h.01" />
            </svg>
        ),
    },
    {
        titleKey: "rules_cancellation",
        time: { en: "Free up to 7 days before", bg: "Безплатно до 7 дни преди" },
        timeSmall: true,
        note: "rules_cancellation_note",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
            </svg>
        ),
    },
];

export default function HouseRules() {
    const { t, lang } = useTranslation();

    return (
        <section id="rules" className={`section ${styles.rules}`}>
            <div className="container">
                <div className="section-label">{SECTION_LABEL[lang]}</div>
                <h2 className="section-title">{t("rules_title")}</h2>
                <div className="section-divider" />

                <div className={styles.rulesGrid}>
                    {RULES.map((rule) => (
                        <div key={rule.titleKey} className={styles.ruleCard}>
                            <div className={styles.ruleIcon}>{rule.icon}</div>
                            <div className={styles.ruleTitle}>{t(rule.titleKey)}</div>
                            <div className={rule.timeSmall ? styles.ruleTimeSmall : styles.ruleTime}>
                                {resolve(rule.time, t, lang)}
                            </div>
                            <div className={styles.ruleNote}>{resolve(rule.note, t, lang)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
