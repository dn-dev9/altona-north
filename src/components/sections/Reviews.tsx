"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/context/LangContext";
import type { TranslationKey } from "@/lib/translations";
import styles from "./Reviews.module.css";

const AUTOPLAY_INTERVAL = 7000;

const HEADING = { en: "Exceptional in every way", bg: "Изключително по всякакъв начин" };
const ON_BOOKING = { en: "on Booking.com", bg: "в Booking.com" };

const SCORE_CATS: { key: TranslationKey; value: string; pct: number }[] = [
    { key: "reviews_categories_host", value: "10", pct: 100 },
    { key: "reviews_categories_cleanliness", value: "10", pct: 100 },
    { key: "reviews_categories_comfort", value: "10", pct: 100 },
    { key: "reviews_categories_facilities", value: "10", pct: 100 },
    { key: "reviews_categories_value", value: "10", pct: 100 },
    { key: "reviews_categories_location", value: "9.3", pct: 93 },
];

const REVIEWS: { num: number; score: number; flag: string }[] = [
    { num: 1, score: 10, flag: "🇧🇬" },
    { num: 2, score: 10, flag: "🇧🇬" },
    { num: 3, score: 10, flag: "🇧🇬" },
    { num: 4, score: 10, flag: "🇧🇬" },
    { num: 5, score: 10, flag: "🇩🇪" },
    { num: 6, score: 10, flag: "🇧🇬" },
];

export default function Reviews() {
    const { t, lang } = useTranslation();
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
    const [selectedIdx, setSelectedIdx] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pausedRef = useRef(false);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIdx(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    const startAutoplay = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            if (!pausedRef.current) emblaApi?.scrollNext();
        }, AUTOPLAY_INTERVAL);
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("select", onSelect);
        startAutoplay();
        return () => {
            emblaApi.off("select", onSelect);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [emblaApi, onSelect, startAutoplay]);

    const handleMouseEnter = () => {
        pausedRef.current = true;
    };
    const handleMouseLeave = () => {
        pausedRef.current = false;
    };

    return (
        <section id="reviews" className={`section ${styles.reviews}`}>
            <div className="container">
                <div className={styles.reviewsLabel}>{t("reviews_title")}</div>
                <h2 className={styles.reviewsTitle}>{HEADING[lang]}</h2>

                <div className={styles.scoreRow}>
                    <div>
                        <div className={styles.scoreBig}>{t("hero_score")}</div>
                        <div className={styles.scoreLabel}>{t("reviews_score_label")}</div>
                        <div className={styles.scoreCount}>
                            {t("reviews_count")} {ON_BOOKING[lang]}
                        </div>
                    </div>

                    <div className={styles.scoreCats}>
                        {SCORE_CATS.map(({ key, value, pct }) => (
                            <div key={key} className={styles.scoreCat}>
                                <span className={styles.scoreCatName}>{t(key)}</span>
                                <div className={styles.scoreCatBar}>
                                    <div className={styles.scoreCatFill} style={{ width: `${pct}%` }} />
                                </div>
                                <span className={styles.scoreCatVal}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    className={styles.reviewsSlider}
                    ref={emblaRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className={styles.reviewsTrack}>
                        {REVIEWS.map(({ num, score, flag }) => {
                            const authorKey = `review_${num}_author` as TranslationKey;
                            const countryKey = `review_${num}_country` as TranslationKey;
                            const textKey = `review_${num}_text` as TranslationKey;
                            const initial = t(authorKey).charAt(0);

                            return (
                                <div key={num} className={styles.reviewCard}>
                                    <div className={styles.reviewScoreBadge}>
                                        <span className={styles.reviewScoreNum}>{score}</span>
                                        <span className={styles.reviewStars}>★★★★★</span>
                                    </div>
                                    <p className={styles.reviewText}>{t(textKey)}</p>
                                    <div className={styles.reviewAuthor}>
                                        <div className={styles.reviewAvatar}>{initial}</div>
                                        <div>
                                            <div className={styles.reviewName}>{t(authorKey)}</div>
                                            <div className={styles.reviewCountry}>
                                                {flag} {t(countryKey)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.reviewsControls}>
                    <button
                        className={styles.revBtn}
                        onClick={() => emblaApi?.scrollPrev()}
                        aria-label="Previous review"
                    >
                        ←
                    </button>
                    <button className={styles.revBtn} onClick={() => emblaApi?.scrollNext()} aria-label="Next review">
                        →
                    </button>
                    <div className={styles.revDots}>
                        {REVIEWS.map((_, i) => (
                            <button
                                key={i}
                                className={`${styles.revDot}${i === selectedIdx ? ` ${styles.revDotActive}` : ""}`}
                                onClick={() => emblaApi?.scrollTo(i)}
                                aria-label={`Go to review ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
