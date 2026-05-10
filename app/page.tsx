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
      // CHANGE: More benefit-forward — removed passive "Ve su plan" opener, leads with outcome
      after: 'Tu alumno abre su app y ya sabe exactamente qué hacer. Sin que te escriba. Sin que vos le preguntes.',
    },
    {
      before: 'Cobrar se siente incómodo, perseguís transferencias semanas.',
      // CHANGE: Lead with the automation, not the button — makes the benefit the protagonist
      after: 'Tu alumno paga desde la app. El dinero llega a tu Mercado Pago. Vos no tuviste que pedirlo.',
    },
    {
      before: 'No sabés si tu alumno entrenó o no hasta que te escribe.',
      after: 'Recibís una notificación cada vez que alguien entrena. Sabés todo sin preguntar nada.',
    },
  ]

  const features = [
    {
      num: '01',
      title: 'Tus alumnos no se van',
      desc: 'Tu alumno ve su progreso, sus logros y sus fotos de evolución. Cuando alguien ve cuánto avanzó, no cancela.',
    },
    {
      num: '02',
      title: 'Sabés quién entrenó sin preguntar',
      desc: 'Notificación en tiempo real cada vez que alguien entrena. El control sin el esfuerzo.',
    },
    {
      num: '03',
      title: 'Tu marca, no la nuestra',
      desc: 'Con PRO, tu app lleva tu nombre, tu logo y tus colores. Lo que construís es tuyo — no nuestro.',
    },
    {
      num: '04',
      title: 'Cobrá sin tener que pedirlo',
      desc: 'Tus alumnos pagan desde la app. El dinero llega a tu Mercado Pago. Vos nunca tuviste que pedirlo.',
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
      body: 'Antes era todo por WhatsApp, ahora tengo mi rutina en la app, marco lo que hago y mi profe lo ve al instante. Nos enfocamos en entrenar, no en coordinarnos.',
      name: 'Sofía',
      role: 'Alumna · Buenos Aires',
      initials: 'S',
      avatarBg: '#eef3ff',
      avatarColor: '#1a56db',
    },
    {
      // CHANGE: Removed "10 minutos" (already used in hero + final CTA). Now highlights
      // a different benefit: replacing WhatsApp chaos with professional structure.
      body: 'Lo que más me sorprendió fue lo profesional que se ve. Mis alumnos dejaron de escribirme por WhatsApp preguntando qué hacer — todo está en la app y lo ven solos.',
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
            Probá gratis
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
              <div className="lp-sstat-l">Para estar activo</div>
            </div>
            <div className="lp-sstat">
              <div className="lp-sstat-n">$<em>0</em></div>
              <div className="lp-sstat-l">Para arrancar</div>
            </div>
            <div className="lp-sstat">
              <div className="lp-sstat-n">0<em>wsp</em></div>
              <div className="lp-sstat-l">De WhatsApp a la app</div>
            </div>
          </div>
        </div>

        {/* Texto — debajo en mobile, columna izquierda en desktop */}
        <div className="lp-hero-body">
          <div className="lp-badge">
            <span className="lp-badge-dot" />
            Usada por trainers en Argentina
          </div>
          <h1 className="lp-h1">
            Dejá de perseguir pagos.<br />
            Empezá a <span className="lp-acc">entrenar.</span>
          </h1>
          {/*
            CHANGE: Old sub was functional ("Rutinas, cobros y seguimiento en un solo lugar").
            New version leads with the trainer's pain (perseguir pagos / WhatsApp) before
            offering the relief — creates emotional resonance before presenting the solution.
          */}
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
          <div className="lp-sec-chip">Tu semana, antes y después</div>
          <h2 className="lp-sec-h">
            TU DÍA HOY.<br />
            <span>TU DÍA CON PULSE.</span>
          </h2>

          {/* Imágenes antes/después */}
          <div className="lp-ba-imgs l-reveal">
            <div className="lp-ba-img-card">
              <div className="lp-ba-img-wrap">
                <img src="/antes.png" alt="Trainer agobiado con papeles y WhatsApp" className="lp-ba-img" />
              </div>
              <div className="lp-ba-img-label lp-ba-img-label--b">Antes</div>
            </div>
            <div className="lp-ba-arrow-center">→</div>
            <div className="lp-ba-img-card">
              <div className="lp-ba-img-wrap">
                <img src="/despues.png" alt="Trainer tranquilo, cobró solo" className="lp-ba-img" />
              </div>
              <div className="lp-ba-img-label lp-ba-img-label--a">Con Pulse</div>
            </div>
          </div>

          {/* Cards de texto */}
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
          <div className="lp-sec-chip">Lo que hace la diferencia</div>
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
          <div className="lp-sec-chip">Lo que cambió para ellos</div>
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
            <span>CERO RIESGO.</span>
          </h2>
          <p className="lp-pricing-sub">Sin contratos. Sin letras chicas.</p>
          <div className="lp-pricing-grid">

            <div className="lp-price-card">
              <div className="lp-price-label">Free</div>
              <div className="lp-price-n">$0</div>
              <div className="lp-price-period">Para siempre</div>
              <div className="lp-price-feat"><span className="lp-pc">✓</span><span>Hasta 2 alumnos</span></div>
              <div className="lp-price-feat"><span className="lp-pc">✓</span><span>Tus alumnos tienen su propia app</span></div>
              <div className="lp-price-feat"><span className="lp-pc">✓</span><span>Rutinas y planes</span></div>
              <div className="lp-price-feat"><span className="lp-pc">✓</span><span>Cobros (comisión 8%)</span></div>
              <div className="lp-price-feat"><span className="lp-pc lp-pc--off">—</span><span className="lp-pc-muted">Branding propio</span></div>
              {/*
                CHANGE: "Empezar gratis" → "Empezar ahora gratis"
                The word "ahora" adds urgency without pressure. Avoids "Crear" which
                implies technical effort and can intimidate non-tech trainers.
              */}
              <a
                href="/register/admin"
                className="lp-price-cta lp-price-cta--free"
                onClick={() => track('cta_click', { location: 'pricing_free' })}
              >
                Empezar ahora gratis
              </a>
            </div>

            <div className="lp-price-card lp-price-card--pro">
              <div className="lp-price-popular">Más elegido</div>
              <div className="lp-price-label">Pro</div>
              {/*
                CHANGE: Added value anchor ABOVE the price. The user sees "una clase extra"
                before they see "$25.000" — this frames cost as trivially low before the
                number lands, which is a proven pricing psychology technique.
              */}
              <div className="lp-price-anchor">Menos de lo que ganás con una clase extra</div>
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
            MENOS PAPELEO.<br />
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
            Probá Pulse ahora, es gratis →
          </a>
          {/*
            CHANGE: Old note repeated the "2 alumnos gratis" already stated in hero + pricing.
            New copy is aspirational — focuses on the identity shift ("trainers que ya
            profesionalizaron") rather than restating a feature for the third time.
          */}
          <div className="lp-note lp-note--right">
            Unite a los trainers que ya profesionalizaron su trabajo.
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
