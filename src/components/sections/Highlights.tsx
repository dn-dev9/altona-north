"use client";

import { useTranslation } from "@/context/LangContext";
import type { TranslationKey } from "@/lib/translations";
import styles from "./Highlights.module.css";

interface HlItem {
    valueKey: TranslationKey;
    subKey: TranslationKey;
    icon: React.ReactNode;
}

const ITEMS: HlItem[] = [
    {
        valueKey: "highlight_type",
        subKey: "highlight_type_sub",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
    },
    {
        valueKey: "highlight_bedrooms",
        subKey: "highlight_bedrooms_sub",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
                <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
                <path d="M12 4v6" />
                <path d="M2 18h20" />
            </svg>
        ),
    },
    {
        valueKey: "highlight_size",
        subKey: "highlight_size_sub",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" />
            </svg>
        ),
    },
    {
        valueKey: "highlight_parking",
        subKey: "highlight_parking_sub",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
            </svg>
        ),
    },
    {
        valueKey: "highlight_pets",
        subKey: "highlight_pets_sub",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="4" r="2" />
                <circle cx="18" cy="8" r="2" />
                <circle cx="20" cy="16" r="2" />
                <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
            </svg>
        ),
    },
];

export default function Highlights() {
    const { t } = useTranslation();

    return (
        <section id="highlights" className={styles.highlights}>
            <div className={`${styles.highlightsInner} container`}>
                {ITEMS.map((item) => (
                    <div key={item.valueKey} className={styles.hlItem}>
                        <div className={styles.hlIcon}>{item.icon}</div>
                        <div>
                            <span className={styles.hlValue}>{t(item.valueKey)}</span>
                            <span className={styles.hlText}>{t(item.subKey)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
