// @ts-nocheck
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

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
        .maybeSingle()

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
        .from('perfiles')
        .upsert({
          id: authData.user.id,
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          rol: 'admin',
          primary_color: '#7D0531',
          secondary_color: '#B05276',
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
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          .r-root { min-height: 100vh; background: #F5F2EE; display: flex; align-items: center; justify-content: center; font-family: 'DM Sans', sans-serif; }
          .r-success { text-align: center; padding: 2rem; }
          .r-success-icon { font-size: 64px; margin-bottom: 16px; }
          .r-success-title { font-family: 'Fraunces', Georgia, serif; font-size: 28px; font-weight: 900; color: #1C1714; margin-bottom: 8px; }
          .r-success-sub { font-size: 15px; color: #9E9188; }
        `}</style>
        <div className="r-root">
          <div className="r-success">
            <div className="r-success-icon">✅</div>
            <div className="r-success-title">¡Cuenta creada con éxito!</div>
            <div className="r-success-sub">Redirigiendo al login...</div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .r-root {
          min-height: 100vh;
          background: #F5F2EE;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          font-family: 'DM Sans', sans-serif;
        }

        .r-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 48px 40px 40px;
          width: 100%;
          max-width: 420px;
          border: 1px solid #E6E0DA;
          box-shadow: 0 2px 4px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06);
          position: relative;
          animation: slideUp .45s cubic-bezier(.22,.68,0,1.2) both;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .r-card::before {
          content: '';
          position: absolute;
          top: 0; left: 36px; right: 36px;
          height: 2.5px;
          background: linear-gradient(90deg, #7D0531, #B05276);
          border-radius: 0 0 6px 6px;
        }

        .r-brand {
          text-align: center;
          margin-bottom: 32px;
        }

        .r-logo {
          width: 68px; height: 68px;
          border-radius: 18px;
          background: #7D053112;
          border: 1.5px solid #E6E0DA;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px;
          font-size: 28px;
        }

        .r-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 22px;
          font-weight: 900;
          color: #1C1714;
          margin-bottom: 4px;
        }

        .r-sub {
          font-size: 13.5px;
          color: #9E9188;
        }

        .r-field { margin-bottom: 14px; }

        .r-label {
          display: block;
          font-size: 11.5px;
          font-weight: 600;
          color: #6B6259;
          text-transform: uppercase;
          letter-spacing: .07em;
          margin-bottom: 6px;
        }

        .r-input {
          width: 100%;
          background: #FFFFFF;
          border: 1.5px solid #D8D0C8;
          border-radius: 12px;
          padding: 13px 16px;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          color: #1C1714;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
          -webkit-appearance: none;
        }

        .r-input::placeholder { color: #BDB5AD; font-weight: 300; }

        .r-input:focus {
          border-color: #7D0531;
          box-shadow: 0 0 0 3.5px #7D05311C;
        }

        .r-divider {
          border: none;
          border-top: 1px dashed #E0D8D0;
          margin: 18px 0;
        }

        .r-error {
          background: #FFF5F5;
          border: 1px solid #FED7D7;
          border-radius: 10px;
          padding: 11px 14px;
          margin-bottom: 14px;
          color: #C53030;
          font-size: 13.5px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .r-cta {
          width: 100%;
          background: #7D0531;
          color: #ffffff;
          border: none;
          border-radius: 13px;
          padding: 15px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity .15s, transform .12s;
          margin-top: 4px;
          box-shadow: 0 2px 8px #7D053135;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .r-cta:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
        .r-cta:disabled { opacity: .6; cursor: not-allowed; }

        .r-spinner {
          width: 16px; height: 16px;
          border: 2.5px solid rgba(255,255,255,.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .r-back {
          text-align: center;
          margin-top: 18px;
          font-size: 13.5px;
          color: #9E9188;
        }

        .r-back a {
          color: #7D0531;
          font-weight: 500;
          text-decoration: none;
          border-bottom: 1px solid #7D053130;
        }

        .r-back a:hover { border-color: #7D0531; }

        @media (max-width: 480px) {
          .r-card { padding: 36px 24px 32px; }
        }
      `}</style>

      <div className="r-root">
        <div className="r-card">

          <div className="r-brand">
            <div className="r-logo">🏋️</div>
            <div className="r-title">Registro de profesora</div>
            <div className="r-sub">Usá tu código de invitación</div>
          </div>

          <form onSubmit={handleSubmit}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div className="r-field" style={{ marginBottom: 0 }}>
                <label className="r-label">Nombre</label>
                <input className="r-input" name="nombre" placeholder="María" value={form.nombre} onChange={handleChange} required />
              </div>
              <div className="r-field" style={{ marginBottom: 0 }}>
                <label className="r-label">Apellido</label>
                <input className="r-input" name="apellido" placeholder="García" value={form.apellido} onChange={handleChange} required />
              </div>
            </div>

            <div className="r-field">
              <label className="r-label">Email</label>
              <input className="r-input" name="email" type="email" placeholder="profe@email.com" value={form.email} onChange={handleChange} required />
            </div>

            <div className="r-field">
              <label className="r-label">Contraseña</label>
              <input className="r-input" name="password" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={handleChange} required minLength={6} />
            </div>

            <hr className="r-divider" />

            <div className="r-field">
              <label className="r-label">Código de invitación</label>
              <input className="r-input" name="codigo" placeholder="Ej: PULSE2026" value={form.codigo} onChange={handleChange} required style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }} />
            </div>

            {error && (
              <div className="r-error">
                <span style={{ fontSize: 16 }}>⚠️</span> {error}
              </div>
            )}

            <button type="submit" className="r-cta" disabled={loading}>
              {loading ? <><div className="r-spinner" /> Creando cuenta...</> : 'Crear cuenta →'}
            </button>

          </form>

          <div className="r-back">
            ¿Ya tenés cuenta? <a href="/login">Iniciá sesión</a>
          </div>

        </div>
      </div>
    </>
  )
}
