// @ts-nocheck
// app/api/mp/crear-pago/route.ts — CON AUTH VERIFICADA
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

const COMISION_FREE = 0.08
const COMISION_PRO  = 0.05

export async function POST(req: NextRequest) {
  try {
    const { alumnoId, adminId } = await req.json()
    if (!alumnoId || !adminId) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const supabase = createClient()

    // ── 1. VERIFICAR AUTH ──
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo el alumno puede iniciar su propio pago
    if (user.id !== alumnoId) {
      console.error(`Intento no autorizado: user ${user.id} como alumno ${alumnoId}`)
      return NextResponse.json({ error: 'Prohibido' }, { status: 403 })
    }

    // ── 2. VERIFICAR QUE EL ALUMNO PERTENECE AL ADMIN ──
    const { data: alumno } = await supabase
      .from('perfiles')
      .select('nombre, apellido, email, precio_mensual, admin_id')
      .eq('id', alumnoId)
      .single()

    if (!alumno) return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })
    if (alumno.admin_id !== adminId) {
      console.error(`adminId manipulado: alumno ${alumnoId} no pertenece a admin ${adminId}`)
      return NextResponse.json({ error: 'Prohibido' }, { status: 403 })
    }
    if (!alumno.precio_mensual) return NextResponse.json({ error: 'Precio no definido' }, { status: 400 })

    // ── 3. CARGAR ADMIN ──
    const { data: admin } = await supabase
      .from('perfiles')
      .select('plan, mp_cobros_access_token, cobros_activos, brand_name')
      .eq('id', adminId)
      .eq('rol', 'admin')
      .single()

    if (!admin) return NextResponse.json({ error: 'Admin no encontrado' }, { status: 404 })
    if (!admin.cobros_activos) return NextResponse.json({ error: 'Cobros no activos' }, { status: 400 })
    if (!admin.mp_cobros_access_token) return NextResponse.json({ error: 'MP no conectado' }, { status: 400 })

    // ── 4. CREAR PREFERENCIA MP ──
    const monto = alumno.precio_mensual
    const comisionPct = admin.plan === 'pro' ? COMISION_PRO : COMISION_FREE
    const comisionMonto = Math.round(monto * comisionPct)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getpulseapp.lat'

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${admin.mp_cobros_access_token}` },
      body: JSON.stringify({
        items: [{ title: `Cuota mensual — ${admin.brand_name || 'Pulse'}`, quantity: 1, unit_price: monto, currency_id: 'ARS' }],
        payer: { email: alumno.email },
        marketplace_fee: comisionMonto,
        back_urls: { success: `${appUrl}/dashboard?pago=ok`, failure: `${appUrl}/dashboard?pago=error`, pending: `${appUrl}/dashboard?pago=pendiente` },
        auto_return: 'approved',
        external_reference: `${alumnoId}|${adminId}`,
        notification_url: `${appUrl}/api/mp/webhook-pago`,
      }),
    })

    const mpData = await mpResponse.json()
    if (!mpResponse.ok) return NextResponse.json({ error: mpData.message || 'Error MP' }, { status: 400 })

    await supabase.from('pagos').insert({
      alumno_id: alumnoId,
      admin_id: adminId,
      monto,
      monto_neto: monto - comisionMonto,
      comision_pulse: comisionMonto,
      mp_preference_id: mpData.id,
      estado: 'pendiente',
    })

    return NextResponse.json({ init_point: mpData.init_point, monto, comision: comisionMonto, monto_neto: monto - comisionMonto })

  } catch (error) {
    console.error('Error crear-pago:', (error as Error).message)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
