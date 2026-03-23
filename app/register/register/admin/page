// @ts-nocheck
'use client'
// app/register/admin/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function RegisterAdminPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'datos' | 'verificando' | 'ok'>('datos')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    passwordConfirm: '',
    codigo: '',
  })

  function update(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
    setError('')
  }

  async function handleRegister() {
    setError('')

    // Validaciones
    if (!form.nombre || !form.apellido) { setError('Completá tu nombre y apellido'); return }
    if (!form.email || !form.email.includes('@')) { setError('Email inválido'); return }
    if (!form.password || form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (form.password !== form.passwordConfirm) { setError('Las contraseñas no coinciden'); return }
    if (!form.codigo) { setError('Ingresá tu código de invitación'); return }

    setLoading(true)

    try {
      // 1. Verificar código de invitación
      const { data: codigo, error: codigoError } = await (supabase as any)
        .from('codigos_invitacion')
        .select('id, usado')
        .eq('codigo', form.codigo.toUpperCase().trim())
        .single()

      if (codigoError || !codigo) {
        setError('Código de invitación inválido')
        setLoading(false)
        return
      }

      if (codigo.usado) {
        setError('Este código ya fue utilizado')
        setLoading(false)
        return
      }

      // 2. Crear cuenta en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            nombre: form.nombre,
            apellido: form.apellido,
            rol: 'admin',
          }
        }
      })

      if (authError) {
        setError(authError.message === 'User already registered'
          ? 'Ya existe una cuenta con ese email'
          : authError.message
        )
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Error al crear la cuenta. Intentá de nuevo.')
        setLoading(false)
        return
      }

      // 3. Actualizar perfil con datos del profe
      await (supabase as any)
        .from('perfiles')
        .update({
          nombre: form.nombre,
          apellido: form.apellido,
          rol: 'admin',
          aprobado: true,
          brand_name: `${form.nombre} ${form.apellido}`,
          primary_color: '#7D0531',
          secondary_color: '#B05276',
        })
        .eq('id', authData.user.id)

      // 4. Marcar código como usado
      await (supabase as any)
        .from('codigos_invitacion')
        .update({ usado: true, usado_por: authData.user.id })
        .eq('codigo', form.codigo.toUpperCase().trim())

      setStep('ok')

    } catch (e) {
      setError('Ocurrió un error inesperado. Intentá de nuevo.')
    }

    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ra-root {
          min-height: 100vh;
          background: #F5F2EE;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          font-family: 'DM Sans', sans-serif;
        }

        .ra-card {
          background: #fff;
          border-radius: 24px;
          padding: 48px 40px 40px;
          width: 100%;
          max-width: 460px;
          border: 1px solid #E6E0DA;
          box-shadow: 0 2px 4px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06);
          position: relative;
          animation: fadeUp .4s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ra-card::before {
          content: '';
          position: absolute;
          top: 0; left: 36px; right: 36px;
          height: 2.5px;
          background: linear-gradient(90deg, #7D0531, #B05276);
          border-radius: 0 0 6px 6px;
        }

        @media (max-width: 480px) {
          .ra-card { padding: 36px 24px 32px; }
        }

        .ra-header { text-align: center; margin-bottom: 36px; }

        .ra-logo {
          width: 64px; height: 64px;
          border-radius: 16px;
          background: #7D053112;
          margin: 0 auto 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px;
          border: 1px solid #E6E0DA;
        }

        .ra-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 24px; font-weight: 900;
          color: #1C1714;
          letter-spacing: -0.3px;
          margin-bottom: 5px;
        }

        .ra-subtitle { font-size: 14px; color: #9E9188; }

        .ra-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .ra-field { margin-bottom: 14px; }

        .ra-label {
          display: block;
          font-size: 11.5px; font-weight: 600;
          color: #6B6259;
          text-transform: uppercase; letter-spacing: .07em;
          margin-bottom: 7px;
        }

        .ra-input {
          width: 100%;
          background: #fff;
          border: 1.5px solid #D8D0C8;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 14.5px;
          font-family: 'DM Sans', sans-serif;
          color: #1C1714;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }

        .ra-input::placeholder { color: #C4BCB4; font-weight: 300; }
        .ra-input:focus {
          border-color: #7D0531;
          box-shadow: 0 0 0 3px rgba(125,5,49,.12);
        }

        .ra-divider {
          border: none;
          border-top: 1px solid #EDE8E3;
          margin: 20px 0;
        }

        .ra-codigo-label {
          font-size: 11.5px; font-weight: 600;
          color: #6B6259;
          text-transform: uppercase; letter-spacing: .07em;
          display: block; margin-bottom: 7px;
        }

        .ra-codigo-input {
          width: 100%;
          background: #FBF9F7;
          border: 1.5px dashed #C8BEB5;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 15px;
          font-family: 'DM Sans', monospace;
          font-weight: 600;
          color: #1C1714;
          letter-spacing: .1em;
          text-transform: uppercase;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }

        .ra-codigo-input:focus {
          border-color: #7D0531;
          border-style: solid;
          box-shadow: 0 0 0 3px rgba(125,5,49,.12);
        }

        .ra-error {
          background: #FFF5F5;
          border: 1px solid #FED7D7;
          border-radius: 10px;
          padding: 11px 14px;
          margin-bottom: 16px;
          color: #C53030;
          font-size: 13.5px; font-weight: 500;
          display: flex; align-items: center; gap: 8px;
          animation: shake .3s ease;
        }

        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-4px); }
          75%      { transform: translateX(4px); }
        }

        .ra-cta {
          width: 100%;
          background: #7D0531;
          color: #fff;
          border: none;
          border-radius: 13px;
          padding: 15px;
          font-size: 15px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity .15s, transform .12s;
          margin-top: 4px;
          box-shadow: 0 2px 8px rgba(125,5,49,.3);
        }

        .ra-cta:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
        .ra-cta:disabled { opacity: .6; cursor: not-allowed; }

        .ra-login {
          text-align: center; margin-top: 18px;
          font-size: 13.5px; color: #9E9188;
        }

        .ra-login a {
          color: #7D0531; font-weight: 500;
          text-decoration: none;
          border-bottom: 1px solid rgba(125,5,49,.25);
          padding-bottom: 1px;
        }

        .ra-login a:hover { border-color: #7D0531; }

        /* Success state */
        .ra-success {
          text-align: center; padding: 16px 0;
        }

        .ra-success-icon {
          font-size: 56px; margin-bottom: 20px;
        }

        .ra-success-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 26px; font-weight: 900;
          color: #1C1714; margin-bottom: 10px;
        }

        .ra-success-text {
          font-size: 15px; color: #6B6259;
          line-height: 1.6; margin-bottom: 28px;
        }
      `}</style>

      <div className="ra-root">
        <div className="ra-card">

          {step === 'ok' ? (
            <div className="ra-success">
              <div className="ra-success-icon">🎉</div>
              <div className="ra-success-title">¡Cuenta creada!</div>
              <p className="ra-success-text">
                Tu espacio en Pulse está listo.<br/>
                Revisá tu email para confirmar tu cuenta y después podés ingresar.
              </p>
              <button
                className="ra-cta"
                onClick={() => router.push('/login')}
              >
                Ir al login →
              </button>
            </div>
          ) : (
            <>
              <div className="ra-header">
                <div className="ra-logo">💪</div>
                <div className="ra-title">Crear tu espacio</div>
                <div className="ra-subtitle">Registrate como entrenador/a en Pulse</div>
              </div>

              {/* Nombre y apellido */}
              <div className="ra-grid">
                <div>
                  <label className="ra-label">Nombre</label>
                  <input className="ra-input" type="text" placeholder="Carolina"
                    value={form.nombre} onChange={e => update('nombre', e.target.value)} />
                </div>
                <div>
                  <label className="ra-label">Apellido</label>
                  <input className="ra-input" type="text" placeholder="Lell"
                    value={form.apellido} onChange={e => update('apellido', e.target.value)} />
                </div>
              </div>

              {/* Email */}
              <div className="ra-field">
                <label className="ra-label">Email</label>
                <input className="ra-input" type="email" placeholder="hola@miemail.com"
                  value={form.email} onChange={e => update('email', e.target.value)} />
              </div>

              {/* Contraseñas */}
              <div className="ra-grid">
                <div>
                  <label className="ra-label">Contraseña</label>
                  <input className="ra-input" type="password" placeholder="••••••••"
                    value={form.password} onChange={e => update('password', e.target.value)} />
                </div>
                <div>
                  <label className="ra-label">Confirmá</label>
                  <input className="ra-input" type="password" placeholder="••••••••"
                    value={form.passwordConfirm} onChange={e => update('passwordConfirm', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRegister()} />
                </div>
              </div>

              <hr className="ra-divider" />

              {/* Código de invitación */}
              <div className="ra-field">
                <label className="ra-codigo-label">🔑 Código de invitación</label>
                <input className="ra-codigo-input" type="text" placeholder="PULSE2026"
                  value={form.codigo} onChange={e => update('codigo', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()} />
              </div>

              {error && (
                <div className="ra-error">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button className="ra-cta" onClick={handleRegister} disabled={loading}>
                {loading ? 'Creando tu cuenta...' : 'Crear mi cuenta →'}
              </button>

              <div className="ra-login">
                ¿Ya tenés cuenta? <Link href="/login">Ingresar →</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
