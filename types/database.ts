// types/database.ts
// Tipos TypeScript que coinciden exactamente con las tablas de Supabase

export type Rol = 'admin' | 'alumno'
export type Nivel = 'Principiante' | 'Intermedio' | 'Avanzado'

export interface Perfil {
  id: string
  rol: Rol
  nombre: string
  apellido: string
  dni: string
  email?: string
  telefono?: string
  edad?: number
  sexo?: string
  objetivo?: string      // campo libre
  nivel?: Nivel
  restricciones?: string
  aprobado: boolean
  created_at: string
}

export interface Plan {
  id: string
  nombre: string
  objetivo: string
  admin_id: string
  created_at: string
  // Relaciones (cuando se hacen joins)
  semanas?: Semana[]
  asignaciones?: Asignacion[]
}

export interface Asignacion {
  id: string
  alumno_id: string
  plan_id: string
  activo: boolean
  created_at: string
  // Relaciones
  plan?: Plan
  alumno?: Perfil
}

export interface Semana {
  id: string
  plan_id: string
  numero: number
  created_at: string
  dias?: Dia[]
}

export interface Dia {
  id: string
  semana_id: string
  dia: string
  tipo?: string
  orden: number
  created_at: string
  ejercicios?: Ejercicio[]
}

export interface Ejercicio {
  id: string
  dia_id: string
  nombre: string
  series: number
  repeticiones: string
  carga?: string
  descanso?: string
  observaciones?: string
  orden: number
  created_at: string
  // Estado local (checkin del día)
  completado?: boolean
}

export interface Checkin {
  id: string
  alumno_id: string
  ejercicio_id: string
  fecha: string
  created_at: string
}

export interface Peso {
  id: string
  alumno_id: string
  valor: number
  fecha: string
  created_at: string
}

// Tipo para la base de datos completa (usado por el cliente de Supabase)
export type Database = {
  public: {
    Tables: {
      perfiles:     { Row: Perfil;    Insert: Omit<Perfil, 'id' | 'created_at'>; Update: Partial<Perfil> }
      planes:       { Row: Plan;      Insert: Omit<Plan, 'id' | 'created_at'>;   Update: Partial<Plan> }
      asignaciones: { Row: Asignacion;Insert: Omit<Asignacion, 'id' | 'created_at'>; Update: Partial<Asignacion> }
      semanas:      { Row: Semana;    Insert: Omit<Semana, 'id' | 'created_at'>; Update: Partial<Semana> }
      dias:         { Row: Dia;       Insert: Omit<Dia, 'id' | 'created_at'>;    Update: Partial<Dia> }
      ejercicios:   { Row: Ejercicio; Insert: Omit<Ejercicio, 'id' | 'created_at'>; Update: Partial<Ejercicio> }
      checkins:     { Row: Checkin;   Insert: Omit<Checkin, 'id' | 'created_at'>; Update: Partial<Checkin> }
      pesos:        { Row: Peso;      Insert: Omit<Peso, 'id' | 'created_at'>;   Update: Partial<Peso> }
    }
  }
}
