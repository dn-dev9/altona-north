import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: Request) {
    try {
        const body: { name: string; email: string; message: string } = await request.json()
        const { name, email, message } = body

        if (!name?.trim() || !email?.trim() || !message?.trim()) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const ownerEmail = process.env.CONTACT_EMAIL
        if (!ownerEmail) {
            return NextResponse.json({ error: 'Contact email not configured' }, { status: 500 })
        }

        const resend = new Resend(process.env.RESEND_API_KEY)

        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL ?? 'noreply@resend.dev',
            to: ownerEmail,
            replyTo: email,
            subject: `Contact form – ${name}`,
            html: `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
  <h2 style="color:#1a1a1a">New message from the Altona North website</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0">
    <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;width:80px">Name</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600">${name}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Email</td><td style="padding:8px 0;border-bottom:1px solid #eee"><a href="mailto:${email}" style="color:#1a1a1a">${email}</a></td></tr>
  </table>
  <p style="white-space:pre-wrap;line-height:1.6">${message}</p>
</div>`,
        })

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }
}