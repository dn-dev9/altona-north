"use client";

import Image from "next/image";
import { format } from "date-fns";
import { useTranslation } from "@/context/LangContext";
import styles from "./Hero.module.css";

function fmtDate(iso: string | null, fallback: string) {
    if (!iso) return fallback
    return format(new Date(iso), 'd MMM')
}

interface Props {
    checkin?: string | null;
    checkout?: string | null;
    guests?: number;
}

export default function Hero({ checkin = null, checkout = null, guests = 2 }: Props) {
    const { t } = useTranslation();

    function scrollToBooking(e: React.MouseEvent) {
        e.preventDefault()
        document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <section id="hero" className={styles.hero}>
            <div className={styles.heroBg}>
                <Image src="/images/690093504.jpg" alt={t("hero_title")} fill style={{ objectFit: "cover" }} priority />
            </div>

            <div className={styles.heroOverlay} />

            <div className={styles.heroScore}>
                <div className={styles.heroScoreNum}>{t("hero_score")}</div>
                <div className={styles.heroScoreLabel}>{t("hero_score_label")}</div>
            </div>

            <div className={styles.heroContent}>
                <div className={styles.heroEyebrow}>{t("hero_location")}</div>
                <h1 className={styles.heroTitle}>{t("hero_title")}</h1>
                <p className={styles.heroSubtitle}>{t("hero_subtitle")}</p>

                <div className={styles.heroBookingBar}>
                    <a href="#booking" className={styles.hbbField} onClick={scrollToBooking}>
                        <span className={styles.hbbLabel}>{t("booking_checkin")}</span>
                        <span className={styles.hbbValue}>{fmtDate(checkin, t("booking_select_date"))}</span>
                    </a>

                    <div className={styles.hbbSep} />

                    <a href="#booking" className={styles.hbbField} onClick={scrollToBooking}>
                        <span className={styles.hbbLabel}>{t("booking_checkout")}</span>
                        <span className={styles.hbbValue}>{fmtDate(checkout, t("booking_select_date"))}</span>
                    </a>

                    <div className={styles.hbbSep} />

                    <a href="#booking" className={styles.hbbField} onClick={scrollToBooking}>
                        <span className={styles.hbbLabel}>{t("booking_guests")}</span>
                        <span className={styles.hbbValue}>
                            {guests} {t(guests === 1 ? "booking_guest_singular" : "booking_guest_plural")}
                        </span>
                    </a>

                    <a href="#booking" className={`btn-primary ${styles.hbbBtn}`} onClick={scrollToBooking}>
                        {t("hero_cta")}
                    </a>
                </div>
            </div>
        </section>
    );
}
