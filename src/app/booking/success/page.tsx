"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { format, differenceInCalendarDays, parseISO } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { bg as bgLocale } from "date-fns/locale/bg";
import { useTranslation } from "@/context/LangContext";
import styles from "./success.module.css";

const WA_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

function SuccessPageContent() {
    const { t, lang, setLang } = useTranslation();
    const searchParams = useSearchParams();

    const checkin = searchParams.get("checkin") ?? "";
    const checkout = searchParams.get("checkout") ?? "";
    const guests = Number(searchParams.get("guests") ?? 0);
    const total = searchParams.get("total") ?? "";

    const checkinDate = checkin ? parseISO(checkin) : null;
    const checkoutDate = checkout ? parseISO(checkout) : null;
    const nights =
        checkinDate && checkoutDate ? differenceInCalendarDays(checkoutDate, checkinDate) : 0;

    const dateLocale = lang === "bg" ? bgLocale : enUS;
    const formatDate = (d: Date) => format(d, "d MMM", { locale: dateLocale });
    const formatWeekday = (d: Date) => format(d, "EEEE", { locale: dateLocale });

    const bookingRef = checkinDate ? format(checkinDate, "'#AN-'yyyy'-'MMdd") : "—";

    const nightWord = nights === 1 ? t("booking_nights") : t("booking_nights_plural");
    const guestWord = guests === 1 ? t("booking_guest_singular") : t("booking_guest_plural");

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
                    {/* ── Animated checkmark ── */}
                    <div className={styles.checkWrap}>
                        <div className={styles.checkCircle}>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                    </div>

                    {/* ── Heading ── */}
                    <h1 className={styles.successHeading}>{t("success_heading")}</h1>
                    <p className={styles.successSub}>{t("success_sub")}</p>

                    {/* ── Booking summary card ── */}
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryHeader}>
                            <div>
                                <div className={styles.summaryHeaderProperty}>
                                    {lang === "bg" ? "Алтона Норт" : "Altona North"}
                                </div>
                                <div className={styles.summaryHeaderLocation}>
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    <span>{t("confirm_location")}</span>
                                </div>
                            </div>
                            <div className={styles.summaryRef}>
                                <span>{t("success_ref")}</span>
                                <span className={styles.summaryRefVal}>{bookingRef}</span>
                            </div>
                        </div>

                        <div className={styles.summaryDatesRow}>
                            <div className={styles.summaryDateBlock}>
                                <div className={styles.summaryDateLabel}>{t("booking_checkin")}</div>
                                <div className={styles.summaryDateVal}>
                                    {checkinDate ? formatDate(checkinDate) : "—"}
                                </div>
                                <div className={styles.summaryDateWeekday}>
                                    {checkinDate ? formatWeekday(checkinDate) : "—"}
                                </div>
                            </div>

                            <div className={styles.summaryDateArrow}>
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                                <span className={styles.summaryDateNights}>
                                    {nights > 0 ? `${nights} ${nightWord}` : "—"}
                                </span>
                            </div>

                            <div className={`${styles.summaryDateBlock} ${styles.summaryDateBlockRight}`}>
                                <div className={styles.summaryDateLabel}>{t("booking_checkout")}</div>
                                <div className={styles.summaryDateVal}>
                                    {checkoutDate ? formatDate(checkoutDate) : "—"}
                                </div>
                                <div className={styles.summaryDateWeekday}>
                                    {checkoutDate ? formatWeekday(checkoutDate) : "—"}
                                </div>
                            </div>
                        </div>

                        <div className={styles.summaryDetails}>
                            <div className={styles.summaryDetailCell}>
                                <div className={styles.summaryDetailLabel}>{t("booking_guests")}</div>
                                <div className={styles.summaryDetailVal}>
                                    {guests > 0 ? `${guests} ${guestWord}` : "—"}
                                </div>
                            </div>
                            <div className={styles.summaryDetailCell}>
                                <div className={styles.summaryDetailLabel}>{t("success_checkin_time")}</div>
                                <div className={styles.summaryDetailVal}>15:00 – 23:00</div>
                            </div>
                            <div className={styles.summaryDetailCell}>
                                <div className={styles.summaryDetailLabel}>{t("success_checkout_time")}</div>
                                <div className={styles.summaryDetailVal}>{t("success_checkout_by")}</div>
                            </div>
                        </div>

                        <div className={styles.summaryPrice}>
                            <div className={styles.summaryPriceLabel}>{t("success_total_paid")}</div>
                            <div className={styles.summaryPriceRight}>
                                <div className={styles.summaryPriceVal}>
                                    {total ? `€${total}` : "—"}
                                </div>
                                <div className={styles.summaryPriceNote}>{t("success_paid_note")}</div>
                            </div>
                        </div>
                    </div>

                    {/* ── Email note ── */}
                    <div className={styles.emailNote}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <p className={styles.emailNoteText}>{t("success_email_note")}</p>
                    </div>

                    {/* ── Actions ── */}
                    <div className={styles.actions}>
                        <a
                            href={`https://wa.me/${WA_NUMBER}`}
                            className={`${styles.btnPrimary} ${styles.btnWa}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                width="20"
                                height="20"
                                fill="white"
                                aria-hidden="true"
                            >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            {t("success_wa_btn")}
                        </a>
                        <Link href="/" className={styles.btnSecondary}>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            {t("success_back_btn")}
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function SuccessPage() {
    return (
        <Suspense>
            <SuccessPageContent />
        </Suspense>
    );
}
