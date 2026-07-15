import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

async function requireAdmin(request: Request) {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const { data: { user }, error } = await supabaseServer.auth.getUser(token)
    if (error || !user) return null
    return user
}

export async function GET(request: Request) {
    try {
        const user = await requireAdmin(request)
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data, error } = await supabaseServer
            .from('settings')
            .select('*')
            .eq('id', 1)
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const user = await requireAdmin(request)
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body: {
            max_occupancy: number
            base_rate: number
            base_occupancy: number
            extra_person_fee: number
            min_nights: number
            checkin_from: string
            checkin_to: string
            checkout_by: string
            whatsapp: string
            contact_email: string
        } = await request.json()

        const { error } = await supabaseServer
            .from('settings')
            .upsert(
                {
                    id: 1,
                    max_occupancy: body.max_occupancy,
                    base_rate: body.base_rate,
                    base_occupancy: body.base_occupancy,
                    extra_person_fee: body.extra_person_fee,
                    min_nights: body.min_nights,
                    checkin_from: body.checkin_from,
                    checkin_to: body.checkin_to,
                    checkout_by: body.checkout_by,
                    whatsapp: body.whatsapp,
                    contact_email: body.contact_email,
                },
                { onConflict: 'id' }
            )

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
