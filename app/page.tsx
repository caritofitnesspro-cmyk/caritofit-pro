// @ts-nocheck
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', user.id)
        .single()
      if (perfil?.rol === 'admin') router.push('/admin')
      else router.push('/dashboard')
    }
    checkSession()
  }, [])

  return (
    <>
      <style>{`
        :root {
          --bg: #0c0c0c;
          --surface: #141414;
          --surface2: #1c1c1c;
          --border: #282828;
          --text: #f0ede8;
          --muted: #7a7670;
          --accent: #5B8CFF;
          --accent-dim: #4A74D9;
          --white: #f8f5f0;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          line-height: 1.6;
          overflow-x: hidden;
        }
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 20px 48px;
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid transparent;
          transition: background 0.3s, border-color 0.3s;
        }
        nav.scrolled { background: rgba(12,12,12,0.92); border-color: var(--border); backdrop-filter: blur(12px); }
        .nav-logo { font-family: 'Instrument Serif', serif; font-size: 22px; letter-spacing: 0.08em; color: var(--white); }
        .nav-logo span { color: var(--accent); }
        .nav-cta { background: var(--accent); color: #fff; font-size: 13px; font-weight: 600; padding: 10px 22px; border-radius: 100px; text-decoration: none; letter-spacing: 0.02em; transition: background 0.2s, transform 0.15s; }
        .nav-cta:hover { background: var(--accent-dim); transform: translateY(-1px); }
        .hero { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 120px 48px 80px; position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; top: -200px; right: -200px; width: 700px; height: 700px; background: radial-gradient(circle, rgba(91,140,255,0.09) 0%, transparent 65%); pointer-events: none; }
        .hero-eyebrow { font-size: 12px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); margin-bottom: 32px; opacity: 0; animation: fadeUp 0.6s 0.2s forwards; }
        .hero h1 { font-family: 'Instrument Serif', serif; font-size: clamp(52px, 7vw, 96px); line-height: 1.0; color: var(--white); max-width: 820px; margin-bottom: 28px; opacity: 0; animation: fadeUp 0.7s 0.35s forwards; }
        .hero h1 em { font-style: italic; color: var(--accent); }
        .hero-sub { font-size: 18px; font-weight: 300; color: var(--muted); max-width: 500px; margin-bottom: 48px; opacity: 0; animation: fadeUp 0.7s 0.5s forwards; }
        .hero-sub strong { color: var(--text); font-weight: 500; }
        .hero-actions { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; opacity: 0; animation: fadeUp 0.7s 0.65s forwards; }
        .btn-primary { background: var(--accent); color: #fff; font-size: 15px; font-weight: 600; padding: 16px 36px; border-radius: 100px; text-decoration: none; transition: background 0.2s, transform 0.15s, box-shadow 0.2s; display: inline-block; }
        .btn-primary:hover { background: var(--accent-dim); transform: translateY(-2px); box-shadow: 0 12px 40px rgba(91,140,255,0.25); }
        .hero-note { font-size: 13px; color: var(--muted); }
        .hero-scroll { position: absolute; bottom: 40px; left: 48px; display: flex; align-items: center; gap: 10px; font-size: 12px; letter-spacing: 0.1em; color: var(--muted); opacity: 0; animation: fadeUp 0.7s 1s forwards; }
        .scroll-line { width: 40px; height: 1px; background: var(--muted); }
        section { padding: 100px 48px; }
        .section-label { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; font-weight: 500; }
        .section-title { font-family: 'Instrument Serif', serif; font-size: clamp(36px, 4.5vw, 60px); line-height: 1.1; color: var(--white); margin-bottom: 20px; }
        .section-title em { font-style: italic; color: var(--accent); }
        .section-sub { font-size: 17px; color: var(--muted); max-width: 480px; font-weight: 300; }
        .problems { background: var(--bg); }
        .problems-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 72px; align-items: start; }
        .problems-intro { max-width: 420px; }
        .problem-list { display: flex; flex-direction: column; gap: 0; }
        .problem-item { padding: 28px 0; border-top: 1px solid var(--border); display: flex; gap: 24px; align-items: flex-start; transition: padding-left 0.3s; }
        .problem-item:last-child { border-bottom: 1px solid var(--border); }
        .problem-item:hover { padding-left: 8px; }
        .problem-num { font-size: 12px; color: var(--muted); font-weight: 500; letter-spacing: 0.1em; padding-top: 4px; min-width: 24px; }
        .problem-content h3 { font-size: 17px; font-weight: 500; color: var(--white); margin-bottom: 6px; }
        .problem-content p { font-size: 14px; color: var(--muted); line-height: 1.6; }
        .solution { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .solution-header { max-width: 600px; margin-bottom: 72px; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .feature-card { background: var(--bg); padding: 48px 36px; position: relative; overflow: hidden; transition: background 0.3s; }
        .feature-card:hover { background: var(--surface2); }
        .feature-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--accent); transform: scaleX(0); transform-origin: left; transition: transform 0.4s; }
        .feature-card:hover::before { transform: scaleX(1); }
        .feature-icon { width: 44px; height: 44px; border: 1px solid var(--border); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 28px; font-size: 18px; }
        .feature-card h3 { font-family: 'Instrument Serif', serif; font-size: 24px; color: var(--white); margin-bottom: 12px; line-height: 1.2; }
        .feature-card p { font-size: 14px; color: var(--muted); line-height: 1.7; }
        .feature-tag { display: inline-block; margin-top: 20px; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); font-weight: 500; }
        .plan { background: var(--bg); }
        .plan-header { margin-bottom: 72px; }
        .weeks-track { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
        .week-card { background: var(--surface); border: 1px solid var(--border); padding: 36px 28px; transition: border-color 0.3s, transform 0.3s; }
        .week-card:hover { border-color: var(--accent); transform: translateY(-4px); }
        .week-card.highlight { background: var(--surface2); border-color: var(--accent); }
        .week-badge { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); font-weight: 500; margin-bottom: 16px; }
        .week-card h3 { font-family: 'Instrument Serif', serif; font-size: 22px; color: var(--white); margin-bottom: 16px; line-height: 1.2; }
        .week-tasks { list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .week-tasks li { font-size: 13px; color: var(--muted); display: flex; gap: 10px; align-items: flex-start; }
        .week-tasks li::before { content: '→'; color: var(--accent); flex-shrink: 0; margin-top: 1px; }
        .success-banner { margin-top: 48px; background: linear-gradient(135deg, rgba(200,240,96,0.1), rgba(200,240,96,0.04)); border: 1px solid rgba(200,240,96,0.3); border-radius: 16px; padding: 36px 48px; display: flex; align-items: center; gap: 24px; }
        .success-icon { font-size: 28px; flex-shrink: 0; }
        .success-text h4 { font-family: 'Instrument Serif', serif; font-size: 22px; color: var(--accent); margin-bottom: 6px; }
        .success-text p { font-size: 14px; color: var(--muted); }
        .pricing { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .pricing-header { text-align: center; margin-bottom: 72px; }
        .pricing-header .section-sub { margin: 0 auto; }
        .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; max-width: 860px; margin: 0 auto; }
        .price-card { background: var(--bg); padding: 52px 44px; position: relative; border: 1px solid var(--border); transition: border-color 0.3s; }
        .price-card:hover { border-color: rgba(200,240,96,0.3); }
        .price-card.pro { background: var(--surface2); border-color: var(--accent); }
        .price-card-label { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); font-weight: 500; margin-bottom: 24px; }
        .price-card.pro .price-card-label { color: var(--accent); }
        .price-amount { display: flex; align-items: baseline; gap: 6px; margin-bottom: 8px; }
        .price-amount .currency { font-size: 20px; color: var(--muted); font-weight: 300; }
        .price-amount .number { font-family: 'Instrument Serif', serif; font-size: 64px; line-height: 1; color: var(--white); }
        .price-amount .period { font-size: 14px; color: var(--muted); }
        .price-desc { font-size: 14px; color: var(--muted); margin-bottom: 40px; }
        .price-features { list-style: none; display: flex; flex-direction: column; gap: 14px; margin-bottom: 44px; }
        .price-features li { font-size: 14px; color: var(--text); display: flex; gap: 12px; align-items: flex-start; }
        .price-features li .check { color: var(--accent); font-size: 13px; flex-shrink: 0; padding-top: 2px; }
        .price-features li .check.muted { color: var(--muted); }
        .price-features li span.muted { color: var(--muted); }
        .pro-badge { position: absolute; top: 24px; right: 24px; font-size: 10px; font-weight: 600; letter-spacing: 0.15em; color: var(--accent); border: 1px solid var(--accent); padding: 4px 10px; border-radius: 100px; }
        .btn-outline { display: block; border: 1px solid var(--border); color: var(--text); text-align: center; padding: 14px 28px; border-radius: 100px; text-decoration: none; font-size: 14px; font-weight: 500; transition: border-color 0.2s, background 0.2s; }
        .btn-outline:hover { border-color: var(--accent); background: rgba(91,140,255,0.06); }
        .btn-pro { display: block; background: var(--accent); color: #fff; text-align: center; padding: 14px 28px; border-radius: 100px; text-decoration: none; font-size: 14px; font-weight: 600; transition: background 0.2s, transform 0.15s; }
        .btn-pro:hover { background: var(--accent-dim); transform: translateY(-1px); }
        .screens { background: var(--surface); border-top: 1px solid var(--border); }
        .screens-header { margin-bottom: 72px; }
        .screens-grid { display: flex; flex-direction: column; gap: 80px; }
        .screen-item { display: flex; flex-direction: column; gap: 16px; }
        .screen-label { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); font-weight: 500; }
        .screen-mock { border: 1px solid var(--border); border-radius: 16px; overflow: hidden; background: var(--bg); max-width: 780px; }
        .login-mock { aspect-ratio: 16/10; display: flex; align-items: center; justify-content: center; background: #F5F2EE; border-color: #e0dbd4; }
        .lm-inner { width: 200px; background: white; border-radius: 14px; padding: 18px 16px; box-shadow: 0 4px 20px rgba(0,0,0,.08); border: 1px solid #e8e2da; }
        .lm-logo { display: flex; justify-content: center; margin-bottom: 8px; }
        .lm-logo-icon { width: 32px; height: 32px; background: #7D0531; border-radius: 8px; color: white; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; font-family: 'Instrument Serif', serif; }
        .lm-brand { text-align: center; font-size: 11px; font-weight: 700; color: #1C1714; font-family: 'Instrument Serif', serif; }
        .lm-sub { text-align: center; font-size: 7px; color: #9E9188; margin-bottom: 10px; }
        .lm-tabs { display: flex; background: #F0EBE5; border-radius: 8px; padding: 3px; gap: 3px; margin-bottom: 10px; }
        .lm-tab { flex: 1; font-size: 7px; font-weight: 500; padding: 5px 4px; border-radius: 5px; text-align: center; color: #7A7068; }
        .lm-tab.active { background: #7D0531; color: white; }
        .lm-field-label { font-size: 6.5px; font-weight: 600; color: #6B6259; letter-spacing: .07em; text-transform: uppercase; margin-bottom: 3px; }
        .lm-input { border: 1px solid #D8D0C8; border-radius: 6px; padding: 5px 8px; font-size: 8px; color: #BDB5AD; margin-bottom: 8px; }
        .lm-input.pw { letter-spacing: 2px; }
        .lm-btn { background: #7D0531; color: white; border-radius: 7px; padding: 7px; text-align: center; font-size: 8px; font-weight: 600; }
        .lm-register { text-align: center; font-size: 7px; color: #9E9188; margin-top: 8px; }
        .dash-mock { aspect-ratio: 16/9; display: flex; background: #F5F2EE; border-color: #e0dbd4; }
        .dm-sidebar { width: 110px; background: white; border-right: 1px solid #E6E0DA; padding: 12px 10px; flex-shrink: 0; display: flex; flex-direction: column; gap: 3px; }
        .dm-sidebar-brand { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #F0EBE5; }
        .dm-brand-icon { width: 22px; height: 22px; background: #7D0531; border-radius: 6px; color: white; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; font-family: 'Instrument Serif', serif; flex-shrink: 0; }
        .dm-brand-name { font-size: 8px; font-weight: 700; color: #1C1714; line-height: 1.2; }
        .dm-brand-role { font-size: 5.5px; color: #9E9188; letter-spacing: 0.05em; }
        .dm-nav-label { font-size: 6px; font-weight: 600; color: #BDB5AD; letter-spacing: .1em; text-transform: uppercase; padding: 6px 6px 2px; }
        .dm-nav-item { font-size: 8px; color: #7A7068; padding: 5px 8px; border-radius: 6px; }
        .dm-nav-item.active { background: #7D053110; color: #7D0531; font-weight: 600; }
        .dm-main { flex: 1; padding: 14px 16px; overflow: hidden; }
        .dm-eyebrow { font-size: 6.5px; letter-spacing: .15em; color: #BDB5AD; text-transform: uppercase; margin-bottom: 2px; }
        .dm-greeting { font-size: 14px; font-weight: 700; color: #1C1714; margin-bottom: 12px; font-family: 'Instrument Serif', serif; }
        .dm-stats { display: flex; gap: 8px; margin-bottom: 14px; }
        .dm-stat { background: white; border: 1px solid #E6E0DA; border-radius: 8px; padding: 8px 10px; flex: 1; }
        .dm-stat-n { display: block; font-size: 16px; font-weight: 700; color: #1C1714; line-height: 1; }
        .dm-stat-l { font-size: 6px; color: #9E9188; letter-spacing: .08em; text-transform: uppercase; }
        .dm-section-title { font-size: 9px; font-weight: 600; color: #6B6259; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
        .dm-ver-todos { color: #7D0531; font-size: 7px; }
        .dm-student { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid #F5F2EE; }
        .dm-ava { width: 22px; height: 22px; border-radius: 50%; background: #5B8CFF; color: white; font-size: 7px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .dm-sinfo { flex: 1; min-width: 0; }
        .dm-sname { font-size: 9px; font-weight: 600; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dm-sgoal { font-size: 7px; color: #999; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dm-badge { font-size: 7px; padding: 2px 6px; border-radius: 100px; font-weight: 600; flex-shrink: 0; }
        .dm-badge.green { background: #e6f9ee; color: #1a7f4b; }
        .dm-badge.yellow { background: #fff3cd; color: #856404; }
        .brand-mock { aspect-ratio: 16/10; background: #f5f2ee; border-color: #e0dbd4; overflow-y: auto; }
        .bm-inner { padding: 16px 18px; }
        .bm-back { font-size: 9px; color: #666; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; border: 1px solid #ddd; background: white; padding: 4px 10px; border-radius: 100px; }
        .bm-title { font-size: 14px; font-weight: 700; color: #5B8CFF; font-family: 'Instrument Serif', serif; }
        .bm-subtitle { font-size: 8px; color: #888; margin-bottom: 10px; }
        .bm-row { display: flex; gap: 14px; }
        .bm-col { flex: 1.2; display: flex; flex-direction: column; }
        .bm-field-label { font-size: 8px; font-weight: 600; letter-spacing: 0.08em; color: #888; margin-bottom: 4px; }
        .bm-input { border: 1px solid #ddd; border-radius: 6px; padding: 6px 9px; font-size: 9px; color: #333; background: white; margin-bottom: 2px; }
        .bm-logo-row { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
        .bm-logo-prev { width: 28px; height: 28px; background: #5B8CFF; border-radius: 7px; color: white; font-weight: 700; font-size: 12px; display: flex; align-items: center; justify-content: center; font-family: 'Instrument Serif', serif; }
        .bm-change-btn { background: #5B8CFF; color: white; font-size: 8px; padding: 5px 10px; border-radius: 6px; font-weight: 600; }
        .bm-colors { display: flex; gap: 10px; margin-top: 2px; }
        .bm-color-label { font-size: 7px; color: #888; margin-bottom: 3px; }
        .bm-color-row { display: flex; align-items: center; gap: 5px; }
        .bm-swatch { width: 16px; height: 16px; border-radius: 4px; flex-shrink: 0; }
        .bm-hex { font-size: 8px; color: #444; border: 1px solid #ddd; background: white; padding: 2px 6px; border-radius: 4px; }
        .bm-preview { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .bm-preview-label { font-size: 7px; letter-spacing: 0.1em; color: #888; font-weight: 600; }
        .bm-preview-card { background: #5B8CFF; border-radius: 8px; padding: 10px; }
        .bm-preview-sidebar { display: flex; flex-direction: column; gap: 4px; }
        .bm-ps-brand { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
        .bm-ps-icon { width: 20px; height: 20px; background: rgba(255,255,255,0.25); border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: white; font-family: 'Instrument Serif', serif; flex-shrink: 0; }
        .bm-ps-name { font-size: 8px; font-weight: 700; color: white; line-height: 1.2; }
        .bm-ps-role { font-size: 6px; color: rgba(255,255,255,0.5); letter-spacing: 0.05em; }
        .bm-ps-item { font-size: 8px; color: rgba(255,255,255,0.7); padding: 4px 6px; border-radius: 4px; }
        .bm-ps-item.active { background: rgba(255,255,255,0.18); color: white; font-weight: 600; }
        .bm-preview-ui { background: white; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 5px; }
        .bm-ui-label { font-size: 7px; letter-spacing: 0.1em; color: #999; margin-bottom: 2px; }
        .bm-btn-primary { background: #5B8CFF; color: white; font-size: 8px; font-weight: 600; padding: 5px 10px; border-radius: 5px; text-align: center; }
        .bm-btn-secondary { border: 1px solid #5B8CFF; color: #5B8CFF; font-size: 8px; font-weight: 600; padding: 5px 10px; border-radius: 5px; text-align: center; }
        .bm-badges { display: flex; gap: 5px; }
        .bm-badge-a { background: rgba(91,140,255,0.15); color: #5B8CFF; font-size: 7px; padding: 2px 7px; border-radius: 100px; font-weight: 600; }
        .bm-badge-s { background: #f0f0f0; color: #888; font-size: 7px; padding: 2px 7px; border-radius: 100px; }
        .bm-save { width: 100%; background: #5B8CFF; color: white; border-radius: 7px; padding: 9px; text-align: center; font-size: 9px; font-weight: 600; margin-top: 10px; }
        footer { padding: 80px 48px 48px; text-align: center; border-top: 1px solid var(--border); }
        .footer-logo { font-family: 'Instrument Serif', serif; font-size: 28px; color: var(--white); letter-spacing: 0.1em; margin-bottom: 12px; }
        .footer-quote { font-size: 14px; color: var(--muted); font-style: italic; margin-bottom: 40px; }
        .footer-divider { width: 40px; height: 1px; background: var(--border); margin: 0 auto 24px; }
        .footer-kairo { font-size: 13px; color: var(--muted); margin-bottom: 28px; }
        .footer-links { display: flex; justify-content: center; gap: 32px; }
        .footer-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color 0.2s; }
        .footer-links a:hover { color: var(--text); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.7s, transform 0.7s; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        @media (max-width: 900px) {
          nav { padding: 20px 24px; }
          section { padding: 72px 24px; }
          .hero { padding: 100px 24px 60px; }
          .problems-grid { grid-template-columns: 1fr; gap: 48px; }
          .features-grid { grid-template-columns: 1fr; }
          .weeks-track { grid-template-columns: 1fr 1fr; }
          .pricing-grid { grid-template-columns: 1fr; }
          .hero-scroll { display: none; }
          .success-banner { flex-direction: column; text-align: center; padding: 28px 24px; }
          footer { padding: 60px 24px 40px; }
        }
        @media (max-width: 560px) { .weeks-track { grid-template-columns: 1fr; } }
      `}</style>

      <nav id="navbar">
        <div className="nav-logo">PULSE<span>.</span></div>
        <a href="/register/admin" className="nav-cta">Empezar gratis</a>
      </nav>

      <section className="hero">
        <div className="hero-eyebrow">Para entrenadores personales</div>
        <h1>Entrená.<br /><em>No administres.</em></h1>
        <p className="hero-sub">Pulse ordena tus alumnos, rutinas y cobros <strong>en un solo lugar</strong>. Para que tu energía vuelva donde tiene que estar.</p>
        <div className="hero-actions">
          <a href="/register/admin" className="btn-primary">Empezar gratis (3 alumnos incluidos)</a>
          <span className="hero-note">Sin tarjeta. Sin compromiso.</span>
        </div>
        <div className="hero-scroll"><div className="scroll-line"></div><span>SCROLL</span></div>
      </section>

      <section className="problems">
        <div className="problems-grid">
          <div className="problems-intro reveal">
            <div className="section-label">El problema</div>
            <h2 className="section-title">¿Te suena <em>familiar</em>?</h2>
            <p className="section-sub">No sos desorganizado. Es que nadie te dio una herramienta que encaje con tu forma de trabajar.</p>
          </div>
          <div className="problem-list">
            {[
              { n: '01', h: 'El caos del PDF y el Excel', p: 'Cada alumno tiene su rutina en un archivo distinto. Cambiar un ejercicio significa editar cinco documentos. Mandás el PDF equivocado y arrancás a disculparte por WhatsApp.' },
              { n: '02', h: 'Mensajes perdidos en el chat', p: 'La consulta de Martina quedó enterrada entre memes y el pedido de turno de Juan. Respondés tarde, te sentís mal, perdés la imagen profesional que tanto te costó construir.' },
              { n: '03', h: 'No sabés quién pagó ni cuándo', p: '¿Sofía abonó este mes? ¿Carlos debe dos? Cobrás con vergüenza porque nunca tenés los números claros. O peor: no cobrás.' },
            ].map(({ n, h, p }) => (
              <div key={n} className="problem-item reveal">
                <span className="problem-num">{n}</span>
                <div className="problem-content"><h3>{h}</h3><p>{p}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="solution">
        <div className="solution-header reveal">
          <div className="section-label">La solución</div>
          <h2 className="section-title">Tres herramientas.<br /><em>Un solo lugar.</em></h2>
          <p className="section-sub">Diseñadas para que en diez minutos ya estés trabajando, no configurando.</p>
        </div>
        <div className="features-grid">
          {[
            { icon: '⚡', h: 'Constructor de Rutinas', p: 'Armá, duplicá y editá rutinas en minutos. Visual, sin tecnicismos, sin Excel. Asignás a un alumno con un clic y él la ve al instante en su app.', tag: 'Rápido y visual' },
            { icon: '◎', h: 'Gestión de Alumnos', p: 'Ficha completa de cada alumno: rutina activa, historial, notas, estado de pago. Todo en un solo lugar. Nada en WhatsApp, nada en papel, nada en tu cabeza.', tag: 'Todo centralizado' },
            { icon: '◻', h: 'App para el Alumno', p: 'Tu alumno ve su rutina del día, marca series y deja comentarios. Vos ves el progreso en tiempo real. Una experiencia limpia que te diferencia de cualquier colega.', tag: 'Imagen profesional' },
          ].map(({ icon, h, p, tag }) => (
            <div key={h} className="feature-card reveal">
              <div className="feature-icon">{icon}</div>
              <h3>{h}</h3>
              <p>{p}</p>
              <span className="feature-tag">{tag}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="screens">
        <div className="screens-header reveal">
          <div className="section-label">El producto</div>
          <h2 className="section-title">Así se ve<br /><em>por dentro.</em></h2>
          <p className="section-sub">Sin curva de aprendizaje. Lo que necesitás, donde lo esperás.</p>
        </div>
        <div className="screens-grid">
          <div className="screen-item reveal">
            <div className="screen-label">Acceso del alumno</div>
            <div className="screen-mock login-mock">
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
          <div className="screen-item reveal">
            <div className="screen-label">Vista del entrenador</div>
            <div className="screen-mock dash-mock">
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
                <div className="dm-student"><div className="dm-ava">LR</div><div className="dm-sinfo"><div className="dm-sname">Laura Rodríguez</div><div className="dm-sgoal">Tonificación, Salud general</div></div><div className="dm-badge green">✓ Plan</div></div>
                <div className="dm-student"><div className="dm-ava">MP</div><div className="dm-sinfo"><div className="dm-sname">Martín Pérez</div><div className="dm-sgoal">Ganar músculo, Fuerza</div></div><div className="dm-badge green">✓ Plan</div></div>
                <div className="dm-student"><div className="dm-ava">VA</div><div className="dm-sinfo"><div className="dm-sname">Valeria Acosta</div><div className="dm-sgoal">Rehabilitación, Movilidad</div></div><div className="dm-badge yellow">Sin plan</div></div>
              </div>
            </div>
          </div>
          <div className="screen-item reveal">
            <div className="screen-label">Personalización de marca</div>
            <div className="screen-mock brand-mock">
              <div className="bm-inner">
                <div className="bm-back">← Volver</div>
                <div className="bm-title">Personalizar marca</div>
                <div className="bm-subtitle">Configurá cómo se ve tu app para vos y tus alumnos</div>
                <div className="bm-row">
                  <div className="bm-col">
                    <div className="bm-field-label">NOMBRE DE MARCA</div>
                    <div className="bm-input">Mi Entrenador</div>
                    <div className="bm-field-label" style={{marginTop:'10px'}}>LOGO / IMAGEN DE MARCA</div>
                    <div className="bm-logo-row"><div className="bm-logo-prev">P</div><div className="bm-change-btn">🖼 Cambiar imagen</div></div>
                    <div className="bm-field-label" style={{marginTop:'10px'}}>COLORES</div>
                    <div className="bm-colors">
                      <div><div className="bm-color-label">Color principal</div><div className="bm-color-row"><div className="bm-swatch" style={{background:'#5B8CFF'}}></div><div className="bm-hex">#5B8CFF</div></div></div>
                      <div><div className="bm-color-label">Color secundario</div><div className="bm-color-row"><div className="bm-swatch" style={{background:'#4A74D9'}}></div><div className="bm-hex">#4A74D9</div></div></div>
                    </div>
                  </div>
                  <div className="bm-preview">
                    <div className="bm-preview-label">VISTA PREVIA</div>
                    <div className="bm-preview-card">
                      <div className="bm-preview-sidebar">
                        <div className="bm-ps-brand"><div className="bm-ps-icon">P</div><div><div className="bm-ps-name">Mi Entrenador</div><div className="bm-ps-role">PANEL</div></div></div>
                        <div className="bm-ps-item active">Dashboard</div>
                        <div className="bm-ps-item">Alumnos/as</div>
                        <div className="bm-ps-item">Planes</div>
                      </div>
                    </div>
                    <div className="bm-preview-ui">
                      <div className="bm-ui-label">ELEMENTOS DE UI</div>
                      <div className="bm-btn-primary">Botón principal</div>
                      <div className="bm-btn-secondary">Botón secundario</div>
                      <div className="bm-badges"><span className="bm-badge-a">Badge activo</span><span className="bm-badge-s">Badge sec.</span></div>
                    </div>
                  </div>
                </div>
                <div className="bm-save">💾 Guardar configuración</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="plan">
        <div className="plan-header reveal">
          <div className="section-label">El plan de 30 días</div>
          <h2 className="section-title">De cero a<br /><em>100% digital.</em></h2>
          <p className="section-sub">Sin curva de aprendizaje empinada. Un paso a la vez.</p>
        </div>
        <div className="weeks-track">
          {[
            { week: 'Semana 1', title: 'Base digital', tasks: ['Creás tu cuenta y configurás tu perfil', 'Cargás tus primeros 3 alumnos', 'Armás tu primera rutina en Pulse'] },
            { week: 'Semana 2', title: 'Todo adentro', tasks: ['Migrás todos tus alumnos activos', 'Reemplazás los PDFs por rutinas digitales', 'Dejás de mandar archivos por WhatsApp'] },
            { week: 'Semana 3', title: 'Sin fricciones', tasks: ['Tus alumnos usan la app sin que los ayudes', 'Ves el progreso en tiempo real', 'Cobrás con datos claros frente a vos'] },
            { week: 'Semana 4', title: 'Operación limpia', tasks: ['Gestión 100% digital, cero papel', 'Marca personal coherente y profesional', 'Tiempo recuperado para entrenar más alumnos'], highlight: true },
          ].map(({ week, title, tasks, highlight }) => (
            <div key={week} className={`week-card reveal${highlight ? ' highlight' : ''}`}>
              <div className="week-badge">{week}</div>
              <h3>{title}</h3>
              <ul className="week-tasks">{tasks.map(t => <li key={t}>{t}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="success-banner reveal">
          <div className="success-icon">✦</div>
          <div className="success-text">
            <h4>Señal de éxito al día 30</h4>
            <p>Tu operación es 100% digital. Tus alumnos tienen una app con tu imagen. Vos sabés exactamente quién entrenó, qué hizo y quién pagó. Sin hojas de cálculo, sin caos.</p>
          </div>
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="pricing-header reveal">
          <div className="section-label">Planes</div>
          <h2 className="section-title">Empezá gratis.<br /><em>Crecé cuando estés listo.</em></h2>
          <p className="section-sub">Sin contratos. Sin letras chicas. Sin sorpresas.</p>
        </div>
        <div className="pricing-grid">
          <div className="price-card reveal">
            <div className="price-card-label">Plan Free</div>
            <div className="price-amount"><span className="currency">$</span><span className="number">0</span><span className="period">/ siempre</span></div>
            <p className="price-desc">Para arrancar y ver si Pulse es para vos.</p>
            <ul className="price-features">
              <li><span className="check">✓</span><span>Hasta <strong>3 alumnos</strong></span></li>
              <li><span className="check">✓</span><span>Constructor de rutinas básico</span></li>
              <li><span className="check">✓</span><span>Ficha de cada alumno</span></li>
              <li><span className="check">✓</span><span>App para el alumno (marca Pulse)</span></li>
              <li><span className="check">✓</span><span>Sin vencimiento</span></li>
              <li><span className="check muted">—</span><span className="muted">Personalización de marca</span></li>
              <li><span className="check muted">—</span><span className="muted">Soporte prioritario</span></li>
            </ul>
            <a href="/register/admin" className="btn-outline">Empezar gratis</a>
          </div>
          <div className="price-card pro reveal">
            <div className="pro-badge">MÁS ELEGIDO</div>
            <div className="price-card-label">Plan Pro</div>
            <div className="price-amount"><span className="currency">$</span><span className="number">9.990</span><span className="period">/ mes</span></div>
            <p className="price-desc">Para quien ya decidió que su negocio es serio.</p>
            <ul className="price-features">
              <li><span className="check">✓</span><span><strong>Alumnos ilimitados</strong></span></li>
              <li><span className="check">✓</span><span>Constructor de rutinas completo</span></li>
              <li><span className="check">✓</span><span>Gestión de pagos y estado de cuenta</span></li>
              <li><span className="check">✓</span><span>App para el alumno con <strong>tu marca</strong></span></li>
              <li><span className="check">✓</span><span>Logo y colores propios</span></li>
              <li><span className="check">✓</span><span>Soporte prioritario</span></li>
            </ul>
            <a href="/register/admin?plan=pro" className="btn-pro">Empezar con Pro</a>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-logo">PULSE</div>
        <p className="footer-quote">"La constancia necesita claridad."</p>
        <div className="footer-divider"></div>
        <p className="footer-kairo">Un producto de <strong>KAIRO</strong> — <em>Make it simple.</em></p>
        <div className="footer-links">
          <a href="/terminos">Términos</a>
          <a href="/privacidad">Privacidad</a>
          <a href="mailto:hola@getpulseapp.lat">Contacto</a>
        </div>
      </footer>

      <script dangerouslySetInnerHTML={{ __html: `
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
          navbar.classList.toggle('scrolled', window.scrollY > 40);
        });
        const reveals = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
              setTimeout(() => entry.target.classList.add('visible'), i * 80);
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12 });
        reveals.forEach(el => observer.observe(el));
      `}} />
    </>
  )
}
