// @ts-nocheck
// app/api/mp/webhook-pago/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Webhook pago recibido:', JSON.stringify(body))

    const { type, data } = body
    if (type !== 'payment') return NextResponse.json({ received: true })

    const paymentId = data?.id
    if (!paymentId) return NextResponse.json({ received: true })

    // Buscar el pago en nuestra DB por preference_id o buscar con MP
    const supabase = createClient()

    // Necesitamos consultar MP para obtener los detalles
    // Primero encontramos el pago pendiente más reciente para obtener el access token del admin
    const { data: pagoPendiente } = await supabase
      .from('pagos')
      .select('*, perfiles!pagos_admin_id_fkey(mp_cobros_access_token)')
      .eq('estado', 'pendiente')
      .order('fecha', { ascending: false })
      .limit(1)
      .single()

    const accessToken = pagoPendiente?.perfiles?.mp_cobros_access_token
      || process.env.MP_ACCESS_TOKEN

    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!mpResponse.ok) return NextResponse.json({ received: true })

    const payment = await mpResponse.json()
    const externalRef = payment.external_reference // formato: "alumnoId|adminId"
    if (!externalRef) return NextResponse.json({ received: true })

    const [alumnoId, adminId] = externalRef.split('|')

    // Actualizar estado del pago
    const estado = payment.status === 'approved' ? 'aprobado'
      : payment.status === 'rejected' ? 'rechazado'
      : 'pendiente'

    await supabase
      .from('pagos')
      .update({
        estado,
        mp_payment_id: String(paymentId),
      })
      .eq('alumno_id', alumnoId)
      .eq('admin_id', adminId)
      .eq('estado', 'pendiente')

    console.log(`Pago ${estado} — alumno: ${alumnoId}`)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook pago error:', error)
    return NextResponse.json({ received: true })
  }
}
