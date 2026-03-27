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
      const { data: perfil } = await supabase
        .from('perfiles').select('rol').eq('id', user.id).single()
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
      if (!reveals.length) return
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
    <div className="landing-root">

      {/* NAV */}
      <nav id="l-navbar" className="l-nav">
        <div className="l-nav-logo">PULSE<span>.</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/login" className="l-nav-login">Iniciar sesión</a>
          <a href="/register/admin" className="l-nav-cta">Empezar gratis</a>
        </div>
      </nav>

      {/* ── 1. HERO ── */}
      <section className="l-hero">
        <div className="l-hero-bg">
          <img
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1800&q=85&auto=format&fit=crop"
            alt="Entrenador personal en acción"
            className="l-hero-img"
          />
          <div className="l-hero-overlay" />
        </div>
        <div className="l-hero-content">
          <div className="l-hero-eyebrow">Para entrenadores personales</div>
          <h1>Tu negocio<br />al ritmo que<br /><em>entrenás.</em></h1>
          <p className="l-hero-sub">
            Alumnos, rutinas y cobros en un lugar.<br />
            <strong>Menos administración. Más cancha.</strong>
          </p>
          <div className="l-hero-actions">
            <a href="/register/admin" className="l-btn-hero">
              Crear mi cuenta gratis
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{marginLeft:'8px'}}>
                <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <span className="l-hero-note">Gratis para siempre · 3 alumnos incluidos</span>
          </div>
          <div className="l-hero-stats">
            <div className="l-hero-stat">
              <span className="l-hero-stat-n">10 min</span>
              <span className="l-hero-stat-l">para estar operativo</span>
            </div>
            <div className="l-hero-stat-div" />
            <div className="l-hero-stat">
              <span className="l-hero-stat-n">3 hs</span>
              <span className="l-hero-stat-l">recuperadas por semana</span>
            </div>
            <div className="l-hero-stat-div" />
            <div className="l-hero-stat">
              <span className="l-hero-stat-n">$0</span>
              <span className="l-hero-stat-l">para empezar</span>
            </div>
          </div>
        </div>
        <div className="l-hero-scroll"><div className="l-scroll-line" /><span>SCROLL</span></div>
      </section>

      {/* ── 2. BARRA DE CREDIBILIDAD ── */}
      <section className="l-cred">
        <div className="l-cred-inner">
          <span className="l-cred-label">Usado por entrenadores en Argentina</span>
          <div className="l-cred-divider" />
          <div className="l-cred-items">
            {[
              { n: '100%', l: 'digital desde el día 1' },
              { n: 'Sin app', l: 'que instalar — corre en el celular' },
              { n: 'MP', l: 'para cobros directos' },
              { n: 'Gratis', l: 'para empezar hoy' },
            ].map(({ n, l }) => (
              <div key={n} className="l-cred-item">
                <span className="l-cred-n">{n}</span>
                <span className="l-cred-l">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. EL DOLOR ── */}
      <section className="l-section l-problems">
        <div className="l-problems-grid">
          <div className="l-problems-intro l-reveal">
            <div className="l-section-label">El problema</div>
            <h2 className="l-section-title">¿Cuántas horas<br /><em>perdés</em> por semana?</h2>
            <p className="l-section-sub">No es falta de organización. Es que nadie te dio una herramienta hecha para entrenadores.</p>
            <a href="/register/admin" className="l-btn-outline-blue" style={{ marginTop: '32px', display: 'inline-block' }}>Lo resuelvo con Pulse →</a>
          </div>
          <div className="l-problem-list">
            {[
              { n: '01', h: 'Rutinas que nadie entiende', p: 'Mandás un PDF, te preguntan qué ejercicio es, mandás otro, se confunden. Todo por WhatsApp, a las 11 de la noche.' },
              { n: '02', h: 'Consultas que se pierden', p: 'La pregunta de Martina quedó enterrada entre memes. Respondés tarde, perdés profesionalismo, perdés alumnos.' },
              { n: '03', h: 'Cobros que no llegan', p: '¿Sofía pagó este mes? ¿Carlos debe dos? Sin datos claros, cobrás con vergüenza. O directamente no cobrás.' },
            ].map(({ n, h, p }) => (
              <div key={n} className="l-problem-item l-reveal">
                <span className="l-problem-num">{n}</span>
                <div className="l-problem-content"><h3>{h}</h3><p>{p}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FEATURE CARDS ── */}
      <section className="l-features-section">
        <div className="l-features-section-header l-reveal">
          <div className="l-section-label">Lo que cambia</div>
          <h2 className="l-section-title">Una herramienta.<br /><em>Todo resuelto.</em></h2>
          <p className="l-section-sub">Diseñada para que en 10 minutos ya estés trabajando, no configurando.</p>
        </div>
        <div className="l-feat-grid">
          {[
            {
              icon: '⚡',
              tag: 'Sin Excel',
              title: 'Rutinas en minutos',
              desc: 'Armá, duplicá y asigná planes de entrenamiento. Tu alumno los ve en su celular al instante. Vos seguís el progreso en tiempo real.',
              accent: '#5B8CFF',
            },
            {
              icon: '◎',
              tag: 'Sin WhatsApp',
              title: 'Todo sobre tu alumno',
              desc: 'Objetivo, restricciones, historial y checkins en un solo lugar. Sabés exactamente en qué punto está cada uno, sin preguntar.',
              accent: '#5B8CFF',
            },
            {
              icon: '💳',
              tag: 'Sin perseguir',
              title: 'Cobrás sin vergüenza',
              desc: 'Tu alumno paga desde la app con un botón. Vos recibís directo en tu Mercado Pago. Sin transferencias pendientes.',
              accent: '#5B8CFF',
            },
            {
              icon: '◈',
              tag: 'Solo PRO',
              title: 'Tu marca, no la nuestra',
              desc: 'Logo, colores y nombre propios. Tus alumnos ven tu identidad, no Pulse. Una app con tu imagen que te diferencia de cualquier colega.',
              accent: '#5B8CFF',
            },
          ].map(({ icon, tag, title, desc }) => (
            <div key={title} className="l-feat-card l-reveal">
              <div className="l-feat-card-top">
                <div className="l-feat-icon">{icon}</div>
                <span className="l-feat-tag">{tag}</span>
              </div>
              <h3 className="l-feat-title">{title}</h3>
              <p className="l-feat-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. MOCKUPS PREMIUM ── */}
      <section className="l-section l-screens">
        <div className="l-screens-header l-reveal">
          <div className="l-section-label">El producto</div>
          <h2 className="l-section-title">Así se ve<br /><em>un negocio real.</em></h2>
          <p className="l-section-sub">No un demo. Una entrenadora con 24 alumnos, 8 planes activos y $480.000 ARS en cobros este mes.</p>
        </div>
        <div className="l-mockups-grid">

          {/* Dashboard */}
          <div className="l-mockup-wrap l-reveal">
            <div className="l-mockup-label">Dashboard</div>
            <div className="l-phone-frame">
              <div className="l-phone-screen">
                <div className="l-ph-head">
                  <div className="l-ph-date">Viernes, 27 de marzo</div>
                  <div className="l-ph-brand">Caro Team</div>
                  <div className="l-ph-greeting">Hola, Carolina 👋</div>
                </div>
                <div className="l-ph-body">
                  <div className="l-ph-stat-grid">
                    {[['24','pink','Alumnos'],['21','green','Con plan'],['3','amber','Sin plan'],['8','pink','Planes']].map(([n,c,l]) => (
                      <div key={l} className="l-ph-stat-card">
                        <div className={`l-ph-stat-n ${c}`}>{n}</div>
                        <div className="l-ph-stat-l">{l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="l-rev-box">
                    <div className="l-rev-label">Ingresos del mes</div>
                    <div className="l-rev-amount">$480.000</div>
                    <div className="l-rev-sub">+12% vs mes anterior</div>
                    <div className="l-rev-row">
                      {[['18','#16a34a','Cobrados'],['4','#d97706','Pendientes'],['2','#9ca3af','Sin cobro']].map(([n,c,l]) => (
                        <div key={l} style={{textAlign:'center'}}>
                          <div style={{fontSize:'13px',fontWeight:'800',color:c}}>{n}</div>
                          <div style={{fontSize:'8px',color:'#6b7280'}}>{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="l-ph-insight">
                    <div className="l-ph-insight-icon">⚡</div>
                    <div className="l-ph-insight-text"><strong>Acción:</strong> Valentina Ruiz sin plan.</div>
                  </div>
                  {[['SM','pink','Sofía Martínez','Hipertrofia · Sem 4','ok','✓ Pagó'],['MG','blue','Martín García','Rendimiento · Sem 2','ok','✓ Pagó'],['LR','teal','Laura Rodríguez','Rehabilitación','warn','Pendiente']].map(([ini,c,name,sub,st,badge]) => (
                    <div key={name} className="l-ph-row">
                      <div className={`l-ph-ava ${c}`}>{ini}</div>
                      <div className="l-ph-row-info"><div className="l-ph-row-name">{name}</div><div className="l-ph-row-sub">{sub}</div></div>
                      <span className={`l-ph-badge ${st}`}>{badge}</span>
                    </div>
                  ))}
                </div>
                <div className="l-ph-nav">
                  {[['▦','Inicio',true],['◉','Alumnos'],['☰','Planes'],['?','Ayuda'],['◈','Marca']].map(([icon,label,active]) => (
                    <div key={label} className={`l-ph-nav-item${active?' active':''}`}>
                      <span className="l-ph-nav-icon">{icon}</span>{label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Alumnos */}
          <div className="l-mockup-wrap l-reveal">
            <div className="l-mockup-label">Alumnos</div>
            <div className="l-phone-frame">
              <div className="l-phone-screen">
                <div className="l-ph-head">
                  <div className="l-ph-date">Gestión</div>
                  <div className="l-ph-greeting" style={{fontSize:'16px'}}>Alumnos/as</div>
                  <div className="l-ph-date" style={{marginTop:'2px'}}>24 alumnos · 21 con plan</div>
                </div>
                <div className="l-ph-body">
                  <div className="l-ph-search">🔍 Buscar por nombre o DNI...</div>
                  <div className="l-ph-list-label green-label">Activos (21)</div>
                  {[['SM','pink','Sofía Martínez','Hipertrofia · Sem 4/8'],['MG','blue','Martín García','Rendimiento deportivo'],['LR','teal','Laura Rodríguez','Rehabilitación rodilla'],['JP','amber','Juliana Pérez','Pérdida de peso'],['NF','purple','Nicolás Ferreyra','Hipertrofia · Sem 2/6'],['CA','cyan','Camila Acosta','Salud general']].map(([ini,c,name,sub]) => (
                    <div key={name} className="l-ph-row">
                      <div className={`l-ph-ava ${c}`}>{ini}</div>
                      <div className="l-ph-row-info"><div className="l-ph-row-name">{name}</div><div className="l-ph-row-sub">{sub}</div></div>
                      <span className="l-ph-badge ok">✓ Plan</span>
                    </div>
                  ))}
                  <div className="l-ph-list-label warn-label">Sin plan (3)</div>
                  {[['VR','red','Valentina Ruiz','Tonificación · Nueva'],['BO','red2','Bruno Ortega','Rendimiento']].map(([ini,c,name,sub]) => (
                    <div key={name} className="l-ph-row">
                      <div className={`l-ph-ava ${c}`}>{ini}</div>
                      <div className="l-ph-row-info"><div className="l-ph-row-name">{name}</div><div className="l-ph-row-sub">{sub}</div></div>
                      <span className="l-ph-badge warn">Sin plan</span>
                    </div>
                  ))}
                </div>
                <div className="l-ph-nav">
                  {[['▦','Inicio'],['◉','Alumnos',true],['☰','Planes'],['?','Ayuda'],['◈','Marca']].map(([icon,label,active]) => (
                    <div key={label} className={`l-ph-nav-item${active?' active':''}`}>
                      <span className="l-ph-nav-icon">{icon}</span>{label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Planes */}
          <div className="l-mockup-wrap l-reveal">
            <div className="l-mockup-label">Planes</div>
            <div className="l-phone-frame">
              <div className="l-phone-screen">
                <div className="l-ph-head">
                  <div className="l-ph-date">Gestión</div>
                  <div className="l-ph-greeting" style={{fontSize:'16px'}}>Planes</div>
                  <div className="l-ph-date" style={{marginTop:'2px'}}>8 planes · 24 asignaciones</div>
                </div>
                <div className="l-ph-body">
                  {[
                    {name:'Hipertrofia Avanzada',tag:'Hipertrofia',tagColor:'#fce7f3',tagText:'#be185d',color:'#e260a5',sems:'8',dias:'5',ejs:'42',alumnos:['SM','NF','AG','+4']},
                    {name:'Rendimiento Deportivo',tag:'Rendimiento',tagColor:'#eff3ff',tagText:'#3b5bdb',color:'#5B8CFF',sems:'6',dias:'4',ejs:'36',alumnos:['MG','BO','+2']},
                    {name:'Rehabilitación Activa',tag:'Rehabilitación',tagColor:'#f0fdf4',tagText:'#15803d',color:'#16a34a',sems:'4',dias:'3',ejs:'18',alumnos:['LR','EP','+1']},
                    {name:'Pérdida de Peso',tag:'Salud general',tagColor:'#fef3c7',tagText:'#92400e',color:'#d97706',sems:'12',dias:'4',ejs:'28',alumnos:['JP','CA','+5']},
                  ].map(({name,tag,tagColor,tagText,color,sems,dias,ejs,alumnos}) => (
                    <div key={name} className="l-plan-card">
                      <div className="l-plan-name" style={{color}}>{name}</div>
                      <span className="l-plan-tag" style={{background:tagColor,color:tagText}}>{tag}</span>
                      <div className="l-plan-stats">
                        {[[sems,'Semanas'],[dias,'Días/sem'],[ejs,'Ejercicios']].map(([n,l]) => (
                          <div key={l} style={{textAlign:'center'}}>
                            <div style={{fontSize:'16px',fontWeight:'800',color,lineHeight:'1'}}>{n}</div>
                            <div style={{fontSize:'7px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.04em'}}>{l}</div>
                          </div>
                        ))}
                      </div>
                      <div className="l-plan-assigned">
                        {alumnos.map(a => a.startsWith('+')
                          ? <span key={a} style={{fontSize:'8px',color:'#9ca3af'}}>{a} más</span>
                          : <div key={a} className="l-plan-ava-sm" style={{background:color}}>{a}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="l-ph-nav">
                  {[['▦','Inicio'],['◉','Alumnos'],['☰','Planes',true],['?','Ayuda'],['◈','Marca']].map(([icon,label,active]) => (
                    <div key={label} className={`l-ph-nav-item${active?' active':''}`}>
                      <span className="l-ph-nav-icon">{icon}</span>{label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cobros */}
          <div className="l-mockup-wrap l-reveal">
            <div className="l-mockup-label">Cobros</div>
            <div className="l-phone-frame">
              <div className="l-phone-screen">
                <div className="l-ph-head">
                  <div className="l-ph-date">Marzo 2026</div>
                  <div className="l-ph-greeting" style={{fontSize:'16px'}}>Cobros</div>
                  <div style={{display:'flex',alignItems:'center',gap:'4px',marginTop:'2px'}}>
                    <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#16a34a',display:'inline-block'}}/>
                    <span style={{fontSize:'9px',color:'#9ca3af'}}>MP conectado · comisión 5%</span>
                  </div>
                </div>
                <div className="l-ph-body">
                  <div className="l-rev-box">
                    <div className="l-rev-label">Ingresos del mes</div>
                    <div className="l-rev-amount">$480.000</div>
                    <div className="l-rev-sub">18 cobros aprobados · 4 pendientes</div>
                    <div className="l-rev-row">
                      {[['$432k','#16a34a','Recibido'],['$96k','#d97706','Pendiente']].map(([n,c,l]) => (
                        <div key={l} style={{textAlign:'center'}}>
                          <div style={{fontSize:'13px',fontWeight:'800',color:c}}>{n}</div>
                          <div style={{fontSize:'8px',color:'#6b7280'}}>{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="l-ph-list-label green-label">Aprobados</div>
                  {[['SM','pink','Sofía Martínez','Hipertrofia','$27.000'],['MG','blue','Martín García','Rendimiento','$27.000'],['LR','teal','Laura Rodríguez','Rehabilitación','$22.000']].map(([ini,c,name,plan,amount]) => (
                    <div key={name} className="l-cobro-row">
                      <div className={`l-ph-ava ${c}`} style={{width:'26px',height:'26px',fontSize:'8px'}}>{ini}</div>
                      <div className="l-ph-row-info"><div className="l-ph-row-name">{name}</div><div className="l-ph-row-sub">{plan}</div></div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:'12px',fontWeight:'800',color:'#16a34a'}}>{amount}</div>
                        <span className="l-ph-badge ok" style={{fontSize:'7px'}}>Aprobado</span>
                      </div>
                    </div>
                  ))}
                  <div className="l-ph-list-label warn-label">Pendientes</div>
                  {[['JP','amber','Juliana Pérez','Pérdida de peso','$24.000'],['NF','purple','Nicolás Ferreyra','Hipertrofia','$27.000']].map(([ini,c,name,plan,amount]) => (
                    <div key={name} className="l-cobro-row">
                      <div className={`l-ph-ava ${c}`} style={{width:'26px',height:'26px',fontSize:'8px'}}>{ini}</div>
                      <div className="l-ph-row-info"><div className="l-ph-row-name">{name}</div><div className="l-ph-row-sub">{plan}</div></div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:'12px',fontWeight:'800',color:'#d97706'}}>{amount}</div>
                        <span className="l-ph-badge warn" style={{fontSize:'7px'}}>Pendiente</span>
                      </div>
                    </div>
                  ))}
                  <div style={{marginTop:'10px',paddingTop:'8px',borderTop:'1px solid #f3f4f6',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:'10px',color:'#6b7280'}}>Total recibido</span>
                    <span style={{fontSize:'15px',fontWeight:'900',color:'#16a34a'}}>$432.000</span>
                  </div>
                </div>
                <div className="l-ph-nav">
                  {[['▦','Inicio'],['◉','Alumnos'],['☰','Planes'],['?','Ayuda'],['◈','Marca',true]].map(([icon,label,active]) => (
                    <div key={label} className={`l-ph-nav-item${active?' active':''}`}>
                      <span className="l-ph-nav-icon">{icon}</span>{label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 6. TESTIMONIO editorial ── */}
      <section className="l-testimonial">
        <div className="l-testimonial-inner l-reveal">
          <div className="l-testimonial-left">
            <div className="l-testimonial-tag">Caso real</div>
            <blockquote className="l-testimonial-quote">
              "Pulse me ayudó a ordenar cada alumno de forma personalizada. Puedo armar rutinas a distancia, unificar los pagos y automatizar el trabajo — para enfocarme en lo que importa: la evolución de cada alumno."
            </blockquote>
            <div className="l-testimonial-author">
              <div className="l-testimonial-avatar">CL</div>
              <div>
                <div className="l-testimonial-name">Carolina Lell</div>
                <div className="l-testimonial-role">Entrenadora personal · Buenos Aires</div>
              </div>
            </div>
          </div>
          <div className="l-testimonial-right">
            <div className="l-tm-item">
              <div className="l-tm-n">100%</div>
              <div className="l-tm-l">Digital desde el día 1</div>
            </div>
            <div className="l-tm-sep" />
            <div className="l-tm-item">
              <div className="l-tm-n">0</div>
              <div className="l-tm-l">PDFs ni Excel</div>
            </div>
            <div className="l-tm-sep" />
            <div className="l-tm-item">
              <div className="l-tm-n">3 hs</div>
              <div className="l-tm-l">Recuperadas por semana</div>
            </div>
            <a href="/register/admin" className="l-btn-primary" style={{marginTop:'32px', display:'inline-block'}}>
              Quiero lo mismo →
            </a>
          </div>
        </div>
      </section>

      {/* ── 7. PRICING ── */}
      <section className="l-section l-pricing" id="pricing">
        <div className="l-pricing-header l-reveal">
          <div className="l-section-label">Planes</div>
          <h2 className="l-section-title">Empezá gratis.<br /><em>Crecé cuando estés listo.</em></h2>
          <p className="l-section-sub">Sin contratos. Sin letras chicas. Sin sorpresas.</p>
        </div>
        <div className="l-pricing-grid">
          <div className="l-price-card l-reveal">
            <div className="l-price-card-label">Plan Free</div>
            <div className="l-price-amount"><span className="currency">$</span><span className="number">0</span><span className="period">/ siempre</span></div>
            <p className="l-price-desc">Para probar sin compromiso.</p>
            <ul className="l-price-features">
              <li><span className="check">✓</span><span>Hasta <strong>2 alumnos</strong></span></li>
              <li><span className="check">✓</span><span>Constructor de rutinas</span></li>
              <li><span className="check">✓</span><span>App del alumno (marca Pulse)</span></li>
              <li><span className="check">✓</span><span>Cobros desde la app (comisión 8%)</span></li>
              <li><span className="check">✓</span><span>Sin vencimiento</span></li>
              <li><span className="check muted">—</span><span className="muted">Personalización de marca</span></li>
              <li><span className="check muted">—</span><span className="muted">Comisión reducida al 5%</span></li>
            </ul>
            <a href="/register/admin" className="l-btn-outline">Empezar gratis</a>
          </div>
          <div className="l-price-card pro l-reveal">
            <div className="l-pro-badge">El que eligen los que probaron los dos</div>
            <div className="l-price-card-label">Plan Pro</div>
            <div className="l-price-amount"><span className="currency">$</span><span className="number">25.000</span><span className="period">ARS / mes</span></div>
            <p className="l-price-desc">Para quien ya decidió que su negocio es serio.</p><p className="l-price-anchor">Menos de lo que ganás con una clase extra.</p>
            <ul className="l-price-features">
              <li><span className="check">✓</span><span><strong>Alumnos ilimitados</strong></span></li>
              <li><span className="check">✓</span><span>Constructor de rutinas completo</span></li>
              <li><span className="check">✓</span><span>App del alumno con <strong>tu marca</strong></span></li>
              <li><span className="check">✓</span><span>Logo y colores propios</span></li>
              <li><span className="check">✓</span><span>Cobrá a tus alumnos desde la app</span></li>
              <li><span className="check">✓</span><span>Comisión reducida 5%</span></li>
              <li><span className="check">✓</span><span>Soporte prioritario</span></li>
            </ul>
            <a href="/register/admin?plan=pro" className="l-btn-pro">Activar Pro →</a>
          </div>
        </div>
      </section>

      {/* ── 8. CTA FINAL ── */}
      <section className="l-final-cta">
        <div className="l-final-cta-inner l-reveal">
          <div className="l-section-label" style={{color:'rgba(255,255,255,0.5)'}}>Una decisión</div>
          <h2 className="l-final-cta-title">Dejá de administrar.<br /><em>Empezá a entrenar.</em></h2>
          <p className="l-final-cta-sub">En 10 minutos tenés tu primera rutina cargada y tu primer alumno adentro.</p>
          <a href="/register/admin" className="l-btn-primary l-btn-xl">Crear mi cuenta gratis →</a>
          <div className="l-final-cta-note">Creá tu cuenta en 2 minutos · Sin instalar nada · Sin tarjeta</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="l-footer">
        <div className="l-footer-logo">PULSE</div>
        <p className="l-footer-quote">"La constancia necesita claridad."</p>
        <div className="l-footer-divider"></div>
        <p className="l-footer-kairo">Un producto de <strong>KAIRO</strong> — <em>Make it simple.</em></p>
        <div className="l-footer-links">
          <a href="/terminos">Términos</a>
          <a href="/privacidad">Privacidad</a>
          <a href="mailto:hola@getpulseapp.lat">Contacto</a>
        </div>
      </footer>

    </div>
  )
}
