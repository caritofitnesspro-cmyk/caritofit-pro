// @ts-nocheck
'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan')
  const supabase = createClient()

  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', codigo: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data: codigo, error: codigoError } = await supabase
        .from('codigos_invitacion')
        .select('id, usado')
        .eq('codigo', form.codigo.toUpperCase())
        .maybeSingle()

      if (codigoError) throw new Error('Error al verificar el código')
      if (!codigo) throw new Error('Código de invitación inválido')
      if (codigo.usado) throw new Error('Este código ya fue utilizado')

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { nombre: form.nombre, apellido: form.apellido } },
      })

      if (authError) throw new Error(authError.message)
      if (!authData.user) throw new Error('No se pudo crear el usuario')

      const { error: profileError } = await supabase
        .from('perfiles')
        .upsert({
          id: authData.user.id,
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          rol: 'admin',
          plan: 'free',
          primary_color: '#5B8CFF',
          secondary_color: '#4A74D9',
        })

      if (profileError) throw new Error('Error al guardar el perfil')

      await supabase
        .from('codigos_invitacion')
        .update({ usado: true, usado_por: authData.user.id })
        .eq('id', codigo.id)

      setSuccess(true)
      setTimeout(() => {
        router.push(planParam === 'pro' ? '/login?next=/admin/upgrade' : '/login')
      }, 2500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const isPro = planParam === 'pro'

  if (success) {
    return (
      <div style={styles.root}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <div style={styles.title}>¡Cuenta creada!</div>
          <div style={styles.sub}>{isPro ? 'Redirigiendo para activar tu plan PRO...' : 'Redirigiendo al login...'}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.root}>
      <div style={{ ...styles.card, borderTop: `3px solid ${isPro ? '#5B8CFF' : '#5B8CFF'}` }}>

        <div style={styles.brand}>
          <div style={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#5B8CFF"/>
              <text x="16" y="22" textAnchor="middle" fontFamily="Georgia,serif" fontSize="20" fontWeight="700" fill="#000000">P</text>
            </svg>
          </div>
          {isPro && (
            <div style={styles.proBadge}>Plan PRO</div>
          )}
          <div style={styles.title}>{isPro ? 'Crear cuenta PRO' : 'Registro de profesora'}</div>
          <div style={styles.sub}>{isPro ? 'Después del registro activamos tu suscripción' : 'Usá tu código de invitación'}</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={styles.label}>Nombre</label>
              <input style={styles.input} name="nombre" placeholder="María" value={form.nombre} onChange={handleChange} required />
            </div>
            <div>
              <label style={styles.label}>Apellido</label>
              <input style={styles.input} name="apellido" placeholder="García" value={form.apellido} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <label style={styles.label}>Email</label>
            <input style={styles.input} name="email" type="email" placeholder="profe@email.com" value={form.email} onChange={handleChange} required />
          </div>

          <div>
            <label style={styles.label}>Contraseña</label>
            <input style={styles.input} name="password" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={handleChange} required minLength={6} />
          </div>

          <hr style={{ border: 'none', borderTop: '1px dashed #E0D8D0', margin: '4px 0' }} />

          <div>
            <label style={styles.label}>Código de invitación</label>
            <input
              style={{ ...styles.input, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}
              name="codigo"
              placeholder="Ej: PULSE2026"
              value={form.codigo}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <div style={styles.error}>⚠️ {error}</div>
          )}

          <button type="submit" disabled={loading} style={{ ...styles.cta, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creando cuenta...' : isPro ? 'Crear cuenta y activar PRO →' : 'Crear cuenta →'}
          </button>

        </form>

        <div style={styles.back}>
          ¿Ya tenés cuenta? <a href="/login" style={{ color: '#5B8CFF', fontWeight: 500, textDecoration: 'none' }}>Iniciá sesión</a>
        </div>

      </div>
    </div>
  )
}

const styles = {
  root: {
    minHeight: '100vh',
    background: '#F5F2EE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: '#ffffff',
    borderRadius: 24,
    padding: '48px 40px 40px',
    width: '100%',
    maxWidth: 420,
    border: '1px solid #E6E0DA',
    boxShadow: '0 2px 4px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06)',
    position: 'relative' as const,
  },
  brand: { textAlign: 'center' as const, marginBottom: 28 },
  logo: { width: 56, height: 56, borderRadius: 16, background: '#5B8CFF18', border: '1.5px solid #E6E0DA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' },
  proBadge: { display: 'inline-block', background: '#5B8CFF', color: 'white', fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 20, letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' as const },
  title: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 900, color: '#1C1714', marginBottom: 4 },
  sub: { fontSize: 13.5, color: '#9E9188' },
  label: { display: 'block', fontSize: 11.5, fontWeight: 600, color: '#6B6259', textTransform: 'uppercase' as const, letterSpacing: '.07em', marginBottom: 6 },
  input: { width: '100%', background: '#FFFFFF', border: '1.5px solid #D8D0C8', borderRadius: 12, padding: '13px 16px', fontSize: 15, fontFamily: "'DM Sans', sans-serif", color: '#1C1714', outline: 'none', boxSizing: 'border-box' as const },
  error: { background: '#FFF5F5', border: '1px solid #FED7D7', borderRadius: 10, padding: '11px 14px', color: '#C53030', fontSize: 13.5, fontWeight: 500 },
  cta: { width: '100%', background: '#5B8CFF', color: '#ffffff', border: 'none', borderRadius: 13, padding: 15, fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', boxShadow: '0 2px 8px #5B8CFF35', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 4 },
  back: { textAlign: 'center' as const, marginTop: 18, fontSize: 13.5, color: '#9E9188' },
}

export default function RegisterAdminPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#F5F2EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #E0D8D0', borderTopColor: '#5B8CFF', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
