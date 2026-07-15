import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

async function requireAdmin(request: Request) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { data: { user }, error } = await supabaseServer.auth.getUser(token)
    if (error || !user) return null
    return user
}

export async function GET(request: Request) {
    try {
        const user = await requireAdmin(request)
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data, error } = await supabaseServer
            .from('blocked_dates')
            .select('date')
            .order('date')

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({
            blockedDates: (data ?? []).map(r => r.date as string),
        })
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const user = await requireAdmin(request)
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body: { date: string; action: 'block' | 'unblock' } = await request.json()

        if (body.action === 'block') {
            const { error } = await supabaseServer
                .from('blocked_dates')
                .insert({ date: body.date })
            if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        } else {
            const { error } = await supabaseServer
                .from('blocked_dates')
                .delete()
                .eq('date', body.date)
            if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}