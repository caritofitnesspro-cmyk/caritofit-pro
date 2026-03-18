// @ts-nocheck
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

const OBJ_SUGERENCIAS = ['Bajar de peso', 'Tonificar', 'Ganar músculo', 'Mejorar resistencia', 'Salud general', 'Rehabilitación', 'Reducir estrés', 'Mejorar postura']

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre:'', apellido:'', dni:'', email:'',
    telefono:'', edad:'', sexo:'',
    objetivo:'', nivel:'',
    restricciones:'', password:'', password2:'',
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  function addSugerencia(s) {
    const current = form.objetivo
    const sep = current && !current.endsWith(' ') && !current.endsWith(',') ? ', ' : ''
    set('objetivo', current + sep + s)
  }

  async function validateStep1() {
    setError('')
    if (!form.nombre.trim()) { setError('Ingresá tu nombre'); return }
    if (!form.apellido.trim()) { setError('Ingresá tu apellido'); return }
    if (!/^\d{7,8}$/.test(form.dni)) { setError('El DNI debe tener 7 u 8 dígitos'); return }
    if (!form.email || !form.email.includes('@')) { setError('Ingresá un email válido'); return }
    const { data } = await supabase.from('perfiles').select('id').eq('dni', form.dni).single()
    if (data) { setError('Ya existe una cuenta con ese DNI'); return }
    setStep(2)
  }

  function validateStep2() {
    setError('')
    if (!form.objetivo.trim() || form.objetivo.length < 10) {
      setError('Describí tu objetivo con un poco más de detalle'); return
    }
    if (!form.nivel) { setError('Seleccioná tu nivel de actividad'); return }
    setStep(3)
  }

  async function handleRegister() {
    setError('')
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (form.password !== form.password2) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { nombre: form.nombre.trim(), apellido: form.apellido.trim(), dni: form.dni, rol: 'alumno' } }
      })
      if (authError) { setError(authError.message); setLoading(false); return }
      if (authData.user) {
        await supabase.from('perfiles').update({
          telefono: form.telefono,
          edad: parseInt(form.edad) || null,
          sexo: form.sexo,
          objetivo: form.objetivo.trim(),
          nivel: form.nivel,
          restricciones: form.restricciones,
        }).eq('id', authData.user.id)
      }
      setStep(4)
    } catch { setError('Ocurrió un error. Intentá de nuevo.') }
    setLoading(false)
  }

  const stepLabel = ['Datos personales', 'Tu objetivo', 'Contraseña']

  return (
    <div style={{ minHeight:'100vh', background:'#7D0531', display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'#faf8f7', borderRadius:'28px', padding:'40px', width:'100%', maxWidth:'560px', boxShadow:'0 24px 80px rgba(0,0,0,.3)', margin:'auto' }}>
        <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'13px', color:'#B05276', fontWeight:'600', marginBottom:'20px', textDecoration:'none' }}>
          ← Volver al inicio
        </Link>

        {step < 4 && (
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'center', marginBottom:'28px' }}>
            {stepLabel.map((lbl, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
                  <div style={{ width:'32px', height:'32px', borderRadius:'50%', border:'2px solid', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700',
                    background: step>i+1 ? '#B05276' : step===i+1 ? '#7D0531' : '#faf8f7',
                    borderColor: step>i+1 ? '#B05276' : step===i+1 ? '#7D0531' : '#d5c4c8',
                    color: step>=i+1 ? '#DBBABF' : '#8a7070' }}>
                    {step>i+1 ? '✓' : i+1}
                  </div>
                  <span style={{ fontSize:'10px', fontWeight:'600', color: step===i+1 ? '#7D0531' : '#8a7070', textAlign:'center', maxWidth:'60px', lineHeight:'1.3' }}>{lbl}</span>
                </div>
                {i < 2 && <div style={{ width:'48px', height:'2px', background: step>i+1 ? '#B05276' : '#d5c4c8', marginTop:'15px', flexShrink:0 }} />}
              </div>
            ))}
          </div>
        )}{step === 1 && (
          <div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'22px', fontWeight:'900', color:'#7D0531', marginBottom:'4px' }}>Tus datos personales</div>
            <div style={{ fontSize:'14px', color:'#8a7070', marginBottom:'22px' }}>Con tu DNI y contraseña podrás ingresar desde cualquier dispositivo.</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
              {[['nombre','Nombre *','Ej: María'],['apellido','Apellido *','Ej: García']].map(([k,l,ph]) => (
                <div key={k}><label className="field-label">{l}</label><input className="input-field" type="text" placeholder={ph} value={form[k]} onChange={e => set(k, e.target.value)} /></div>
              ))}
            </div>
            <div style={{ marginBottom:'14px' }}><label className="field-label">DNI *</label><input className="input-field" type="text" placeholder="Ej: 38500001" maxLength={8} value={form.dni} onChange={e => set('dni', e.target.value.replace(/\D/g,''))} /></div>
            <div style={{ marginBottom:'14px' }}><label className="field-label">Email *</label><input className="input-field" type="email" placeholder="tu@mail.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
              <div><label className="field-label">Teléfono</label><input className="input-field" type="text" placeholder="11-0000-0000" value={form.telefono} onChange={e => set('telefono', e.target.value)} /></div>
              <div><label className="field-label">Edad</label><input className="input-field" type="number" placeholder="30" value={form.edad} onChange={e => set('edad', e.target.value)} /></div>
            </div>
            <div style={{ marginBottom:'14px' }}><label className="field-label">Sexo</label>
              <select className="input-field" value={form.sexo} onChange={e => set('sexo', e.target.value)}>
                <option value="">—</option>
                {['Femenino','Masculino','No binario','Prefiero no decir'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:'14px' }}><label className="field-label">Restricciones / Lesiones <span style={{ textTransform:'none', fontSize:'11px', fontWeight:'400', letterSpacing:0, color:'#8a7070' }}>(opcional)</span></label>
              <input className="input-field" type="text" placeholder="Ej: dolor de rodilla..." value={form.restricciones} onChange={e => set('restricciones', e.target.value)} />
            </div>
            {error && <div style={{ background:'#fff0f0', border:'1px solid #fcc', borderRadius:'10px', padding:'10px 14px', marginBottom:'14px', color:'#c0392b', fontSize:'14px', fontWeight:'600' }}>⚠️ {error}</div>}
            <button className="btn-wine" style={{ width:'100%', fontSize:'15px', padding:'14px' }} onClick={validateStep1}>Siguiente →</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'22px', fontWeight:'900', color:'#7D0531', marginBottom:'4px' }}>¿Cuál es tu objetivo?</div>
            <div style={{ fontSize:'14px', color:'#8a7070', marginBottom:'20px', lineHeight:'1.5' }}>Contanos con tus palabras qué querés lograr. <strong style={{ color:'#7D0531' }}>Tu profesora va a armar tu plan en base a esto.</strong></div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'7px', marginBottom:'10px' }}>
              {OBJ_SUGERENCIAS.map(s => (
                <span key={s} onClick={() => addSugerencia(s)}
                  style={{ padding:'6px 13px', borderRadius:'20px', background:'#ede0e2', border:'1.5px solid #d5c4c8', fontSize:'12px', fontWeight:'600', color:'#5a2a3a', cursor:'pointer' }}>
                  {s}
                </span>
              ))}
            </div>
            <div style={{ marginBottom:'20px' }}>
              <label className="field-label">Mi objetivo es... *</label>
              <textarea value={form.objetivo} onChange={e => set('objetivo', e.target.value)}
                placeholder="Escribí libremente tu objetivo. Por ejemplo: quiero bajar 5 kilos antes del verano, mejorar mi resistencia..."
                style={{ background:'#ede0e2', border:'2px solid #d5c4c8', borderRadius:'14px', padding:'16px', fontSize:'15px', color:'#2a1520', outline:'none', width:'100%', fontFamily:'inherit', resize:'vertical', minHeight:'110px', lineHeight:'1.6' }} />
              <div style={{ fontSize:'11px', color:'#8a7070', marginTop:'5px', fontStyle:'italic' }}>✏️ Tocá las etiquetas para agregar ideas o escribí directamente.</div>
            </div>
            <div style={{ marginBottom:'20px' }}>
              <label className="field-label">Nivel de actividad</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
                {[{n:'Principiante',icon:'🌱',desc:'Empiezo ahora'},{n:'Intermedio',icon:'🔥',desc:'Más de 6 meses'},{n:'Avanzado',icon:'⚡',desc:'Hace años'}].map(({n,icon,desc}) => (
                  <div key={n} onClick={() => set('nivel', n)}
                    style={{ border:`2px solid ${form.nivel===n?'#7D0531':'#d5c4c8'}`, borderRadius:'14px', padding:'14px 10px', textAlign:'center', cursor:'pointer', background: form.nivel===n ? '#f5eaed' : '#faf8f7' }}>
                    <div style={{ fontSize:'28px', marginBottom:'6px' }}>{icon}</div>
                    <div style={{ fontWeight:'700', fontSize:'13px' }}>{n}</div>
                    <div style={{ fontSize:'11px', color:'#8a7070', marginTop:'3px' }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
            {error && <div style={{ background:'#fff0f0', border:'1px solid #fcc', borderRadius:'10px', padding:'10px 14px', marginBottom:'14px', color:'#c0392b', fontSize:'14px', fontWeight:'600' }}>⚠️ {error}</div>}
            <div style={{ display:'flex', gap:'10px' }}>
              <button className="btn-ghost" style={{ flex:1 }} onClick={() => setStep(1)}>← Atrás</button>
              <button className="btn-wine" style={{ flex:2 }} onClick={validateStep2}>Siguiente →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'22px', fontWeight:'900', color:'#7D0531', marginBottom:'4px' }}>Creá tu contraseña</div>
            <div style={{ fontSize:'14px', color:'#8a7070', marginBottom:'22px' }}>Con tu DNI y esta contraseña vas a poder ingresar desde cualquier dispositivo.</div>
            <div style={{ background:'#ede0e2', borderRadius:'14px', padding:'16px', marginBottom:'22px' }}>
              <div style={{ fontSize:'12px', fontWeight:'700', color:'#7D0531', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'10px' }}>Resumen</div>
              <div style={{ fontSize:'14px', color:'#2a1520', lineHeight:'1.8' }}>
                <span style={{ color:'#8a7070' }}>Nombre:</span> <strong>{form.nombre} {form.apellido}</strong><br/>
                <span style={{ color:'#8a7070' }}>DNI:</span> <strong>{form.dni}</strong><br/>
                <span style={{ color:'#8a7070' }}>Nivel:</span> <strong>{form.nivel}</strong><br/>
                <span style={{ color:'#8a7070' }}>Objetivo:</span> <em style={{ color:'#7D0531' }}>"{form.objetivo.slice(0,80)}{form.objetivo.length>80?'…':''}"</em>
              </div>
            </div>
            <div style={{ marginBottom:'14px' }}><label className="field-label">Contraseña *</label>
              <input className="input-field" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} /></div>
            <div style={{ marginBottom:'14px' }}><label className="field-label">Repetir contraseña *</label>
              <input className="input-field" type="password" placeholder="Igual que la anterior" value={form.password2} onChange={e => set('password2', e.target.value)} />
              {form.password2 && <div style={{ fontSize:'12px', marginTop:'4px', color: form.password===form.password2 ? '#16a34a' : '#c0392b' }}>{form.password===form.password2 ? '✓ Coinciden' : '✗ No coinciden'}</div>}
            </div>
            {error && <div style={{ background:'#fff0f0', border:'1px solid #fcc', borderRadius:'10px', padding:'10px 14px', marginBottom:'14px', color:'#c0392b', fontSize:'14px', fontWeight:'600' }}>⚠️ {error}</div>}
            <div style={{ display:'flex', gap:'10px' }}>
              <button className="btn-ghost" style={{ flex:1 }} onClick={() => setStep(2)}>← Atrás</button>
              <button className="btn-wine" style={{ flex:2, fontSize:'15px', padding:'14px' }} onClick={handleRegister} disabled={loading}>{loading ? 'Creando cuenta...' : 'Crear mi cuenta ✓'}</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign:'center', padding:'8px 0' }}>
            <div style={{ fontSize:'60px', marginBottom:'12px' }}>🎉</div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'24px', fontWeight:'900', color:'#7D0531', marginBottom:'8px' }}>¡Bienvenida/o a CaritoFit Pro!</div>
            <p style={{ fontSize:'15px', color:'#5a2a3a', marginBottom:'24px', lineHeight:'1.6' }}>Tu cuenta fue creada. La profesora va a revisar tu objetivo y armar tu plan personalizado.</p>
            <div style={{ background:'#f5eaed', border:'1.5px solid #B05276', borderRadius:'14px', padding:'16px', marginBottom:'24px', textAlign:'left' }}>
              <div style={{ fontSize:'12px', fontWeight:'700', color:'#7D0531', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'8px' }}>Tu objetivo registrado</div>
              <div style={{ fontSize:'14px', color:'#2a1520', lineHeight:'1.6', fontStyle:'italic' }}>"{form.objetivo}"</div>
            </div>
            <button className="btn-wine" style={{ width:'100%', fontSize:'16px', padding:'16px' }} onClick={() => router.push('/login')}>Ir al inicio de sesión →</button>
          </div>
        )}

      </div>
    </div>
  )
}
