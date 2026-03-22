// @ts-nocheck
'use client'
// app/admin/page.tsx — Panel de la profesora
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Perfil, Plan, Asignacion } from '@/types/database'
import { RoutineDayEditor } from '@/components/routines/RoutineDayEditor'

type Tab = 'dashboard' | 'alumnos' | 'ficha' | 'planes' | 'builder'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab]               = useState<Tab>('dashboard')
  const [loading, setLoading]       = useState(true)
  const [admin, setAdmin]           = useState<Perfil | null>(null)
  const [alumnos, setAlumnos]       = useState<Perfil[]>([])
  const [planes, setPlanes]         = useState<Plan[]>([])
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [alumnoActivo, setAlumnoActivo] = useState<Perfil | null>(null)
  const [searchQ, setSearchQ]       = useState('')
  const [toast, setToast]           = useState('')

  // Builder state
  const [bp, setBp] = useState<any>(null)

  // Modal add alumno
  const [showAddAlumno, setShowAddAlumno] = useState(false)
  const [newA, setNewA] = useState({ nombre:'', apellido:'', dni:'', email:'', telefono:'', edad:'', sexo:'', objetivo:'', nivel:'Principiante', restricciones:'', password:'' })

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [planExpandido, setPlanExpandido] = useState(null)

  // Modal editor de bloques
  const [diaEditorActivo, setDiaEditorActivo] = useState<{id: string, nombre: string, numero: number} | null>(null)

  useEffect(() => { loadData() }, [])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: p } = await supabase.from('perfiles').select('*').eq('id', user.id).single() as any
    if (!p || p.rol !== 'admin') { router.push('/dashboard'); return }
    setAdmin(p)

    // Cargar alumnos
    const { data: as } = await supabase.from('perfiles').select('*').eq('rol', 'alumno').order('nombre')
    setAlumnos(as || [])

    // Cargar planes con semanas/días/ejercicios
    const { data: ps } = await supabase.from('planes').select(`*, semanas(*, dias(*, ejercicios(*)))`).order('created_at', { ascending: false })
    setPlanes(ps || [])

    // Cargar asignaciones
    const { data: asigs } = await supabase.from('asignaciones').select('*').eq('activo', true)
    setAsignaciones(asigs || [])

    setLoading(false)
  }

  function getPlanAlumno(alumnoId: string) {
    const asig = asignaciones.find(a => a.alumno_id === alumnoId)
    return asig ? planes.find(p => p.id === asig.plan_id) : null
  }

  async function asignarPlan(alumnoId: string, planId: string | null) {
    // Eliminar asignación existente
    await supabase.from('asignaciones').delete().eq('alumno_id', alumnoId)
    if (planId) {
      await supabase.from('asignaciones').insert({ alumno_id: alumnoId, plan_id: planId, activo: true })
    }
    await loadData()
    showToast(planId ? '✅ Plan asignado' : '✅ Plan removido')
  }

  // ── CREAR ALUMNO ──
  async function crearAlumno() {
    if (!newA.nombre || !newA.apellido || !newA.dni || !newA.email) { showToast('⚠️ Completá nombre, apellido, DNI y email'); return }
    if (!/^\d{7,8}$/.test(newA.dni)) { showToast('⚠️ DNI inválido'); return }
    if (!newA.objetivo || newA.objetivo.length < 3) { showToast('⚠️ El objetivo es obligatorio'); return }
    if (!newA.password || newA.password.length < 6) { showToast('⚠️ La contraseña debe tener al menos 6 caracteres'); return }

    // Guardar sesión admin antes de crear alumno
    const { data: { session: adminSession } } = await supabase.auth.getSession()

    const { data: authData, error } = await supabase.auth.signUp({
      email: newA.email,
      password: newA.password,
      options: { data: { nombre: newA.nombre, apellido: newA.apellido, dni: newA.dni, rol: 'alumno' } }
    })

    // Restaurar sesión admin inmediatamente
    if (adminSession) {
      await supabase.auth.setSession({ access_token: adminSession.access_token, refresh_token: adminSession.refresh_token })
    }

    if (error) { showToast('⚠️ ' + error.message); return }

    if (authData.user) {
      await supabase.from('perfiles').update({
        telefono: newA.telefono, edad: parseInt(newA.edad) || undefined,
        sexo: newA.sexo, objetivo: newA.objetivo, nivel: newA.nivel as any,
        restricciones: newA.restricciones, aprobado: true,
      }).eq('id', authData.user.id)
    }

    setShowAddAlumno(false)
    setNewA({ nombre:'', apellido:'', dni:'', email:'', telefono:'', edad:'', sexo:'', objetivo:'', nivel:'Principiante', restricciones:'', password:'' })
    showToast('✅ Alumno/a creado/a')
    loadData()
  }

  // ── BUILDER: GUARDAR PLAN ──
  async function guardarPlan() {
    if (!bp.nombre) { showToast('⚠️ El plan necesita un nombre'); return }
    const totalDias = bp.semanas.reduce((a: number, s: any) => a + s.dias.length, 0)
    if (!totalDias) { showToast('⚠️ Agregá al menos 1 día de entrenamiento'); return }

    let planId = bp.id

    if (planId) {
      // Actualizar plan existente sin borrar días (preserva bloques)
      await supabase.from('planes').update({ nombre: bp.nombre, objetivo: bp.objetivo }).eq('id', planId)

      // IDs que vienen del builder (los que queremos conservar)
      const semanaIds = bp.semanas.map((s: any) => s.id).filter((id: string) => id && !id.startsWith('tmp'))
      const diaIds = bp.semanas.flatMap((s: any) => s.dias.map((d: any) => d.id)).filter((id: string) => id && !id.startsWith('tmp'))
      const ejIds = bp.semanas.flatMap((s: any) => s.dias.flatMap((d: any) => d.ejercicios.map((e: any) => e.id))).filter((id: string) => id && !id.startsWith('tmp'))

      // Borrar semanas que ya no existen
      const { data: semsActuales } = await supabase.from('semanas').select('id').eq('plan_id', planId)
      for (const sem of (semsActuales || [])) {
        if (!semanaIds.includes(sem.id)) {
          await supabase.from('semanas').delete().eq('id', sem.id)
        }
      }

      // Borrar días que ya no existen (preserva bloques de los días que sí existen)
      const { data: diasActuales } = await supabase.from('dias').select('id, semana_id').in('semana_id', semanaIds.length ? semanaIds : ['none'])
      for (const dia of (diasActuales || [])) {
        if (!diaIds.includes(dia.id)) {
          await supabase.from('dias').delete().eq('id', dia.id)
        }
      }

      // Borrar ejercicios sin bloque que ya no existen
      if (diaIds.length > 0) {
        const { data: ejsActuales } = await supabase.from('ejercicios').select('id').in('dia_id', diaIds).is('bloque_id', null)
        for (const ej of (ejsActuales || [])) {
          if (!ejIds.includes(ej.id)) {
            await supabase.from('ejercicios').delete().eq('id', ej.id)
          }
        }
      }

      // Actualizar/crear semanas y días
      for (const sem of bp.semanas) {
        let semId = sem.id
        if (semId && !semId.startsWith('tmp')) {
          await supabase.from('semanas').update({ numero: sem.numero }).eq('id', semId)
        } else {
          const { data: newSem } = await supabase.from('semanas').insert({ plan_id: planId, numero: sem.numero }).select().single()
          semId = newSem!.id
        }

        for (const dia of sem.dias) {
          let diaId = dia.id
          if (diaId && !diaId.startsWith('tmp')) {
            await supabase.from('dias').update({ dia: dia.dia, tipo: dia.tipo, orden: dia.orden || 0 }).eq('id', diaId)
          } else {
            const { data: newDia } = await supabase.from('dias').insert({ semana_id: semId, dia: dia.dia, tipo: dia.tipo, orden: dia.orden || 0 }).select().single()
            diaId = newDia!.id
          }

          for (let i = 0; i < dia.ejercicios.length; i++) {
            const ej = dia.ejercicios[i]
            if (ej.id && !ej.id.startsWith('tmp')) {
              await supabase.from('ejercicios').update({ nombre: ej.nombre, series: ej.series, repeticiones: ej.repeticiones, carga: ej.carga, descanso: ej.descanso, rpe: ej.rpe || null, rir: ej.rir || null, observaciones: ej.observaciones, orden: i }).eq('id', ej.id)
            } else {
              await supabase.from('ejercicios').insert({ dia_id: diaId, nombre: ej.nombre, series: ej.series, repeticiones: ej.repeticiones, carga: ej.carga, descanso: ej.descanso, rpe: ej.rpe || null, rir: ej.rir || null, observaciones: ej.observaciones, orden: i })
            }
          }
        }
      }

    } else {
      // Plan nuevo — crear todo desde cero
      const { data: newPlan } = await supabase.from('planes').insert({ nombre: bp.nombre, objetivo: bp.objetivo, admin_id: admin!.id }).select().single()
      planId = newPlan!.id

      for (const sem of bp.semanas) {
        const { data: semData } = await supabase.from('semanas').insert({ plan_id: planId, numero: sem.numero }).select().single()
        for (const dia of sem.dias) {
          const { data: diaData } = await supabase.from('dias').insert({ semana_id: semData!.id, dia: dia.dia, tipo: dia.tipo, orden: dia.orden || 0 }).select().single()
          for (let i = 0; i < dia.ejercicios.length; i++) {
            const ej = dia.ejercicios[i]
            await supabase.from('ejercicios').insert({ dia_id: diaData!.id, nombre: ej.nombre, series: ej.series, repeticiones: ej.repeticiones, carga: ej.carga, descanso: ej.descanso, rpe: ej.rpe || null, rir: ej.rir || null, observaciones: ej.observaciones, orden: i })
          }
        }
      }
    }

    // Asignar a los alumnos seleccionados en el builder
    for (const alumnoId of bp.asignados || []) {
      await supabase.from('asignaciones').delete().eq('alumno_id', alumnoId)
      await supabase.from('asignaciones').insert({ alumno_id: alumnoId, plan_id: planId, activo: true })
    }

    setBp(null)
    showToast('✅ Plan guardado exitosamente')
    setTab('planes')
    loadData()
  }

  async function eliminarPlan(planId: string) {
    if (!confirm('¿Eliminar este plan? Los alumnos asignados quedarán sin plan.')) return
    await supabase.from('planes').delete().eq('id', planId)
    showToast('🗑 Plan eliminado')
    loadData()
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ede0e2' }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: '48px', marginBottom: '12px' }}>🏋️</div><div style={{ color: '#7D0531', fontWeight: '600' }}>Cargando panel...</div></div>
    </div>
  )

  const filtrados = alumnos.filter(a => `${a.nombre} ${a.apellido} ${a.dni}`.toLowerCase().includes(searchQ.toLowerCase()))
  const DIAS_SEM = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  const OBJ_OPTS = ['Bajar de peso', 'Ganar masa muscular', 'Salud general', 'Rendimiento deportivo', 'Rehabilitación', 'Flexibilidad', 'Otro']

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Mobile topbar */}
      <div style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: '#7D0531', padding: '14px 20px', alignItems: 'center', justifyContent: 'space-between', id: 'mobile-topbar' }} className="mobile-topbar">
        <div style={{ fontFamily: 'Georgia,serif', fontSize: '18px', fontWeight: '900', color: '#DBBABF' }}>Team Carito</div>
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#DBBABF', fontSize: '24px', cursor: 'pointer', padding: '4px' }}>☰</button>
      </div>
      {/* Overlay mobile */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 299 }} />}
      {toast && <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#7D0531', color: '#DBBABF', padding: '12px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', zIndex: 600, whiteSpace: 'nowrap' }}>{toast}</div>}

      {/* SIDEBAR */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-topbar { display: flex !important; }
          .admin-sidebar { transform: translateX(-100%); position: fixed !important; z-index: 300; transition: transform .3s ease; }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-main { padding-top: 60px !important; }
          .admin-main > div { padding: 20px 16px !important; }
          .stats-grid-3 { grid-template-columns: 1fr 1fr !important; }
          .table-scroll { overflow-x: auto; }
          .grid-2-col { grid-template-columns: 1fr !important; }
          .builder-cols { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
      <aside className={sidebarOpen ? 'admin-sidebar open' : 'admin-sidebar'} style={{ background: '#7D0531', color: '#DBBABF', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', width: '260px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px 0' }}>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(219,186,191,.5)', fontSize: '20px', cursor: 'pointer', display: 'none' }} className="close-sidebar">✕</button>
        </div>
        <div style={{ padding: '32px 28px 24px', borderBottom: '1px solid rgba(219,186,191,.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{ width: '40px', height: '40px', background: '#B05276', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🏋️</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '900', lineHeight: '1.1' }}>Team<br />Carito</div>
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(219,186,191,.5)', textTransform: 'uppercase', letterSpacing: '.1em', marginTop: '4px' }}>Panel de entrenamiento</div>
        </div>

        <div style={{ padding: '20px 16px 8px' }}>
          <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(219,186,191,.4)', textTransform: 'uppercase', letterSpacing: '.1em', padding: '0 12px', marginBottom: '8px' }}>Gestión</div>
          {[
            { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
            { key: 'alumnos',   icon: '👥', label: 'Alumnos/as' },
            { key: 'planes',    icon: '📋', label: 'Planes' },
          ].map(({ key, icon, label }) => (
            <button key={key} onClick={() => { setTab(key as Tab); setSidebarOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '12px', cursor: 'pointer', transition: '.2s', fontSize: '14px', fontWeight: '500', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit',
                background: tab === key ? '#9a0840' : 'transparent',
                color: tab === key ? '#DBBABF' : 'rgba(219,186,191,.7)',
                boxShadow: tab === key ? '0 4px 12px rgba(77,0,17,.4)' : 'none',
              }}>
              <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{icon}</span>{label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: '20px 16px', borderTop: '1px solid rgba(219,186,191,.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(219,186,191,.06)', borderRadius: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#B05276', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>
              {`${admin?.nombre?.[0] || ''}${admin?.apellido?.[0] || ''}`.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#DBBABF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin?.nombre} {admin?.apellido}</div>
              <div style={{ fontSize: '11px', color: 'rgba(219,186,191,.5)' }}>Profesora</div>
            </div>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'rgba(219,186,191,.4)', cursor: 'pointer', fontSize: '16px', padding: '4px', borderRadius: '6px' }} title="Cerrar sesión">⏏</button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className='admin-main' style={{ overflowY: 'auto', background: '#ede0e2', flex: 1, minWidth: 0 }}>

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div style={{ padding: '32px 36px' }}>
            <div style={{ marginBottom: '32px' }}>
              <div className="page-eyebrow">Bienvenida</div>
              <div className="page-title">Hola, {admin?.nombre} 👩‍💼</div>
            </div>
            <div className='stats-grid-3' style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
              {[[alumnos.length, 'Alumnos/as'], [planes.length, 'Planes'], [asignaciones.length, 'Con plan activo']].map(([n, l]) => (
                <div key={l} style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #d5c4c8', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: '#DBBABF', borderRadius: '50%', opacity: .5 }} />
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '40px', fontWeight: '900', color: '#7D0531', lineHeight: 1, position: 'relative', zIndex: 1 }}>{n}</div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#8a7070', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: '6px', position: 'relative', zIndex: 1 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#7D0531' }}>Alumnos/as</h2>
              <button className="btn-wine" style={{ fontSize: '13px', padding: '8px 14px' }} onClick={() => setTab('alumnos')}>Ver todos →</button>
            </div>
            <div style={{ background: '#fff', borderRadius: '20px', padding: '8px', border: '1px solid #d5c4c8' }}>
              {alumnos.slice(0, 5).map(a => {
                const plan = getPlanAlumno(a.id)
                return (
                  <div key={a.id} onClick={() => { setAlumnoActivo(a); setTab('ficha') }}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderBottom: '1px solid #ede0e2', cursor: 'pointer', transition: '.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#ede0e2')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#B05276', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', color: '#fff', flexShrink: 0 }}>
                      {`${a.nombre[0]}${a.apellido[0]}`.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{a.nombre} {a.apellido}</div>
                      <div style={{ fontSize: '12px', color: '#8a7070', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>{a.objetivo || '—'}</div>
                    </div>
                    <span className={`badge ${plan ? 'badge-green' : 'badge-amber'}`}>{plan ? '✓ Plan' : 'Sin plan'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ALUMNOS */}
        {tab === 'alumnos' && (
          <div style={{ padding: '32px 36px' }}>
            <div style={{ marginBottom: '24px' }}>
              <div className="page-eyebrow">Gestión</div>
              <div className="page-title">Alumnos/as</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <input type="text" placeholder="🔍 Buscar por nombre o DNI..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
                style={{ background: '#fff', border: '1.5px solid #d5c4c8', borderRadius: '11px', padding: '10px 16px', fontSize: '14px', outline: 'none', maxWidth: '280px', fontFamily: 'inherit', width: '100%' }} />
              <button className="btn-wine" onClick={() => setShowAddAlumno(true)}>+ Nuevo alumno/a</button>
            </div>
            <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid #d5c4c8' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                <thead>
                  <tr style={{ background: '#DBBABF' }}>
                    {['Alumno/a', 'DNI', 'Objetivo', 'Nivel', 'Plan', ''].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#7D0531', textTransform: 'uppercase', letterSpacing: '.08em', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(a => {
                    const plan = getPlanAlumno(a.id)
                    return (
                      <tr key={a.id} style={{ cursor: 'pointer' }}
                        onMouseEnter={e => { Array.from(e.currentTarget.children).forEach((td: any) => td.style.background = '#ede0e2') }}
                        onMouseLeave={e => { Array.from(e.currentTarget.children).forEach((td: any) => td.style.background = '') }}
                        onClick={() => { setAlumnoActivo(a); setTab('ficha') }}>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #ede0e2' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#B05276', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', color: '#fff', flexShrink: 0 }}>
                              {`${a.nombre[0]}${a.apellido[0]}`.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '14px' }}>{a.nombre} {a.apellido}</div>
                              <div style={{ fontSize: '11px', color: '#8a7070' }}>DNI {a.dni}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #ede0e2', fontSize: '13px', color: '#5a3a40' }}>{a.dni}</td>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #ede0e2', fontSize: '13px', color: '#5a3a40', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.objetivo || '—'}</td>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #ede0e2' }}><span className="badge badge-rose">{a.nivel || '—'}</span></td>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #ede0e2' }}><span className={`badge ${plan ? 'badge-green' : 'badge-amber'}`}>{plan ? plan.nombre : 'Sin plan'}</span></td>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #ede0e2' }}>
                          <select value={getPlanAlumno(a.id)?.id || ''} onChange={e => { e.stopPropagation(); asignarPlan(a.id, e.target.value || null) }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: '#ede0e2', border: '1.5px solid #d5c4c8', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', color: '#5a3a40', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                            <option value="">Sin plan</option>
                            {planes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FICHA ALUMNO */}
        {tab === 'ficha' && alumnoActivo && (
          <div style={{ padding: '32px 36px' }}>
            <button className="btn-ghost" style={{ marginBottom: '20px', fontSize: '13px' }} onClick={() => setTab('alumnos')}>← Volver</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#B05276', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '22px', color: '#fff', flexShrink: 0 }}>
                {`${alumnoActivo.nombre[0]}${alumnoActivo.apellido[0]}`.toUpperCase()}
              </div>
              <div>
                <div className="page-title" style={{ marginBottom: '4px' }}>{alumnoActivo.nombre} {alumnoActivo.apellido}</div>
                <span className="badge badge-rose">{alumnoActivo.nivel || 'Sin nivel'}</span>
              </div>
            </div>
            <div className='grid-2-col' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[['DNI', alumnoActivo.dni], ['Edad', alumnoActivo.edad ? `${alumnoActivo.edad} años` : '—'], ['Teléfono', alumnoActivo.telefono || '—'], ['Sexo', alumnoActivo.sexo || '—']].map(([l, v]) => (
                <div key={l} className="card">
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#8a7070', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '4px' }}>{l}</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#2a1520' }}>{v}</div>
                </div>
              ))}
            </div>
            {alumnoActivo.objetivo && (
              <div className="card" style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#8a7070', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '6px' }}>Objetivo</div>
                <div style={{ fontSize: '14px', color: '#2a1520', lineHeight: '1.6' }}>{alumnoActivo.objetivo}</div>
              </div>
            )}
            {alumnoActivo.restricciones && (
              <div className="card" style={{ marginTop: '16px', borderLeft: '3px solid #f59e0b' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#8a7070', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '6px' }}>⚠️ Restricciones</div>
                <div style={{ fontSize: '14px', color: '#2a1520' }}>{alumnoActivo.restricciones}</div>
              </div>
            )}
            <div className="card" style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#8a7070', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '10px' }}>Plan asignado</div>
              <select value={getPlanAlumno(alumnoActivo.id)?.id || ''} onChange={e => asignarPlan(alumnoActivo.id, e.target.value || null)}
                style={{ background: '#ede0e2', border: '1.5px solid #d5c4c8', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', color: '#2a1520', outline: 'none', width: '100%', fontFamily: 'inherit' }}>
                <option value="">Sin plan asignado</option>
                {planes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* PLANES */}
        {tab === 'planes' && !bp && (
          <div style={{ padding: '32px 36px' }}>
            <div style={{ marginBottom: '24px' }}>
              <div className="page-eyebrow">Gestión</div>
              <div className="page-title">Planes de entrenamiento</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', color: '#8a7070' }}>{planes.length} plan{planes.length !== 1 ? 'es' : ''}</div>
              <button className="btn-wine" onClick={() => { setBp({ id: null, nombre: '', objetivo: 'Bajar de peso', semanas: [{ id: uid(), numero: 1, dias: [] }], asignados: [] }); setTab('builder') }}>+ Crear plan</button>
            </div>

            {!planes.length ? (
              <div className="card" style={{ textAlign: 'center', padding: '56px 24px' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>📋</div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#7D0531', marginBottom: '12px' }}>Ningún plan todavía</h3>
                <p style={{ color: '#8a7070', marginBottom: '24px' }}>Creá el primer plan y asignalo a tus alumnos</p>
                <button className="btn-wine" onClick={() => { setBp({ id: null, nombre: '', objetivo: 'Bajar de peso', semanas: [{ id: uid(), numero: 1, dias: [] }], asignados: [] }); setTab('builder') }}>+ Crear primer plan</button>
              </div>
            ) : planes.map(plan => {
              const asigAlumnos = alumnos.filter(a => getPlanAlumno(a.id)?.id === plan.id)
              const totalDias = (plan as any).semanas?.reduce((a: number, s: any) => a + (s.dias?.length || 0), 0) || 0
              const totalEjs = (plan as any).semanas?.reduce((a: number, s: any) => a + (s.dias || []).reduce((b: number, d: any) => b + (d.ejercicios?.length || 0), 0), 0) || 0
              return (
                <div key={plan.id} className="card" style={{ marginBottom: '16px', cursor: 'pointer' }} onClick={() => setPlanExpandido(planExpandido === plan.id ? null : plan.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '700', color: '#7D0531', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>{plan.nombre} <span style={{ fontSize: '14px', opacity: .5 }}>{planExpandido === plan.id ? '▲' : '▼'}</span></h3>
                      <span className="badge badge-rose">🎯 {plan.objetivo}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-ghost" style={{ fontSize: '13px', padding: '8px 14px' }}
                        onClick={() => {
                          const semanas = ((plan as any).semanas || []).map((s: any) => ({
                            id: s.id, numero: s.numero,
                            dias: (s.dias || []).map((d: any) => ({ id: d.id, dia: d.dia, tipo: d.tipo || '', orden: d.orden || 0, ejercicios: (d.ejercicios || []).map((e: any) => ({ id: e.id, nombre: e.nombre, series: e.series, repeticiones: e.repeticiones, carga: e.carga || '', descanso: e.descanso || '', rpe: e.rpe || '', rir: e.rir || '', observaciones: e.observaciones || '' })) }))
                          }))
                          setBp({ id: plan.id, nombre: plan.nombre, objetivo: plan.objetivo, semanas, asignados: asigAlumnos.map(a => a.id) })
                          setTab('builder')
                        }}>✏️ Editar</button>
                      <button className="btn-danger" style={{ fontSize: '13px', padding: '8px 12px' }} onClick={() => eliminarPlan(plan.id)}>🗑</button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                    {[[(plan as any).semanas?.length || 0, 'Semanas'], [totalDias, 'Días totales'], [totalEjs, 'Ejercicios']].map(([n, l]) => (
                      <div key={l} style={{ background: '#ede0e2', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '700', color: '#7D0531' }}>{n}</div>
                        <div style={{ fontSize: '11px', color: '#8a7070', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: '3px' }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ height: '1px', background: '#d5c4c8', margin: '14px 0' }} />
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#8a7070', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Asignado a</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {asigAlumnos.length ? asigAlumnos.map(a => (
                        <span key={a.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#DBBABF', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', fontWeight: '600', color: '#7D0531' }}>
                          <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#B05276', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '8px', fontWeight: '800' }}>{`${a.nombre[0]}${a.apellido[0]}`.toUpperCase()}</span>
                          {a.nombre} {a.apellido}
                        </span>
                      )) : <span style={{ color: '#8a7070', fontSize: '13px' }}>Ningún alumno/a</span>}
                    </div>
                  </div>
                  {/* Detalle expandible del plan */}
                  {planExpandido === plan.id && (
                    <div style={{ borderTop: '1px solid #d5c4c8', marginTop: '14px', paddingTop: '14px' }} onClick={e => e.stopPropagation()}>
                      {((plan as any).semanas || []).map((sem: any) => (
                        <div key={sem.id} style={{ marginBottom: '16px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#7D0531', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: '#7D0531', color: '#DBBABF', borderRadius: '50%', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', flexShrink: 0 }}>{sem.numero}</span>
                            Semana {sem.numero}
                          </div>
                          {(sem.dias || []).map((dia: any) => (
                            <div key={dia.id} style={{ background: '#ede0e2', borderRadius: '12px', padding: '12px 14px', marginBottom: '8px' }}>
                              <div style={{ fontWeight: '700', fontSize: '13px', color: '#2a1520', marginBottom: '8px' }}>
                                {dia.dia} {dia.tipo && <span style={{ fontWeight: '400', color: '#8a7070' }}>— {dia.tipo}</span>}
                              </div>
                              {(dia.ejercicios || []).length === 0 ? (
                                <div style={{ fontSize: '12px', color: '#8a7070', fontStyle: 'italic' }}>Sin ejercicios cargados</div>
                              ) : (dia.ejercicios || []).map((ej: any, i: number) => (
                                <div key={ej.id} style={{ fontSize: '13px', padding: '6px 0', borderBottom: i < dia.ejercicios.length - 1 ? '1px solid rgba(0,0,0,.07)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontWeight: '600', flex: 1, color: '#2a1520' }}>{ej.nombre}</span>
                                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    <span style={{ background: 'rgba(176,82,118,.15)', color: '#7D0531', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>{ej.series}×{ej.repeticiones}</span>
                                    {ej.carga && <span style={{ background: '#fef3c7', color: '#d97706', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: '700' }}>{ej.carga}</span>}
                                    {ej.rpe && <span style={{ background: '#ede0e2', color: '#5a2a3a', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: '700' }}>RPE {ej.rpe}</span>}
                                    {ej.rir && <span style={{ background: '#ede0e2', color: '#5a2a3a', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: '700' }}>RIR {ej.rir}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* BUILDER */}
        {tab === 'builder' && bp && (
          <div style={{ padding: '32px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <button className="btn-ghost" style={{ marginBottom: '12px', fontSize: '13px' }} onClick={() => { setBp(null); setTab('planes') }}>← Volver</button>
                <div className="page-title">{bp.id ? 'Editar plan' : 'Nuevo plan'}</div>
              </div>
              <button className="btn-wine" style={{ fontSize: '15px', padding: '12px 24px' }} onClick={guardarPlan}>💾 Guardar plan</button>
            </div>

            {/* Paso 1: Datos */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#7D0531', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DBBABF', fontWeight: '800', fontSize: '13px' }}>1</div>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#7D0531' }}>Datos del plan</h3>
            </div>
            <div className="card" style={{ marginBottom: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="field-label">Nombre del plan *</label>
                  <input className="input-field" type="text" placeholder="Ej: Plan Fuerza 8 semanas" value={bp.nombre} onChange={e => setBp((p: any) => ({ ...p, nombre: e.target.value }))} />
                </div>
                <div>
                  <label className="field-label">Objetivo</label>
                  <select className="input-field" value={['Bajar de peso','Ganar masa muscular','Salud general','Rendimiento deportivo','Rehabilitación','Flexibilidad'].includes(bp.objetivo) ? bp.objetivo : 'Otro'}
                    onChange={e => setBp((p: any) => ({ ...p, objetivo: e.target.value === 'Otro' ? '' : e.target.value }))}>
                    {['Bajar de peso','Ganar masa muscular','Salud general','Rendimiento deportivo','Rehabilitación','Flexibilidad','Otro'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  {!['Bajar de peso','Ganar masa muscular','Salud general','Rendimiento deportivo','Rehabilitación','Flexibilidad'].includes(bp.objetivo) && (
                    <input className="input-field" type="text" placeholder="Escribí el objetivo del plan..." value={bp.objetivo} onChange={e => setBp((p: any) => ({ ...p, objetivo: e.target.value }))} style={{ marginTop: '8px' }} />
                  )}
                </div>
              </div>
            </div>

            {/* Paso 2: Semanas */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#7D0531', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DBBABF', fontWeight: '800', fontSize: '13px' }}>2</div>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#7D0531' }}>Semanas y ejercicios</h3>
            </div>

            {bp.semanas.map((sem: any, si: number) => (
              <div key={sem.id} style={{ border: '1.5px solid #d5c4c8', borderRadius: '16px', padding: '20px', marginBottom: '16px', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: '17px', fontWeight: '700', color: '#7D0531' }}>Semana {sem.numero}</span>
                    <span className="badge badge-rose">{sem.dias.length} día{sem.dias.length !== 1 ? 's' : ''}</span>
                  </div>
                  {si > 0 && <button className="btn-danger" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => setBp((p: any) => ({ ...p, semanas: p.semanas.filter((_: any, i: number) => i !== si).map((s: any, i: number) => ({ ...s, numero: i + 1 })) }))}>Eliminar semana</button>}
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#8a7070', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '8px' }}>Días de entrenamiento</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {DIAS_SEM.map(d => {
                      const ya = sem.dias.find((x: any) => x.dia === d)
                      return (
                        <button key={d} onClick={async () => {
                          if (ya) {
                            // Si el día tiene un ID real, borrarlo de Supabase
                            if (ya.id && !ya.id.startsWith('tmp') && bp.id) {
                              await supabase.from('dias').delete().eq('id', ya.id)
                            }
                            setBp((p: any) => ({ ...p, semanas: p.semanas.map((s: any) => s.id === sem.id ? { ...s, dias: s.dias.filter((x: any) => x.dia !== d) } : s) }))
                          } else {
                            // Si el plan ya existe, crear el día en Supabase inmediatamente
                            if (bp.id && sem.id && !sem.id.startsWith('tmp')) {
                              const { data: newDia } = await supabase.from('dias').insert({ semana_id: sem.id, dia: d, tipo: '', orden: sem.dias.length }).select().single()
                              if (newDia) {
                                setBp((p: any) => ({ ...p, semanas: p.semanas.map((s: any) => s.id === sem.id ? { ...s, dias: [...s.dias, { id: newDia.id, dia: d, tipo: '', orden: s.dias.length, ejercicios: [] }] } : s) }))
                                return
                              }
                            }
                            setBp((p: any) => ({ ...p, semanas: p.semanas.map((s: any) => s.id === sem.id ? { ...s, dias: [...s.dias, { id: uid(), dia: d, tipo: '', orden: s.dias.length, ejercicios: [] }] } : s) }))
                          }
                        }}
                          style={{ padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', border: '1.5px solid', transition: '.15s', fontFamily: 'inherit',
                            background: ya ? '#7D0531' : '#fff', color: ya ? '#DBBABF' : '#8a7070', borderColor: ya ? '#7D0531' : '#d5c4c8' }}>
                          {d.slice(0, 3)}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {sem.dias.map((dia: any) => (
                  <div key={dia.id} style={{ background: '#ede0e2', borderRadius: '13px', padding: '16px', marginBottom: '12px', border: '1px solid #d5c4c8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontWeight: '700', fontSize: '15px', color: '#7D0531' }}>{dia.dia}</span>
                      <button className="btn-danger" style={{ fontSize: '11px', padding: '5px 10px' }} onClick={() => setBp((p: any) => ({ ...p, semanas: p.semanas.map((s: any) => s.id === sem.id ? { ...s, dias: s.dias.filter((x: any) => x.id !== dia.id) } : s) }))}>✕</button>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#8a7070', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '6px' }}>Nombre de la sesión</label>
                      <input style={{ background: '#fff', border: '1.5px solid #d5c4c8', borderRadius: '9px', padding: '8px 11px', fontSize: '14px', color: '#2a1520', outline: 'none', width: '100%', fontFamily: 'inherit', transition: '.2s' }}
                        type="text" placeholder="Ej: Pecho + Tríceps, Cardio..." value={dia.tipo}
                        onChange={e => setBp((p: any) => ({ ...p, semanas: p.semanas.map((s: any) => s.id === sem.id ? { ...s, dias: s.dias.map((x: any) => x.id === dia.id ? { ...x, tipo: e.target.value } : x) } : s) }))} />
                    </div>

                    {dia.ejercicios.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 55px 65px 70px 70px 55px 55px 32px', gap: '6px', marginBottom: '6px' }}>
                        {['Ejercicio', 'Series', 'Reps', 'Carga', 'Descanso', 'RPE', 'RIR', ''].map(l => (
                          <span key={l} style={{ fontSize: '10px', fontWeight: '700', color: '#8a7070', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: l !== 'Ejercicio' ? 'center' : 'left' }}>{l}</span>
                        ))}
                      </div>
                    )}

                    {dia.ejercicios.map((ej: any, ei: number) => (
                      <div key={ej.id}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 55px 65px 70px 70px 55px 55px 32px', gap: '6px', marginBottom: '6px' }}>
                          {[
                            { k: 'nombre', ph: 'Nombre del ejercicio' },
                            { k: 'series', ph: '3', type: 'number' },
                            { k: 'repeticiones', ph: '12' },
                            { k: 'carga', ph: 'kg/PC' },
                            { k: 'descanso', ph: '60s' },
                            { k: 'rpe', ph: '1-10' },
                            { k: 'rir', ph: '0-5' },
                          ].map(({ k, ph, type }) => (
                            <input key={k} type={type || 'text'} placeholder={ph} value={(ej as any)[k] || ''} style={{ background: '#fff', border: '1.5px solid #d5c4c8', borderRadius: '9px', padding: '8px 6px', fontSize: '13px', color: '#2a1520', outline: 'none', width: '100%', fontFamily: 'inherit', textAlign: k !== 'nombre' ? 'center' : 'left' }}
                              onChange={e => setBp((p: any) => ({ ...p, semanas: p.semanas.map((s: any) => s.id === sem.id ? { ...s, dias: s.dias.map((x: any) => x.id === dia.id ? { ...x, ejercicios: x.ejercicios.map((ex: any) => ex.id === ej.id ? { ...ex, [k]: k === 'series' ? parseInt(e.target.value) || 1 : e.target.value } : ex) } : x) } : s) }))} />
                          ))}
                          <button className="btn-danger" style={{ padding: '8px', fontSize: '12px', borderRadius: '9px' }} onClick={() => setBp((p: any) => ({ ...p, semanas: p.semanas.map((s: any) => s.id === sem.id ? { ...s, dias: s.dias.map((x: any) => x.id === dia.id ? { ...x, ejercicios: x.ejercicios.filter((ex: any) => ex.id !== ej.id) } : x) } : s) }))}>✕</button>
                        </div>
                        <input type="text" placeholder="Observaciones (opcional)" value={ej.observaciones} style={{ background: '#fff', border: '1.5px solid #d5c4c8', borderRadius: '9px', padding: '7px 11px', fontSize: '12px', color: '#8a7070', outline: 'none', width: '100%', fontFamily: 'inherit', marginBottom: '8px' }}
                          onChange={e => setBp((p: any) => ({ ...p, semanas: p.semanas.map((s: any) => s.id === sem.id ? { ...s, dias: s.dias.map((x: any) => x.id === dia.id ? { ...x, ejercicios: x.ejercicios.map((ex: any) => ex.id === ej.id ? { ...ex, observaciones: e.target.value } : ex) } : x) } : s) }))} />
                      </div>
                    ))}

                    <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '13px', marginTop: '4px' }}
                      onClick={() => setBp((p: any) => ({ ...p, semanas: p.semanas.map((s: any) => s.id === sem.id ? { ...s, dias: s.dias.map((x: any) => x.id === dia.id ? { ...x, ejercicios: [...x.ejercicios, { id: uid(), nombre: '', series: 3, repeticiones: '12', carga: '', descanso: '60 seg', rpe: '', rir: '', observaciones: '' }] } : x) } : s) }))}>
                      + Agregar ejercicio
                    </button>

                    {/* ── BOTÓN EDITAR BLOQUES ── */}
                    {bp.id && dia.id && (
                      <button
                        style={{ width: '100%', marginTop: '8px', padding: '10px', borderRadius: '10px', border: '1.5px dashed #B05276', background: 'transparent', color: '#7D0531', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        onClick={() => setDiaEditorActivo({ id: dia.id, nombre: dia.tipo || dia.dia, numero: dia.orden + 1 })}
                      >
                        🧱 Editar bloques de {dia.dia}
                      </button>
                    )}

                  </div>
                ))}
              </div>
            ))}

            <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', marginBottom: '28px' }}
              onClick={() => setBp((p: any) => ({ ...p, semanas: [...p.semanas, { id: uid(), numero: p.semanas.length + 1, dias: [] }] }))}>
              + Agregar semana {bp.semanas.length + 1}
            </button>

            {/* Paso 3: Asignar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#7D0531', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DBBABF', fontWeight: '800', fontSize: '13px' }}>3</div>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#7D0531' }}>Asignar alumnos/as</h3>
            </div>
            <div className="card" style={{ marginBottom: '28px' }}>
              {alumnos.map(a => {
                const sel = bp.asignados.includes(a.id)
                return (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #ede0e2', cursor: 'pointer' }}
                    onClick={() => setBp((p: any) => ({ ...p, asignados: sel ? p.asignados.filter((id: string) => id !== a.id) : [...p.asignados, a.id] }))}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: '2px solid', borderColor: sel ? '#7D0531' : '#d5c4c8', background: sel ? '#7D0531' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#DBBABF', flexShrink: 0 }}>
                      {sel ? '✓' : ''}
                    </div>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#B05276', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', color: '#fff', flexShrink: 0 }}>{`${a.nombre[0]}${a.apellido[0]}`.toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{a.nombre} {a.apellido}</div>
                      <div style={{ fontSize: '12px', color: '#8a7070', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>{a.objetivo}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <button className="btn-wine" style={{ width: '100%', fontSize: '16px', padding: '16px' }} onClick={guardarPlan}>💾 Guardar plan</button>
          </div>
        )}
      </main>

      {/* MODAL EDITOR DE BLOQUES */}
      {diaEditorActivo && (
        <div
          onClick={() => setDiaEditorActivo(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(2,6,23,0.7)', backdropFilter: 'blur(4px)' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '640px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: '#0F172A', borderRadius: '20px 20px 0 0', border: '1px solid rgba(51,65,85,0.8)', borderBottom: 'none', boxShadow: '0 -8px 48px rgba(0,0,0,0.6)' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(51,65,85,0.5)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  🧱
                </div>
                <div>
                  <div style={{ color: '#F1F5F9', fontWeight: '700', fontSize: '15px', lineHeight: 1.2 }}>Bloques</div>
                  <div style={{ color: '#64748B', fontSize: '12px', marginTop: '2px' }}>{diaEditorActivo.nombre}</div>
                </div>
              </div>
              <button
                onClick={() => setDiaEditorActivo(null)}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(51,65,85,0.6)', background: 'rgba(30,41,59,0.8)', cursor: 'pointer', color: '#64748B', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>
            {/* Contenido scrolleable */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px' }}>
              <RoutineDayEditor
                diaId={diaEditorActivo.id}
                diaNombre={diaEditorActivo.nombre}
                diaNumero={diaEditorActivo.numero}
                onAgregarEjercicio={() => {
                  showToast('💡 Guardá el plan primero, luego agregá ejercicios desde el bloque')
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR ALUMNO */}
      {showAddAlumno && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(125,5,49,.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowAddAlumno(false)}>
          <div style={{ background: '#faf8f7', borderRadius: '24px', padding: '28px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', color: '#7D0531' }}>Nuevo alumno/a</div>
              <button onClick={() => setShowAddAlumno(false)} style={{ background: '#ede0e2', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: '#8a7070', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[['nombre', 'Nombre *', 'Ej: María'], ['apellido', 'Apellido *', 'Ej: García'], ['dni', 'DNI *', 'Sin puntos'], ['email', 'Email *', 'mail@mail.com'], ['telefono', 'Teléfono', '11-0000-0000'], ['edad', 'Edad', '30']].map(([k, l, ph]) => (
                <div key={k}>
                  <label className="field-label">{l}</label>
                  <input className="input-field" type={k === 'edad' ? 'number' : k === 'email' ? 'email' : 'text'} placeholder={ph}
                    value={(newA as any)[k]} onChange={e => setNewA(p => ({ ...p, [k]: e.target.value }))} />
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label className="field-label">Sexo</label>
                <select className="input-field" value={newA.sexo} onChange={e => setNewA(p => ({ ...p, sexo: e.target.value }))}>
                  <option value="">—</option>
                  {['Femenino', 'Masculino', 'No binario', 'Prefiero no decir'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Nivel</label>
                <select className="input-field" value={newA.nivel} onChange={e => setNewA(p => ({ ...p, nivel: e.target.value }))}>
                  {['Principiante', 'Intermedio', 'Avanzado'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label className="field-label">Objetivo * <span style={{ textTransform: 'none', fontWeight: '400', letterSpacing: 0, fontSize: '11px', color: '#8a7070' }}>campo libre — la alumna/o escribe lo que realmente quiere</span></label>
              <textarea value={newA.objetivo} onChange={e => setNewA(p => ({ ...p, objetivo: e.target.value }))}
                placeholder="Ej: quiero bajar 5 kilos, tonificar piernas, mejorar mi resistencia..."
                style={{ background: '#ede0e2', border: '2px solid #d5c4c8', borderRadius: '12px', padding: '14px', fontSize: '14px', color: '#2a1520', outline: 'none', width: '100%', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px', lineHeight: '1.6' }} />
              <div style={{ fontSize: '11px', color: '#8a7070', marginTop: '4px', fontStyle: 'italic' }}>💡 Este es el campo más importante. Armás el plan en base a esto.</div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label className="field-label">Restricciones <span style={{ textTransform: 'none', fontWeight: '400', letterSpacing: 0, fontSize: '11px', color: '#8a7070' }}>(opcional)</span></label>
              <input className="input-field" type="text" placeholder="Ej: dolor de rodilla..." value={newA.restricciones} onChange={e => setNewA(p => ({ ...p, restricciones: e.target.value }))} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="field-label">Contraseña inicial *</label>
              <input className="input-field" type="password" placeholder="Mínimo 6 caracteres" value={newA.password} onChange={e => setNewA(p => ({ ...p, password: e.target.value }))} />
              <div style={{ fontSize: '11px', color: '#8a7070', marginTop: '4px' }}>El alumno/a puede cambiarla desde su perfil.</div>
            </div>

            <button className="btn-wine" style={{ width: '100%' }} onClick={crearAlumno}>Crear alumno/a ✓</button>
          </div>
        </div>
      )}
    </div>
  )
}
