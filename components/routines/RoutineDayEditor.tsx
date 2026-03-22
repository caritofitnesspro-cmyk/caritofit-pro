// components/routines/RoutineDayEditor.tsx
'use client'

import { useEffect } from 'react'
import { useRoutineBlocks } from '@/hooks/useRoutineBlocks'
import { RoutineBlockCard } from './RoutineBlockCard'
import { supabase } from '@/lib/supabase'
import type { Ejercicio } from '@/types/routines'

interface Props {
  diaId: string
  diaNombre: string
  diaNumero: number
  onAgregarEjercicio: (bloqueId: string, diaId: string) => void
}

export function RoutineDayEditor({ diaId, diaNombre, diaNumero, onAgregarEjercicio }: Props) {
  const {
    bloques, loading, error,
    load, agregarBloque, actualizarBloque, eliminarBloque, duplicarBloque, moverBloque
  } = useRoutineBlocks(diaId)

  useEffect(() => {
    load()
  }, [load])

  const handleUpdateEjercicio = async (ejercicioId: string, data: Partial<Ejercicio>) => {
    await supabase.from('ejercicios').update(data).eq('id', ejercicioId)
    await load()
  }

  const handleDeleteEjercicio = async (ejercicioId: string) => {
    await supabase.from('ejercicios').delete().eq('id', ejercicioId)
    await load()
  }

  const handleMoverEjercicio = async (
    bloqueId: string,
    ejercicioId: string,
    direccion: 'up' | 'down'
  ) => {
    const bloque = bloques.find((b) => b.id === bloqueId)
    if (!bloque?.ejercicios) return

    const ejs = [...bloque.ejercicios]
    const idx = ejs.findIndex((e) => e.id === ejercicioId)
    const newIdx = direccion === 'up' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= ejs.length) return

    ;[ejs[idx], ejs[newIdx]] = [ejs[newIdx], ejs[idx]]

    for (let i = 0; i < ejs.length; i++) {
      await supabase
        .from('ejercicios')
        .update({ orden: i })
        .eq('id', ejs[i].id)
    }

    await load()
  }

  return (
    <section className="space-y-4">

      {/* Header del día */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center
          text-white font-bold text-sm shrink-0">
          {diaNumero}
        </div>
        <h3 className="font-bold text-white text-base">
          {diaNombre || `Día ${diaNumero}`}
        </h3>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-xs bg-red-950/30 border border-red-800 rounded-lg px-3 py-2">
          Error: {error}
        </p>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center text-slate-500 py-8 text-sm">
          Cargando bloques…
        </div>
      ) : (
        <div className="space-y-3">

          {/* Lista de bloques */}
          {bloques.map((bloque, i) => (
            <RoutineBlockCard
              key={bloque.id}
              bloque={bloque}
              index={i}
              total={bloques.length}
              onMoveUp={() => moverBloque(bloque.id, 'up')}
              onMoveDown={() => moverBloque(bloque.id, 'down')}
              onDelete={() => eliminarBloque(bloque.id)}
              onDuplicate={() => duplicarBloque(bloque)}
              onUpdate={(data) => actualizarBloque(bloque.id, data)}
              onAddEjercicio={(bloqueId) => onAgregarEjercicio(bloqueId, diaId)}
              onUpdateEjercicio={handleUpdateEjercicio}
              onDeleteEjercicio={handleDeleteEjercicio}
              onMoveEjercicio={(ejId, dir) => handleMoverEjercicio(bloque.id, ejId, dir)}
            />
          ))}

          {/* Botón agregar bloque */}
          <button
            onClick={() => agregarBloque({
              nombre: `Bloque ${String.fromCharCode(65 + bloques.length)}`,
              tipo: 'normal',
            })}
            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-700
              text-slate-500 text-sm font-medium hover:border-blue-600 hover:text-blue-400
              hover:bg-blue-950/20 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span className="text-lg leading-none">+</span>
            Agregar bloque al Día {diaNumero}
          </button>

        </div>
      )}
    </section>
  )
}
