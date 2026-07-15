"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { bg as bgLocale } from "date-fns/locale/bg";
import { useTranslation } from "@/context/LangContext";
import styles from "./cancel.module.css";

function CancelPageContent() {
    const { t, lang, setLang } = useTranslation();
    const searchParams = useSearchParams();

    const checkin = searchParams.get("checkin") ?? "";
    const checkout = searchParams.get("checkout") ?? "";
    const guests = searchParams.get("guests") ?? "";
    const total = searchParams.get("total") ?? "";

    const dateLocale = lang === "bg" ? bgLocale : enUS;
    const formatDate = (iso: string) =>
        format(parseISO(iso), "d MMM yyyy", { locale: dateLocale });

    const checkinDisplay = checkin ? formatDate(checkin) : "—";
    const checkoutDisplay = checkout ? formatDate(checkout) : "—";
    const guestWord = guests === "1" ? t("booking_guest_singular") : t("booking_guest_plural");
    const guestsDisplay = guests ? `${guests} ${guestWord}` : "—";
    const totalDisplay = total ? `€${total}` : "—";

    const retryHref =
        checkin && checkout && guests
            ? `/#booking?checkin=${checkin}&checkout=${checkout}&guests=${guests}`
            : "/#booking";

    return (
        <>
            <nav className={styles.nav}>
                <Link href="/" className={styles.navLogo}>
                    {lang === "bg" ? "Алтона Норт" : "Altona North"}
                </Link>
                <div className={styles.langToggle}>
                    <button
                        className={`${styles.langBtn}${lang === "en" ? ` ${styles.langBtnActive}` : ""}`}
                        onClick={() => setLang("en")}
                    >
                        EN
                    </button>
                    <button
                        className={`${styles.langBtn}${lang === "bg" ? ` ${styles.langBtnActive}` : ""}`}
                        onClick={() => setLang("bg")}
                    >
                        BG
                    </button>
                </div>
            </nav>

            <div className={styles.page}>
                <div className={styles.pageInner}>
                    {/* ── Icon ── */}
                    <div className={styles.iconWrap}>
                        <div className={styles.iconCircle}>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </div>
                    </div>

                    {/* ── Heading ── */}
                    <h1 className={styles.cancelHeading}>{t("cancel_heading")}</h1>
                    <p className={styles.cancelSub}>{t("cancel_sub")}</p>

                    {/* ── Saved details card ── */}
                    <div className={styles.detailsCard}>
                        <div className={styles.detailsCardTitle}>{t("cancel_saved_selection")}</div>

                        <div className={styles.detailsRow}>
                            <span className={styles.detailsRowLabel}>
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <rect x="3" y="4" width="18" height="18" rx="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                {t("booking_checkin")}
                            </span>
                            <span className={styles.detailsRowVal}>{checkinDisplay}</span>
                        </div>

                        <div className={styles.detailsRow}>
                            <span className={styles.detailsRowLabel}>
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <rect x="3" y="4" width="18" height="18" rx="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                {t("booking_checkout")}
                            </span>
                            <span className={styles.detailsRowVal}>{checkoutDisplay}</span>
                        </div>

                        <div className={styles.detailsRow}>
                            <span className={styles.detailsRowLabel}>
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                                    <path d="M16 3.13a4 4 0 010 7.75" />
                                </svg>
                                {t("booking_guests")}
                            </span>
                            <span className={styles.detailsRowVal}>{guestsDisplay}</span>
                        </div>

                        <div className={styles.detailsRow}>
                            <span className={styles.detailsRowLabel}>
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <line x1="12" y1="1" x2="12" y2="23" />
                                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                                </svg>
                                {t("booking_total")}
                            </span>
                            <span className={styles.detailsRowVal}>{totalDisplay}</span>
                        </div>
                    </div>

                    {/* ── Actions ── */}
                    <div className={styles.actions}>
                        <a href={retryHref} className={styles.btnPrimary}>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <polyline points="1 4 1 10 7 10" />
                                <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                            </svg>
                            {t("cancel_try_again")}
                        </a>
                        <Link href="/" className={styles.btnSecondary}>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            {t("cancel_back")}
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function CancelPage() {
    return (
        <Suspense>
            <CancelPageContent />
        </Suspense>
    );
}