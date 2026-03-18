// @ts-nocheck
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState('alumno')
  const [dni, setDni] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setError('')
    if (!dni || !password) { setError('Completá DNI y contraseña'); return }
    setLoading(true)
    try {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('id, email, rol')
        .eq('dni', dni)
        .single()

      if (!perfil?.email) {
        setError('No existe una cuenta con ese DNI')
        setLoading(false)
        return
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: perfil.email,
        password,
      })

      if (authError) {
        setError('Contraseña incorrecta')
        setLoading(false)
        return
      }

      if (perfil.rol === 'admin') router.push('/admin')
      else router.push('/dashboard')

    } catch {
      setError('Ocurrió un error. Intentá de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#7D0531', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'#faf8f7', borderRadius:'28px', padding:'48px 40px', width:'100%', maxWidth:'420px', boxShadow:'0 24px 80px rgba(0,0,0,.3)' }}>
        <div style={{ textAlign:'center', marginBottom:'36px' }}>
          <div style={{ width:'64px', h
