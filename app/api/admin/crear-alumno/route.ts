// app/api/admin/crear-alumno/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, apellido, dni, email, password, telefono, edad, sexo, objetivo, nivel, restricciones, adminId } = body

    if (!nombre || !apellido || !dni || !email || !password || !adminId) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    // Usar service role key para crear usuario sin afectar la sesión del admin
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Crear usuario en Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // confirmar email automáticamente
      user_metadata: { nombre, apellido, dni, rol: 'alumno' }
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'No se pudo crear el usuario' }, { status: 400 })
    }

    // Actualizar perfil con todos los datos
    const { error: profileError } = await supabaseAdmin
      .from('perfiles')
      .upsert({
        id: authData.user.id,
        nombre,
        apellido,
        dni,
        email,
        rol: 'alumno',
        telefono: telefono || null,
        edad: edad ? parseInt(edad) : null,
        sexo: sexo || null,
        objetivo: objetivo || null,
        nivel: nivel || 'Principiante',
        restricciones: restricciones || null,
        aprobado: true,
        admin_id: adminId,
      })

    if (profileError) {
      // Si falla el perfil, eliminar el usuario de Auth
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: 'Error al guardar el perfil: ' + profileError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, userId: authData.user.id })

  } catch (error) {
    console.error('Error crear alumno:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
