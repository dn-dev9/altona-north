'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from '../layout.module.css'

interface Props {
    href: string
    children: React.ReactNode
}

export function AdminNavLink({ href, children }: Props) {
    const pathname = usePathname()
    const isActive =
        href === '/admin'
            ? pathname === '/admin'
            : pathname === href || pathname.startsWith(href + '/')

    return (
        <Link
            href={href}
            className={`${styles.navItem}${isActive ? ` ${styles.navItemActive}` : ''}`}
        >
            {children}
        </Link>
    )
}
