// app/api/admin/create-profile/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request) {
  try {
    const { id, nombre, apellido, dni, email, codigoId, userId } = await req.json()

    if (!id || !nombre || !email) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    // ── 1. VERIFICAR AUTH — el token debe corresponder al usuario recién registrado ──
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }
    if (user.id !== id) {
      console.error(`Intento no autorizado: token de ${user.id} para crear perfil de ${id}`)
      return NextResponse.json({ error: 'Prohibido' }, { status: 403 })
    }

    // ── 2. INSERTAR PERFIL sin restricciones de RLS ──
    const { error: profileError } = await supabaseAdmin
      .from('perfiles')
      .upsert({
        id,
        nombre,
        apellido,
        dni,
        email,
        rol: 'admin',
        plan: 'free',
        primary_color: '#5B8CFF',
        secondary_color: '#4A74D9',
      })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // ── 3. MARCAR CÓDIGO DE DESCUENTO como usado si aplica ──
    if (codigoId && userId) {
      await supabaseAdmin
        .from('codigos_invitacion')
        .update({ usado: true, usado_por: userId })
        .eq('id', codigoId)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
