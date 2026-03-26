// @ts-nocheck
// app/api/mp/crear-pago/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// Comisión de Pulse según plan
const COMISION_FREE = 0.08  // 8%
const COMISION_PRO  = 0.05  // 5%

export async function POST(req: NextRequest) {
  try {
    const { alumnoId, adminId } = await req.json()
    if (!alumnoId || !adminId) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const supabase = createClient()

    // Cargar datos del admin (profe)
    const { data: admin } = await supabase
      .from('perfiles')
      .select('nombre, apellido, plan, mp_cobros_access_token, cobros_activos, brand_name')
      .eq('id', adminId)
      .single()

    if (!admin) return NextResponse.json({ error: 'Profe no encontrado' }, { status: 404 })
    if (!admin.cobros_activos) return NextResponse.json({ error: 'El profe no tiene cobros activos' }, { status: 400 })
    if (!admin.mp_cobros_access_token) return NextResponse.json({ error: 'El profe no conectó su cuenta de MP' }, { status: 400 })

    // Cargar datos del alumno
    const { data: alumno } = await supabase
      .from('perfiles')
      .select('nombre, apellido, email, precio_mensual')
      .eq('id', alumnoId)
      .single()

    if (!alumno) return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })
    if (!alumno.precio_mensual) return NextResponse.json({ error: 'El profe no definió un precio para este alumno' }, { status: 400 })

    const monto = alumno.precio_mensual
    const comisionPct = admin.plan === 'pro' ? COMISION_PRO : COMISION_FREE
    const comisionMonto = Math.round(monto * comisionPct)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getpulseapp.lat'
    const brandName = admin.brand_name || 'Pulse'

    // Crear preferencia de pago en la cuenta del PROFE
    // marketplace_fee = lo que se queda Pulse
    const preferenceData = {
      items: [{
        title: `Cuota mensual — ${brandName}`,
        quantity: 1,
        unit_price: monto,
        currency_id: 'ARS',
      }],
      payer: {
        email: alumno.email,
      },
      marketplace_fee: comisionMonto,
      back_urls: {
        success: `${appUrl}/dashboard?pago=ok`,
        failure: `${appUrl}/dashboard?pago=error`,
        pending: `${appUrl}/dashboard?pago=pendiente`,
      },
      auto_return: 'approved',
      external_reference: `${alumnoId}|${adminId}`,
      notification_url: `${appUrl}/api/mp/webhook-pago`,
    }

    // Usar el access token DEL PROFE (no el de Pulse)
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${admin.mp_cobros_access_token}`,
      },
      body: JSON.stringify(preferenceData),
    })

    const mpData = await mpResponse.json()

    if (!mpResponse.ok) {
      console.error('MP Error crear pago:', mpData)
      return NextResponse.json({ error: mpData.message || 'Error al crear pago' }, { status: 400 })
    }

    // Registrar pago pendiente en DB
    await supabase.from('pagos').insert({
      alumno_id: alumnoId,
      admin_id: adminId,
      monto,
      monto_neto: monto - comisionMonto,
      comision_pulse: comisionMonto,
      mp_preference_id: mpData.id,
      estado: 'pendiente',
    })

    return NextResponse.json({
      init_point: mpData.init_point,
      monto,
      comision: comisionMonto,
      monto_neto: monto - comisionMonto,
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
