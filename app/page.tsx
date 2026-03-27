// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import './landing.css'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setChecking(false); return }
      const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
      if (perfil?.rol === 'admin') router.push('/admin')
      else router.push('/dashboard')
    }
    checkSession()
    const navbar = document.getElementById('l-navbar')
    const onScroll = () => navbar?.classList.toggle('scrolled', window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (checking) return
    const timer = setTimeout(() => {
      const reveals = document.querySelectorAll('.l-reveal')
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80)
            observer.unobserve(entry.target)
          }
        })
      }, { threshold: 0.08 })
      reveals.forEach(el => observer.observe(el))
    }, 100)
    return () => clearTimeout(timer)
  }, [checking])

  if (checking) return null

  return (
    <div className="lp">

      {/* ── NAV — idéntico al original ── */}
      <nav id="l-navbar" className="lp-nav">
        <div className="lp-logo">PULSE<span>.</span></div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <a href="/login" className="lp-nav-login">Iniciar sesión</a>
          <a href="/register/admin" className="lp-nav-cta">Empezar gratis</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
        <div className="lp-hero">
          <div>
            <div className="lp-hero-eyebrow">Para entrenadores personales</div>
            <h1>Tu negocio<br />al ritmo que<br /><em>entrenás.</em></h1>
            <p className="lp-hero-sub">
              Alumnos, rutinas y cobros <strong>en una sola app</strong>.<br />
              Menos administración. Más tiempo para entrenar.
            </p>
            <div className="lp-cta-group">
              <a href="/register/admin" className="lp-btn-main">Crear mi app gratis →</a>
              <a href="#producto" className="lp-btn-ghost">Ver cómo funciona</a>
            </div>
            <div className="lp-hero-note">Gratis para tus primeros 2 alumnos · Sin tarjeta</div>
          </div>
          <div className="lp-hero-img">
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80&auto=format&fit=crop"
              alt="Entrenador personal trabajando con un alumno"
              className="lp-hero-photo"
            />
          </div>
        </div>
      </div>

      {/* ── FEATURES — estructura idéntica al original, mockups premium ── */}
      <div className="lp-features" id="producto">
        <div className="lp-section-label">El producto</div>
        <div className="lp-section-title">Así se ve<br /><em>por dentro.</em></div>
        <div className="lp-section-sub">Tres herramientas. Un solo lugar. En 10 minutos ya estás trabajando, no configurando.</div>

        {/* FEATURE 1: Alumnos */}
        <div className="lp-feat-block l-reveal">
          <div>
            <div className="lp-feat-tag">Gestión de alumnos</div>
            <div className="lp-feat-h">Todo sobre cada alumno, siempre a mano</div>
            <p className="lp-feat-p">Objetivo, nivel, restricciones, plan activo y estado de pago. Sin WhatsApp, sin papel, sin tu cabeza como base de datos.</p>
            <div className="lp-feat-check"><div className="lp-check-dot">✓</div><span>Ficha completa con historial y notas</span></div>
            <div className="lp-feat-check"><div className="lp-check-dot">✓</div><span>Estado del plan en tiempo real</span></div>
            <div className="lp-feat-check"><div className="lp-check-dot">✓</div><span>Alerta cuando alguien no tiene plan</span></div>
          </div>
          {/* lp-mini-screen — misma clase que el original, datos premium */}
          <div className="lp-mini-screen">
            <div className="lp-mini-header">
              <div className="lp-mini-title">Alumnos/as</div>
              <div className="lp-mini-sub">24 alumnos · 21 con plan activo</div>
            </div>
            <div className="lp-ph-list-label lp-green-label">Activos (21)</div>
            {[['SM','lp-ava-pink','Valentina Cruz','Hipertrofia · Sem 4/8'],
              ['MG','lp-ava-blue','Andrés Molina','Rendimiento deportivo'],
              ['LR','lp-ava-teal','Camila Herrera','Rehabilitación rodilla'],
              ['JP','lp-ava-amber','Rodrigo Vega','Pérdida de peso'],
              ['NF','lp-ava-purple','Florencia Ibarra','Hipertrofia · Sem 2/6'],
            ].map(([ini,c,name,sub]) => (
              <div key={name} className="lp-ph-row" style={{ marginBottom:'4px' }}>
                <div className={`lp-ph-ava ${c}`} style={{ width:'28px', height:'28px', fontSize:'9px' }}>{ini}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'11px', fontWeight:'600', color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</div>
                  <div style={{ fontSize:'9px', color:'#9ca3af' }}>{sub}</div>
                </div>
                <span className="lp-ph-badge ok">✓ Plan</span>
              </div>
            ))}
            <div className="lp-ph-list-label lp-warn-label" style={{ marginTop:'8px' }}>Sin plan (3)</div>
            <div className="lp-ph-row">
              <div className="lp-ph-ava lp-ava-red" style={{ width:'28px', height:'28px', fontSize:'9px' }}>BS</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'11px', fontWeight:'600', color:'#111827' }}>Bruno Salazar</div>
                <div style={{ fontSize:'9px', color:'#9ca3af' }}>Tonificación · Nuevo</div>
              </div>
              <span className="lp-ph-badge warn">Sin plan</span>
            </div>
          </div>
        </div>

        {/* FEATURE 2: Planes */}
        <div className="lp-feat-block reverse l-reveal">
          <div>
            <div className="lp-feat-tag">Constructor de rutinas</div>
            <div className="lp-feat-h">Armá un plan en minutos, no en horas</div>
            <p className="lp-feat-p">Creá semanas, días y ejercicios. Asignás con un clic y tu alumno lo ve al instante en su app. Sin PDFs, sin archivos.</p>
            <div className="lp-feat-check"><div className="lp-check-dot">✓</div><span>Series, reps, carga, RPE, RIR y descanso</span></div>
            <div className="lp-feat-check"><div className="lp-check-dot">✓</div><span>Bloques: circuito, superserie, calentamiento</span></div>
            <div className="lp-feat-check"><div className="lp-check-dot">✓</div><span>El alumno marca cada ejercicio completado</span></div>
          </div>
          <div className="lp-mini-screen">
            <div className="lp-mini-header">
              <div className="lp-mini-title">Planes</div>
              <div className="lp-mini-sub">8 planes activos · 24 asignaciones</div>
            </div>
            {[
              { name:'Hipertrofia Avanzada', tag:'Hipertrofia', tagBg:'#fce7f3', tagC:'#be185d', color:'#e260a5', sems:'8', dias:'5', ejs:'42', avs:['VC','FI','+4'] },
              { name:'Rendimiento Deportivo', tag:'Rendimiento', tagBg:'#eff3ff', tagC:'#3b5bdb', color:'#5B8CFF', sems:'6', dias:'4', ejs:'36', avs:['AM','+2'] },
            ].map(({ name, tag, tagBg, tagC, color, sems, dias, ejs, avs }) => (
              <div key={name} className="lp-plan-card">
                <div className="lp-plan-name" style={{ color }}>{name}</div>
                <span style={{ display:'inline-block', fontSize:'8px', fontWeight:'700', background:tagBg, color:tagC, padding:'2px 8px', borderRadius:'20px', marginBottom:'7px' }}>{tag}</span>
                <div className="lp-plan-stats">
                  {[[sems,'Semanas'],[dias,'Días/sem'],[ejs,'Ejercicios']].map(([n,l]) => (
                    <div key={l} className="lp-plan-stat">
                      <div className="lp-plan-stat-n" style={{ color }}>{n}</div>
                      <div className="lp-plan-stat-l">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="lp-plan-assigned">
                  {avs.map(a => a.startsWith('+')
                    ? <span key={a} style={{ fontSize:'9px', color:'#9ca3af' }}>{a} más</span>
                    : <div key={a} className="lp-plan-ava" style={{ background:color }}>{a}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURE 3: Cobros */}
        <div className="lp-feat-block l-reveal">
          <div>
            <div className="lp-feat-tag">Cobros automáticos</div>
            <div className="lp-feat-h">Tu alumno paga. Vos recibís. Sin perseguir a nadie.</div>
            <p className="lp-feat-p">Activás los cobros, definís el precio por alumno y el dinero va directo a tu Mercado Pago. Sin transferencias pendientes, sin vergüenza.</p>
            <div className="lp-feat-check"><div className="lp-check-dot">✓</div><span>El alumno paga desde su app con un botón</span></div>
            <div className="lp-feat-check"><div className="lp-check-dot">✓</div><span>Recibís en tu cuenta MP instantáneamente</span></div>
            <div className="lp-feat-check"><div className="lp-check-dot">✓</div><span>Comisión 5% con PRO · 8% con FREE</span></div>
          </div>
          <div className="lp-mini-screen">
            <div className="lp-mini-header">
              <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#16a34a', display:'inline-block' }} />
                <div className="lp-mini-title" style={{ margin:'0' }}>MP conectado</div>
                <span style={{ fontSize:'10px', color:'#9ca3af', marginLeft:'4px' }}>· comisión 5%</span>
              </div>
            </div>
            {/* Revenue box */}
            <div className="lp-rev-box">
              <div className="lp-rev-label">Ingresos del mes</div>
              <div className="lp-rev-amount">$820.000</div>
              <div className="lp-rev-sub">+15% vs mes anterior</div>
            </div>
            <div style={{ fontSize:'10px', fontWeight:'700', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px' }}>Aprobados</div>
            {[['VC','lp-ava-pink','Valentina Cruz','Hipertrofia','$38.000'],
              ['AM','lp-ava-blue','Andrés Molina','Rendimiento','$38.000'],
              ['CH','lp-ava-teal','Camila Herrera','Rehabilitación','$38.000'],
            ].map(([ini,c,name,plan,amount]) => (
              <div key={name} className="lp-cobro-item" style={{ padding:'8px 10px' }}>
                <div className={`lp-ph-ava ${c}`} style={{ width:'24px', height:'24px', fontSize:'7px', flexShrink:0 }}>{ini}</div>
                <div style={{ flex:1, minWidth:0, marginLeft:'8px' }}>
                  <div className="lp-cobro-name" style={{ fontSize:'11px' }}>{name}</div>
                  <div style={{ fontSize:'9px', color:'#9ca3af' }}>{plan}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div className="lp-cobro-amount" style={{ fontSize:'12px' }}>{amount}</div>
                  <div className="lp-cobro-status" style={{ fontSize:'8px' }}>Aprobado</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop:'12px', paddingTop:'10px', borderTop:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:'11px', color:'#6b7280' }}>Total recibido</div>
              <div style={{ fontSize:'16px', fontWeight:'800', color:'#16a34a' }}>$779.000</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TESTIMONIAL — idéntico al original ── */}
      <div className="lp-testimonial">
        <div className="lp-testi-inner l-reveal">
          <div className="lp-testi-tag">Caso real</div>
          <div className="lp-testi-quote">
            "Pulse me ayudó a ordenar cada alumno de forma personalizada. Puedo armar rutinas a distancia, unificar los pagos y automatizar el trabajo — para enfocarme en lo que importa: la evolución de cada alumno."
          </div>
          <div className="lp-testi-author">
            <div className="lp-testi-ava">CL</div>
            <div>
              <div className="lp-testi-name">Entrenadora personal · Buenos Aires</div>
              <div className="lp-testi-role">Usuaria desde el lanzamiento</div>
            </div>
          </div>
          <div className="lp-testi-metrics">
            <div><div className="lp-tm-n">100%</div><div className="lp-tm-l">Digital desde el día 1</div></div>
            <div><div className="lp-tm-n">0</div><div className="lp-tm-l">PDFs ni Excel</div></div>
            <div><div className="lp-tm-n">3 hs</div><div className="lp-tm-l">Recuperadas por semana</div></div>
          </div>
          <a href="/register/admin" className="lp-btn-main" style={{ fontSize:'15px', padding:'14px 28px' }}>Quiero lo mismo →</a>
        </div>
      </div>

      {/* ── PRICING — idéntico al original, ✅ FREE = 2 alumnos ── */}
      <div className="lp-pricing">
        <div className="lp-pricing-inner">
          <div className="lp-section-label" style={{ textAlign:'center' }}>Planes</div>
          <div className="lp-section-title" style={{ textAlign:'center' }}>Empezá gratis.<br /><em>Crecé cuando estés listo.</em></div>
          <div style={{ fontSize:'14px', color:'#6b7280', textAlign:'center' }}>Sin contratos. Sin letras chicas. Sin sorpresas.</div>
          <div className="lp-pricing-grid">
            <div className="lp-price-card">
              <div className="lp-price-label">Plan Free</div>
              <div className="lp-price-n">$0</div>
              <div className="lp-price-period">Para siempre</div>
              {/* ✅ 2 alumnos */}
              <div className="lp-price-feat"><span className="lp-pf-dot">✓</span>Hasta <strong>2 alumnos</strong></div>
              <div className="lp-price-feat"><span className="lp-pf-dot">✓</span>Constructor de rutinas</div>
              <div className="lp-price-feat"><span className="lp-pf-dot">✓</span>App del alumno (marca Pulse)</div>
              <div className="lp-price-feat"><span className="lp-pf-dot">✓</span>Cobros (comisión 8%)</div>
              <div className="lp-price-feat"><span className="lp-pf-dot muted">—</span><span style={{ color:'#9ca3af' }}>Branding propio</span></div>
              <div className="lp-price-feat"><span className="lp-pf-dot muted">—</span><span style={{ color:'#9ca3af' }}>Comisión reducida</span></div>
              <a href="/register/admin" className="lp-price-cta free">Empezar gratis</a>
            </div>
            <div className="lp-price-card pro">
              <div style={{ display:'inline-block', background:'#5B8CFF', color:'#fff', fontSize:'10px', fontWeight:'700', padding:'4px 12px', borderRadius:'20px', marginBottom:'12px', letterSpacing:'0.06em' }}>MÁS ELEGIDO</div>
              <div className="lp-price-label">Plan Pro</div>
              <div className="lp-price-n">$25.000</div>
              <div className="lp-price-period">ARS / mes</div>
              <div className="lp-price-feat"><span className="lp-pf-dot">✓</span><strong>Alumnos ilimitados</strong></div>
              <div className="lp-price-feat"><span className="lp-pf-dot">✓</span>App con tu logo y colores</div>
              <div className="lp-price-feat"><span className="lp-pf-dot">✓</span>Nombre de marca propio</div>
              <div className="lp-price-feat"><span className="lp-pf-dot">✓</span>Cobros (comisión 5%)</div>
              <div className="lp-price-feat"><span className="lp-pf-dot">✓</span>Soporte prioritario</div>
              <div style={{ fontSize:'12px', color:'#3b5bdb', marginTop:'8px', fontWeight:'600' }}>Menos de lo que ganás con una clase extra.</div>
              <a href="/register/admin?plan=pro" className="lp-price-cta pro">Activar Pro →</a>
            </div>
          </div>
        </div>
      </div>

      {/* ── FINAL CTA — idéntico al original, ✅ FREE = 2 alumnos ── */}
      <div className="lp-final">
        <h2>Dejá de administrar.<br /><em>Empezá a entrenar.</em></h2>
        <div className="lp-final-sub">En 10 minutos tenés tu primera rutina cargada y tu primer alumno adentro.</div>
        <a href="/register/admin" className="lp-btn-main" style={{ fontSize:'16px', padding:'16px 40px' }}>Crear mi app gratis →</a>
        {/* ✅ 2 alumnos */}
        <div className="lp-final-note">Gratis para tus primeros 2 alumnos · Sin tarjeta · Sin contrato</div>
      </div>

      {/* ── FOOTER — ecosistema KAIRO ── */}
      <div className="lp-footer-eco">
        <div className="lp-footer-eco-in">
          <div className="lp-eco-mark">
            <a href="#" className="lp-eco-item lp-eco-pulse">PULSE<span className="lp-eco-dot lp-eco-dot-pulse">.</span></a>
            <a href="#" className="lp-eco-item lp-eco-crece">CRECE<span className="lp-eco-dot lp-eco-dot-crece">.</span></a>
            <a href="#" className="lp-eco-item lp-eco-closer">CLOSER<span className="lp-eco-dot lp-eco-dot-closer">.</span></a>
            <a href="https://getsignalatam.lat/" target="_blank" rel="noopener" className="lp-eco-item lp-eco-signal">SIGNAL<span className="lp-eco-dot lp-eco-dot-signal">.</span></a>
          </div>
          <div className="lp-foot-links">
            <a href="https://kairo.lat/" target="_blank" rel="noopener" className="lp-foot-kairo"><strong>KAIRO</strong> — Make it simple</a>
            <a href="/privacidad">Privacidad</a>
            <a href="mailto:hola@getpulseapp.lat">Contacto</a>
          </div>
        </div>
      </div>

    </div>
  )
}
