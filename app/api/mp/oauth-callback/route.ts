// @ts-nocheck
// app/api/mp/oauth-callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getpulseapp.lat'

  if (!code) {
    return NextResponse.redirect(`${appUrl}/admin?cobros=error`)
  }

  try {
    // Intercambiar code por access token
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

    // Guardar en Supabase — necesitamos saber quién es el admin
    // Usamos el user_id de MP para identificarlo
    const supabase = createClient()

    // Buscar el admin por mp_user_id si ya existe, o actualizarlo
    // Por ahora actualizamos el admin que inició el flujo
    // En producción deberías usar el state parameter de OAuth
    const { data: admins } = await supabase
      .from('perfiles')
      .select('id')
      .eq('rol', 'admin')
      .is('mp_cobros_user_id', null)
      .order('created_at', { ascending: false })
      .limit(1)

    if (admins && admins.length > 0) {
      await supabase
        .from('perfiles')
        .update({
          mp_cobros_access_token: data.access_token,
          mp_cobros_user_id: String(data.user_id),
          cobros_activos: true,
        })
        .eq('id', admins[0].id)
    }

    return NextResponse.redirect(`${appUrl}/admin?cobros=ok`)
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(`${appUrl}/admin?cobros=error`)
  }
}
