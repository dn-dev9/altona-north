"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format, differenceInCalendarDays, parseISO } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { bg as bgLocale } from "date-fns/locale/bg";
import { useTranslation } from "@/context/LangContext";
import { supabaseBrowser } from "@/lib/supabase";
import styles from "./confirm.module.css";

function ConfirmPageContent() {
    const { t, lang, setLang } = useTranslation();
    const searchParams = useSearchParams();
    const router = useRouter();

    const checkin = searchParams.get("checkin") ?? "";
    const checkout = searchParams.get("checkout") ?? "";
    const guests = Number(searchParams.get("guests") ?? 2);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [specialRequests, setSpecialRequests] = useState("");
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [settings, setSettings] = useState({ base_rate: 10000, base_occupancy: 2, extra_person_fee: 1500 });

    useEffect(() => {
        if (!checkin || !checkout) {
            router.replace("/#booking");
        }
    }, [checkin, checkout, router]);

    useEffect(() => {
        supabaseBrowser
            .from('settings')
            .select('base_rate, base_occupancy, extra_person_fee')
            .eq('id', 1)
            .single()
            .then(({ data }) => { if (data) setSettings(data as typeof settings) })
    }, []);

    useEffect(() => {
        document.title = t("confirm_page_title");
    }, [t]);

    const checkinDate = checkin ? parseISO(checkin) : null;
    const checkoutDate = checkout ? parseISO(checkout) : null;
    const nights = checkinDate && checkoutDate ? differenceInCalendarDays(checkoutDate, checkinDate) : 0;
    const rateEur = settings.base_rate / 100;
    const feeEur = settings.extra_person_fee / 100;
    const extraGuests = Math.max(0, guests - settings.base_occupancy);
    const baseTotal = nights * rateEur;
    const extraGuestFee = extraGuests * feeEur * nights;
    const total = baseTotal + extraGuestFee;

    const dateLocale = lang === "bg" ? bgLocale : enUS;
    const formatDateDisplay = (d: Date) => format(d, "d MMM", { locale: dateLocale });
    const formatWeekday = (d: Date) => format(d, "EEEE", { locale: dateLocale });

    const guestWord = guests === 1 ? t("booking_guest_singular") : t("booking_guest_plural");
    const nightWord = nights === 1 ? t("booking_nights") : t("booking_nights_plural");

    function validate(): boolean {
        const next: Record<string, boolean> = {};
        if (!firstName.trim()) next.firstName = true;
        if (!lastName.trim()) next.lastName = true;
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = true;
        if (!phone.trim()) next.phone = true;
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setSubmitError("");
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    checkin,
                    checkout,
                    guests,
                    guestName: `${firstName} ${lastName}`,
                    guestEmail: email,
                    guestPhone: phone,
                    specialRequests,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Something went wrong.");
            window.location.href = data.url;
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
            setLoading(false);
        }
    }

    const btnText = loading ? t("confirm_redirecting") : t("confirm_btn").replace("{total}", String(total));

    return (
        <>
            <nav className={styles.nav}>
                <Link href="/" className={styles.navLogo}>
                    {lang === "bg" ? "Алтона Норт" : "Altona North"}
                </Link>
                <div className={styles.navRight}>
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
                    <Link href="/#booking" className={styles.navBack}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        {t("confirm_nav_back")}
                    </Link>
                </div>
            </nav>

            <div className={styles.page}>
                <div className={styles.pageInner}>
                    {/* ── Form column ── */}
                    <div>
                        <div className={styles.formSection}>
                            <h1 className={styles.formHeading}>{t("confirm_heading")}</h1>
                            <p className={styles.formSubheading}>{t("confirm_subheading")}</p>

                            <form onSubmit={handleSubmit} noValidate>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            {t("confirm_first_name")}
                                            <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`${styles.formInput}${errors.firstName ? ` ${styles.inputError}` : ""}`}
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            autoComplete="given-name"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            {t("confirm_last_name")}
                                            <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`${styles.formInput}${errors.lastName ? ` ${styles.inputError}` : ""}`}
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            autoComplete="family-name"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        {t("confirm_email")}
                                        <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className={`${styles.formInput}${errors.email ? ` ${styles.inputError}` : ""}`}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        {t("confirm_phone")}
                                        <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        className={`${styles.formInput}${errors.phone ? ` ${styles.inputError}` : ""}`}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        autoComplete="tel"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>{t("confirm_special_requests")}</label>
                                    <textarea
                                        className={`${styles.formInput} ${styles.formTextarea}`}
                                        placeholder={t("confirm_special_requests_placeholder")}
                                        value={specialRequests}
                                        onChange={(e) => setSpecialRequests(e.target.value)}
                                    />
                                </div>

                                <button type="submit" className={styles.btnReserve} disabled={loading}>
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <rect x="1" y="4" width="22" height="16" rx="2" />
                                        <line x1="1" y1="10" x2="23" y2="10" />
                                    </svg>
                                    {btnText}
                                </button>

                                {submitError && <p className={styles.submitError}>{submitError}</p>}
                            </form>

                            <div className={styles.secureNote}>
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                    <path d="M7 11V7a5 5 0 0110 0v4" />
                                </svg>
                                {t("confirm_secure")}
                            </div>
                        </div>

                        <div className={styles.cancellationNote}>
                            <p>
                                <strong>{t("confirm_cancellation_title")}</strong> {t("confirm_cancellation_body")}
                            </p>
                        </div>
                    </div>

                    {/* ── Summary column ── */}
                    <div>
                        <div className={styles.summaryCard}>
                            <div className={styles.summaryImgWrap}>
                                <Image
                                    src="/images/690093504.jpg"
                                    alt="Altona North"
                                    fill
                                    unoptimized
                                    priority
                                    style={{ objectFit: "cover" }}
                                />
                            </div>
                            <div className={styles.summaryBody}>
                                <div className={styles.summaryProperty}>
                                    {lang === "bg" ? "Алтона Норт" : "Altona North"}
                                </div>
                                <div className={styles.summaryLocation}>
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    {t("confirm_location")}
                                </div>

                                <div className={styles.summaryScore}>
                                    <span className={styles.summaryScoreNum}>{t("hero_score")}</span>
                                    <div>
                                        <div className={styles.summaryScoreStars}>★★★★★</div>
                                        <div className={styles.summaryScoreLabel}>{t("hero_score_label")}</div>
                                    </div>
                                </div>

                                {checkinDate && checkoutDate && (
                                    <div className={styles.summaryDates}>
                                        <div className={styles.summaryDateCell}>
                                            <div className={styles.summaryDateLabel}>{t("booking_checkin")}</div>
                                            <div className={styles.summaryDateVal}>
                                                {formatDateDisplay(checkinDate)}
                                            </div>
                                            <div className={styles.summaryDateDay}>{formatWeekday(checkinDate)}</div>
                                        </div>
                                        <div className={`${styles.summaryDateCell} ${styles.summaryDateCellRight}`}>
                                            <div className={styles.summaryDateLabel}>{t("booking_checkout")}</div>
                                            <div className={styles.summaryDateVal}>
                                                {formatDateDisplay(checkoutDate)}
                                            </div>
                                            <div className={styles.summaryDateDay}>{formatWeekday(checkoutDate)}</div>
                                        </div>
                                    </div>
                                )}

                                <div className={styles.summaryGuests}>
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                                        <path d="M16 3.13a4 4 0 010 7.75" />
                                    </svg>
                                    <span className={styles.summaryGuestsText}>
                                        {guests} {guestWord} · {nights} {nightWord}
                                    </span>
                                </div>

                                <div className={styles.priceRows}>
                                    <div className={styles.priceRow}>
                                        <span className={styles.priceRowLabel}>
                                            {nights} {nightWord} × €{rateEur}
                                        </span>
                                        <span className={styles.priceRowVal}>€{baseTotal}</span>
                                    </div>
                                    {extraGuestFee > 0 && (
                                        <div className={styles.priceRow}>
                                            <span className={styles.priceRowLabel}>
                                                {t("booking_extra_guest")} ({extraGuests} × €{feeEur} × {nights})
                                            </span>
                                            <span className={styles.priceRowVal}>€{extraGuestFee}</span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.priceDivider} />

                                <div className={styles.priceTotalRow}>
                                    <span className={styles.priceTotalLabel}>{t("booking_total")}</span>
                                    <span className={styles.priceTotalVal}>€{total}</span>
                                </div>
                                <p className={styles.priceNote}>{t("confirm_no_extra_charges")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function ConfirmPage() {
    return (
        <Suspense>
            <ConfirmPageContent />
        </Suspense>
    );
}
