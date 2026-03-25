// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pulse — Entrená. No administres.',
  description: 'La plataforma para entrenadores personales que quieren operar de forma profesional, simple y escalable.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Fraunces:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='16' fill='%235B8CFF'/><text x='16' y='22' text-anchor='middle' font-family='Georgia,serif' font-size='20' font-weight='700' fill='%23000000'>P</text></svg>"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
