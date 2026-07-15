"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/context/LangContext";
import { supabaseBrowser } from "@/lib/supabase";
import styles from "./login.module.css";

export default function AdminLoginPage() {
    const { t, lang, setLang } = useTranslation();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const emailEmpty = !email.trim();
        const passwordEmpty = !password.trim();
        setEmailError(emailEmpty);
        setPasswordError(passwordEmpty);
        if (emailEmpty || passwordEmpty) return;

        setLoading(true);
        setError("");

        const { error: authError, data } = await supabaseBrowser.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        // Set cookie before navigation so the server auth guard sees it immediately
        if (data.session?.access_token) {
            const maxAge = Math.max(0, (data.session.expires_at ?? 0) - Math.floor(Date.now() / 1000));
            document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
        }

        router.push("/admin");
    }

    return (
        <div className={styles.pageShell}>
            <div className={styles.topRight}>
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
            </div>
            <div className={styles.loginWrap}>
                <div className={styles.loginLogo}>
                    <span className={styles.loginLogoName}>Altona North</span>
                    <span className={styles.loginLogoLabel}>{t("admin_login_label")}</span>
                </div>

                <div className={styles.loginCard}>
                    {error && (
                        <div className={styles.errorMsg}>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {t("admin_login_error")}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>{t("admin_login_email")}</label>
                            <input
                                type="email"
                                className={`${styles.formInput}${emailError ? ` ${styles.inputError}` : ""}`}
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setEmailError(false);
                                }}
                                autoComplete="email"
                                autoFocus
                            />
                        </div>

                        <div className={styles.formGroupLast}>
                            <label className={styles.formLabel}>{t("admin_login_password")}</label>
                            <input
                                type="password"
                                className={`${styles.formInput}${passwordError ? ` ${styles.inputError}` : ""}`}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setPasswordError(false);
                                }}
                                autoComplete="current-password"
                            />
                        </div>

                        <button type="submit" className={styles.btnSignin} disabled={loading}>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                                <polyline points="10 17 15 12 10 7" />
                                <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                            {loading ? t("admin_login_signing_in") : t("admin_login_btn")}
                        </button>
                    </form>
                </div>

                <div className={styles.loginFooter}>
                    <Link href="/">{t("admin_login_back")}</Link>
                </div>
            </div>
        </div>
    );
}
