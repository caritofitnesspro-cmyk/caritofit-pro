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

  function track(event: string, params?: Record<string, any>) {
    try { sendGAEvent('event', event, params || {}) } catch (e) {}
  }

  const beforeAfter = [
    {
      before: 'Mandás la rutina por WhatsApp y rezás para que la encuentren.',
      after: 'Tu alumno abre su app, ve su plan del día y marca cada ejercicio. Vos lo ves al instante.',
    },
    {
      before: 'Cobrar se siente incómodo, perseguís transferencias semanas.',
      after: 'Tu alumno ve "Pagar mes" en su app. El dinero llega a tu Mercado Pago. Sin mensajes incómodos.',
    },
    {
      before: 'No sabés si tu alumno entrenó o no hasta que te escribe.',
      after: 'Recibís una notificación cuando alguien completa su sesión. Sin preguntar. Sin adivinar.',
    },
  ]

  const features = [
    {
      num: '01',
      title: 'Tus alumnos no se van',
      desc: 'Ven su progreso, sus rachas y sus fotos. Cuando un alumno ve cuánto avanzó, no cancela.',
    },
    {
      num: '02',
      title: 'Sabés quién entrenó sin preguntar',
      desc: 'Notificación en tiempo real cada vez que alguien completa su sesión. El control sin el esfuerzo.',
    },
    {
      num: '03',
      title: 'Tu marca, no la nuestra',
      desc: 'Con PRO tu app lleva tu nombre y colores. Tus alumnos ven tu marca. Vos construís tu negocio.',
    },
    {
      num: '04',
      title: 'Cobrá sin tener que pedirlo',
      desc: 'Tus alumnos pagan desde la app. El dinero va directo a tu Mercado Pago. Fin de los mensajes incómodos.',
    },
  ]

  const testimonios = [
    {
      body: 'Antes mandaba las rutinas por WhatsApp y nunca sabía si las hacían. Ahora cada alumno tiene su app, recibo una notificación cuando entrenan y los cobros se manejan solos.',
      name: 'Carolina L.',
      role: 'Trainer personal · Buenos Aires',
      initials: 'CL',
      avatarBg: '#fce7f3',
      avatarColor: '#9d174d',
    },
    {
      body: 'Antes era todo por chat, ahora tengo mi rutina en la app, marco lo que hago y mi profe lo ve al instante. Nos enfocamos en entrenar, no en coordinarnos.',
      name: 'Sofía',
      role: 'Alumno · Buenos Aires',
      initials: 'S',
      avatarBg: '#eef3ff',
      avatarColor: '#1a56db',
    },
    {
      body: 'Me sorprendió lo fácil que fue empezar. En 10 minutos tenía mis primeros alumnos cargados y el plan asignado. No necesité ayuda de nadie.',
      name: 'Nahuel P.',
      role: 'Trainer · Buenos Aires',
      initials: 'NP',
      avatarBg: '#ecfdf5',
      avatarColor: '#065f46',
    },
  ]

  return (
    <div className="lp">

      {/* ── NAV ── */}
      <nav id="l-navbar" className="lp-nav">
        <div className="lp-logo">PULSE<span>.</span></div>
        <div className="lp-nav-r">
          <a href="/login" className="lp-nav-login">Iniciar sesión</a>
          <a
            href="/register/admin"
            className="lp-nav-cta"
            onClick={() => track('cta_click', { location: 'nav' })}
          >
            Empezar gratis
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero">
        {/* Imagen + stats — arriba en mobile, columna derecha en desktop */}
        <div className="lp-hero-media">
          <div className="lp-hero-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1400&q=85&auto=format&fit=crop&crop=center"
              alt="Trainer guiando a su alumno"
              className="lp-hero-img"
            />
          </div>
          <div className="lp-stats-bar">
            <div className="lp-sstat">
              <div className="lp-sstat-n">10<em>min</em></div>
              <div className="lp-sstat-l">Para operar</div>
            </div>
            <div className="lp-sstat">
              <div className="lp-sstat-n">$<em>0</em></div>
              <div className="lp-sstat-l">Para empezar</div>
            </div>
            <div className="lp-sstat">
              <div className="lp-sstat-n">0<em>wsp</em></div>
              <div className="lp-sstat-l">Para rutinas</div>
            </div>
          </div>
        </div>

        {/* Texto — debajo en mobile, columna izquierda en desktop */}
        <div className="lp-hero-body">
          <div className="lp-badge">
            <span className="lp-badge-dot" />
            Para entrenadores personales
          </div>
          <h1 className="lp-h1">
            La app que simplifica<br />
            la gestión de <span className="lp-acc">tus alumnos.</span>
          </h1>
          <p className="lp-sub">
            Rutinas, cobros y seguimiento en un solo lugar.
            Tus alumnos tienen su app. Vos tenés el control.
          </p>
          <div className="lp-cta-row">
            <a
              href="/register/admin"
              className="lp-btn-primary"
              onClick={() => track('cta_click', { location: 'hero' })}
            >
              Probá Pulse gratis →
            </a>
            <a href="#como-funciona" className="lp-btn-ghost">
              Ver cómo funciona
            </a>
          </div>
          <div className="lp-note">
            Gratis para tus primeros 2 alumnos · Sin tarjeta · Sin contrato
          </div>
        </div>
      </section>

      {/* ── ANTES / DESPUÉS ── */}
      <section className="lp-section lp-section--alt" id="como-funciona">
        <div className="lp-wrap">
          <div className="lp-sec-chip">El cambio real</div>
          <h2 className="lp-sec-h">
            TU DÍA HOY.<br />
            <span>TU DÍA CON PULSE.</span>
          </h2>
          <div className="lp-ba-grid">
            {beforeAfter.map(({ before, after }, i) => (
              <div key={i} className="lp-ba-card l-reveal">
                <div className="lp-ba-tag lp-tag-b">Antes</div>
                <div className="lp-ba-b-txt">{before}</div>
                <div className="lp-ba-tag lp-tag-a">Con Pulse</div>
                <div className="lp-ba-a-txt">{after}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-section">
        <div className="lp-wrap">
          <div className="lp-sec-chip">Por qué Pulse</div>
          <h2 className="lp-sec-h">
            COBRÁ SIN PEDIRLO.<br />
            <span>SABÉ SIN PREGUNTAR.</span>
          </h2>
          <div className="lp-feat-grid">
            {features.map(({ num, title, desc }, i) => (
              <div key={i} className="lp-feat-card l-reveal">
                <div className="lp-feat-num">{num}</div>
                <div className="lp-feat-title">{title}</div>
                <div className="lp-feat-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className="lp-section lp-section--alt">
        <div className="lp-wrap">
          <div className="lp-sec-chip">Lo que dicen</div>
          <h2 className="lp-sec-h">
            PROFES REALES.<br />
            <span>RESULTADOS REALES.</span>
          </h2>
          <div className="lp-testi-grid">
            {testimonios.map(({ body, name, role, initials, avatarBg, avatarColor }, i) => (
              <div key={i} className="lp-testi-card l-reveal">
                <div className="lp-testi-stars">★★★★★</div>
                <p className="lp-testi-body">{body}</p>
                <div className="lp-testi-foot">
                  <div
                    className="lp-testi-ava"
                    style={{ background: avatarBg, color: avatarColor }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div className="lp-testi-name">{name}</div>
                    <div className="lp-testi-role">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="lp-section" id="precios">
        <div className="lp-wrap">
          <div className="lp-sec-chip">Sin sorpresas</div>
          <h2 className="lp-sec-h" style={{ marginBottom: '8px' }}>
            EMPEZÁ GRATIS.<br />
            <span>SIN EXCUSAS.</span>
          </h2>
          <p className="lp-pricing-sub">Sin contratos. Sin letras chicas.</p>
          <div className="lp-pricing-grid">

            <div className="lp-price-card">
              <div className="lp-price-label">Free</div>
              <div className="lp-price-n">$0</div>
              <div className="lp-price-period">Para siempre</div>
              <div className="lp-price-feat"><span className="lp-pc">✓</span><span>Hasta 2 alumnos</span></div>
              <div className="lp-price-feat"><span className="lp-pc">✓</span><span>App para cada alumno</span></div>
              <div className="lp-price-feat"><span className="lp-pc">✓</span><span>Rutinas y planes</span></div>
              <div className="lp-price-feat"><span className="lp-pc">✓</span><span>Cobros (comisión 8%)</span></div>
              <div className="lp-price-feat"><span className="lp-pc lp-pc--off">—</span><span className="lp-pc-muted">Branding propio</span></div>
              <a
                href="/register/admin"
                className="lp-price-cta lp-price-cta--free"
                onClick={() => track('cta_click', { location: 'pricing_free' })}
              >
                Empezar gratis
              </a>
            </div>

            <div className="lp-price-card lp-price-card--pro">
              <div className="lp-price-popular">Más elegido</div>
              <div className="lp-price-label">Pro</div>
              <div className="lp-price-n">$25.000</div>
              <div className="lp-price-period">ARS / mes</div>
              <div className="lp-price-feat"><span className="lp-pc">✓</span><span><strong>Alumnos ilimitados</strong></span></div>
              <div className="lp-price-feat"><span className="lp-pc">✓</span><span>App con tu logo y colores</span></div>
              <div className="lp-price-feat"><span className="lp-pc">✓</span><span>Nombre de marca propio</span></div>
              <div className="lp-price-feat"><span className="lp-pc">✓</span><span>Cobros (comisión 5%)</span></div>
              <div className="lp-price-feat"><span className="lp-pc">✓</span><span>Soporte prioritario</span></div>
              <a
                href="/register/admin?plan=pro"
                className="lp-price-cta lp-price-cta--pro"
                onClick={() => track('cta_click', { location: 'pricing_pro' })}
              >
                Activar Pro →
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="lp-final">
        <div className="lp-final-l">
          <h2 className="lp-final-h">
            MENOS GESTIÓN.<br />
            <span>MÁS ENTRENAMIENTO.</span>
          </h2>
        </div>
        <div className="lp-final-r">
          <p className="lp-final-sub">
            En 10 minutos tenés tu primer alumno adentro y su primer plan asignado.
          </p>
          <a
            href="/register/admin"
            className="lp-btn-primary"
            onClick={() => track('cta_click', { location: 'final_cta' })}
          >
            Empezá a simplificar tu gestión →
          </a>
          <div className="lp-note lp-note--right">
            Gratis · Sin tarjeta · Sin contrato
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <a
          href="https://kairoinc.lat/"
          target="_blank"
          rel="noopener"
          className="lp-footer-link"
        >
          Built by <strong>KAIRO</strong> · Make it simple — 2026
        </a>
      </footer>

    </div>
  )
}
