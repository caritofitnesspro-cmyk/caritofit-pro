'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RegisterAdminPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    codigo: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Validar código de invitación
      const { data: codigo, error: codigoError } = await supabase
        .from('codigos_invitacion')
        .select('id, usado')
        .eq('codigo', form.codigo.toUpperCase())
        .maybeSingle()   // ← clave: no rompe si no existe

      if (codigoError) throw new Error('Error al verificar el código')
      if (!codigo) throw new Error('Código de invitación inválido')
      if (codigo.usado) throw new Error('Este código ya fue utilizado')

      // 2. Crear cuenta en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            nombre: form.nombre,
            apellido: form.apellido,
          },
        },
      })

      if (authError) throw new Error(authError.message)
      if (!authData.user) throw new Error('No se pudo crear el usuario')

      // 3. Actualizar perfil con rol admin
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          rol: 'admin',
          branding: {
            color_primario: '#FF6B6B',
            logo_url: null,
          },
        })

      if (profileError) throw new Error('Error al guardar el perfil')

      // 4. Marcar código como usado
      const { error: updateError } = await supabase
        .from('codigos_invitacion')
        .update({ usado: true, usado_por: authData.user.id })
        .eq('id', codigo.id)

      if (updateError) throw new Error('Error al actualizar el código')

      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '3rem' }}>✅</p>
          <h2>¡Cuenta creada con éxito!</h2>
          <p>Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>
          Registro de profe
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required
            style={inputStyle} />
          <input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} required
            style={inputStyle} />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required
            style={inputStyle} />
          <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required
            style={inputStyle} />
          <input name="codigo" placeholder="Código de invitación" value={form.codigo} onChange={handleChange} required
            style={inputStyle} />

          {error && (
            <p style={{ color: '#E24B4A', fontSize: '14px', margin: 0 }}>{error}</p>
          )}

          <button type="submit" disabled={loading}
            style={{ padding: '12px', background: '#FF6B6B', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '15px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}
