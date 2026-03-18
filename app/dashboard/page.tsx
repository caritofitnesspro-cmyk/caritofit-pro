// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [perfil, setPerfil] = useState(null)
  const [plan, setPlan] = useState(null)
  const [semanas, setSemanas] = useState([])
  const [pesos, setPesos] = useState([])
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('inicio')
  const [nuevoPeso, setNuevoPeso] = useState('')
  const [showPesoModal, setShowPesoModal] = useState(false)
  const [diaActivo, setDiaActivo] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => { loadData() }, [])

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

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
        const { data: semsData } = await supabase.from('semanas').select('*, dias(*, ejercicios(*))').eq('plan_id', planData.id).order('numero')
        setSemanas(semsData || [])
      }
    }
    const { data: pesosData } = await supabase.from('pesos').select('*').eq('alumno_id', user.id).order('fecha')
    setPesos(pesosData || [])
    const hoy = new Date().toISOString().split('T')[0]
    const { data: chkData } = await supabase.from('checkins').select('ejercicio_id').eq('alumno_id', user.id).eq('fecha', hoy)
    setCheckins((chkData || []).map(c => c.ejercicio_id))
    setLoading(false)
  }

  async function toggleCheckin(ejercicioId) {
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
    setNuevoPeso(''); setShowPesoModal(false)
    showToast('⚖️ Peso registrado!'); loadData()
  }

  async function logout() { await supabase.auth.signOut(); router.push('/login') }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#ede0e2' }}>
      <div style={{ textAlign:'center' }}><div style={{ fontSize:'48px', marginBottom:'12px' }}>🏋️</div><div style={{ color:'#7D0531', fontWeight:'600' }}>Cargando...</div></div>
    </div>
  )

  const diasSemana1 = semanas[0]?.dias || []
  const completadosHoy = diasSemana1.flatMap(d => d.ejercicios || []).filter(e => checkins.includes(e.id)).length
  const totalEjs = diasSemana1.flatMap(d => d.ejercicios || []).length
  const ini = `${perfil?.nombre?.[0]||''}${perfil?.apellido?.[0]||''}`.toUpperCase()return (
    <div style={{ maxWidth:'430px', margin:'0 auto', minHeight:'100vh', background:'#faf8f7', position:'relative' }}>
      {toast && <div style={{ position:'fixed', top:'18px', left:'50%', transform:'translateX(-50%)', background:'#7D0531', color:'#DBBABF', padding:'11px 20px', borderRadius:'12px', fontSize:'14px', fontWeight:'600', zIndex:400, whiteSpace:'nowrap' }}>{toast}</div>}

      {tab === 'inicio' && (
        <>
          <div style={{ background:'linear-gradient(160deg,#7D0531,#9a0840)', padding:'36px 22px 28px', color:'#DBBABF', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' }}>
                <div><div style={{ fontSize:'13px', opacity:.7, marginBottom:'4px' }}>Hola de nuevo 👋</div>
                  <div style={{ fontFamily:'Georgia,serif', fontSize:'26px', fontWeight:'900' }}>{perfil?.nombre}!</div></div>
                <div style={{ width:'46px', height:'46px', borderRadius:'50%', background:'#B05276', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800', fontSize:'16px', color:'#fff' }}>{ini}</div>
              </div>
              {plan ? (
                <div style={{ background:'rgba(255,255,255,.12)', borderRadius:'14px', padding:'16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                    <span style={{ fontSize:'13px', opacity:.8 }}>{plan.nombre}</span>
                    <span style={{ fontWeight:'700', fontSize:'15px' }}>{totalEjs>0?Math.round(completadosHoy/totalEjs*100):0}%</span>
                  </div>
                  <div style={{ height:'8px', background:'rgba(255,255,255,.2)', borderRadius:'4px', overflow:'hidden' }}>
                    <div style={{ height:'100%', background:'#DBBABF', borderRadius:'4px', width:`${totalEjs>0?Math.round(completadosHoy/totalEjs*100):0}%` }} />
                  </div>
                </div>
              ) : (
                <div style={{ background:'rgba(255,255,255,.12)', borderRadius:'14px', padding:'18px', textAlign:'center' }}>
                  <div style={{ fontSize:'24px', marginBottom:'6px' }}>📋</div>
                  <div style={{ fontSize:'14px', opacity:.8 }}>Tu profesora está preparando tu plan</div>
                </div>
              )}
            </div>
          </div>
          <div style={{ padding:'18px 20px 90px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'22px' }}>
              {[[completadosHoy,'Completados'],[totalEjs,'Esta semana'],[pesos.length?pesos[pesos.length-1].valor+' kg':'—','Peso actual']].map(([n,l]) => (
                <div key={l} style={{ background:'#ede0e2', borderRadius:'14px', padding:'14px', textAlign:'center' }}>
                  <div style={{ fontSize:'22px', fontWeight:'800', color:'#7D0531' }}>{n}</div>
                  <div style={{ fontSize:'11px', color:'#8a7070', marginTop:'2px' }}>{l}</div>
                </div>
              ))}
            </div>
            {diasSemana1.length > 0 && (
              <>
                <h3 style={{ fontFamily:'Georgia,serif', fontSize:'18px', color:'#7D0531', marginBottom:'14px' }}>Esta semana</h3>
                <div style={{ background:'#fff', borderRadius:'18px', padding:'8px', border:'1px solid #d5c4c8' }}>
                  {diasSemana1.map((dia) => {
                    const ejsDia = dia.ejercicios || []
                    const doneCount = ejsDia.filter(e => checkins.includes(e.id)).length
                    const allDone = ejsDia.length > 0 && doneCount === ejsDia.length
                    return (
                      <div key={dia.id} onClick={() => { setDiaActivo(dia); setTab('plan') }}
                        style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', borderBottom:'1px solid #ede0e2', cursor:'pointer' }}>
                        <div style={{ width:'44px', height:'44px', borderRadius:'13px', background: allDone?'#dcfce7':'#ede0e2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>
                          {allDone?'✅':'🏋️'}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:'600', fontSize:'15px' }}>{dia.dia}</div>
                          <div style={{ fontSize:'12px', color:'#8a7070', marginTop:'2px' }}>{dia.tipo||'—'}</div>
                        </div>
                        <span style={{ display:'inline-flex', alignItems:'center', padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700', background: allDone?'#dcfce7':'rgba(176,82,118,.15)', color: allDone?'#15803d':'#7D0531' }}>
                          {allDone?'Hecho':`${doneCount}/${ejsDia.length}`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
            {perfil?.restricciones && (
              <div style={{ background:'#fff8f0', border:'1px solid #fde8c0', borderRadius:'12px', padding:'14px 16px', marginTop:'16px' }}>
                <div style={{ fontWeight:'700', fontSize:'13px', color:'#b45309', marginBottom:'4px' }}>📌 Observación médica</div>
                <div style={{ fontSize:'13px', color:'#92400e' }}>{perfil.restricciones}</div>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'plan' && !diaActivo && (
        <div style={{ paddingBottom:'90px' }}>
          <div style={{ padding:'20px 20px 12px', borderBottom:'1px solid #ede0e2' }}>
            <div style={{ fontSize:'.75rem', fontWeight:'700', textTransform:'uppercase', letterSpacing:'.1em', color:'#B05276', marginBottom:'8px' }}>Mi entrenamiento</div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'1.875rem', fontWeight:'700', color:'#7D0531' }}>Mi Plan</div>
          </div>
          <div style={{ padding:'16px 20px' }}>
            {!plan ? (
              <div style={{ background:'#fff', borderRadius:'20px', padding:'48px 24px', textAlign:'center', border:'1px solid #d5c4c8' }}>
                <div style={{ fontSize:'56px', marginBottom:'16px' }}>📋</div>
                <p style={{ color:'#8a7070' }}>Tu profesora todavía no asignó un plan.</p>
              </div>
            ) : (
              <>
                <div style={{ background:'#7D0531', borderRadius:'20px', padding:'22px', color:'#DBBABF', marginBottom:'20px' }}>
                  <div style={{ fontSize:'11px', opacity:.6, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:'6px' }}>Plan activo</div>
                  <div style={{ fontFamily:'Georgia,serif', fontSize:'20px', fontWeight:'700', marginBottom:'10px' }}>{plan.nombre}</div>
                  <span style={{ background:'#DBBABF', color:'#7D0531', borderRadius:'20px', padding:'4px 11px', fontSize:'11px', fontWeight:'700' }}>🎯 {plan.objetivo}</span>
                </div>
                {semanas.map((sem) => (
                  <div key={sem.id} style={{ marginBottom:'24px' }}>
                    <h3 style={{ fontFamily:'Georgia,serif', fontSize:'16px', color:'#7D0531', marginBottom:'12px' }}>Semana {sem.numero}</h3>
                    <div style={{ background:'#fff', borderRadius:'18px', padding:'8px', border:'1px solid #d5c4c8' }}>
                      {(sem.dias||[]).map((dia) => {
                        const ejs = dia.ejercicios||[]
                        const done = ejs.filter(e => checkins.includes(e.id)).length
                        return (
                          <div key={dia.id} onClick={() => setDiaActivo(dia)}
                            style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', borderBottom:'1px solid #ede0e2', cursor:'pointer' }}>
                            <div style={{ width:'44px', height:'44px', borderRadius:'13px', background: done===ejs.length&&ejs.length>0?'#dcfce7':'#ede0e2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', color:'#7D0531' }}>
                              {done===ejs.length&&ejs.length>0?'✅':'▶'}
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontWeight:'600', fontSize:'14px' }}>{dia.dia}</div>
                              <div style={{ fontSize:'12px', color:'#8a7070', marginTop:'2px' }}>{dia.tipo||'—'}</div>
                            </div>
                            <span style={{ display:'inline-flex', alignItems:'center', padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700', background: done===ejs.length&&ejs.length>0?'#dcfce7':'rgba(176,82,118,.15)', color: done===ejs.length&&ejs.length>0?'#15803d':'#7D0531' }}>{done}/{ejs.length}</span>
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

      {tab === 'plan' && diaActivo && (
        <div style={{ paddingBottom:'90px' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid #ede0e2', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#faf8f7', zIndex:40 }}>
            <button onClick={() => setDiaActivo(null)} style={{ background:'transparent', border:'1px solid #d5c4c8', color:'#8a7070', borderRadius:'10px', padding:'8px 12px', fontSize:'13px', cursor:'pointer', fontFamily:'inherit' }}>← Volver</button>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontWeight:'800', fontSize:'16px', color:'#7D0531' }}>{diaActivo.dia}</div>
              <div style={{ fontSize:'12px', color:'#8a7070' }}>{diaActivo.tipo}</div>
            </div>
            <div style={{ width:'60px' }} />
          </div>
          <div style={{ padding:'16px 20px' }}>
            {(diaActivo.ejercicios||[]).length === 0 ? (
              <div style={{ background:'#fff', borderRadius:'18px', padding:'40px', textAlign:'center', border:'1px solid #d5c4c8' }}>
                <div style={{ fontSize:'48px', marginBottom:'12px' }}>📋</div>
                <p style={{ color:'#8a7070' }}>Los ejercicios se cargarán pronto</p>
              </div>
            ) : (diaActivo.ejercicios||[]).map((ej) => {
              const done = checkins.includes(ej.id)
              return (
                <div key={ej.id} onClick={() => toggleCheckin(ej.id)}
                  style={{ display:'flex', alignItems:'flex-start', gap:'14px', padding:'16px', background: done?'#f0fdf4':'#ede0e2', borderRadius:'14px', marginBottom:'10px', border:`1.5px solid ${done?'#bbf7d0':'transparent'}`, cursor:'pointer' }}>
                  <div style={{ width:'28px', height:'28px', borderRadius:'50%', border:'2px solid', borderColor: done?'transparent':'#DBBABF', background: done?'linear-gradient(135deg,#22c55e,#16a34a)':'#faf8f7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'13px', color:'#fff' }}>
                    {done?'✓':''}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:'700', fontSize:'15px', marginBottom:'8px', color: done?'#15803d':'#2a1520' }}>{ej.nombre}</div>
                    <div style={{ display:'flex', gap:'7px', flexWrap:'wrap', marginBottom: ej.observaciones?'8px':0 }}>
                      <span style={{ background:'rgba(176,82,118,.15)', color:'#7D0531', borderRadius:'20px', padding:'4px 10px', fontSize:'11px', fontWeight:'700' }}>{ej.series} series</span>
                      <span style={{ background:'rgba(117,130,77,.15)', color:'#75824D', borderRadius:'20px', padding:'4px 10px', fontSize:'11px', fontWeight:'700' }}>{ej.repeticiones} reps</span>
                      {ej.carga && <span style={{ background:'#fef3c7', color:'#d97706', borderRadius:'20px', padding:'4px 10px', fontSize:'11px', fontWeight:'700' }}>🏋️ {ej.carga}</span>}
                      {ej.descanso && ej.descanso!=='-' && <span style={{ background:'#dcfce7', color:'#15803d', borderRadius:'20px', padding:'4px 10px', fontSize:'11px', fontWeight:'700' }}>⏱ {ej.descanso}</span>}
                    </div>
                    {ej.observaciones && <div style={{ fontSize:'12px', color:'#8a7070', fontStyle:'italic' }}>💡 {ej.observaciones}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}{tab === 'progreso' && (
        <div style={{ paddingBottom:'90px' }}>
          <div style={{ padding:'20px 20px 12px', borderBottom:'1px solid #ede0e2' }}>
            <div style={{ fontSize:'.75rem', fontWeight:'700', textTransform:'uppercase', letterSpacing:'.1em', color:'#B05276', marginBottom:'8px' }}>Mi evolución</div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'1.875rem', fontWeight:'700', color:'#7D0531' }}>Progreso</div>
          </div>
          <div style={{ padding:'16px 20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <h3 style={{ fontFamily:'Georgia,serif', fontSize:'18px', color:'#7D0531' }}>Historial de peso</h3>
              <button onClick={() => setShowPesoModal(true)} style={{ background:'#7D0531', color:'#DBBABF', border:'none', borderRadius:'10px', padding:'8px 14px', fontSize:'13px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit' }}>+ Registrar</button>
            </div>
            {pesos.length === 0 ? (
              <div style={{ background:'#fff', borderRadius:'18px', padding:'48px', textAlign:'center', border:'1px solid #d5c4c8' }}>
                <div style={{ fontSize:'48px', marginBottom:'12px' }}>⚖️</div>
                <p style={{ color:'#8a7070' }}>Todavía no hay registros</p>
              </div>
            ) : (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
                  <div style={{ background:'#ede0e2', borderRadius:'14px', padding:'14px', textAlign:'center' }}>
                    <div style={{ fontSize:'24px', fontWeight:'800', color:'#7D0531' }}>{pesos[pesos.length-1].valor}</div>
                    <div style={{ fontSize:'11px', color:'#8a7070', marginTop:'2px' }}>kg actual</div>
                  </div>
                  {pesos.length > 1 && (
                    <div style={{ background:'#ede0e2', borderRadius:'14px', padding:'14px', textAlign:'center' }}>
                      <div style={{ fontSize:'24px', fontWeight:'800', color: pesos[pesos.length-1].valor<pesos[0].valor?'#16a34a':'#c0392b' }}>
                        {pesos[pesos.length-1].valor<pesos[0].valor?'-':'+'}
                        {Math.abs((pesos[pesos.length-1].valor-pesos[0].valor).toFixed(1))}
                      </div>
                      <div style={{ fontSize:'11px', color:'#8a7070', marginTop:'2px' }}>kg diferencia</div>
                    </div>
                  )}
                </div>
                <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #d5c4c8', overflow:'hidden' }}>
                  {[...pesos].reverse().map((p, i) => (
                    <div key={p.id} style={{ display:'flex', justifyContent:'space-between', padding:'12px 16px', borderBottom: i<pesos.length-1?'1px solid #ede0e2':'none' }}>
                      <span style={{ color:'#8a7070', fontSize:'13px' }}>{new Date(p.fecha).toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit'})}</span>
                      <span style={{ fontWeight:'700', fontSize:'16px', color:'#7D0531' }}>{p.valor} kg</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'perfil' && (
        <div style={{ paddingBottom:'90px' }}>
          <div style={{ padding:'20px 20px 12px', borderBottom:'1px solid #ede0e2' }}>
            <div style={{ fontSize:'.75rem', fontWeight:'700', textTransform:'uppercase', letterSpacing:'.1em', color:'#B05276', marginBottom:'8px' }}>Mi cuenta</div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'1.875rem', fontWeight:'700', color:'#7D0531' }}>Perfil</div>
          </div>
          <div style={{ padding:'16px 20px' }}>
            <div style={{ background:'#7D0531', borderRadius:'20px', padding:'24px', color:'#DBBABF', display:'flex', alignItems:'center', gap:'20px', marginBottom:'24px' }}>
              <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'#B05276', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800', fontSize:'22px', color:'#fff' }}>{ini}</div>
              <div>
                <div style={{ fontFamily:'Georgia,serif', fontSize:'20px', fontWeight:'700' }}>{perfil?.nombre} {perfil?.apellido}</div>
                <div style={{ opacity:.7, fontSize:'14px', marginTop:'4px' }}>{perfil?.nivel}</div>
              </div>
            </div>
            {perfil?.objetivo && (
              <div style={{ background:'#f5eaed', border:'2px solid #B05276', borderRadius:'16px', padding:'18px', marginBottom:'20px' }}>
                <div style={{ fontSize:'12px', fontWeight:'700', color:'#7D0531', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'8px' }}>🎯 Mi objetivo</div>
                <p style={{ fontSize:'14px', color:'#2a1520', lineHeight:'1.6', fontStyle:'italic' }}>"{perfil.objetivo}"</p>
              </div>
            )}
            <div style={{ background:'#fff', borderRadius:'18px', padding:'8px', border:'1px solid #d5c4c8', marginBottom:'16px' }}>
              {[['DNI',perfil?.dni],['Email',perfil?.email],['Teléfono',perfil?.telefono],['Edad',perfil?.edad?`${perfil.edad} años`:'—'],['Sexo',perfil?.sexo],['Nivel',perfil?.nivel],['Restricciones',perfil?.restricciones||'Ninguna']].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'10px 16px', borderBottom:'1px solid #ede0e2' }}>
                  <span style={{ color:'#8a7070', fontSize:'14px' }}>{k}</span>
                  <span style={{ fontWeight:'600', fontSize:'14px', textAlign:'right', maxWidth:'60%' }}>{v||'—'}</span>
                </div>
              ))}
            </div>
            <button onClick={logout} style={{ width:'100%', background:'transparent', border:'1px solid #d5c4c8', color:'#8a7070', borderRadius:'14px', padding:'12px', fontSize:'14px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit' }}>Cerrar sesión</button>
          </div>
        </div>
      )}

      {showPesoModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(125,5,49,.5)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={() => setShowPesoModal(false)}>
          <div style={{ background:'#faf8f7', borderRadius:'24px 24px 0 0', padding:'28px', width:'100%', maxWidth:'430px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily:'Georgia,serif', fontSize:'20px', fontWeight:'700', color:'#7D0531', marginBottom:'18px' }}>Registrar peso</h3>
            <div style={{ marginBottom:'16px' }}>
              <label className="field-label">Peso actual (kg)</label>
              <input className="input-field" type="number" step="0.1" min="20" max="300" placeholder="Ej: 65.5" value={nuevoPeso} onChange={e => setNuevoPeso(e.target.value)} />
            </div>
            <button className="btn-wine" style={{ width:'100%' }} onClick={guardarPeso}>Guardar ✓</button>
          </div>
        </div>
      )}

      <nav style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:'430px', background:'#faf8f7', borderTop:'1px solid #d5c4c8', display:'flex', padding:'8px 0 16px', zIndex:100 }}>
        {[{key:'inicio',icon:'🏠',label:'Inicio'},{key:'plan',icon:'📋',label:'Mi Plan'},{key:'progreso',icon:'📈',label:'Progreso'},{key:'perfil',icon:'👤',label:'Perfil'}].map(({key,icon,label}) => (
          <button key={key} onClick={() => { setTab(key); if(key==='plan') setDiaActivo(null) }}
            style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', padding:'6px 0', background:'none', border:'none', cursor:'pointer' }}>
            <span style={{ fontSize:'20px', transform: tab===key?'scale(1.12)':'scale(1)', transition:'.2s' }}>{icon}</span>
            <span style={{ fontSize:'10px', fontWeight:'700', color: tab===key?'#7D0531':'#8a7070' }}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
