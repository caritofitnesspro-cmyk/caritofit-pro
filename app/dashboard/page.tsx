// @ts-nocheck
'use client'
// app/dashboard/page.tsx — Dashboard del alumno — Light mode Pulse
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Perfil, Plan, Semana, Dia, Ejercicio, Peso } from '@/types/database'

// ── Colores por tipo de bloque ──
const TIPO_EMOJI: any  = { normal: '💪', circuito: '🔁', superserie: '⚡', entrada_en_calor: '🔥', vuelta_a_la_calma: '🧘' }
const TIPO_LABEL: any  = { normal: 'Normal', circuito: 'Circuito', superserie: 'Superserie', entrada_en_calor: 'Entrada en calor', vuelta_a_la_calma: 'Vuelta a la calma' }
const TIPO_COLOR: any  = { normal: '#3b82f6', circuito: '#22c55e', superserie: '#8b5cf6', entrada_en_calor: '#f97316', vuelta_a_la_calma: '#06b6d4' }

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [perfil, setPerfil]           = useState<Perfil | null>(null)
  const [plan, setPlan]               = useState<Plan | null>(null)
  const [semanas, setSemanas]         = useState<Semana[]>([])
  const [pesos, setPesos]             = useState<Peso[]>([])
  const [checkins, setCheckins]       = useState<string[]>([])
  const [loading, setLoading]         = useState(true)
  const [tab, setTab]                 = useState<'inicio' | 'plan' | 'progreso' | 'perfil'>('inicio')
  const [nuevoPeso, setNuevoPeso]     = useState('')
  const [showPesoModal, setShowPesoModal] = useState(false)
  const [diaActivo, setDiaActivo]     = useState<Dia | null>(null)
  const [toast, setToast]             = useState('')
  const [fotosProgreso, setFotosProgreso] = useState([])
  const [showFotoModal, setShowFotoModal] = useState(false)
  const [fotoUpload, setFotoUpload]   = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const fotoRef                       = useRef(null)
  const [ejActivo, setEjActivo]       = useState(null)
  const [seriesData, setSeriesData]   = useState({})
  const [showCaritas, setShowCaritas] = useState(false)
  const [diaTerminado, setDiaTerminado] = useState(null)
  const lastTap                       = useRef({})
  const [bloquesActivos, setBloquesActivos] = useState<any[]>([])

  useEffect(() => { loadData() }, [])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: p } = await supabase.from('perfiles').select('*').eq('id', user.id).single()
    if (!p) { router.push('/login'); return }
    if (p.rol === 'admin') { router.push('/admin'); return }
    setPerfil(p)
    const { data: asig } = await supabase.from('asignaciones').select('plan_id').eq('alumno_id', user.id).eq('activo', true).single()
    if (asig) {
      const { data: planData } = await supabase.from('planes').select('*').eq('id', asig.plan_id).single()
      if (planData) {
        setPlan(planData)
        const { data: semsData } = await supabase.from('semanas').select(`*, dias(*, ejercicios(*))`).eq('plan_id', planData.id).order('numero')
        setSemanas(semsData || [])
      }
    }
    const { data: pesosData } = await supabase.from('pesos').select('*').eq('alumno_id', user.id).order('fecha')
    setPesos(pesosData || [])
    const hoy = new Date().toISOString().split('T')[0]
    const { data: chkData } = await supabase.from('checkins').select('ejercicio_id').eq('alumno_id', user.id).eq('fecha', hoy)
    setCheckins((chkData || []).map(c => c.ejercicio_id).filter(Boolean))
    setLoading(false)
    cargarFotosProgreso()
  }

  async function cargarFotosProgreso() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    try {
      const { data } = await supabase.storage.from('fotos-progreso').list(user.id, { sortBy: { column: 'created_at', order: 'desc' } })
      if (!data) return
      const urls = data.map(f => {
        const { data: u } = supabase.storage.from('fotos-progreso').getPublicUrl(`${user.id}/${f.name}`)
        return { url: u.publicUrl, fecha: new Date(f.created_at).toLocaleDateString('es-AR') }
      })
      setFotosProgreso(urls)
    } catch(e) {}
  }

  async function cargarBloques(diaId: string) {
    const client = supabase as any
    const { data: bloques } = await client.from('bloques').select('*').eq('dia_id', diaId).order('orden', { ascending: true })
    if (!bloques || bloques.length === 0) { setBloquesActivos([]); return }
    const { data: ejercicios } = await client.from('ejercicios').select('*').in('bloque_id', bloques.map((b: any) => b.id)).order('orden', { ascending: true })
    setBloquesActivos(bloques.map((b: any) => ({ ...b, ejercicios: (ejercicios || []).filter((e: any) => e.bloque_id === b.id) })))
  }

  async function toggleCheckin(ejercicioId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const hoy = new Date().toISOString().split('T')[0]
    if (checkins.includes(ejercicioId)) {
      await supabase.from('checkins').delete().eq('alumno_id', user.id).eq('ejercicio_id', ejercicioId).eq('fecha', hoy)
      setCheckins(prev => prev.filter(id => id !== ejercicioId))
    } else {
      await supabase.from('checkins').insert({ alumno_id: user.id, ejercicio_id: ejercicioId, fecha: hoy })
      setCheckins(prev => [...prev, ejercicioId])
      showToast('✅ Ejercicio completado!')
    }
  }

  function handleDoubleTap(ej) {
    const now = Date.now()
    const last = (lastTap.current)[ej.id] || 0
    if (now - last < 500) {
      setSeriesData(p => ({ ...p, [ej.id]: p[ej.id] || Array.from({length: ej.series || 3}, () => ({ peso: '', rpe: '', rir: '' })) }))
      setEjActivo(ej)
    } else {
      toggleCheckin(ej.id)
      const ejsDia = bloquesActivos.flatMap((b: any) => b.ejercicios || [])
      const nuevos = checkins.includes(ej.id) ? checkins.filter(id => id !== ej.id) : [...checkins, ej.id]
      if (ejsDia.length > 0 && ejsDia.every(e => nuevos.includes(e.id))) setTimeout(() => { setDiaTerminado(diaActivo); setShowCaritas(true) }, 600)
    }
    ;(lastTap.current)[ej.id] = now
  }

  function updateSerie(ejId, idx, campo, valor) {
    setSeriesData(p => { const s = [...(p[ejId] || [])]; s[idx] = { ...s[idx], [campo]: valor }; return { ...p, [ejId]: s } })
  }

  async function guardarSeries(ej) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const hoy = new Date().toISOString().split('T')[0]
    await supabase.from('checkins').upsert({ alumno_id: user.id, ejercicio_id: ej.id, fecha: hoy }, { onConflict: 'alumno_id,ejercicio_id,fecha' })
    if (!checkins.includes(ej.id)) setCheckins(p => [...p, ej.id])
    setEjActivo(null)
    showToast('✅ Series guardadas!')
  }

  async function guardarPeso() {
    const val = parseFloat(nuevoPeso)
    if (!val || val < 20 || val > 300) { showToast('⚠️ Ingresá un valor válido'); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('pesos').insert({ alumno_id: user.id, valor: val })
    setNuevoPeso('')
    setShowPesoModal(false)
    showToast('⚖️ Peso registrado!')
    loadData()
  }

  async function subirFotoProgreso() {
    if (!fotoUpload) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const ts = Date.now(); const ext = fotoUpload.name.split('.').pop()
    const { data: uploadData, error } = await supabase.storage.from('fotos-progreso').upload(`${user.id}/${ts}.${ext}`, fotoUpload, { upsert: false })
    if (error) { showToast('⚠️ Error al subir la foto'); return }
    const { data: urlData } = supabase.storage.from('fotos-progreso').getPublicUrl(uploadData.path)
    setFotosProgreso(p => [{ url: urlData.publicUrl, fecha: new Date().toLocaleDateString('es-AR') }, ...p])
    setShowFotoModal(false); setFotoUpload(null); setFotoPreview(null)
    showToast('📸 Foto guardada!')
  }

  async function logout() { await supabase.auth.signOut(); router.push('/login') }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#7D0531', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
        <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Cargando...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )

  const diasSemana1 = semanas[0]?.dias || []
  const completadosHoy = diasSemana1.flatMap(d => (d as any).ejercicios || []).filter((e: Ejercicio) => checkins.includes(e.id)).length
  const totalEjs = diasSemana1.flatMap(d => (d as any).ejercicios || []).length
  const ini = `${perfil?.nombre?.[0] || ''}${perfil?.apellido?.[0] || ''}`.toUpperCase()
  const pesoActual = pesos.length > 0 ? pesos[pesos.length - 1].valor : null

  // Colores del brand (se usan en acentos)
  const wine = '#7D0531'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f9fafb; }
        .d-root { min-height: 100vh; background: #f9fafb; max-width: 430px; margin: 0 auto; position: relative; font-family: 'DM Sans', sans-serif; }
        .d-toast { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); background: #111827; color: #fff; padding: '10px 20px'; borderRadius: '10px'; fontSize: '14px'; fontWeight: '500'; zIndex: 999; white-space: nowrap; }
        .d-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 430px; background: #fff; border-top: 1px solid #f3f4f6; display: flex; padding: 8px 0 20px; z-index: 100; }
        .d-nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 6px 0; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .d-section { padding-bottom: 90px; }
        .d-header { padding: 20px 20px 14px; border-bottom: 1px solid #f3f4f6; }
        .d-eyebrow { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 2px; }
        .d-title { font-family: 'Fraunces', Georgia, serif; font-size: 24px; font-weight: 900; color: #111827; letter-spacing: -0.3px; }
        .d-card { background: #fff; border-radius: 16px; border: 1px solid #f3f4f6; padding: 16px; }
        .d-badge { display: inline-flex; align-items: center; gap: 4px; border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; }
        .d-input { width: 100%; background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 12px 14px; font-size: 15px; font-family: 'DM Sans', sans-serif; color: #111827; outline: none; }
        .d-input:focus { border-color: ${wine}; }
        .d-btn-primary { width: 100%; background: ${wine}; color: #fff; border: none; border-radius: 12px; padding: 14px; font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; }
        .d-btn-ghost { background: transparent; border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px 14px; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; color: #374151; cursor: pointer; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .d-animate { animation: slideUp .3s ease both; }
      `}</style>

      <div className="d-root">

        {toast && (
          <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#111827', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, whiteSpace: 'nowrap' }}>
            {toast}
          </div>
        )}

        {/* ── TAB INICIO ── */}
        {tab === 'inicio' && (
          <div className="d-section d-animate">

            {/* Header con saludo */}
            <div style={{ padding: '32px 20px 20px', background: '#fff', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500', marginBottom: '2px' }}>
                    {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '26px', fontWeight: '900', color: '#111827', letterSpacing: '-0.3px' }}>
                    Hola, {perfil?.nombre} 👋
                  </div>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: wine, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff', flexShrink: 0 }}>
                  {ini}
                </div>
              </div>

              {/* Barra de progreso del plan */}
              {plan ? (
                <div style={{ background: '#f9fafb', borderRadius: 14, padding: '14px 16px', border: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{plan.nombre}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: wine }}>{totalEjs > 0 ? Math.round(completadosHoy / totalEjs * 100) : 0}%</span>
                  </div>
                  <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: wine, borderRadius: 3, width: `${totalEjs > 0 ? Math.round(completadosHoy / totalEjs * 100) : 0}%`, transition: 'width .5s' }} />
                  </div>
                </div>
              ) : (
                <div style={{ background: '#f9fafb', borderRadius: 14, padding: '16px', border: '1px dashed #e5e7eb', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>📋</div>
                  <div style={{ fontSize: 13, color: '#9ca3af' }}>Tu profesora está preparando tu plan</div>
                </div>
              )}
            </div>

            <div style={{ padding: '20px' }}>

              {/* Métricas rápidas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
                {[
                  { n: completadosHoy, label: 'Completados' },
                  { n: diasSemana1.length, label: 'Esta semana' },
                  { n: pesoActual ? `${pesoActual}kg` : '—', label: 'Peso actual' },
                ].map(({ n, label }) => (
                  <div key={label} style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 24, fontWeight: 900, color: '#111827', lineHeight: 1, marginBottom: 4 }}>{n}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Esta semana */}
              {diasSemana1.length > 0 && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Esta semana</div>
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f3f4f6', overflow: 'hidden', marginBottom: 20 }}>
                    {diasSemana1.map((dia: any, i: number) => {
                      const ejsDia = dia.ejercicios || []
                      const doneCount = ejsDia.filter((e: Ejercicio) => checkins.includes(e.id)).length
                      const allDone = ejsDia.length > 0 && doneCount === ejsDia.length
                      return (
                        <div key={dia.id}
                          onClick={() => { setTab('plan'); setBloquesActivos([]); setDiaActivo(dia); cargarBloques(dia.id) }}
                          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < diasSemana1.length - 1 ? '1px solid #f9fafb' : 'none', cursor: 'pointer', transition: 'background .12s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: allDone ? '#f0fdf4' : '#f9fafb', border: `1px solid ${allDone ? '#bbf7d0' : '#f3f4f6'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                            {allDone ? '✅' : '▶️'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{dia.dia}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>{dia.tipo || '—'}</div>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: allDone ? '#16a34a' : wine, background: allDone ? '#f0fdf4' : '#fdf2f5', borderRadius: 20, padding: '3px 10px' }}>
                            {allDone ? 'Hecho' : `${doneCount}/${ejsDia.length}`}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Restricciones médicas */}
              {perfil?.restricciones && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>📌</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>Observación médica</div>
                    <div style={{ fontSize: 13, color: '#78350f' }}>{perfil.restricciones}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB PLAN - Lista de días ── */}
        {tab === 'plan' && !diaActivo && (
          <div className="d-section d-animate">
            <div className="d-header">
              <div className="d-eyebrow">Mi entrenamiento</div>
              <div className="d-title">Mi Plan</div>
            </div>
            <div style={{ padding: '16px 20px' }}>
              {!plan ? (
                <div style={{ textAlign: 'center', padding: '56px 24px', background: '#fff', borderRadius: 16, border: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                  <p style={{ color: '#9ca3af', fontSize: 14 }}>Tu profesora todavía no asignó un plan.</p>
                </div>
              ) : (
                <>
                  <div style={{ background: wine, borderRadius: 16, padding: '16px 18px', marginBottom: 20, color: '#fff' }}>
                    <div style={{ fontSize: 11, opacity: .7, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Plan activo</div>
                    <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 900, marginBottom: 8 }}>{plan.nombre}</div>
                    <span style={{ background: 'rgba(255,255,255,.2)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>🎯 {plan.objetivo}</span>
                  </div>
                  {semanas.map((sem: any) => (
                    <div key={sem.id} style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: wine, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ background: wine, color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{sem.numero}</span>
                        Semana {sem.numero}
                      </div>
                      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
                        {(sem.dias || []).map((dia: any, i: number) => {
                          const ejs = dia.ejercicios || []
                          const done = ejs.filter((e: Ejercicio) => checkins.includes(e.id)).length
                          const allDone = ejs.length > 0 && done === ejs.length
                          return (
                            <div key={dia.id}
                              onClick={() => { const fullDia = semanas.flatMap((s: any) => s.dias || []).find((d: any) => d.id === dia.id) || dia; setBloquesActivos([]); setDiaActivo(fullDia); cargarBloques(fullDia.id) }}
                              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < (sem.dias || []).length - 1 ? '1px solid #f9fafb' : 'none', cursor: 'pointer', transition: 'background .12s' }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                              <div style={{ width: 40, height: 40, borderRadius: 12, background: allDone ? '#f0fdf4' : '#f9fafb', border: `1px solid ${allDone ? '#bbf7d0' : '#f3f4f6'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                                {allDone ? '✅' : '▶️'}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{dia.dia}</div>
                                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>{dia.tipo || '—'}</div>
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: allDone ? '#16a34a' : wine, background: allDone ? '#f0fdf4' : '#fdf2f5', borderRadius: 20, padding: '3px 10px', flexShrink: 0 }}>
                                {allDone ? '✓ Hecho' : `${done}/${ejs.length}`}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── TAB PLAN - Detalle de un día ── */}
        {tab === 'plan' && diaActivo && (
          <div className="d-section d-animate">
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 40 }}>
              <button className="d-btn-ghost" onClick={() => setDiaActivo(null)}>← Volver</button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>{(diaActivo as any).dia}</div>
                {(diaActivo as any).tipo && <div style={{ fontSize: 11, color: '#9ca3af' }}>{(diaActivo as any).tipo}</div>}
              </div>
              <div style={{ width: 60 }} />
            </div>

            <div style={{ padding: '16px 20px' }}>
              {bloquesActivos.length > 0 ? bloquesActivos.map((bloque: any) => {
                const color = TIPO_COLOR[bloque.tipo] || wine
                const isCircuito = bloque.tipo === 'circuito' || bloque.tipo === 'superserie'
                return (
                  <div key={bloque.id} style={{ marginBottom: 16, borderRadius: 16, border: `1px solid ${color}25`, overflow: 'hidden', background: '#fff' }}>
                    <div style={{ background: `${color}10`, padding: '10px 14px', borderBottom: `1px solid ${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{TIPO_EMOJI[bloque.tipo] || '💪'}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{bloque.nombre}</div>
                          <div style={{ fontSize: 10, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '.06em' }}>{TIPO_LABEL[bloque.tipo]}</div>
                        </div>
                      </div>
                      {isCircuito && bloque.rondas && (
                        <span style={{ background: `${color}20`, borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 700, color }}>🔁 {bloque.rondas} rondas</span>
                      )}
                    </div>
                    {bloque.descripcion && (
                      <div style={{ background: `${color}06`, padding: '8px 14px', fontSize: 12, color: '#6b7280', fontStyle: 'italic', borderBottom: `1px solid ${color}15` }}>
                        {bloque.descripcion}
                      </div>
                    )}
                    <div>
                      {(bloque.ejercicios || []).map((ej: any, i: number) => {
                        const done = checkins.includes(ej.id)
                        const series = seriesData[ej.id] || []
                        return (
                          <div key={ej.id} onClick={() => handleDoubleTap(ej)}
                            style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14, borderBottom: i < (bloque.ejercicios || []).length - 1 ? '1px solid #f9fafb' : 'none', background: done ? '#f0fdf4' : '#fff', cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${done ? 'transparent' : '#e5e7eb'}`, background: done ? 'linear-gradient(135deg,#22c55e,#16a34a)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, color: '#fff', marginTop: 2 }}>
                              {done ? '✓' : ''}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3, color: done ? '#15803d' : '#111827' }}>{ej.nombre}</div>
                              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6, fontStyle: 'italic' }}>Doble toque para registrar series</div>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {ej.series && <span style={{ background: '#fdf2f5', color: wine, borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{ej.series} series</span>}
                                {ej.repeticiones && <span style={{ background: '#f0fdf4', color: '#16a34a', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{ej.repeticiones} reps</span>}
                                {ej.carga && <span style={{ background: '#fffbeb', color: '#d97706', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>🏋️ {ej.carga}</span>}
                                {ej.descanso && ej.descanso !== '-' && <span style={{ background: '#f0f9ff', color: '#0284c7', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>⏱ {ej.descanso}</span>}
                              </div>
                              {ej.observaciones && <div style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic', marginTop: 6 }}>💡 {ej.observaciones}</div>}
                              {series.length > 0 && series.some((s: any) => s.peso || s.rpe || s.rir) && (
                                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  {series.map((s: any, i: number) => (s.peso || s.rpe || s.rir) && (
                                    <div key={i} style={{ fontSize: 12, color: wine, background: '#fdf2f5', borderRadius: 8, padding: '4px 10px', display: 'inline-flex', gap: 10 }}>
                                      <span>Serie {i+1}</span>
                                      {s.peso && <span>⚖️ {s.peso}kg</span>}
                                      {s.rpe && <span>RPE {s.rpe}</span>}
                                      {s.rir && <span>RIR {s.rir}</span>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {isCircuito && bloque.descanso_entre_rondas && (
                      <div style={{ background: `${color}08`, padding: '8px 14px', fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>⏱</span> Descanso entre rondas: <strong style={{ color }}>{bloque.descanso_entre_rondas} seg</strong>
                      </div>
                    )}
                  </div>
                )
              }) : (diaActivo as any).ejercicios?.length > 0 ? (
                (diaActivo as any).ejercicios.map((ej: Ejercicio, i: number) => {
                  const done = checkins.includes(ej.id)
                  return (
                    <div key={ej.id} onClick={() => handleDoubleTap(ej)}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14, background: done ? '#f0fdf4' : '#fff', borderRadius: 14, marginBottom: 8, border: `1px solid ${done ? '#bbf7d0' : '#f3f4f6'}`, cursor: 'pointer', userSelect: 'none' }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${done ? 'transparent' : '#e5e7eb'}`, background: done ? 'linear-gradient(135deg,#22c55e,#16a34a)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontSize: 12, marginTop: 2 }}>
                        {done ? '✓' : ''}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: done ? '#15803d' : '#111827', marginBottom: 3 }}>{ej.nombre}</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ background: '#fdf2f5', color: wine, borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{ej.series} series</span>
                          <span style={{ background: '#f0fdf4', color: '#16a34a', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{ej.repeticiones} reps</span>
                          {ej.carga && <span style={{ background: '#fffbeb', color: '#d97706', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>🏋️ {ej.carga}</span>}
                        </div>
                        {ej.observaciones && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>💡 {ej.observaciones}</div>}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 24px', background: '#fff', borderRadius: 16, border: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
                  <p style={{ color: '#9ca3af', fontSize: 14 }}>Los ejercicios se cargarán pronto</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB PROGRESO ── */}
        {tab === 'progreso' && (
          <div className="d-section d-animate">
            <div className="d-header">
              <div className="d-eyebrow">Mi evolución</div>
              <div className="d-title">Progreso</div>
            </div>
            <div style={{ padding: '16px 20px' }}>

              {/* Fotos */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Fotos de progreso</div>
                <button onClick={() => setShowFotoModal(true)} style={{ background: wine, color: '#fff', border: 'none', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>+ Foto</button>
              </div>
              <div style={{ background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#9ca3af' }}>
                🔒 Solo vos y tu profesora pueden ver tus fotos
              </div>
              {fotosProgreso.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', background: '#fff', borderRadius: 14, border: '1px solid #f3f4f6', marginBottom: 24 }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📸</div>
                  <p style={{ color: '#9ca3af', fontSize: 13 }}>Todavía no subiste fotos</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 24 }}>
                  {fotosProgreso.map((f, i) => (
                    <div key={i} style={{ borderRadius: 12, overflow: 'hidden', position: 'relative', aspectRatio: '1' }}>
                      <img src={f.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,.5)', padding: '4px 6px', fontSize: 10, color: '#fff', textAlign: 'center' }}>{f.fecha}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Historial de peso */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Historial de peso</div>
                <button onClick={() => setShowPesoModal(true)} style={{ background: wine, color: '#fff', border: 'none', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>+ Registrar</button>
              </div>
              {pesos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: 14, border: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>⚖️</div>
                  <p style={{ color: '#9ca3af', fontSize: 13 }}>Todavía no hay registros</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 14, padding: 14, textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 900, color: '#111827', lineHeight: 1 }}>{pesos[pesos.length-1].valor}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>kg actual</div>
                    </div>
                    {pesos.length > 1 && (
                      <div style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 14, padding: 14, textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 900, lineHeight: 1, color: pesos[pesos.length-1].valor < pesos[0].valor ? '#16a34a' : '#dc2626' }}>
                          {pesos[pesos.length-1].valor < pesos[0].valor ? '-' : '+'}{Math.abs(+(pesos[pesos.length-1].valor - pesos[0].valor).toFixed(1))}
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>kg diferencia</div>
                      </div>
                    )}
                  </div>
                  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
                    {[...pesos].reverse().map((p, i) => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < pesos.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                        <span style={{ color: '#9ca3af', fontSize: 13 }}>{new Date(p.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</span>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{p.valor} kg</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── TAB PERFIL ── */}
        {tab === 'perfil' && (
          <div className="d-section d-animate">
            <div className="d-header">
              <div className="d-eyebrow">Mi cuenta</div>
              <div className="d-title">Perfil</div>
            </div>
            <div style={{ padding: '16px 20px' }}>

              {/* Card de perfil */}
              <div style={{ background: wine, borderRadius: 20, padding: '20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, color: '#fff', flexShrink: 0 }}>{ini}</div>
                <div>
                  <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 900, color: '#fff' }}>{perfil?.nombre} {perfil?.apellido}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>{perfil?.nivel}</div>
                </div>
              </div>

              {/* Objetivo */}
              {perfil?.objetivo && (
                <div style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: '14px 16px', marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>🎯 Mi objetivo</div>
                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{perfil.objetivo}</p>
                </div>
              )}

              {/* Datos */}
              <div style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
                {[['DNI', perfil?.dni], ['Email', perfil?.email], ['Teléfono', perfil?.telefono], ['Edad', perfil?.edad ? `${perfil.edad} años` : '—'], ['Sexo', perfil?.sexo], ['Nivel', perfil?.nivel], ['Restricciones', perfil?.restricciones || 'Ninguna']].map(([k, v], i, arr) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < arr.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                    <span style={{ color: '#9ca3af', fontSize: 13 }}>{k}</span>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#111827', textAlign: 'right', maxWidth: '60%' }}>{v || '—'}</span>
                  </div>
                ))}
              </div>

              <button onClick={logout} style={{ width: '100%', background: 'transparent', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 500, color: '#6b7280', fontFamily: 'inherit', cursor: 'pointer' }}>
                Cerrar sesión
              </button>
            </div>
          </div>
        )}

        {/* ── BOTTOM NAV ── */}
        <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: '#fff', borderTop: '1px solid #f3f4f6', display: 'flex', padding: '8px 0 20px', zIndex: 100 }}>
          {[
            { key: 'inicio', icon: '⊞', label: 'Inicio' },
            { key: 'plan',   icon: '▤',  label: 'Mi Plan' },
            { key: 'progreso', icon: '↑', label: 'Progreso' },
            { key: 'perfil', icon: '◉',  label: 'Perfil' },
          ].map(({ key, icon, label }) => (
            <button key={key} onClick={() => { setTab(key as any); if (key === 'plan') setDiaActivo(null) }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              <span style={{ fontSize: 18, color: tab === key ? wine : '#d1d5db', transition: '.2s', fontWeight: 'bold' }}>{icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: tab === key ? wine : '#9ca3af' }}>{label}</span>
            </button>
          ))}
        </nav>

        {/* ── MODAL PESO ── */}
        {showPesoModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowPesoModal(false)}>
            <div style={{ background: '#fff', borderRadius: '24px 24px 0 0', padding: 28, width: '100%', maxWidth: 430 }} onClick={e => e.stopPropagation()}>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 900, color: '#111827', marginBottom: 18 }}>Registrar peso</div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Peso actual (kg)</label>
              <input className="d-input" type="number" step="0.1" min="20" max="300" placeholder="Ej: 65.5" value={nuevoPeso} onChange={e => setNuevoPeso(e.target.value)} style={{ marginBottom: 16 }} />
              <button className="d-btn-primary" onClick={guardarPeso}>Guardar ✓</button>
            </div>
          </div>
        )}

        {/* ── MODAL SERIES ── */}
        {ejActivo && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setEjActivo(null)}>
            <div style={{ background: '#fff', borderRadius: '24px 24px 0 0', padding: '24px 20px', width: '100%', maxWidth: 430, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 900, color: '#111827' }}>{ejActivo.nombre}</div>
                <button onClick={() => setEjActivo(null)} style={{ background: '#f9fafb', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 14, color: '#6b7280' }}>✕</button>
              </div>
              <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>{ejActivo.series} series · {ejActivo.repeticiones} reps {ejActivo.carga ? `· ${ejActivo.carga}` : ''}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div />
                {['⚖️ Peso', 'RPE', 'RIR'].map(l => (
                  <div key={l} style={{ fontSize: 10, fontWeight: 700, color: wine, textTransform: 'uppercase', letterSpacing: '.04em', textAlign: 'center' }}>{l}</div>
                ))}
              </div>
              {(seriesData[ejActivo.id] || Array.from({length: ejActivo.series}, () => ({peso:'',rpe:'',rir:''}))).map((s, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: wine, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>{i+1}</div>
                  {['peso','rpe','rir'].map(campo => (
                    <input key={campo} type="number"
                      placeholder={campo === 'peso' ? '0' : campo === 'rpe' ? '1-10' : '0'}
                      value={s[campo] || ''}
                      onChange={e => updateSerie(ejActivo.id, i, campo, e.target.value)}
                      style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '10px 8px', fontSize: 14, textAlign: 'center', width: '100%', fontFamily: 'inherit', outline: 'none' }} />
                  ))}
                </div>
              ))}
              <div style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 14px', marginBottom: 16, marginTop: 8, fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>
                <strong style={{ color: wine }}>RPE</strong> = esfuerzo percibido (1 fácil → 10 máximo) &nbsp;·&nbsp; <strong style={{ color: wine }}>RIR</strong> = reps que te quedaron
              </div>
              <button className="d-btn-primary" onClick={() => guardarSeries(ejActivo)}>Guardar series ✓</button>
            </div>
          </div>
        )}

        {/* ── MODAL FOTOS ── */}
        {showFotoModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowFotoModal(false)}>
            <div style={{ background: '#fff', borderRadius: '24px 24px 0 0', padding: '24px 20px', width: '100%', maxWidth: 430 }} onClick={e => e.stopPropagation()}>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 900, color: '#111827', marginBottom: 4 }}>Foto de progreso</div>
              <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 18 }}>🔒 Solo vos y tu profesora pueden verla</div>
              {fotoPreview ? (
                <div style={{ marginBottom: 16, borderRadius: 14, overflow: 'hidden', maxHeight: 280 }}>
                  <img src={fotoPreview} style={{ width: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div onClick={() => fotoRef.current?.click()}
                  style={{ background: '#f9fafb', border: '2px dashed #e5e7eb', borderRadius: 14, padding: 40, textAlign: 'center', cursor: 'pointer', marginBottom: 16 }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📸</div>
                  <div style={{ fontWeight: 600, color: '#374151', fontSize: 14 }}>Tocá para elegir una foto</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Desde tu galería o cámara</div>
                </div>
              )}
              <input ref={fotoRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
                onChange={e => {
                  const f = e.target.files[0]; if (!f) return
                  setFotoUpload(f)
                  const r = new FileReader(); r.onload = ev => setFotoPreview(ev.target.result); r.readAsDataURL(f)
                }} />
              {fotoPreview && (
                <button onClick={() => fotoRef.current?.click()} style={{ width: '100%', background: 'transparent', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 500, color: '#6b7280', fontFamily: 'inherit', cursor: 'pointer', marginBottom: 10 }}>
                  Cambiar foto
                </button>
              )}
              <button className="d-btn-primary" onClick={subirFotoProgreso} disabled={!fotoUpload} style={{ opacity: fotoUpload ? 1 : 0.5 }}>
                Guardar foto ✓
              </button>
            </div>
          </div>
        )}

        {/* ── MODAL CARITAS ── */}
        {showCaritas && diaTerminado && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: '#fff', borderRadius: 24, padding: '32px 24px', width: '100%', maxWidth: 360, textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,.15)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 900, color: '#111827', marginBottom: 6 }}>¡Día completado!</div>
              <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>Terminaste {diaTerminado.dia}. ¿Cómo te sentiste?</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 20 }}>
                {[{ emoji: '😫', label: 'Muy difícil' }, { emoji: '😓', label: 'Difícil' }, { emoji: '😊', label: 'Bien' }, { emoji: '💪', label: 'Fuerte' }, { emoji: '🔥', label: '¡Genial!' }].map(({ emoji, label }) => (
                  <div key={emoji} onClick={() => { showToast(`¡${label}! Seguí así 💪`); setShowCaritas(false) }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 6px', borderRadius: 12, cursor: 'pointer', border: '1.5px solid #f3f4f6', transition: '.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = wine)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#f3f4f6')}>
                    <span style={{ fontSize: 26 }}>{emoji}</span>
                    <span style={{ fontSize: 9, fontWeight: 600, color: '#9ca3af', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowCaritas(false)} style={{ width: '100%', background: 'transparent', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, fontSize: 14, color: '#6b7280', fontFamily: 'inherit', cursor: 'pointer' }}>
                Cerrar
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
