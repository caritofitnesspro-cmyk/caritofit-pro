// app/page.tsx
// Página raíz: redirige al dashboard si está logueado, o al login
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Ver si es admin o alumno
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfil?.rol === 'admin') redirect('/admin')
  else redirect('/dashboard')
}
