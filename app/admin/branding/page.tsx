// app/admin/branding/page.tsx
// @ts-nocheck
'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useBrand, applyBrandCSS } from '@/hooks/useBrand'

export default function BrandingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [adminId, setAdminId] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Formulario local
  const [form, setForm] = useState({
    brandName: '',
    primaryColor: '#7D0531',
    secondaryColor: '#B05276',
    brandImageUrl: null as string | null,
  })
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const { brand, loading, saveBrand, uploadBrandImage } = useBrand(adminId || undefined)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setAdminId(user.id)
    }
    init()
  }, [])

  useEffect(() => {
    if (!loading && brand) {
      setForm({
        brandName:      brand.brandName,
        primaryColor:   brand.primaryColor,
        secondaryColor: brand.secondaryColor,
        brandImageUrl:  brand.brandImageUrl,
      })
      setPreviewImage(brand.brandImageUrl)
    }
  }, [loading, brand])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !adminId) return

    // Preview local inmediato
    const reader = new FileReader()
    reader.onload = ev => setPreviewImage(ev.target?.result as string)
    reader.readAsDataURL(file)

    setUploading(true)
    const url = await uploadBrandImage(file, adminId)
    setUploading(false)

    if (url) {
      setForm(p => ({ ...p, brandImageUrl: url }))
      showToast('✅ Imagen subida')
    } else {
      showToast('⚠️ Solo PNG/JPG/WebP hasta 2MB')
    }
  }

  async function handleSave() {
    if (!adminId) return
    setSaving(true)
    const ok = await saveBrand(form, adminId)
    setSaving(false)
    if (ok) {
      showToast('✅ Branding guardado')
      applyBrandCSS(form as any)
    } else {
      showToast('⚠️ Error al guardar')
    }
  }

  const p = form.primaryColor
  const s = form.secondaryColor

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ede0e2' }}>
      <div style={{ color: '#7D0531', fontWeight: '600' }}>Cargando...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#ede0e2', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px' }}>
      {toast && <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#7D0531', color: '#DBBABF', padding: '12px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', zIndex: 600 }}>{toast}</div>}

      <div style={{ width: '100%', maxWidth: '900px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Header */}
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <button onClick={() => router.push('/admin')}
            style={{ background: '#fff', border: '1.5px solid #d5c4c8', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', color: '#7D0531', fontWeight: '600' }}>
            ← Volver
          </button>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '900', color: '#7D0531', margin: 0 }}>Personalizar marca</h1>
            <p style={{ color: '#8a7070', fontSize: '14px', margin: '4px 0 0' }}>Configurá cómo se ve tu app para vos y tus alumnos</p>
          </div>
        </div>

        {/* ── FORMULARIO ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Nombre de marca */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #d5c4c8' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#8a7070', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: '8px' }}>
              Nombre de marca
            </label>
            <input
              type="text"
              value={form.brandName}
              onChange={e => setForm(p => ({ ...p, brandName: e.target.value }))}
              placeholder="Ej: Team Carito, FitZone, PowerCoach..."
              style={{ width: '100%', background: '#ede0e2', border: '1.5px solid #d5c4c8', borderRadius: '10px', padding: '12px 14px', fontSize: '15px', fontFamily: 'inherit', outline: 'none', color: '#2a1520', boxSizing: 'border-box' }}
            />
          </div>

          {/* Logo */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #d5c4c8' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#8a7070', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: '12px' }}>
              Logo / Imagen de marca
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Preview del logo */}
              <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: p, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {previewImage
                  ? <img src={previewImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '28px' }}>🏋️</span>
                }
              </div>
              <div style={{ flex: 1 }}>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{ background: p, color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', opacity: uploading ? .6 : 1 }}>
                  {uploading ? 'Subiendo...' : previewImage ? '🔄 Cambiar imagen' : '📸 Subir logo'}
                </button>
                <p style={{ fontSize: '12px', color: '#8a7070', marginTop: '6px' }}>PNG, JPG o WebP · Máx 2MB</p>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={handleImageChange} />
          </div>

          {/* Colores */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #d5c4c8' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#8a7070', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: '16px' }}>
              Colores
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#5a3a40', display: 'block', marginBottom: '8px' }}>Color principal</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="color" value={form.primaryColor}
                    onChange={e => setForm(p => ({ ...p, primaryColor: e.target.value }))}
                    style={{ width: '48px', height: '48px', border: 'none', borderRadius: '10px', cursor: 'pointer', padding: '2px' }} />
                  <input type="text" value={form.primaryColor}
                    onChange={e => setForm(p => ({ ...p, primaryColor: e.target.value }))}
                    style={{ flex: 1, background: '#ede0e2', border: '1.5px solid #d5c4c8', borderRadius: '8px', padding: '10px', fontSize: '13px', fontFamily: 'monospace', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#5a3a40', display: 'block', marginBottom: '8px' }}>Color secundario</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="color" value={form.secondaryColor}
                    onChange={e => setForm(p => ({ ...p, secondaryColor: e.target.value }))}
                    style={{ width: '48px', height: '48px', border: 'none', borderRadius: '10px', cursor: 'pointer', padding: '2px' }} />
                  <input type="text" value={form.secondaryColor}
                    onChange={e => setForm(p => ({ ...p, secondaryColor: e.target.value }))}
                    style={{ flex: 1, background: '#ede0e2', border: '1.5px solid #d5c4c8', borderRadius: '8px', padding: '10px', fontSize: '13px', fontFamily: 'monospace', outline: 'none' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Guardar */}
          <button onClick={handleSave} disabled={saving}
            style={{ background: p, color: '#fff', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? .7 : 1, transition: '.2s' }}>
            {saving ? 'Guardando...' : '💾 Guardar configuración'}
          </button>
        </div>

        {/* ── PREVIEW ── */}
        <div style={{ position: 'sticky', top: '40px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#8a7070', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '12px' }}>
            Vista previa
          </div>

          {/* Preview Sidebar */}
          <div style={{ background: p, borderRadius: '20px', padding: '24px', marginBottom: '16px', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,.15)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: s, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {previewImage
                  ? <img src={previewImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '20px' }}>🏋️</span>
                }
              </div>
              <div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '900', lineHeight: 1.1 }}>{form.brandName || 'Mi Equipo'}</div>
                <div style={{ fontSize: '11px', opacity: .6, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '.08em' }}>Panel de entrenamiento</div>
              </div>
            </div>
            {['Dashboard', 'Alumnos/as', 'Planes'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', marginBottom: '4px', background: item === 'Dashboard' ? 'rgba(255,255,255,.15)' : 'transparent', fontSize: '14px', opacity: item === 'Dashboard' ? 1 : .7 }}>
                <span>{item === 'Dashboard' ? '🏠' : item === 'Alumnos/as' ? '👥' : '📋'}</span>
                {item}
              </div>
            ))}
          </div>

          {/* Preview botones y badges */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #d5c4c8' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#8a7070', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '14px' }}>Elementos de UI</div>
            <button style={{ background: p, color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '10px', width: '100%' }}>
              Botón principal
            </button>
            <button style={{ background: 'transparent', color: p, border: `2px solid ${p}`, borderRadius: '10px', padding: '8px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '14px', width: '100%' }}>
              Botón secundario
            </button>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: p + '20', color: p, borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '700' }}>Badge activo</span>
              <span style={{ background: s + '20', color: s, borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '700' }}>Badge sec.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
