// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [tab, setTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState(null)
  const [alumnos, setAlumnos] = useState([])
  const [planes, setPlanes] = useState([])
  const [asignaciones, setAsignaciones] = useState([])
  const [alumnoActivo, setAlumnoActivo] = useState(null)
  const [searchQ, setSearchQ] = useState('')
  const [toast, setToast] = useState('')
  const [bp, setBp] = useState(null)
  const [showAddAlumno, setShowAddAlumno] = useState(false)
  const [newA, setNewA] = useState({ nombre:'',apellido:'',dni:'',email:'',telefono:'',edad:'',sexo:'',objetivo:'',nivel:'Principiante',restricciones:'',password:'' })

  useEffect(() => { loadData() }, [])

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }
  function uid() { return Date.now().toString(36)+Math.random().toString(36).slice(2) }

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: p } = await supabase.from('perfiles').select('*').eq('id', user.id).single()
    if (!p || p.rol !== 'admin') { router.push('/dashboard'); return }
    setAdmin(p)
    const { data: as } = await supabase.from('perfiles').select('*').eq('rol','alumno').order('nombre')
    setAlumnos(as||[])
    const { data: ps } = await supabase.from('planes').select('*, semanas(*, dias(*, ejercicios(*)))').order('created_at',{ascending:false})
    setPlanes(ps||[])
    const { data: asigs } = await supabase.from('asignaciones').select('*').eq('activo',true)
    setAsignaciones(asigs||[])
    setLoading(false)
  }

  function getPlanAlumno(alumnoId) {
    const asig = asignaciones.find(a => a.alumno_id === alumnoId)
    return asig ? planes.find(p => p.id === asig.plan_id) : null
  }

  async function asignarPlan(alumnoId, planId) {
    await supabase.from('asignaciones').delete().eq('alumno_id', alumnoId)
    if (planId) await supabase.from('asignaciones').insert({ alumno_id: alumnoId, plan_id: planId, activo: true })
    await loadData()
    showToast(planId ? '✅ Plan asignado' : '✅ Plan removido')
  }

  async function crearAlumno() {
    if (!newA.nombre||!newA.apellido||!newA.dni||!newA.email) { showToast('⚠️ Completá nombre, apellido, DNI y email'); return }
    if (!/^\d{7,8}$/.test(newA.dni)) { showToast('⚠️ DNI inválido'); return }
    if (!newA.objetivo||newA.objetivo.length<3) { showToast('⚠️ El objetivo es obligatorio'); return }
    if (!newA.password||newA.password.length<6) { showToast('⚠️ La contraseña debe tener al menos 6 caracteres'); return }
    const { data: authData, error } = await supabase.auth.signUp({
      email: newA.email, password: newA.password,
      options: { data: { nombre: newA.nombre, apellido: newA.apellido, dni: newA.dni, rol: 'alumno' } }
    })
    if (error) { showToast('⚠️ '+error.message); return }
    if (authData.user) {
      await supabase.from('perfiles').update({
        telefono: newA.telefono, edad: parseInt(newA.edad)||null,
        sexo: newA.sexo, objetivo: newA.objetivo, nivel: newA.nivel,
        restricciones: newA.restricciones, aprobado: true,
      }).eq('id', authData.user.id)
    }
    setShowAddAlumno(false)
    setNewA({nombre:'',apellido:'',dni:'',email:'',telefono:'',edad:'',sexo:'',objetivo:'',nivel:'Principiante',restricciones:'',password:''})
    showToast('✅ Alumno/a creado/a'); loadData()
  }

  async function guardarPlan() {
    if (!bp.nombre) { showToast('⚠️ El plan necesita un nombre'); return }
    if (!bp.semanas.reduce((a,s)=>a+s.dias.length,0)) { showToast('⚠️ Agregá al menos 1 día'); return }
    let planId = bp.id
    if (planId) {
      await supabase.from('planes').update({ nombre: bp.nombre, objetivo: bp.objetivo }).eq('id', planId)
      await supabase.from('semanas').delete().eq('plan_id', planId)
    } else {
      const { data: newPlan } = await supabase.from('planes').insert({ nombre: bp.nombre, objetivo: bp.objetivo, admin_id: admin.id }).select().single()
      planId = newPlan.id
    }
    for (const sem of bp.semanas) {
      const { data: semData } = await supabase.from('semanas').insert({ plan_id: planId, numero: sem.numero }).select().single()
      for (const dia of sem.dias) {
        const { data: diaData } = await supabase.from('dias').insert({ semana_id: semData.id, dia: dia.dia, tipo: dia.tipo, orden: dia.orden||0 }).select().single()
        for (let i=0; i<dia.ejercicios.length; i++) {
          const ej = dia.ejercicios[i]
          await supabase.from('ejercicios').insert({ dia_id: diaData.id, nombre: ej.nombre, series: ej.series, repeticiones: ej.repeticiones, carga: ej.carga, descanso: ej.descanso, observaciones: ej.observaciones, orden: i })
        }
      }
    }
    for (const alumnoId of bp.asignados||[]) {
      await supabase.from('asignaciones').delete().eq('alumno_id', alumnoId)
      await supabase.from('asignaciones').insert({ alumno_id: alumnoId, plan_id: planId, activo: true })
    }
    setBp(null); showToast('✅ Plan guardado'); setTab('planes'); loadData()
  }

  async function eliminarPlan(planId) {
    if (!confirm('¿Eliminar este plan?')) return
    await supabase.from('planes').delete().eq('id', planId)
    showToast('🗑 Plan eliminado'); loadData()
  }

  async function logout() { await supabase.auth.signOut(); router.push('/login') }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#ede0e2' }}>
      <div style={{ textAlign:'center' }}><div style={{ fontSize:'48px', marginBottom:'12px' }}>🏋️</div><div style={{ color:'#7D0531', fontWeight:'600' }}>Cargando panel...</div></div>
    </div>
  )

  const filtrados = alumnos.filter(a => `${a.nombre} ${a.apellido} ${a.dni}`.toLowerCase().includes(searchQ.toLowerCase()))
  const DIAS_SEM = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']
