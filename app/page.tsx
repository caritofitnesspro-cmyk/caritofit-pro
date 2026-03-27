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

      {/* ── 5. DEMO VISUAL (PANTALLAS) ── */}
      <section className="l-section l-screens">
        <div className="l-screens-header l-reveal">
          <div className="l-section-label">El producto</div>
          <h2 className="l-section-title">Así se ve<br /><em>por dentro.</em></h2>
          <p className="l-section-sub">Sin curva de aprendizaje. Lo que necesitás, donde lo esperás.</p>
        </div>
        <div className="l-screens-grid">
          <div className="l-screen-item l-reveal">
            <div className="l-screen-label">Acceso del alumno</div>
            <div className="l-screen-mock l-login-mock">
              <div className="lm-inner">
                <div className="lm-logo"><div className="lm-logo-icon">P</div></div>
                <div className="lm-brand">Mi Entrenador</div>
                <div className="lm-sub">Tu entrenamiento personalizado</div>
                <div className="lm-tabs"><div className="lm-tab active">🏋 Alumno/a</div><div className="lm-tab">👤 Profesor/a</div></div>
                <div className="lm-field-label">DNI</div>
                <div className="lm-input">Sin puntos ni guiones</div>
                <div className="lm-field-label">CONTRASEÑA</div>
                <div className="lm-input pw">••••••••</div>
                <div className="lm-btn">Ingresar</div>
                <div className="lm-register">¿Primera vez? Registrate acá</div>
              </div>
            </div>
          </div>
          <div className="l-screen-item l-reveal">
            <div className="l-screen-label">Panel del entrenador</div>
            <div className="l-screen-mock l-dash-mock">
              <div className="dm-sidebar">
                <div className="dm-sidebar-brand">
                  <div className="dm-brand-icon">P</div>
                  <div><div className="dm-brand-name">Mi Equipo</div><div className="dm-brand-role">PANEL</div></div>
                </div>
                <div className="dm-nav-label">GESTIÓN</div>
                <div className="dm-nav-item active">Dashboard</div>
                <div className="dm-nav-item">Alumnos/as</div>
                <div className="dm-nav-item">Planes</div>
                <div className="dm-nav-item">Mi marca</div>
              </div>
              <div className="dm-main">
                <div className="dm-eyebrow">PULSE</div>
                <div className="dm-greeting">Hola, Carolina 👋</div>
                <div className="dm-stats">
                  <div className="dm-stat"><span className="dm-stat-n">3</span><span className="dm-stat-l">ALUMNOS</span></div>
                  <div className="dm-stat"><span className="dm-stat-n">2</span><span className="dm-stat-l">ACTIVOS HOY</span></div>
                  <div className="dm-stat"><span className="dm-stat-n">1</span><span className="dm-stat-l">PLAN NUEVO</span></div>
                </div>
                <div className="dm-section-title">Alumnos/as <span className="dm-ver-todos">Ver todos →</span></div>
                <div className="dm-student"><div className="dm-ava">LR</div><div className="dm-sinfo"><div className="dm-sname">Laura Rodríguez</div><div className="dm-sgoal">Tonificación</div></div><div className="dm-badge green">✓ Plan</div></div>
                <div className="dm-student"><div className="dm-ava">MP</div><div className="dm-sinfo"><div className="dm-sname">Martín Pérez</div><div className="dm-sgoal">Ganar músculo</div></div><div className="dm-badge green">✓ Plan</div></div>
                <div className="dm-student"><div className="dm-ava">VA</div><div className="dm-sinfo"><div className="dm-sname">Valeria Acosta</div><div className="dm-sgoal">Rehabilitación</div></div><div className="dm-badge yellow">Sin plan</div></div>
              </div>
            </div>
          </div>
          <div className="l-screen-item l-reveal">
            <div className="l-screen-label">Personalización de marca</div>
            <div className="l-screen-mock l-brand-mock">
              <div className="bm-inner">
                <div className="bm-back">← Volver</div>
                <div className="bm-title">Personalizar marca</div>
                <div className="bm-subtitle">Configurá cómo te ven tus alumnos</div>
                <div className="bm-row">
                  <div className="bm-col">
                    <div className="bm-field-label">NOMBRE DE MARCA</div>
                    <div className="bm-input">Mi Entrenador</div>
                    <div className="bm-field-label" style={{marginTop:'10px'}}>LOGO</div>
                    <div className="bm-logo-row"><div className="bm-logo-prev">P</div><div className="bm-change-btn">Cambiar</div></div>
                    <div className="bm-field-label" style={{marginTop:'10px'}}>COLORES</div>
                    <div className="bm-colors">
                      <div><div className="bm-color-label">Principal</div><div className="bm-color-row"><div className="bm-swatch" style={{background:'#5B8CFF'}}></div><div className="bm-hex">#5B8CFF</div></div></div>
                      <div><div className="bm-color-label">Secundario</div><div className="bm-color-row"><div className="bm-swatch" style={{background:'#4A74D9'}}></div><div className="bm-hex">#4A74D9</div></div></div>
                    </div>
                  </div>
                  <div className="bm-preview">
                    <div className="bm-preview-label">VISTA PREVIA</div>
                    <div className="bm-preview-card">
                      <div className="bm-preview-sidebar">
                        <div className="bm-ps-brand"><div className="bm-ps-icon">P</div><div><div className="bm-ps-name">Mi Entrenador</div><div className="bm-ps-role">PANEL</div></div></div>
                        <div className="bm-ps-item active">Dashboard</div>
                        <div className="bm-ps-item">Alumnos/as</div>
                      </div>
                    </div>
                    <div className="bm-preview-ui">
                      <div className="bm-btn-primary">Botón principal</div>
                      <div className="bm-btn-secondary">Botón secundario</div>
                    </div>
                  </div>
                </div>
                <div className="bm-save">💾 Guardar</div>
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
            <p className="l-price-desc">Para arrancar y ver si Pulse es para vos.</p>
            <ul className="l-price-features">
              <li><span className="check">✓</span><span>Hasta <strong>3 alumnos</strong></span></li>
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
