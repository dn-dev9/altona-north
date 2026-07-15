"use client";

import { useTranslation } from "@/context/LangContext";
import type { TranslationKey } from "@/lib/translations";
import styles from "./Location.module.css";

const SECTION_LABEL = { en: "Find us", bg: "Намерете ни" };
const ADDRESS_LABEL = { en: "Address", bg: "Адрес" };

interface NearbyItem {
    nameKey: TranslationKey;
    distKey: TranslationKey;
    icon: React.ReactNode;
}

const NEARBY: NearbyItem[] = [
    {
        nameKey: "location_beach",
        distKey: "location_beach_dist",
        icon: (
            <svg viewBox="0 0 24 24">
                <path d="M12.5 11.134 18.196 21" />
                <path d="M20.425 5.299a10 10 0 0 0-16.941 9.78c.183.563.843.774 1.355.478L20.16 6.711c.512-.296.66-.973.264-1.413" />
                <path d="M21 21H3" />
            </svg>
        ),
    },
    {
        nameKey: "location_little_sea",
        distKey: "location_little_sea_dist",
        icon: (
            <svg viewBox="0 0 24 24">
                <path d="M12.5 11.134 18.196 21" />
                <path d="M20.425 5.299a10 10 0 0 0-16.941 9.78c.183.563.843.774 1.355.478L20.16 6.711c.512-.296.66-.973.264-1.413" />
                <path d="M21 21H3" />
            </svg>
        ),
    },
    {
        nameKey: "location_center",
        distKey: "location_center_dist",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
            </svg>
        ),
    },
    {
        nameKey: "location_cape",
        distKey: "location_cape_dist",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ),
    },
    {
        nameKey: "location_golf",
        distKey: "location_golf_dist",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <line x1="12" y1="2" x2="12" y2="22" />
                <path d="M12 2l8 5-8 5" />
            </svg>
        ),
    },
    {
        nameKey: "location_airport",
        distKey: "location_airport_dist",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
        ),
    },
];

const MAPS_URL =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2044.911402256156!2d28.53340455135552!3d43.545262604978376!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40a4c434ba0832fd%3A0x2a214fb885672fc8!2z0YPQuy4g0JLQuNGF0YDQtdC9IDEwLCA5NjgwINCo0LDQsdC70LA!5e0!3m2!1sbg!2sbg!4v1782467709063!5m2!1sbg!2sbg";

export default function Location() {
    const { t, lang } = useTranslation();

    return (
        <section id="location" className="section">
            <div className="container">
                <div className="section-label">{SECTION_LABEL[lang]}</div>
                <h2 className="section-title">{t("location_title")}</h2>
                <div className="section-divider" />

                <div className={styles.locGrid}>
                    <div>
                        <p className={styles.locDescription}>{t("location_description")}</p>

                        <ul className={styles.nearbyList}>
                            {NEARBY.map(({ nameKey, distKey, icon }) => (
                                <li key={nameKey} className={styles.nearbyItem}>
                                    <span className={styles.nearbyName}>
                                        <div className={styles.nearbyIcon}>{icon}</div>
                                        {t(nameKey)}
                                    </span>
                                    <span className={styles.nearbyDist}>{t(distKey)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <div className={styles.mapPlaceholder}>
                            <iframe
                                src={MAPS_URL}
                                title={t("location_title")}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                            <div className={styles.mapLabel}>
                                <span className={styles.mapLabelTitle}>{ADDRESS_LABEL[lang]}</span>
                                {t("location_subtitle")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
