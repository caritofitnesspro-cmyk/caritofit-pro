// @ts-nocheck
// app/api/mp/oauth-callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getpulseapp.lat'

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/admin?cobros=error`)
  }

  try {
    let adminId: string
    try {
      const decoded = JSON.parse(atob(state))
      adminId = decoded.adminId
      if (Date.now() - decoded.ts > 30 * 60 * 1000) {
        return NextResponse.redirect(`${appUrl}/admin?cobros=expired`)
      }
    } catch {
      return NextResponse.redirect(`${appUrl}/admin?cobros=error`)
    }

    if (!adminId) return NextResponse.redirect(`${appUrl}/admin?cobros=error`)

    const res = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_secret: process.env.MP_ACCESS_TOKEN,
        client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${appUrl}/api/mp/oauth-callback`,
      }),
    })

    const data = await res.json()

    if (!res.ok || !data.access_token) {
      console.error('OAuth error:', data)
      return NextResponse.redirect(`${appUrl}/admin?cobros=error`)
    }

    const supabase = createClient()
    await supabase
      .from('perfiles')
      .update({
        mp_cobros_access_token: data.access_token,
        mp_cobros_user_id: String(data.user_id),
        cobros_activos: true,
      })
      .eq('id', adminId)
      .eq('rol', 'admin')

    console.log(`MP conectado para admin: ${adminId}`)
    return NextResponse.redirect(`${appUrl}/admin?cobros=ok`)

  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(`${appUrl}/admin?cobros=error`)
  }
}
