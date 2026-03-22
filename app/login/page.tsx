// @ts-nocheck
'use client'
// app/login/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<'alumno' | 'admin'>('alumno')
  const [dni, setDni] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [brandImageUrl, setBrandImageUrl] = useState<string | null>(null)

  useEffect(() => {
    async function loadBrandLogo() {
      try {
        const { data } = await (supabase as any)
          .from('perfiles')
          .select('brand_image_url')
          .eq('rol', 'admin')
          .not('brand_image_url', 'is', null)
          .limit(1)
          .single()
        if (data?.brand_image_url) {
          setBrandImageUrl(data.brand_image_url)
        }
      } catch {
        // Sin logo configurado, usa el estático
      }
    }
    loadBrandLogo()
  }, [])

  async function handleLogin() {
    setError('')
    if (!dni || !password) { setError('Completá DNI y contraseña'); return }

    setLoading(true)
    try {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('id, email, rol')
        .eq('dni', dni)
        .single()

      if (!perfil?.email) {
        setError('No existe una cuenta con ese DNI')
        setLoading(false)
        return
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: perfil.email,
        password,
      })

      if (authError) {
        setError('Contraseña incorrecta')
        setLoading(false)
        return
      }

      if (perfil.rol === 'admin') router.push('/admin')
      else router.push('/dashboard')

    } catch {
      setError('Ocurrió un error. Intentá de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #1a0008 0%, #7D0531 60%, #B05276 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#faf8f7', borderRadius: '28px', padding: '48px 40px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 80px rgba(0,0,0,.3)' }}>

        {/* Logo — dinámico si existe, estático como fallback */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          {brandImageUrl ? (
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 8px', border: '4px solid #DBBABF', boxShadow: '0 8px 24px rgba(125,5,49,.25)' }}>
              <img
                src={brandImageUrl}
                alt='Logo'
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : (
            <img
              src='/logo.png'
              alt='Team Carito'
              style={{ width: '220px', height: 'auto', margin: '0 auto 8px', display: 'block', objectFit: 'contain' }}
            />
          )}
          <div style={{ fontSize: '13px', color: '#8a7070', marginTop: '4px' }}>Tu equipo de entrenamiento personalizado</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#ede0e2', borderRadius: '14px', padding: '4px', gap: '4px', marginBottom: '24px' }}>
          {(['alumno', 'admin'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: '.2s', fontFamily: 'inherit',
                background: mode === m ? '#7D0531' : 'transparent',
                color: mode === m ? '#DBBABF' : '#8a7070',
                boxShadow: mode === m ? '0 2px 8px rgba(125,5,49,.28)' : 'none',
              }}>
              {m === 'alumno' ? '🏋️ Alumno/a' : '👩‍💼 Profesora'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ marginBottom: '14px' }}>
          <label className="field-label">DNI</label>
          <input className="input-field" type="text" placeholder="Sin puntos ni guiones"
            maxLength={8} value={dni}
            onChange={e => setDni(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label className="field-label">Contraseña</label>
          <input className="input-field" type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>

        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #fcc', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', color: '#c0392b', fontSize: '14px', fontWeight: '600' }}>
            ⚠️ {error}
          </div>
        )}

        <button className="btn-wine" style={{ width: '100%', fontSize: '15px', padding: '14px' }}
          onClick={handleLogin} disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar →'}
        </button>

        {mode === 'alumno' && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link href="/register" style={{ color: '#B05276', fontWeight: '600', fontSize: '14px', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              ¿No tenés cuenta? Registrate →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
