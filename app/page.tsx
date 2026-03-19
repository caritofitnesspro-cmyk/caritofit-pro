// @ts-nocheck
'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

const OBJ_SUGERENCIAS = ['Bajar de peso', 'Tonificar', 'Ganar músculo', 'Mejorar resistencia', 'Salud general', 'Rehabilitación', 'Reducir estrés', 'Mejorar postura']
const DIAS_OPCIONES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const HORARIOS = ['6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00']

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const fotoRef = useRef(null)

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fotoPreview, setFotoPreview] = useState(null)
  const [fotoFile, setFotoFile] = useState(null)
  const [aceptaCondiciones, setAceptaCondiciones] = useState(false)

  const [form, setForm] = useState({
    nombre: '', apellido: '', dni: '', email: '',
    telefono: '', edad: '', sexo: '',
    objetivo: '', nivel: '',
    restricciones: '', experiencia: '',
    lugarEntrenamiento: '',
    cantidadDias: 0,
    diasHorarios: [],
    // Composición corporal (opcional, informativo)
    peso: '', altura: '', circunferenciaCintura: '', circunferenciaCaradera: '',
    password: '', password2: '',
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  function addSugerencia(s) {
    const current = form.objetivo
    const sep = current && !current.endsWith(' ') && !current.endsWith(',') ? ', ' : ''
    set('objetivo', current + sep + s)
  }

  function handleCantidadDias(cant) {
    const n = parseInt(cant) || 0
    const actual = form.diasHorarios
    let nuevo = [...actual]
    if (n > actual.length) {
      while (nuevo.length < n) nuevo.push({ dia: '', horario: '9:00' })
    } else {
      nuevo = nuevo.slice(0, n)
    }
    setForm(p => ({ ...p, cantidadDias: n, diasHorarios: nuevo }))
  }

  function setDiaHorario(i, campo, valor) {
    const nuevo = [...form.diasHorarios]
    nuevo[i] = { ...nuevo[i], [campo]: valor }
    set('diasHorarios', nuevo)
  }

  function handleFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setFotoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setFotoPreview(ev.target.result)
    reader.readAsDataURL(file)
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
    if (!form.lugarEntrenamiento) { setError('Seleccioná dónde vas a entrenar'); return }
    setStep(3)
  }

  function validateStep3() {
    setError('')
    if (!aceptaCondiciones) { setError('Debés aceptar los términos para continuar'); return }
    setStep(4)
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
        // Subir foto si hay
        let fotoUrl = null
        if (fotoFile) {
          const ext = fotoFile.name.split('.').pop()
          const { data: uploadData } = await supabase.storage
            .from('fotos-perfil')
            .upload(`${authData.user.id}/perfil.${ext}`, fotoFile, { upsert: true })
          if (uploadData) {
            const { data: urlData } = supabase.storage.from('fotos-perfil').getPublicUrl(uploadData.path)
            fotoUrl = urlData.publicUrl
          }
        }

        await supabase.from('perfiles').update({
          telefono: form.telefono,
          edad: parseInt(form.edad) || null,
          sexo: form.sexo,
          objetivo: form.objetivo.trim(),
          nivel: form.nivel,
          restricciones: form.restricciones,
          experiencia: form.experiencia,
          lugar_entrenamiento: form.lugarEntrenamiento,
          dias_horarios: JSON.stringify(form.diasHorarios),
          composicion_corporal: JSON.stringify({
            peso: form.peso, altura: form.altura,
            cintura: form.circunferenciaCintura,
            cadera: form.circunferenciaCaradera,
          }),
          foto_url: fotoUrl,
        }).eq('id', authData.user.id)
      }
      setStep(5)
    } catch { setError('Ocurrió un error. Intentá de nuevo.') }
    setLoading(false)
  }

  const stepLabel = ['Datos', 'Objetivo', 'Info extra', 'Contraseña']
  const S = { fontFamily: 'Cinzel, Georgia, serif' }

  return (
    <div style={{ minHeight: '100vh', background: '#7D0531', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#faf8f7', borderRadius: '28px', padding: '36px 32px', width: '100%', maxWidth: '580px', boxShadow: '0 24px 80px rgba(0,0,0,.3)', margin: 'auto' }}>

        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#B05276', fontWeight: '600', marginBottom: '20px', textDecoration: 'none' }}>
          ← Volver al inicio
        </Link>

        {/* Steps indicator */}
        {step < 5 && (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: '28px' }}>
            {stepLabel.map((lbl, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700',
                    background: step > i+1 ? '#B05276' : step === i+1 ? '#7D0531' : '#faf8f7',
                    borderColor: step > i+1 ? '#B05276' : step === i+1 ? '#7D0531' : '#d5c4c8',
                    color: step >= i+1 ? '#DBBABF' : '#8a7070' }}>
                    {step > i+1 ? '✓' : i+1}
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: '600', color: step === i+1 ? '#7D0531' : '#8a7070', textAlign: 'center', maxWidth: '52px', lineHeight: '1.3' }}>{lbl}</span>
                </div>
                {i < 3 && <div style={{ width: '36px', height: '2px', background: step > i+1 ? '#B05276' : '#d5c4c8', marginTop: '14px', flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        )}

        {/* ── PASO 1: DATOS PERSONALES ── */}
        {step === 1 && (
          <div>
            <div style={{ ...S, fontSize: '22px', fontWeight: '900', color: '#7D0531', marginBottom: '4px' }}>Tus datos personales</div>
            <div style={{ fontSize: '14px', color: '#8a7070', marginBottom: '22px' }}>Con tu DNI y contraseña podrás ingresar desde cualquier dispositivo.</div>

            {/* Foto de perfil */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', background: '#ede0e2', borderRadius: '16px', padding: '16px' }}>
              <div onClick={() => fotoRef.current?.click()} style={{ width: '72px', height: '72px', borderRadius: '50%', background: fotoPreview ? 'transparent' : '#DBBABF', border: '3px solid #B05276', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}>
                {fotoPreview ? <img src={fotoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '28px' }}>📷</span>}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#2a1520', marginBottom: '4px' }}>Foto de perfil</div>
                <div style={{ fontSize: '12px', color: '#8a7070', marginBottom: '8px' }}>Opcional — solo vos y tu profesora la ven</div>
                <button onClick={() => fotoRef.current?.click()} style={{ background: '#7D0531', color: '#DBBABF', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {fotoPreview ? 'Cambiar foto' : 'Subir foto'}
                </button>
              </div>
              <input ref={fotoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFoto} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              {[['nombre', 'Nombre *', 'Ej: María'], ['apellido', 'Apellido *', 'Ej: García']].map(([k, l, ph]) => (
                <div key={k}><label className="field-label">{l}</label><input className="input-field" type="text" placeholder={ph} value={form[k]} onChange={e => set(k, e.target.value)} /></div>
              ))}
            </div>
            <div style={{ marginBottom: '14px' }}><label className="field-label">DNI *</label><input className="input-field" type="text" placeholder="Sin puntos ni guiones" maxLength={8} value={form.dni} onChange={e => set('dni', e.target.value.replace(/\D/g, ''))} /></div>
            <div style={{ marginBottom: '14px' }}><label className="field-label">Email *</label><input className="input-field" type="email" placeholder="tu@mail.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div><label className="field-label">Teléfono</label><input className="input-field" type="text" placeholder="11-0000-0000" value={form.telefono} onChange={e => set('telefono', e.target.value)} /></div>
              <div><label className="field-label">Edad</label><input className="input-field" type="number" placeholder="30" value={form.edad} onChange={e => set('edad', e.target.value)} /></div>
            </div>
            <div style={{ marginBottom: '14px' }}><label className="field-label">Sexo</label>
              <select className="input-field" value={form.sexo} onChange={e => set('sexo', e.target.value)}>
                <option value="">—</option>
                {['Femenino', 'Masculino', 'No binario', 'Prefiero no decir'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            {error && <div style={{ background: '#fff0f0', border: '1px solid #fcc', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', color: '#c0392b', fontSize: '14px', fontWeight: '600' }}>⚠️ {error}</div>}
            <button className="btn-wine" style={{ width: '100%', fontSize: '15px', padding: '14px' }} onClick={validateStep1}>Siguiente →</button>
          </div>
        )}

        {/* ── PASO 2: OBJETIVO ── */}
        {step === 2 && (
          <div>
            <div style={{ ...S, fontSize: '22px', fontWeight: '900', color: '#7D0531', marginBottom: '4px' }}>Tu objetivo y entrenamiento</div>
            <div style={{ fontSize: '14px', color: '#8a7070', marginBottom: '20px', lineHeight: '1.5' }}>Contanos qué querés lograr. <strong style={{ color: '#7D0531' }}>Tu profesora va a armar tu plan en base a esto.</strong></div>

            {/* Objetivo libre */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '10px' }}>
              {OBJ_SUGERENCIAS.map(s => (
                <span key={s} onClick={() => addSugerencia(s)}
                  style={{ padding: '6px 13px', borderRadius: '20px', background: '#ede0e2', border: '1.5px solid #d5c4c8', fontSize: '12px', fontWeight: '600', color: '#5a2a3a', cursor: 'pointer' }}>
                  {s}
                </span>
              ))}
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="field-label">Mi objetivo es... *</label>
              <textarea value={form.objetivo} onChange={e => set('objetivo', e.target.value)}
                placeholder="Escribí libremente tu objetivo..."
                style={{ background: '#ede0e2', border: '2px solid #d5c4c8', borderRadius: '14px', padding: '16px', fontSize: '15px', color: '#2a1520', outline: 'none', width: '100%', fontFamily: 'inherit', resize: 'vertical', minHeight: '90px', lineHeight: '1.6' }} />
            </div>

            {/* Nivel */}
            <div style={{ marginBottom: '20px' }}>
              <label className="field-label">Nivel de actividad</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {[{ n: 'Principiante', icon: '🌱', desc: 'Empiezo ahora' }, { n: 'Intermedio', icon: '🔥', desc: 'Más de 6 meses' }, { n: 'Avanzado', icon: '⚡', desc: 'Hace años' }].map(({ n, icon, desc }) => (
                  <div key={n} onClick={() => set('nivel', n)}
                    style={{ border: `2px solid ${form.nivel === n ? '#7D0531' : '#d5c4c8'}`, borderRadius: '14px', padding: '14px 10px', textAlign: 'center', cursor: 'pointer', background: form.nivel === n ? '#f5eaed' : '#faf8f7' }}>
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>{icon}</div>
                    <div style={{ fontWeight: '700', fontSize: '13px' }}>{n}</div>
                    <div style={{ fontSize: '11px', color: '#8a7070', marginTop: '3px' }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lugar de entrenamiento */}
            <div style={{ marginBottom: '20px' }}>
              <label className="field-label">¿Dónde vas a entrenar?</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {[{ v: 'gym', icon: '🏋️', label: 'GYM' }, { v: 'casa', icon: '🏠', label: 'CASA' }, { v: 'mixto', icon: '🔄', label: 'MIXTO' }].map(({ v, icon, label }) => (
                  <div key={v} onClick={() => set('lugarEntrenamiento', v)}
                    style={{ border: `2px solid ${form.lugarEntrenamiento === v ? '#7D0531' : '#d5c4c8'}`, borderRadius: '14px', padding: '16px 10px', textAlign: 'center', cursor: 'pointer', background: form.lugarEntrenamiento === v ? '#f5eaed' : '#faf8f7', transition: '.2s' }}>
                    <div style={{ fontSize: '32px', marginBottom: '6px' }}>{icon}</div>
                    <div style={{ fontWeight: '800', fontSize: '13px', color: form.lugarEntrenamiento === v ? '#7D0531' : '#2a1520', letterSpacing: '.05em' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Días de entrenamiento */}
            <div style={{ marginBottom: '20px' }}>
              <label className="field-label">¿Cuántos días por semana vas a entrenar?</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <button key={n} onClick={() => handleCantidadDias(n)}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid', fontWeight: '800', fontSize: '16px', cursor: 'pointer', fontFamily: 'inherit', transition: '.2s',
                      background: form.cantidadDias === n ? '#7D0531' : '#faf8f7',
                      borderColor: form.cantidadDias === n ? '#7D0531' : '#d5c4c8',
                      color: form.cantidadDias === n ? '#DBBABF' : '#2a1520' }}>
                    {n}
                  </button>
                ))}
              </div>

              {form.diasHorarios.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {form.diasHorarios.map((dh, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#ede0e2', borderRadius: '12px', padding: '12px 14px', alignItems: 'center' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#7D0531', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '5px' }}>Día {i + 1}</label>
                        <select value={dh.dia} onChange={e => setDiaHorario(i, 'dia', e.target.value)}
                          style={{ background: '#fff', border: '1.5px solid #d5c4c8', borderRadius: '9px', padding: '8px 11px', fontSize: '14px', width: '100%', fontFamily: 'inherit', outline: 'none' }}>
                          <option value="">Elegí el día</option>
                          {DIAS_OPCIONES.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#7D0531', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '5px' }}>Horario</label>
                        <select value={dh.horario} onChange={e => setDiaHorario(i, 'horario', e.target.value)}
                          style={{ background: '#fff', border: '1.5px solid #d5c4c8', borderRadius: '9px', padding: '8px 11px', fontSize: '14px', width: '100%', fontFamily: 'inherit', outline: 'none' }}>
                          {HORARIOS.map(h => <option key={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                  <div style={{ background: '#fff8f0', border: '1px solid #fde8c0', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#92400e', lineHeight: '1.5' }}>
                    📅 <strong>Recordá:</strong> En caso de querer reprogramar alguno de los días, avisá con <strong>24hs de anticipación</strong>.
                  </div>
                </div>
              )}
            </div>

            {error && <div style={{ background: '#fff0f0', border: '1px solid #fcc', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', color: '#c0392b', fontSize: '14px', fontWeight: '600' }}>⚠️ {error}</div>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>← Atrás</button>
              <button className="btn-wine" style={{ flex: 2 }} onClick={validateStep2}>Siguiente →</button>
            </div>
          </div>
        )}

        {/* ── PASO 3: INFO EXTRA + LEGAL ── */}
        {step === 3 && (
          <div>
            <div style={{ ...S, fontSize: '22px', fontWeight: '900', color: '#7D0531', marginBottom: '4px' }}>Un poco más sobre vos</div>
            <div style={{ fontSize: '14px', color: '#8a7070', marginBottom: '22px' }}>Esta info ayuda a tu profesora a conocerte mejor. Todo es opcional.</div>

            {/* Lesiones */}
            <div style={{ marginBottom: '16px' }}>
              <label className="field-label">Lesiones o dolores <span style={{ textTransform: 'none', fontWeight: '400', fontSize: '11px', color: '#8a7070' }}>(opcional)</span></label>
              <input className="input-field" type="text" placeholder="Ej: dolor de rodilla, hernia de disco..." value={form.restricciones} onChange={e => set('restricciones', e.target.value)} />
            </div>

            {/* Experiencia previa */}
            <div style={{ marginBottom: '16px' }}>
              <label className="field-label">Experiencia previa <span style={{ textTransform: 'none', fontWeight: '400', fontSize: '11px', color: '#8a7070' }}>(opcional)</span></label>
              <textarea value={form.experiencia} onChange={e => set('experiencia', e.target.value)}
                placeholder="Contanos si entrenaste antes, qué deportes hacés, qué actividades físicas realizás..."
                style={{ background: '#ede0e2', border: '2px solid #d5c4c8', borderRadius: '12px', padding: '14px', fontSize: '14px', color: '#2a1520', outline: 'none', width: '100%', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px', lineHeight: '1.6' }} />
            </div>

            {/* Composición corporal */}
            <div style={{ background: '#ede0e2', borderRadius: '16px', padding: '18px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px' }}>📊</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#7D0531' }}>Índices de composición corporal</span>
                <span style={{ fontSize: '11px', color: '#8a7070', fontStyle: 'italic' }}>(opcional)</span>
              </div>
              <div style={{ fontSize: '12px', color: '#8a7070', marginBottom: '14px', lineHeight: '1.5' }}>
                Solo informativo — no afecta el armado de tu plan. Tu profesora lo usa como referencia.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  ['peso', 'Peso (kg)', 'Ej: 65'],
                  ['altura', 'Altura (cm)', 'Ej: 165'],
                  ['circunferenciaCintura', 'Cintura (cm)', 'Ej: 72'],
                  ['circunferenciaCaradera', 'Cadera (cm)', 'Ej: 98'],
                ].map(([k, l, ph]) => (
                  <div key={k}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#5a2a3a', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: '5px' }}>{l}</label>
                    <input type="number" placeholder={ph} value={form[k]} onChange={e => set(k, e.target.value)}
                      style={{ background: '#fff', border: '1.5px solid #d5c4c8', borderRadius: '9px', padding: '9px 12px', fontSize: '14px', width: '100%', fontFamily: 'inherit', outline: 'none' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Leyenda legal y condiciones */}
            <div style={{ background: '#f5eaed', border: '1.5px solid #B05276', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#7D0531', marginBottom: '10px' }}>🔒 Privacidad y condiciones</div>
              <div style={{ fontSize: '12px', color: '#5a2a3a', lineHeight: '1.7', marginBottom: '14px' }}>
                Tus datos personales son <strong>estrictamente privados</strong> y no serán compartidos con terceros bajo ninguna circunstancia. La información que proporcionás — incluyendo datos físicos, objetivos y fotos — es de uso exclusivo de tu entrenadora personal para el diseño y seguimiento de tu plan de entrenamiento.<br /><br />
                Al registrarte aceptás que tus datos sean almacenados de forma segura y utilizados únicamente con fines de entrenamiento personalizado. Podés solicitar la eliminación de tu cuenta y datos en cualquier momento.
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <div onClick={() => setAceptaCondiciones(!aceptaCondiciones)}
                  style={{ width: '22px', height: '22px', borderRadius: '6px', border: '2px solid', borderColor: aceptaCondiciones ? '#7D0531' : '#d5c4c8', background: aceptaCondiciones ? '#7D0531' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', cursor: 'pointer', transition: '.2s' }}>
                  {aceptaCondiciones && <span style={{ color: '#DBBABF', fontSize: '13px', fontWeight: '700' }}>✓</span>}
                </div>
                <span style={{ fontSize: '13px', color: '#2a1520', lineHeight: '1.5' }}>
                  Leí y acepto las condiciones de privacidad. Entiendo que mis datos son confidenciales y de uso exclusivo para mi entrenamiento.
                </span>
              </label>
            </div>

            {error && <div style={{ background: '#fff0f0', border: '1px solid #fcc', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', color: '#c0392b', fontSize: '14px', fontWeight: '600' }}>⚠️ {error}</div>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setStep(2)}>← Atrás</button>
              <button className="btn-wine" style={{ flex: 2 }} onClick={validateStep3}>Siguiente →</button>
            </div>
          </div>
        )}

        {/* ── PASO 4: CONTRASEÑA ── */}
        {step === 4 && (
          <div>
            <div style={{ ...S, fontSize: '22px', fontWeight: '900', color: '#7D0531', marginBottom: '4px' }}>Creá tu contraseña</div>
            <div style={{ fontSize: '14px', color: '#8a7070', marginBottom: '22px' }}>Con tu DNI y esta contraseña vas a poder ingresar desde cualquier dispositivo.</div>

            <div style={{ background: '#ede0e2', borderRadius: '14px', padding: '16px', marginBottom: '22px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#7D0531', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '10px' }}>Resumen</div>
              <div style={{ fontSize: '14px', color: '#2a1520', lineHeight: '1.8' }}>
                <span style={{ color: '#8a7070' }}>Nombre:</span> <strong>{form.nombre} {form.apellido}</strong><br />
                <span style={{ color: '#8a7070' }}>DNI:</span> <strong>{form.dni}</strong><br />
                <span style={{ color: '#8a7070' }}>Nivel:</span> <strong>{form.nivel}</strong><br />
                {form.lugarEntrenamiento && <><span style={{ color: '#8a7070' }}>Entrena en:</span> <strong>{form.lugarEntrenamiento.toUpperCase()}</strong><br /></>}
                {form.cantidadDias > 0 && <><span style={{ color: '#8a7070' }}>Días/semana:</span> <strong>{form.cantidadDias}</strong><br /></>}
                <span style={{ color: '#8a7070' }}>Objetivo:</span> <em style={{ color: '#7D0531' }}>"{form.objetivo.slice(0, 80)}{form.objetivo.length > 80 ? '…' : ''}"</em>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label className="field-label">Contraseña * <span style={{ textTransform: 'none', fontWeight: '400', fontSize: '11px', color: '#8a7070' }}>(mínimo 6 caracteres)</span></label>
              <input className="input-field" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="field-label">Repetir contraseña *</label>
              <input className="input-field" type="password" placeholder="Igual que la anterior" value={form.password2} onChange={e => set('password2', e.target.value)} />
              {form.password2 && <div style={{ fontSize: '12px', marginTop: '4px', color: form.password === form.password2 ? '#16a34a' : '#c0392b' }}>{form.password === form.password2 ? '✓ Coinciden' : '✗ No coinciden'}</div>}
            </div>

            {error && <div style={{ background: '#fff0f0', border: '1px solid #fcc', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', color: '#c0392b', fontSize: '14px', fontWeight: '600' }}>⚠️ {error}</div>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setStep(3)}>← Atrás</button>
              <button className="btn-wine" style={{ flex: 2, fontSize: '15px', padding: '14px' }} onClick={handleRegister} disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear mi cuenta ✓'}
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 5: ÉXITO ── */}
        {step === 5 && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: '60px', marginBottom: '12px' }}>🎉</div>
            <div style={{ ...S, fontSize: '24px', fontWeight: '900', color: '#7D0531', marginBottom: '8px' }}>¡Bienvenida/o a Team Carito!</div>
            <p style={{ fontSize: '15px', color: '#5a2a3a', marginBottom: '24px', lineHeight: '1.6' }}>
              Tu cuenta fue creada. Carolina va a revisar tu objetivo y armar tu plan personalizado. ¡Te avisará cuando esté listo!
            </p>
            <div style={{ background: '#f5eaed', border: '1.5px solid #B05276', borderRadius: '14px', padding: '16px', marginBottom: '16px', textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#7D0531', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px' }}>Tu objetivo registrado</div>
              <div style={{ fontSize: '14px', color: '#2a1520', lineHeight: '1.6', fontStyle: 'italic' }}>"{form.objetivo}"</div>
            </div>
            <div style={{ background: '#ede0e2', borderRadius: '14px', padding: '14px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#7D0531', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px' }}>🔒 Tus datos están protegidos</div>
              <div style={{ fontSize: '13px', color: '#5a2a3a', lineHeight: '1.5' }}>Tu información es privada y confidencial. Solo tu entrenadora tiene acceso.</div>
            </div>
            <button className="btn-wine" style={{ width: '100%', fontSize: '16px', padding: '16px' }} onClick={() => router.push('/login')}>
              Ir al inicio de sesión →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
