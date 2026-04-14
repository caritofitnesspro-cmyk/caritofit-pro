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

    // Insertar perfil sin restricciones de RLS
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

    // Marcar código de descuento como usado si aplica
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
