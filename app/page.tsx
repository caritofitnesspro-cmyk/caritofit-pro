// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { sendGAEvent } from '@next/third-parties/google'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import './landing.css'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [checking, setChecking] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

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
    const onScroll = () => {
      const scrolled = window.scrollY > 40
      const pastHero = window.scrollY > 500
      navbar?.classList.toggle('scrolled', scrolled)
      navbar?.classList.toggle('past-hero', pastHero)
    }
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

  function track(event: string, params?: Record<string, any>) {
    try { sendGAEvent('event', event, params || {}) } catch(e) {}
  }

  const ALUMNOS = [
    { av: 'SG', bg: '#e260a5', name: 'Sofía González',   plan: 'Fuerza Femenina · 3x/sem',         racha: 12 },
    { av: 'LM', bg: '#f97316', name: 'Lucas Martínez',   plan: 'Hipertrofia Upper/Lower · 4x/sem', racha: 8  },
    { av: 'CM', bg: '#8b5cf6', name: 'Camila Moreno',    plan: 'Full Body Principiantes · 3x/sem', racha: 21 },
    { av: 'TR', bg: '#16a34a', name: 'Tomás Rodríguez',  plan: 'Fuerza Femenina · 3x/sem',         racha: 5  },
    { av: 'AP', bg: '#3B5BDB', name: 'Agustina Pérez',   plan: 'Hipertrofia Upper/Lower · 4x/sem', racha: 3  },
    { av: 'BF', bg: '#0d9488', name: 'Bruno Ferreyra',   plan: 'Full Body Principiantes · 3x/sem', racha: 1  },
  ]

  const PLANES = [
    { name: 'Fuerza Femenina',        meta: 'Tonificación y fuerza · 3 días/sem',      dias: ['Lun · Piernas & Glúteos', 'Mié · Tren Superior', 'Vie · Full Body'] },
    { name: 'Hipertrofia Upper/Lower', meta: 'Ganar masa muscular · 4 días/sem',        dias: ['Lun · Upper A', 'Mar · Lower A', 'Jue · Upper B', 'Vie · Lower B'] },
    { name: 'Full Body Principiantes', meta: 'Acondicionamiento general · 3 días/sem',  dias: ['Lun · Full Body A', 'Mié · Cardio+Core', 'Vie · Full Body B'] },
  ]

  const FEED = [
    { av: 'SG', bg: '#e260a5', name: 'Sofía González',  sess: 'Piernas & Glúteos', time: '20 min' },
    { av: 'LM', bg: '#f97316', name: 'Lucas Martínez',  sess: 'Tren Superior',     time: '1 h'    },
    { av: 'CM', bg: '#8b5cf6', name: 'Camila Moreno',   sess: 'Full Body A',       time: '2 h'    },
    { av: 'TR', bg: '#16a34a', name: 'Tomás Rodríguez', sess: 'Cardio + Core',     time: '3 h'    },
  ]

  const NAV_TABS = [
    { key: 'dashboard', icon: '◈', label: 'Dashboard'   },
    { key: 'alumnos',   icon: '◉', label: 'Alumnos'     },
    { key: 'planes',    icon: '▦', label: 'Planes'      },
    { key: 'ficha',     icon: '◎', label: 'Ficha alumna'},
  ]

  return (
    <div className="lp">

      {/* NAV */}
      <nav id="l-navbar" className="lp-nav">
        <div className="lp-logo">PULSE<span>.</span></div>

        {/* Links de navegación — ocultos en mobile */}
        <div className="lp-nav-links">
          <a href="#el-producto" className="lp-nav-link">El producto</a>
          <a href="#como-funciona" className="lp-nav-link">Cómo funciona</a>
          <a href="#precios" className="lp-nav-link">Precios</a>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <a href="/login" className="lp-nav-login">Iniciar sesión</a>
          <a href="/register/admin" className="lp-nav-cta" onClick={() => track('cta_click', { location: 'nav' })}>Empezar gratis</a>
        </div>
      </nav>

      {/* HERO */}
      <div className="lp-hero-outer">
        <div className="lp-hero-wrap">
          <img
            className="lp-hero-photo"
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1400&q=85&auto=format&fit=crop&crop=center"
            alt="Trainer guiando a su atleta"
          />
          <div className="lp-hero-overlay" />
          <div className="lp-hero-badge">Para trainers personales</div>
          <div className="lp-hero-content">
            <div className="lp-hero-eyebrow">Pulse</div>
            <h1>
              Dejá de administrar.<br />
              Empezá a<br />
              <em>entrenar.</em>
            </h1>
            <p className="lp-hero-sub">
              Rutinas, seguimiento y cobros <strong>en una sola app</strong>.<br />
              Tus atletas entrenan. Vos lo sabés al instante.
            </p>
            <div className="lp-cta-group">
              <a href="/register/admin" className="lp-btn-main" onClick={() => track('cta_click', { location: 'hero' })}>Crear mi app gratis →</a>
              <a href="#el-producto" className="lp-btn-ghost-dark">Ver el producto</a>
            </div>
            <div className="lp-hero-note">Gratis para tus primeros 2 atletas · Sin tarjeta</div>
          </div>
          <div className="lp-hero-stats">
            <div className="lp-stat-pill">
              <div className="lp-stat-n">10<span>min</span></div>
              <div className="lp-stat-l">Para estar operativo</div>
            </div>
            <div className="lp-stat-pill">
              <div className="lp-stat-n"><span>$0</span></div>
              <div className="lp-stat-l">Para empezar</div>
            </div>
            <div className="lp-stat-pill">
              <div className="lp-stat-n">0<span>wsp</span></div>
              <div className="lp-stat-l">Para mandar rutinas</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DEMO DEL PRODUCTO ── */}
      <div className="lp-demo-section" id="el-producto">
        <div className="lp-demo-inner">
          <div className="lp-demo-header">

            <div className="live-badge">
              <span className="live-dot-wrap"><span className="live-dot" /></span>
              Demo en vivo
            </div>

            <div className="lp-section-label" style={{ textAlign: 'center', marginBottom: '12px' }}>El producto real</div>
            <h2 className="lp-section-title" style={{ textAlign: 'center', marginBottom: '10px' }}>
              Así se ve tu panel<br /><em>desde adentro.</em>
            </h2>
            <p className="lp-section-sub" style={{ textAlign: 'center', maxWidth: '460px', margin: '0 auto 32px' }}>
              Explorá el dashboard de Valentina, una trainer con 6 atletas activos. Navegá las pestañas.
            </p>

            <div className="demo-tabs">
              {NAV_TABS.map(({ key }, i) => (
                <button
                  key={key}
                  className={`demo-tab-btn${activeTab === key ? ' active' : ''}`}
                  onClick={() => setActiveTab(key)}
                >
                  {['Dashboard', 'Alumnos', 'Planes', 'Ficha alumna'][i]}
                </button>
              ))}
            </div>
          </div>

          <div className="app-shell">

            {/* SIDEBAR */}
            <aside className="app-sidebar">
              <div className="app-sidebar-header">
                <div className="app-brand-row">
                  <div className="app-brand-logo">
                    <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                      <text x="16" y="22" textAnchor="middle" fontFamily="Georgia,serif" fontSize="20" fontWeight="700" fill="#fff">P</text>
                    </svg>
                  </div>
                  <div>
                    <div className="app-brand-name">Pulse</div>
                    <div className="app-brand-sub">Panel de entrenamiento</div>
                  </div>
                </div>
              </div>
              <div className="app-nav">
                <div className="app-nav-section">Gestión</div>
                {NAV_TABS.map(({ key, icon, label }) => (
                  <button
                    key={key}
                    className={`app-nav-btn${activeTab === key ? ' active' : ''}`}
                    onClick={() => setActiveTab(key)}
                  >
                    <span className="app-nav-icon">{icon}</span>
                    {label}
                    {activeTab === key && <span className="app-nav-dot" />}
                  </button>
                ))}
              </div>
              <div className="app-sidebar-footer">
                <div className="app-user-row">
                  <div className="app-avatar" style={{ width: 30, height: 30, fontSize: 10, background: '#5B8CFF' }}>VR</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="app-username">Valentina Ruiz</div>
                    <div className="app-userrole">Profesora</div>
                  </div>
                </div>
              </div>
            </aside>

            {/* MAIN */}
            <main className="app-main">

              {/* DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="app-panel">
                  <div className="app-date-line">
                    {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div className="app-brand-tag">Pulse</div>
                  <div className="app-page-title">Hola, Valentina 👋</div>
                  <div className="app-insight ok">✅ ¡Todos tus alumnos tienen plan activo!</div>
                  <div className="app-stats-grid">
                    <div className="app-stat-card">
                      <div className="app-stat-n">6</div>
                      <div className="app-stat-lbl">Alumnos activos</div>
                    </div>
                    <div className="app-stat-card">
                      <div className="app-stat-n">3<span>planes</span></div>
                      <div className="app-stat-lbl">Planes creados</div>
                    </div>
                    <div className="app-stat-card">
                      <div className="app-stat-n" style={{ color: '#d97706' }}>🔥 4</div>
                      <div className="app-stat-lbl">Sesiones hoy</div>
                    </div>
                  </div>
                  <div className="app-section-hd">Actividad reciente</div>
                  <div className="app-feed">
                    {FEED.map(({ av, bg, name, sess, time }) => (
                      <div className="app-feed-row" key={name}>
                        <div className="app-feed-av" style={{ background: bg }}>{av}</div>
                        <div className="app-feed-text"><strong>{name}</strong> completó {sess}</div>
                        <div className="app-feed-time">{time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ALUMNOS */}
              {activeTab === 'alumnos' && (
                <div className="app-panel">
                  <div className="app-top-bar">
                    <div>
                      <div className="app-page-title" style={{ fontSize: 18 }}>Alumnos</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>6 activos · 6 con plan</div>
                    </div>
                    <button className="app-btn-sm">+ Nuevo</button>
                  </div>
                  {ALUMNOS.map(({ av, bg, name, plan, racha }) => (
                    <div className="app-alu-card" key={name} onClick={() => setActiveTab('ficha')}>
                      <div className="app-avatar" style={{ width: 36, height: 36, fontSize: 11, background: bg }}>{av}</div>
                      <div style={{ flex: 1 }}>
                        <div className="app-alu-name">{name}</div>
                        <div className="app-alu-sub">{plan}</div>
                      </div>
                      <span className="app-badge app-badge-green">Con plan</span>
                      <div className="app-racha">🔥 {racha}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* PLANES */}
              {activeTab === 'planes' && (
                <div className="app-panel">
                  <div className="app-top-bar">
                    <div>
                      <div className="app-page-title" style={{ fontSize: 18 }}>Planes</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>3 planes · 6 atletas asignados</div>
                    </div>
                    <button className="app-btn-sm">+ Nuevo</button>
                  </div>
                  {PLANES.map(({ name, meta, dias }) => (
                    <div className="app-plan-card" key={name}>
                      <div className="app-plan-header">
                        <div className="app-plan-name">{name}</div>
                        <span className="app-badge app-badge-blue">2 atletas</span>
                      </div>
                      <div className="app-plan-meta">{meta}</div>
                      <div>{dias.map(d => <span className="app-day-chip" key={d}>{d}</span>)}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* FICHA */}
              {activeTab === 'ficha' && (
                <div className="app-panel">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <button className="app-btn-ghost" onClick={() => setActiveTab('alumnos')}>← Volver</button>
                    <div className="app-page-title" style={{ fontSize: 16, margin: 0 }}>Sofía González</div>
                  </div>
                  <div className="app-ficha-grid">
                    <div className="app-ficha-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <div className="app-avatar" style={{ width: 44, height: 44, fontSize: 15, background: '#e260a5' }}>SG</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Sofía González</div>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>Desde feb 2025</div>
                        </div>
                      </div>
                      {[
                        ['Plan activo',   'Fuerza Femenina'],
                        ['Objetivo',      'Tonificar piernas y bajar 5 kg'],
                        ['Nivel',         'Intermedio'],
                        ['Restricciones', 'Dolor lumbar leve'],
                      ].map(([lbl, val], i, arr) => (
                        <div key={lbl}>
                          <div className="app-ficha-lbl">{lbl}</div>
                          <div className="app-ficha-val" style={{ marginBottom: i === arr.length - 1 ? 0 : 10 }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="app-stat-card" style={{ marginBottom: 8 }}>
                        <div className="app-stat-n" style={{ color: '#d97706' }}>🔥 12</div>
                        <div className="app-stat-lbl">Días de racha</div>
                      </div>
                      <div className="app-stat-card" style={{ marginBottom: 8 }}>
                        <div className="app-stat-n">68<span>kg</span></div>
                        <div className="app-stat-lbl">Peso registrado</div>
                      </div>
                      <div className="app-stat-card">
                        <div className="app-stat-n" style={{ fontSize: 22 }}>28</div>
                        <div className="app-stat-lbl">Sesiones totales</div>
                      </div>
                    </div>
                  </div>
                  <div className="app-sessions">
                    <div className="app-section-hd" style={{ marginBottom: 10 }}>Últimas sesiones</div>
                    {[
                      ['Piernas & Glúteos', 'hoy 10:20'],
                      ['Full Body',         'mié 9:45' ],
                      ['Tren Superior',     'lun 11:00'],
                    ].map(([sess, fecha]) => (
                      <div key={sess} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                        <span style={{ color: '#111827', fontWeight: 500 }}>{sess}</span>
                        <span style={{ color: '#9ca3af' }}>{fecha}</span>
                        <span className="app-badge app-badge-green">Completo</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </main>
          </div>
        </div>
      </div>

      {/* ANTES / DESPUES */}
      <div className="lp-before-after" id="como-funciona">
        <div className="lp-ba-inner">
          <div className="lp-section-label" style={{ textAlign: 'center', marginBottom: '12px' }}>El cambio real</div>
          <h2 className="lp-section-title" style={{ textAlign: 'center', marginBottom: '8px' }}>
            Así era antes.<br /><em>Así es con Pulse.</em>
          </h2>
          <p className="lp-section-sub" style={{ textAlign: 'center', margin: '0 auto 48px' }}>
            Sabemos exactamente cómo es tu día hoy.
          </p>
          <div className="lp-ba-grid">
            {[
              { before: '📱 Mandás la rutina por WhatsApp y rezás para que la encuentren', after: 'Tu atleta abre su app, ve su plan y marca cada ejercicio completo', icon: '📋' },
              { before: '😬 Cobrar se siente incómodo, perseguís transferencias semanas', after: 'Tu atleta ve un botón "Pagar mes" y vos recibís en Mercado Pago al instante', icon: '💳' },
              { before: '🤷 No sabés si tu atleta entrenó o no hasta que te escribe', after: 'Recibís una notificación cada vez que alguien completa su sesión del día', icon: '🔔' },
            ].map(({ before, after, icon }, i) => (
              <div key={i} className="lp-ba-card l-reveal">
                <div className="lp-ba-icon">{icon}</div>
                <div className="lp-ba-before">
                  <div className="lp-ba-label lp-ba-label-before">Antes</div>
                  <div className="lp-ba-text">{before}</div>
                </div>
                <div className="lp-ba-arrow">↓</div>
                <div className="lp-ba-after">
                  <div className="lp-ba-label lp-ba-label-after">Con Pulse</div>
                  <div className="lp-ba-text">{after}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DIFERENCIAL */}
      <div className="lp-pills-section">
        <div className="lp-pills-inner">
          <div className="lp-section-label" style={{ textAlign: 'center', marginBottom: '12px' }}>Por qué Pulse</div>
          <h2 className="lp-section-title" style={{ textAlign: 'center', marginBottom: '48px' }}>
            Lo que ningún otro<br /><em>tiene junto.</em>
          </h2>
          <div className="lp-pills-grid">
            {[
              { icon: '🔥', title: 'Racha de adherencia',   desc: 'Tus atletas ven sus días consecutivos entrenados. Vuelven solos sin que vos hagas nada.' },
              { icon: '⚡', title: 'Alerta en tiempo real', desc: 'Recibís un email cada vez que un atleta completa su sesión. Sabés quién cumple y quién no.' },
              { icon: '🎨', title: 'Tu marca, no la nuestra', desc: 'Con PRO tu app lleva tu nombre y colores. Tus atletas ven tu marca, no Pulse.' },
              { icon: '💸', title: 'Cobros sin vergüenza',   desc: 'Tus atletas pagan desde la app. El dinero va directo a tu Mercado Pago. Sin vuelto.' },
            ].map(({ icon, title, desc }, i) => (
              <div key={i} className="lp-pill-card l-reveal">
                <div className="lp-pill-icon">{icon}</div>
                <div className="lp-pill-title">{title}</div>
                <div className="lp-pill-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TESTIMONIOS */}
      <div className="lp-quote-section">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="lp-section-label" style={{ textAlign: 'center', marginBottom: '12px', color: 'rgba(91,140,255,0.8)' }}>Lo que dicen</div>
          <h2 className="lp-section-title" style={{ textAlign: 'center', marginBottom: '48px', color: '#f0ede8' }}>
            Personas reales.<br /><em>Resultados reales.</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }} className="lp-testi-grid">
            <div className="lp-testi-card">
              <div className="lp-testi-stars">★★★★★</div>
              <p className="lp-testi-body">"Antes mandaba las rutinas por WhatsApp y nunca sabía si las hacían. Ahora cada atleta tiene su app, yo recibo una notificación cuando entrenan y los cobros se manejan solos. Me cambió la forma de trabajar."</p>
              <div className="lp-testi-foot">
                <div className="lp-testi-ava" style={{ background: '#e260a5' }}>CL</div>
                <div><div className="lp-testi-name">Carolina L.</div><div className="lp-testi-role">Trainer personal · Buenos Aires</div></div>
              </div>
            </div>
            <div className="lp-testi-card">
              <div className="lp-testi-stars">★★★★★</div>
              <p className="lp-testi-body">"La comunicación con mi profe mejoró muchísimo. Antes era todo por chat, ahora tengo mi rutina en la app, marco lo que hago y ella lo ve al instante. Nos enfocamos en entrenar, no en coordinarnos."</p>
              <div className="lp-testi-foot">
                <div className="lp-testi-ava" style={{ background: '#5B8CFF' }}>S</div>
                <div><div className="lp-testi-name">Sofía</div><div className="lp-testi-role">Atleta · Buenos Aires</div></div>
              </div>
            </div>
            <div className="lp-testi-card">
              <div className="lp-testi-stars">★★★★★</div>
              <p className="lp-testi-body">"Me sorprendió lo fácil que fue empezar. En 10 minutos tenía mis primeros atletas cargados y el plan asignado. No necesité ayuda de nadie."</p>
              <div className="lp-testi-foot">
                <div className="lp-testi-ava" style={{ background: '#16a34a' }}>NP</div>
                <div><div className="lp-testi-name">Nahuel P.</div><div className="lp-testi-role">Trainer · Buenos Aires</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div className="lp-pricing" id="precios">
        <div className="lp-pricing-inner">
          <div className="lp-section-label" style={{ textAlign: 'center', marginBottom: '12px' }}>Sin sorpresas</div>
          <h2 className="lp-section-title" style={{ textAlign: 'center', marginBottom: '8px' }}>
            Empezá gratis.<br /><em>Crecé cuando estés listo.</em>
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
            Sin contratos. Sin letras chicas.
          </p>
          <div className="lp-pricing-grid">
            <div className="lp-price-card">
              <div className="lp-price-label">Free</div>
              <div className="lp-price-n">$0</div>
              <div className="lp-price-period">Para siempre</div>
              <div className="lp-price-feat"><span className="lp-pf-dot">✓</span><span>Hasta 2 atletas</span></div>
              <div className="lp-price-feat"><span className="lp-pf-dot">✓</span><span>App para cada atleta</span></div>
              <div className="lp-price-feat"><span className="lp-pf-dot">✓</span><span>Rutinas y planes</span></div>
              <div className="lp-price-feat"><span className="lp-pf-dot">✓</span><span>Cobros (comisión 8%)</span></div>
              <div className="lp-price-feat"><span className="lp-pf-dot muted">—</span><span style={{ color: '#9ca3af' }}>Branding propio</span></div>
              <div className="lp-price-feat"><span className="lp-pf-dot muted">—</span><span style={{ color: '#9ca3af' }}>Comisión reducida</span></div>
              <a href="/register/admin" className="lp-price-cta free" onClick={() => track('cta_click', { location: 'pricing_free' })}>Empezar gratis</a>
            </div>
            <div className="lp-price-card pro">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'inline-block', background: '#5B8CFF', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.06em' }}>MÁS ELEGIDO</div>
                <div style={{ display: 'inline-block', background: '#dcfce7', color: '#15803d', fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.06em' }}>LANZAMIENTO</div>
              </div>
              <div className="lp-price-label">Pro</div>
              <div style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'line-through', marginBottom: '2px' }}>$35.000 ARS/mes</div>
              <div className="lp-price-n">$25.000</div>
              <div className="lp-price-period">ARS / mes · primeros 3 meses</div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '16px' }}>≈ USD 25 · luego $35.000 ARS/mes</div>
              <div className="lp-price-feat"><span className="lp-pf-dot">✓</span><span><strong>Atletas ilimitados</strong></span></div>
              <div className="lp-price-feat"><span className="lp-pf-dot">✓</span><span>App con tu logo y colores</span></div>
              <div className="lp-price-feat"><span className="lp-pf-dot">✓</span><span>Nombre de marca propio</span></div>
              <div className="lp-price-feat"><span className="lp-pf-dot">✓</span><span>Cobros (comisión 5%)</span></div>
              <div className="lp-price-feat"><span className="lp-pf-dot">✓</span><span>Soporte prioritario</span></div>
              <div style={{ fontSize: '12px', color: '#3b5bdb', marginTop: '8px', fontWeight: '600' }}>Menos de lo que ganás con una clase extra.</div>
              <a href="/register/admin?plan=pro" className="lp-price-cta pro" onClick={() => track('cta_click', { location: 'pricing_pro' })}>Activar Pro →</a>
            </div>
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="lp-final">
        <h2>Tu negocio más ordenado.<br /><em>Desde hoy.</em></h2>
        <div className="lp-final-sub">En 10 minutos tenés tu primer atleta adentro y tu primer plan cargado.</div>
        <a href="/register/admin" className="lp-btn-main" style={{ fontSize: '16px', padding: '16px 40px' }} onClick={() => track('cta_click', { location: 'final_cta' })}>Crear mi app gratis →</a>
        <div className="lp-final-note">Gratis para tus primeros 2 atletas · Sin tarjeta · Sin contrato</div>
      </div>

      {/* FOOTER */}
      <div className="lp-footer-eco">
        <div className="lp-footer-eco-in" style={{ justifyContent: 'center' }}>
          <div className="lp-foot-links">
            <a href="https://kairoinc.lat/" target="_blank" rel="noopener" className="lp-foot-kairo">Built by <strong>KAIRO</strong> · Make it simple — 2026</a>
          </div>
        </div>
      </div>

    </div>
  )
}
