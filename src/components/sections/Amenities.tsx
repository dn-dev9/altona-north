"use client";

import { useTranslation } from "@/context/LangContext";
import type { TranslationKey } from "@/lib/translations";
import styles from "./Amenities.module.css";

interface AmenityItem {
    nameKey: TranslationKey;
    icon: React.ReactNode;
}

interface AmenityGroup {
    title: { en: string; bg: string };
    mt?: boolean;
    items: AmenityItem[];
}

const COLUMNS: AmenityGroup[][] = [
    [
        {
            title: { en: "Internet & media", bg: "Интернет и медии" },
            items: [
                {
                    nameKey: "amenity_wifi",
                    icon: (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M5 12.55a11 11 0 0114.08 0" />
                            <path d="M1.42 9a16 16 0 0121.16 0" />
                            <path d="M8.53 16.11a6 6 0 016.95 0" />
                            <circle cx="12" cy="20" r="1" />
                        </svg>
                    ),
                },
                {
                    nameKey: "amenity_tv",
                    icon: (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <rect x="2" y="7" width="20" height="15" rx="2" />
                            <polyline points="17 2 12 7 7 2" />
                        </svg>
                    ),
                },
            ],
        },
        {
            title: { en: "Kitchen", bg: "Кухня" },
            mt: true,
            items: [
                {
                    nameKey: "amenity_kitchen",
                    icon: (
                        <svg viewBox="0 0 24 24">
                            <path d="M2 12h20" />
                            <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
                            <path d="m4 8 16-4" />
                            <path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8" />
                        </svg>
                    ),
                },
                {
                    nameKey: "amenity_washing_machine",
                    icon: (
                        <svg viewBox="0 0 24 24">
                            <path d="M3 6h3" />
                            <path d="M17 6h.01" />
                            <rect width="18" height="20" x="3" y="2" rx="2" />
                            <circle cx="12" cy="13" r="5" />
                            <path d="M12 18a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 1 0-5" />
                        </svg>
                    ),
                },
                {
                    nameKey: "amenity_laundry",
                    icon: (
                        <svg viewBox="0 0 24 24">
                            <path d="M7.001 15.085A1.5 1.5 0 0 1 9 16.5" />
                            <circle cx="18.5" cy="8.5" r="3.5" />
                            <circle cx="7.5" cy="16.5" r="5.5" />
                            <circle cx="7.5" cy="4.5" r="2.5" />
                        </svg>
                    ),
                },
            ],
        },
    ],

    [
        {
            title: { en: "Outdoors", bg: "Навън" },
            items: [
                {
                    nameKey: "amenity_garden",
                    icon: (
                        <svg viewBox="0 0 24 24">
                            <path d="M17 10h-1a4 4 0 1 1 4-4v.534" />
                            <path d="M17 6h1a4 4 0 0 1 1.42 7.74l-2.29.87a6 6 0 0 1-5.339-10.68l2.069-1.31" />
                            <path d="M4.5 17c2.8-.5 4.4 0 5.5.8s1.8 2.2 2.3 3.7c-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2" />
                            <path d="M9.77 12C4 15 2 22 2 22" />
                            <circle cx="17" cy="8" r="2" />
                        </svg>
                    ),
                },
                {
                    nameKey: "amenity_bbq",
                    icon: (
                        <svg viewBox="0 0 24 24">
                            <path d="M16.4 13.7A6.5 6.5 0 1 0 6.28 6.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3" />
                            <path d="m18.5 6 2.19 4.5a6.48 6.48 0 0 1-2.29 7.2C15.4 20.2 11 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5" />
                            <circle cx="12.5" cy="8.5" r="2.5" />
                        </svg>
                    ),
                },
                {
                    nameKey: "amenity_terrace",
                    icon: (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                    ),
                },
                {
                    nameKey: "amenity_outdoor_furniture",
                    icon: (
                        <svg viewBox="0 0 24 24">
                            <path d="M12.5 11.134 18.196 21" />
                            <path d="M20.425 5.299a10 10 0 0 0-16.941 9.78c.183.563.843.774 1.355.478L20.16 6.711c.512-.296.66-.973.264-1.413" />
                            <path d="M21 21H3" />
                        </svg>
                    ),
                },
                {
                    nameKey: "amenity_picnic",
                    icon: (
                        <svg viewBox="0 0 24 24">
                            <path d="M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z" />
                            <path d="M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z" />
                            <path d="M7 14c3.22-2.91 4.29-8.75 5-12 1.66 2.38 4.94 9 5 12" />
                            <path d="M22 9c-4.29 0-7.14-2.33-10-7 5.71 0 10 4.67 10 7Z" />
                        </svg>
                    ),
                },
            ],
        },
    ],

    [
        {
            title: { en: "Comfort & safety", bg: "Комфорт и безопасност" },
            items: [
                {
                    nameKey: "amenity_ac",
                    icon: (
                        <svg viewBox="0 0 24 24">
                            <path d="M12.8 19.6A2 2 0 1 0 14 16H2" />
                            <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" />
                            <path d="M9.8 4.4A2 2 0 1 1 11 8H2" />
                        </svg>
                    ),
                },
                {
                    nameKey: "amenity_parking",
                    icon: (
                        <svg viewBox="0 0 24 24">
                            <rect width="18" height="18" x="3" y="3" rx="2" />
                            <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
                        </svg>
                    ),
                },
                {
                    nameKey: "amenity_pets",
                    icon: (
                        <svg viewBox="0 0 24 24">
                            <path d="M11.25 16.25h1.5L12 17z" />
                            <path d="M16 14v.5" />
                            <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309" />
                            <path d="M8 14v.5" />
                            <path d="M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5" />
                        </svg>
                    ),
                },
                {
                    nameKey: "amenity_fire",
                    icon: (
                        <svg viewBox="0 0 24 24">
                            <path d="M15 6.5V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3.5" />
                            <path d="M9 18h8" />
                            <path d="M18 3h-3" />
                            <path d="M11 3a6 6 0 0 0-6 6v11" />
                            <path d="M5 13h4" />
                            <path d="M17 10a4 4 0 0 0-8 0v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2Z" />
                        </svg>
                    ),
                },
                {
                    nameKey: "amenity_key",
                    icon: (
                        <svg viewBox="0 0 24 24">
                            <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
                            <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
                        </svg>
                    ),
                },
                {
                    nameKey: "amenity_shop",
                    icon: (
                        <svg viewBox="0 0 24 24">
                            <path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5" />
                            <path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244" />
                            <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05" />
                        </svg>
                    ),
                },
            ],
        },
    ],
];

const SECTION_LABEL = { en: "What's included", bg: "Какво е включено" };

export default function Amenities() {
    const { t, lang } = useTranslation();

    return (
        <section id="amenities" className={`section ${styles.amenities}`}>
            <div className="container">
                <div className="section-label">{SECTION_LABEL[lang]}</div>
                <h2 className="section-title">{t("amenities_title")}</h2>
                <div className="section-divider" />

                <div className={styles.amenityGroups}>
                    {COLUMNS.map((groups, colIdx) => (
                        <div key={colIdx}>
                            {groups.map((group, groupIdx) => (
                                <div key={groupIdx}>
                                    <div
                                        className={`${styles.amenityGroupTitle}${group.mt ? ` ${styles.amenityGroupTitleMt}` : ""}`}
                                    >
                                        {group.title[lang]}
                                    </div>
                                    {group.items.map((item) => (
                                        <div key={item.nameKey} className={styles.amenityItem}>
                                            <div className={styles.amenityIcon}>{item.icon}</div>
                                            <span className={styles.amenityName}>{t(item.nameKey)}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
