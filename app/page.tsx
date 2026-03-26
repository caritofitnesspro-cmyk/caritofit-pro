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

  // Observer separado — espera que el DOM esté listo
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

      <nav id="l-navbar" className="l-nav">
        <div className="l-nav-logo">PULSE<span>.</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/login" style={{ color: 'var(--muted)', fontSize: '14px', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--white)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
            Iniciar sesión
          </a>
          <a href="/register/admin" className="l-nav-cta">Empezar gratis</a>
        </div>
      </nav>

      <section className="l-hero">
        <div className="l-hero-eyebrow">Para entrenadores personales</div>
        <h1>Entrená.<br /><em>No administres.</em></h1>
        <p className="l-hero-sub">
          Pulse ordena tus alumnos, rutinas y cobros <strong>en un solo lugar</strong>. Para que tu energía vuelva donde tiene que estar.
        </p>
        <div className="l-hero-actions">
          <a href="/register/admin" className="l-btn-primary">Empezar gratis (3 alumnos incluidos)</a>
          <span className="l-hero-note">Sin tarjeta. Sin compromiso.</span>
        </div>
        <div className="l-hero-scroll"><div className="l-scroll-line"></div><span>SCROLL</span></div>
      </section>

      <section className="l-section l-problems">
        <div className="l-problems-grid">
          <div className="l-problems-intro l-reveal">
            <div className="l-section-label">El problema</div>
            <h2 className="l-section-title">¿Te suena <em>familiar</em>?</h2>
            <p className="l-section-sub">No sos desorganizado. Es que nadie te dio una herramienta que encaje con tu forma de trabajar.</p>
          </div>
          <div className="l-problem-list">
            {[
              { n: '01', h: 'El caos del PDF y el Excel', p: 'Cada alumno tiene su rutina en un archivo distinto. Cambiar un ejercicio significa editar cinco documentos. Mandás el PDF equivocado y arrancás a disculparte por WhatsApp.' },
              { n: '02', h: 'Mensajes perdidos en el chat', p: 'La consulta de Martina quedó enterrada entre memes y el pedido de turno de Juan. Respondés tarde, te sentís mal, perdés la imagen profesional que tanto te costó construir.' },
              { n: '03', h: 'No sabés quién pagó ni cuándo', p: '¿Sofía abonó este mes? ¿Carlos debe dos? Cobrás con vergüenza porque nunca tenés los números claros. O peor: no cobrás.' },
            ].map(({ n, h, p }) => (
              <div key={n} className="l-problem-item l-reveal">
                <span className="l-problem-num">{n}</span>
                <div className="l-problem-content"><h3>{h}</h3><p>{p}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="l-section l-solution">
        <div className="l-solution-header l-reveal">
          <div className="l-section-label">La solución</div>
          <h2 className="l-section-title">Tres herramientas.<br /><em>Un solo lugar.</em></h2>
          <p className="l-section-sub">Diseñadas para que en diez minutos ya estés trabajando, no configurando.</p>
        </div>
        <div className="l-features-grid">
          {[
            { icon: '⚡', h: 'Constructor de Rutinas', p: 'Armá, duplicá y editá rutinas en minutos. Visual, sin tecnicismos, sin Excel. Asignás a un alumno con un clic y él la ve al instante en su app.', tag: 'Rápido y visual' },
            { icon: '◎', h: 'Gestión de Alumnos', p: 'Ficha completa de cada alumno: rutina activa, historial, notas, estado de pago. Todo en un solo lugar. Nada en WhatsApp, nada en papel, nada en tu cabeza.', tag: 'Todo centralizado' },
            { icon: '◻', h: 'App para el Alumno', p: 'Tu alumno ve su rutina del día, marca series y deja comentarios. Vos ves el progreso en tiempo real. Una experiencia limpia que te diferencia de cualquier colega.', tag: 'Imagen profesional' },
          ].map(({ icon, h, p, tag }) => (
            <div key={h} className="l-feature-card l-reveal">
              <div className="l-feature-icon">{icon}</div>
              <h3>{h}</h3>
              <p>{p}</p>
              <span className="l-feature-tag">{tag}</span>
            </div>
          ))}
        </div>
      </section>

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
                <div className="lm-input pw">········</div>
                <div className="lm-btn">Ingresar →</div>
                <div className="lm-register">¿No tenés cuenta? Registrate →</div>
              </div>
            </div>
          </div>
          <div className="l-screen-item l-reveal">
            <div className="l-screen-label">Vista del entrenador</div>
            <div className="l-screen-mock l-dash-mock">
              <div className="dm-sidebar">
                <div className="dm-sidebar-brand">
                  <div className="dm-brand-icon">P</div>
                  <div><div className="dm-brand-name">Mi Equipo</div><div className="dm-brand-role">PANEL DE ENTRENAMIENTO</div></div>
                </div>
                <div className="dm-nav-label">GESTIÓN</div>
                <div className="dm-nav-item active">🏠 Dashboard</div>
                <div className="dm-nav-item">👥 Alumnos/as</div>
                <div className="dm-nav-item">📋 Planes</div>
                <div className="dm-nav-item">🎨 Mi marca</div>
              </div>
              <div className="dm-main">
                <div className="dm-eyebrow">BIENVENIDO/A</div>
                <div className="dm-greeting">Hola, Marcos 👋</div>
                <div className="dm-stats">
                  <div className="dm-stat"><span className="dm-stat-n">8</span><span className="dm-stat-l">ALUMNOS/AS</span></div>
                  <div className="dm-stat"><span className="dm-stat-n">5</span><span className="dm-stat-l">PLANES</span></div>
                  <div className="dm-stat"><span className="dm-stat-n">6</span><span className="dm-stat-l">CON PLAN ACTIVO</span></div>
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
                <div className="bm-subtitle">Configurá cómo se ve tu app para vos y tus alumnos</div>
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

      <section className="l-section l-plan">
        <div className="l-plan-header l-reveal">
          <div className="l-section-label">El plan de 30 días</div>
          <h2 className="l-section-title">De cero a<br /><em>100% digital.</em></h2>
          <p className="l-section-sub">Sin curva de aprendizaje empinada. Un paso a la vez.</p>
        </div>
        <div className="l-weeks-track">
          {[
            { week: 'Semana 1', title: 'Base digital', tasks: ['Creás tu cuenta y configurás tu perfil', 'Cargás tus primeros 3 alumnos', 'Armás tu primera rutina en Pulse'] },
            { week: 'Semana 2', title: 'Todo adentro', tasks: ['Migrás todos tus alumnos activos', 'Reemplazás los PDFs por rutinas digitales', 'Dejás de mandar archivos por WhatsApp'] },
            { week: 'Semana 3', title: 'Sin fricciones', tasks: ['Tus alumnos usan la app sin que los ayudes', 'Ves el progreso en tiempo real', 'Cobrás con datos claros frente a vos'] },
            { week: 'Semana 4', title: 'Operación limpia', tasks: ['Gestión 100% digital, cero papel', 'Marca personal coherente y profesional', 'Tiempo recuperado para entrenar más alumnos'], highlight: true },
          ].map(({ week, title, tasks, highlight }) => (
            <div key={week} className={`l-week-card l-reveal${highlight ? ' highlight' : ''}`}>
              <div className="l-week-badge">{week}</div>
              <h3>{title}</h3>
              <ul className="l-week-tasks">{tasks.map(t => <li key={t}>{t}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="l-success-banner l-reveal">
          <div className="l-success-icon">✦</div>
          <div className="l-success-text">
            <h4>Señal de éxito al día 30</h4>
            <p>Tu operación es 100% digital. Tus alumnos tienen una app con tu imagen. Vos sabés exactamente quién entrenó, qué hizo y quién pagó. Sin hojas de cálculo, sin caos.</p>
          </div>
        </div>
      </section>

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
              <li><span className="check">✓</span><span>Constructor de rutinas básico</span></li>
              <li><span className="check">✓</span><span>Ficha de cada alumno</span></li>
              <li><span className="check">✓</span><span>App para el alumno (marca Pulse)</span></li>
              <li><span className="check">✓</span><span>Sin vencimiento</span></li>
              <li><span className="check muted">—</span><span className="muted">Personalización de marca</span></li>
              <li><span className="check muted">—</span><span className="muted">Soporte prioritario</span></li>
            </ul>
            <a href="/register/admin" className="l-btn-outline">Empezar gratis</a>
          </div>
          <div className="l-price-card pro l-reveal">
            <div className="l-pro-badge">MÁS ELEGIDO</div>
            <div className="l-price-card-label">Plan Pro</div>
            <div className="l-price-amount"><span className="currency">$</span><span className="number">25.000</span><span className="period">ARS / mes</span></div>
            <p className="l-price-desc">Para quien ya decidió que su negocio es serio. Menos de lo que ganás con un alumno más.</p>
            <ul className="l-price-features">
              <li><span className="check">✓</span><span><strong>Alumnos ilimitados</strong></span></li>
              <li><span className="check">✓</span><span>Constructor de rutinas completo</span></li>
              <li><span className="check">✓</span><span>Gestión de pagos y estado de cuenta</span></li>
              <li><span className="check">✓</span><span>App para el alumno con <strong>tu marca</strong></span></li>
              <li><span className="check">✓</span><span>Logo y colores propios</span></li>
              <li><span className="check">✓</span><span>Soporte prioritario</span></li>
            </ul>
            <a href="/register/admin?plan=pro" className="l-btn-pro">Empezar con Pro</a>
          </div>
        </div>
      </section>

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
