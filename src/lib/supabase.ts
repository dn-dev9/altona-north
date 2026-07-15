import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Server-side client — uses service role key so it bypasses RLS.
// Only referenced in route handlers; SUPABASE_SERVICE_ROLE_KEY is never
// included in client bundles (no NEXT_PUBLIC_ prefix).
export const supabaseServer = createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey,
    { auth: { persistSession: false, autoRefreshToken: false } }
)

export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey)

// Supabase defaults to localStorage which is inaccessible from Server Components.
// Mirror the access token into a plain cookie so the server auth guard can read it.
if (typeof window !== 'undefined') {
    supabaseBrowser.auth.onAuthStateChange((_event, session) => {
        if (session?.access_token) {
            const maxAge = Math.max(
                0,
                (session.expires_at ?? 0) - Math.floor(Date.now() / 1000)
            )
            document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`
        } else {
            document.cookie = 'sb-access-token=; path=/; max-age=0'
        }
    })
}