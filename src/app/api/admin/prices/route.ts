import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

async function requireAdmin(request: Request) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { data: { user }, error } = await supabaseServer.auth.getUser(token)
    if (error || !user) return null
    return user
}

type DbRow = {
    id: string
    date_from: string
    date_to: string
    price_eur: number
    label: string
}

function toClient(row: DbRow) {
    return {
        id: row.id,
        dateFrom: row.date_from,
        dateTo: row.date_to,
        priceEur: row.price_eur,
        label: row.label ?? '',
    }
}

export async function GET(request: Request) {
    try {
        const user = await requireAdmin(request)
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Delete expired ranges before returning the list
        await supabaseServer
            .from('pricing')
            .delete()
            .lt('date_to', new Date().toISOString().slice(0, 10))

        const { data, error } = await supabaseServer
            .from('pricing')
            .select('id, date_from, date_to, price_eur, label')
            .order('date_from')

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json((data ?? []).map(toClient))
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const user = await requireAdmin(request)
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body: {
            dateFrom: string
            dateTo: string
            priceEur: number
            label?: string
        } = await request.json()

        const { data, error } = await supabaseServer
            .from('pricing')
            .insert({
                date_from: body.dateFrom,
                date_to: body.dateTo,
                price_eur: body.priceEur,
                label: body.label ?? '',
            })
            .select('id, date_from, date_to, price_eur, label')
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json(toClient(data as DbRow))
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const user = await requireAdmin(request)
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body: { id: string } = await request.json()

        const { error } = await supabaseServer
            .from('pricing')
            .delete()
            .eq('id', body.id)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
