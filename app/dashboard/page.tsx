// @ts-nocheck
'use client'
// app/dashboard/page.tsx — Dashboard del alumno
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Perfil, Plan, Semana, Dia, Ejercicio, Peso } from '@/types/database'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [semanas, setSemanas] = useState<Semana[]>([])
  const [pesos, setPesos] = useState<Peso[]>([])
  const [checkins, setCheckins] = useState<string[]>([]) // IDs de ejercicios completados hoy
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'inicio' | 'plan' | 'progreso' | 'perfil'>('inicio')
  const [nuevoPeso, setNuevoPeso] = useState('')
  const [showPesoModal, setShowPesoModal] = useState(false)
  const [diaActivo, setDiaActivo] = useState<Dia | null>(null)
  const [toast, setToast] = useState('')
  // Fotos de progreso
  const [fotosProgreso, setFotosProgreso] = useState([])
  const [showFotoModal, setShowFotoModal] = useState(false)
  const [fotoUpload, setFotoUpload] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const fotoRef = typeof window !== 'undefined' ? { current: null } : { current: null }
  // Series detalle por ejercicio (doble tap)
  const [ejActivo, setEjActivo] = useState(null) // ejercicio con modal abierto
  const [seriesData, setSeriesData] = useState({}) // { [ejId]: [{peso, rpe, rir}] }
  // Caritas al terminar día
  const [showCaritas, setShowCaritas] = useState(false)
  const [diaTerminado, setDiaTerminado] = useState(null)
  // Tap timer para doble tap
  const lastTap = typeof window !== 'undefined' ? { current: {} } : { current: {} }

  useEffect(() => { loadData() }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Cargar perfil
    const { data: p } = await supabase.from('perfiles').select('*').eq('id', user.id).single()
    if (!p) { router.push('/login'); return }
    if (p.rol === 'admin') { router.push('/admin'); return }
    setPerfil(p)

    // Cargar plan asignado
    const { data: asig } = await supabase
      .from('asignaciones')
      .select('plan_id')
      .eq('alumno_id', user.id)
      .eq('activo', true)
      .single()

    if (asig) {
      const { data: planData } = await supabase.from('planes').select('*').eq('id', asig.plan_id).single()
      if (planData) {
        setPlan(planData)
        // Cargar semanas con días y ejercicios
        const { data: semsData } = await supabase
          .from('semanas')
          .select(`*, dias(*, ejercicios(*))`)
          .eq('plan_id', planData.id)
          .order('numero')
        setSemanas(semsData || [])
      }
    }

    // Cargar pesos
    const { data: pesosData } = await supabase
      .from('pesos')
      .select('*')
      .eq('alumno_id', user.id)
      .order('fecha')
    setPesos(pesosData || [])

    // Cargar checkins de hoy
    const hoy = new Date().toISOString().split('T')[0]
    const { data: chkData } = await supabase
      .from('checkins')
      .select('ejercicio_id')
      .eq('alumno_id', user.id)
      .eq('fecha', hoy)
    setCheckins((chkData || []).map(c => c.ejercicio_id))

    setLoading(false)
    cargarFotosProgreso()
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

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ede0e2' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏋️</div>
        <div style={{ color: '#7D0531', fontWeight: '600' }}>Cargando tu espacio...</div>
      </div>
    </div>
  )

  const diasSemana1 = semanas[0]?.dias || []
  const completadosHoy = diasSemana1.flatMap(d => (d as any).ejercicios || []).filter((e: Ejercicio) => checkins.includes(e.id)).length
  const totalEjs = diasSemana1.flatMap(d => (d as any).ejercicios || []).length
  const ini = `${perfil?.nombre?.[0] || ''}${perfil?.apellido?.[0] || ''}`.toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#7D0531 0%,#9a0840 50%,#B05276 100%)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
    <div style={{ maxWidth: '430px', width: '100%', minHeight: '100vh', background: '#faf8f7', position: 'relative', boxShadow: '0 0 80px rgba(0,0,0,.35)' }}>
      {toast && <div className="toast">{toast}</div>}

      {/* INICIO */}
      {tab === 'inicio' && (
        <>
          <div style={{ background: 'linear-gradient(160deg,#7D0531,#9a0840)', padding: '36px 22px 28px', color: '#DBBABF', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <div style={{ fontSize: '13px', opacity: .7, marginBottom: '4px' }}>Hola de nuevo 👋</div>
                  <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '26px', fontWeight: '900' }}>{perfil?.nombre}!</div>
                </div>
                <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#B05276', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px', color: '#fff' }}>{ini}</div>
              </div>
              {plan ? (
                <div style={{ background: 'rgba(255,255,255,.12)', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', opacity: .8 }}>{plan.nombre}</span>
                    <span style={{ fontWeight: '700', fontSize: '15px' }}>{totalEjs > 0 ? Math.round(completadosHoy / totalEjs * 100) : 0}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,.2)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#DBBABF', borderRadius: '4px', width: `${totalEjs > 0 ? Math.round(completadosHoy / totalEjs * 100) : 0}%`, transition: 'width .5s' }} />
                  </div>
                </div>
              ) : (
                <div style={{ background: 'rgba(255,255,255,.12)', borderRadius: '14px', padding: '18px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>📋</div>
                  <div style={{ fontSize: '14px', opacity: .8 }}>Tu profesora está preparando tu plan</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: '18px 20px', paddingBottom: '90px' }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '22px' }}>
              {[
                [completadosHoy.toString(), 'Completados'],
                [totalEjs.toString(), 'Esta semana'],
                [pesos.length ? pesos[pesos.length - 1].valor + ' kg' : '—', 'Peso actual'],
              ].map(([n, l]) => (
                <div key={l} style={{ background: '#ede0e2', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: '800', background: 'linear-gradient(135deg,#B05276,#7D0531)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{n}</div>
                  <div style={{ fontSize: '11px', color: '#8a7070', marginTop: '2px' }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Días de la semana */}
            {diasSemana1.length > 0 && (
              <>
                <h3 style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '18px', color: '#7D0531', marginBottom: '14px' }}>Esta semana</h3>
                <div className="card" style={{ padding: '8px' }}>
                  {diasSemana1.map((dia: any) => {
                    const ejsDia = dia.ejercicios || []
                    const doneCount = ejsDia.filter((e: Ejercicio) => checkins.includes(e.id)).length
                    const allDone = ejsDia.length > 0 && doneCount === ejsDia.length
                    return (
                      <div key={dia.id} onClick={() => { setDiaActivo(dia); setTab('plan') }}
                        style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderBottom: '1px solid #ede0e2', cursor: 'pointer', transition: '.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#ede0e2')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: allDone ? '#dcfce7' : '#ede0e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                          {allDone ? '✅' : '🏋️'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '15px' }}>{dia.dia}</div>
                          <div style={{ fontSize: '12px', color: '#8a7070', marginTop: '2px' }}>{dia.tipo || '—'}</div>
                        </div>
                        <span className={`badge ${allDone ? 'badge-green' : 'badge-rose'}`}>{allDone ? 'Hecho' : `${doneCount}/${ejsDia.length}`}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {perfil?.restricciones && (
              <div className="warn" style={{ marginTop: '16px' }}>
                <div className="warn-title">📌 Observación médica</div>
                <div style={{ fontSize: '13px', color: '#92400e' }}>{perfil.restricciones}</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* PLAN - Lista de días */}
      {tab === 'plan' && !diaActivo && (
        <div style={{ paddingBottom: '90px' }}>
          <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #ede0e2' }}>
            <div className="page-eyebrow">Mi entrenamiento</div>
            <div className="page-title">Mi Plan</div>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {!plan ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>📋</div>
                <p style={{ color: '#8a7070' }}>Tu profesora todavía no asignó un plan.</p>
              </div>
            ) : (
              <>
                <div className="card-pine" style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', opacity: .6, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px' }}>Plan activo</div>
                  <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>{plan.nombre}</div>
                  <span className="badge badge-pink">🎯 {plan.objetivo}</span>
                </div>
                {semanas.map((sem: any) => (
                  <div key={sem.id} style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '16px', color: '#7D0531', marginBottom: '12px' }}>Semana {sem.numero}</h3>
                    <div className="card" style={{ padding: '8px' }}>
                      {(sem.dias || []).map((dia: any) => {
                        const ejs = dia.ejercicios || []
                        const done = ejs.filter((e: Ejercicio) => checkins.includes(e.id)).length
                        return (
                          <div key={dia.id} onClick={() => setDiaActivo(dia)}
                            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderBottom: '1px solid #ede0e2', cursor: 'pointer' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#ede0e2')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: done === ejs.length && ejs.length > 0 ? '#dcfce7' : '#ede0e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#7D0531' }}>
                              {done === ejs.length && ejs.length > 0 ? '✅' : '▶'}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '600', fontSize: '14px' }}>{dia.dia}</div>
                              <div style={{ fontSize: '12px', color: '#8a7070', marginTop: '2px' }}>{dia.tipo || '—'}</div>
                            </div>
                            <span className={`badge ${done === ejs.length && ejs.length > 0 ? 'badge-green' : 'badge-rose'}`}>{done}/{ejs.length}</span>
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

      {/* PLAN - Detalle de un día */}
      {tab === 'plan' && diaActivo && (
        <div style={{ paddingBottom: '90px' }}>
          <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid #ede0e2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#faf8f7', zIndex: 40 }}>
            <button className="btn-ghost" style={{ padding: '8px 12px', fontSize: '13px' }} onClick={() => setDiaActivo(null)}>← Volver</button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: '800', fontSize: '16px', color: '#7D0531' }}>{(diaActivo as any).dia}</div>
              <div style={{ fontSize: '12px', color: '#8a7070' }}>{(diaActivo as any).tipo}</div>
            </div>
            <div style={{ width: '60px' }} />
          </div>
          <div style={{ padding: '16px 20px' }}>
            {((diaActivo as any).ejercicios || []).length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                <p style={{ color: '#8a7070' }}>Los ejercicios se cargarán pronto</p>
              </div>
            ) : (
              (diaActivo as any).ejercicios.map((ej: Ejercicio) => {
                const done = checkins.includes(ej.id)
                const series = seriesData[ej.id] || []
                return (
                  <div key={ej.id} onClick={() => handleDoubleTap(ej)}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px', background: done ? '#f0fdf4' : '#ede0e2', borderRadius: '14px', marginBottom: '10px', border: `1.5px solid ${done ? '#bbf7d0' : 'transparent'}`, cursor: 'pointer', transition: '.2s', userSelect: 'none' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid', borderColor: done ? 'transparent' : '#DBBABF', background: done ? 'linear-gradient(135deg,#22c55e,#16a34a)' : '#faf8f7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '13px', color: '#fff' }}>
                      {done ? '✓' : ''}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px', color: done ? '#15803d' : '#2a1520' }}>{ej.nombre}</div>
                      <div style={{ fontSize: '11px', color: '#B05276', marginBottom: '6px', fontStyle: 'italic' }}>Doble toque para registrar series</div>
                      <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: ej.observaciones ? '8px' : '0' }}>
                        <span className="badge badge-rose">{ej.series} series</span>
                        <span className="badge badge-pine">{ej.repeticiones} reps</span>
                        {ej.carga && <span className="badge badge-amber">🏋️ {ej.carga}</span>}
                        {ej.descanso && ej.descanso !== '-' && <span className="badge badge-green">⏱ {ej.descanso}</span>}
                      </div>
                      {ej.observaciones && <div style={{ fontSize: '12px', color: '#8a7070', fontStyle: 'italic', marginTop: '4px' }}>💡 {ej.observaciones}</div>}
                      {series.length > 0 && series.some(s => s.peso || s.rpe || s.rir) && (
                        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {series.map((s, i) => (s.peso || s.rpe || s.rir) && (
                            <div key={i} style={{ fontSize: '12px', color: '#5a2a3a', background: 'rgba(176,82,118,.1)', borderRadius: '8px', padding: '4px 10px', display: 'inline-flex', gap: '10px' }}>
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
              })
            )}
          </div>
        </div>
      )}

      {/* PROGRESO */}
      {tab === 'progreso' && (
        <div style={{ paddingBottom: '90px' }}>
          <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #ede0e2' }}>
            <div className="page-eyebrow">Mi evolución</div>
            <div className="page-title">Progreso</div>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {/* Fotos de progreso */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '18px', color: '#7D0531' }}>Fotos de progreso</h3>
                <button className="btn-wine" style={{ fontSize: '13px', padding: '8px 14px' }} onClick={() => setShowFotoModal(true)}>+ Foto</button>
              </div>
              <div style={{ background: '#ede0e2', borderRadius: '12px', padding: '10px 14px', marginBottom: '12px', fontSize: '12px', color: '#8a7070', lineHeight: '1.5' }}>
                🔒 Tus fotos son <strong>privadas</strong> — solo vos y tu profesora pueden verlas. No se comparten en ningún lado.
              </div>
              {fotosProgreso.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>📸</div>
                  <p style={{ color: '#8a7070', fontSize: '14px' }}>Todavía no subiste fotos</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {fotosProgreso.map((f, i) => (
                    <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', position: 'relative', aspectRatio: '1' }}>
                      <img src={f.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(125,5,49,.7)', padding: '4px 6px', fontSize: '10px', color: '#DBBABF', textAlign: 'center' }}>{f.fecha}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '18px', color: '#7D0531' }}>Historial de peso</h3>
              <button className="btn-wine" style={{ fontSize: '13px', padding: '8px 14px' }} onClick={() => setShowPesoModal(true)}>+ Registrar</button>
            </div>
            {pesos.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚖️</div>
                <p style={{ color: '#8a7070' }}>Todavía no hay registros</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ background: '#ede0e2', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#7D0531' }}>{pesos[pesos.length - 1].valor}</div>
                    <div style={{ fontSize: '11px', color: '#8a7070', marginTop: '2px' }}>kg actual</div>
                  </div>
                  {pesos.length > 1 && (
                    <div style={{ background: '#ede0e2', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: pesos[pesos.length - 1].valor < pesos[0].valor ? '#16a34a' : '#c0392b' }}>
                        {pesos[pesos.length - 1].valor < pesos[0].valor ? '-' : '+'}{Math.abs(+(pesos[pesos.length - 1].valor - pesos[0].valor).toFixed(1))}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8a7070', marginTop: '2px' }}>kg diferencia</div>
                    </div>
                  )}
                </div>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {[...pesos].reverse().map((p, i) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < pesos.length - 1 ? '1px solid #ede0e2' : 'none' }}>
                      <span style={{ color: '#8a7070', fontSize: '13px' }}>{new Date(p.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</span>
                      <span style={{ fontWeight: '700', fontSize: '16px', color: '#7D0531' }}>{p.valor} kg</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* PERFIL */}
      {tab === 'perfil' && (
        <div style={{ paddingBottom: '90px' }}>
          <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #ede0e2' }}>
            <div className="page-eyebrow">Mi cuenta</div>
            <div className="page-title">Perfil</div>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <div className="card-pine" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#B05276', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '22px', color: '#fff' }}>{ini}</div>
              <div>
                <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '20px', fontWeight: '700' }}>{perfil?.nombre} {perfil?.apellido}</div>
                <div style={{ opacity: .7, fontSize: '14px', marginTop: '4px' }}>{perfil?.nivel}</div>
              </div>
            </div>

            {perfil?.objetivo && (
              <div style={{ background: '#f5eaed', border: '2px solid #B05276', borderRadius: '16px', padding: '18px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#7D0531', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px' }}>🎯 Mi objetivo</div>
                <p style={{ fontSize: '14px', color: '#2a1520', lineHeight: '1.6', fontStyle: 'italic' }}>"{perfil.objetivo}"</p>
              </div>
            )}

            <div className="card" style={{ marginBottom: '16px' }}>
              {[['DNI', perfil?.dni], ['Email', perfil?.email], ['Teléfono', perfil?.telefono], ['Edad', perfil?.edad ? `${perfil.edad} años` : '—'], ['Sexo', perfil?.sexo], ['Nivel', perfil?.nivel], ['Restricciones', perfil?.restricciones || 'Ninguna']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #ede0e2' }}>
                  <span style={{ color: '#8a7070', fontSize: '14px' }}>{k}</span>
                  <span style={{ fontWeight: '600', fontSize: '14px', textAlign: 'right', maxWidth: '60%' }}>{v || '—'}</span>
                </div>
              ))}
            </div>
            <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={logout}>Cerrar sesión</button>
          </div>
        </div>
      )}

      {/* MODAL PESO */}
      {showPesoModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(125,5,49,.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowPesoModal(false)}>
          <div style={{ background: '#faf8f7', borderRadius: '24px 24px 0 0', padding: '28px', width: '100%', maxWidth: '430px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '20px', fontWeight: '700', color: '#7D0531', marginBottom: '18px' }}>Registrar peso</h3>
            <div style={{ marginBottom: '16px' }}>
              <label className="field-label">Peso actual (kg)</label>
              <input className="input-field" type="number" step="0.1" min="20" max="300" placeholder="Ej: 65.5" value={nuevoPeso} onChange={e => setNuevoPeso(e.target.value)} />
            </div>
            <button className="btn-wine" style={{ width: '100%' }} onClick={guardarPeso}>Guardar ✓</button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      {/* MODAL SERIES (doble tap en ejercicio) */}
      {ejActivo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(125,5,49,.6)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setEjActivo(null)}>
          <div style={{ background: '#faf8f7', borderRadius: '24px 24px 0 0', padding: '24px 20px', width: '100%', maxWidth: '430px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '18px', fontWeight: '700', color: '#7D0531' }}>{ejActivo.nombre}</div>
              <button onClick={() => setEjActivo(null)} style={{ background: '#ede0e2', border: 'none', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '14px', color: '#8a7070' }}>✕</button>
            </div>
            <div style={{ fontSize: '13px', color: '#8a7070', marginBottom: '18px' }}>{ejActivo.series} series · {ejActivo.repeticiones} reps {ejActivo.carga ? `· ${ejActivo.carga}` : ''}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#8a7070', textTransform: 'uppercase' }}></div>
              {[['⚖️ Peso (kg)', 'Ej: 20'], ['RPE (1-10)', 'Ej: 8'], ['RIR', 'Ej: 2']].map(([l]) => (
                <div key={l} style={{ fontSize: '11px', fontWeight: '700', color: '#7D0531', textTransform: 'uppercase', letterSpacing: '.04em', textAlign: 'center' }}>{l}</div>
              ))}
            </div>
            {(seriesData[ejActivo.id] || Array.from({length: ejActivo.series}, () => ({peso:'',rpe:'',rir:''}))).map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#7D0531', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DBBABF', fontWeight: '700', fontSize: '12px' }}>{i+1}</div>
                {['peso','rpe','rir'].map(campo => (
                  <input key={campo} type="number" placeholder={campo === 'peso' ? '0' : campo === 'rpe' ? '1-10' : '0'}
                    value={s[campo] || ''}
                    onChange={e => updateSerie(ejActivo.id, i, campo, e.target.value)}
                    style={{ background: '#ede0e2', border: '1.5px solid #d5c4c8', borderRadius: '10px', padding: '10px 8px', fontSize: '14px', textAlign: 'center', width: '100%', fontFamily: 'inherit', outline: 'none' }} />
                ))}
              </div>
            ))}
            <div style={{ background: '#ede0e2', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', marginTop: '8px' }}>
              <div style={{ fontSize: '12px', color: '#8a7070', lineHeight: '1.5' }}>
                <strong style={{ color: '#7D0531' }}>RPE</strong> = percepción del esfuerzo (1 muy fácil → 10 máximo esfuerzo)<br/>
                <strong style={{ color: '#7D0531' }}>RIR</strong> = repeticiones en reserva (cuántas más podrías hacer)
              </div>
            </div>
            <button className="btn-wine" style={{ width: '100%', fontSize: '15px', padding: '14px' }} onClick={() => guardarSeries(ejActivo)}>
              Guardar series ✓
            </button>
          </div>
        </div>
      )}

      {/* MODAL FOTOS PROGRESO */}
      {showFotoModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(125,5,49,.6)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowFotoModal(false)}>
          <div style={{ background: '#faf8f7', borderRadius: '24px 24px 0 0', padding: '24px 20px', width: '100%', maxWidth: '430px' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '18px', fontWeight: '700', color: '#7D0531', marginBottom: '6px' }}>Foto de progreso</div>
            <div style={{ fontSize: '13px', color: '#8a7070', marginBottom: '18px' }}>🔒 Solo vos y tu profesora pueden verla</div>
            {fotoPreview ? (
              <div style={{ marginBottom: '16px', borderRadius: '14px', overflow: 'hidden', maxHeight: '280px' }}>
                <img src={fotoPreview} style={{ width: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div onClick={() => document.getElementById('foto-input-progreso')?.click()}
                style={{ background: '#ede0e2', border: '2px dashed #d5c4c8', borderRadius: '14px', padding: '40px', textAlign: 'center', cursor: 'pointer', marginBottom: '16px' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>📸</div>
                <div style={{ fontWeight: '600', color: '#7D0531', fontSize: '14px' }}>Tocá para elegir una foto</div>
                <div style={{ fontSize: '12px', color: '#8a7070', marginTop: '4px' }}>Desde tu galería o cámara</div>
              </div>
            )}
            <input id="foto-input-progreso" type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
              onChange={e => {
                const f = e.target.files[0]
                if (!f) return
                setFotoUpload(f)
                const r = new FileReader()
                r.onload = ev => setFotoPreview(ev.target.result)
                r.readAsDataURL(f)
              }} />
            {fotoPreview && (
              <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', marginBottom: '10px' }} onClick={() => document.getElementById('foto-input-progreso')?.click()}>
                Cambiar foto
              </button>
            )}
            <button className="btn-wine" style={{ width: '100%' }} onClick={subirFotoProgreso} disabled={!fotoUpload}>
              Guardar foto ✓
            </button>
          </div>
        </div>
      )}

      {/* MODAL CARITAS AL TERMINAR DÍA */}
      {showCaritas && diaTerminado && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(125,5,49,.7)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#faf8f7', borderRadius: '28px', padding: '32px 24px', width: '100%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,.3)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
            <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '20px', fontWeight: '900', color: '#7D0531', marginBottom: '8px' }}>¡Día completado!</div>
            <div style={{ fontSize: '14px', color: '#8a7070', marginBottom: '24px' }}>Terminaste el entrenamiento de {diaTerminado.dia}. ¿Cómo te sentiste?</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '20px' }}>
              {[
                { emoji: '😫', label: 'Muy difícil' },
                { emoji: '😓', label: 'Difícil' },
                { emoji: '😊', label: 'Bien' },
                { emoji: '💪', label: 'Fuerte' },
                { emoji: '🔥', label: '¡Increíble!' },
              ].map(({ emoji, label }) => (
                <div key={emoji} onClick={() => { showToast(`¡${label}! Seguí así 💪`); setShowCaritas(false) }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px 6px', borderRadius: '14px', cursor: 'pointer', border: '2px solid #ede0e2', background: '#faf8f7', transition: '.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#B05276'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#ede0e2'}>
                  <span style={{ fontSize: '28px' }}>{emoji}</span>
                  <span style={{ fontSize: '10px', fontWeight: '600', color: '#8a7070', textAlign: 'center', lineHeight: '1.2' }}>{label}</span>
                </div>
              ))}
            </div>
            <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowCaritas(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', background: '#faf8f7', borderTop: '1px solid #d5c4c8', display: 'flex', padding: '8px 0 16px', zIndex: 100 }}>
        {[
          { key: 'inicio', icon: '🏠', label: 'Inicio' },
          { key: 'plan', icon: '📋', label: 'Mi Plan' },
          { key: 'progreso', icon: '📈', label: 'Progreso' },
          { key: 'perfil', icon: '👤', label: 'Perfil' },
        ].map(({ key, icon, label }) => (
          <button key={key} onClick={() => { setTab(key as any); if (key === 'plan') setDiaActivo(null) }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer' }}>
            <span style={{ fontSize: '20px', transform: tab === key ? 'scale(1.12)' : 'scale(1)', transition: '.2s' }}>{icon}</span>
            <span style={{ fontSize: '10px', fontWeight: '700', color: tab === key ? '#7D0531' : '#8a7070' }}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
    </div>
  )
}
