'use client'

import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase'
import styles from '../layout.module.css'

export function SignOutButton() {
    const router = useRouter()

    async function handleSignOut() {
        await supabaseBrowser.auth.signOut()
        router.push('/admin/login')
    }

    return (
        <button className={styles.signoutBtn} onClick={handleSignOut}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
        </button>
    )
}