import { supabaseBrowser } from '@/lib/supabase'

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const { data: { session } } = await supabaseBrowser.auth.getSession()
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
            ...(options.headers as Record<string, string> | undefined),
        },
    })
}
