// components/routines/RoutineExerciseItem.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import type { Ejercicio } from '@/types/routines'

interface Props {
  ejercicio: Ejercicio
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onUpdate: (data: Partial<Ejercicio>) => void
}

export function RoutineExerciseItem({
  ejercicio, index, total, onMoveUp, onMoveDown, onDelete, onUpdate
}: Props) {
  const isNuevo = ejercicio.nombre === 'Nuevo ejercicio' || !ejercicio.nombre
  const [editing, setEditing] = useState(isNuevo)
  const [nombre, setNombre] = useState(isNuevo ? '' : (ejercicio.nombre ?? ''))
  const [series, setSeries] = useState(String(ejercicio.series ?? ''))
  const [reps, setReps] = useState(ejercicio.repeticiones ?? '')
  const [descanso, setDescanso] = useState(ejercicio.descanso ?? '')
  const [carga, setCarga] = useState(ejercicio.carga ?? '')
  const [notas, setNotas] = useState(ejercicio.observaciones ?? '')
  const nombreRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && nombreRef.current) {
      setTimeout(() => nombreRef.current?.focus(), 50)
    }
  }, [editing])

  const handleSave = () => {
    onUpdate({
      nombre: nombre || 'Ejercicio',
      series: series ? parseInt(series) : null,
      repeticiones: reps || null,
      descanso: descanso || null,  // texto directo, no parseInt
      carga: carga || null,
      observaciones: notas || null,
    })
    setEditing(false)
  }

  const displayNombre = nombre || ejercicio.nombre || 'Ejercicio'

  return (
    <div className="flex items-start gap-2 py-2.5 px-3 border-b border-slate-800/60 last:border-0">
      <span className="mt-1 text-slate-600 text-xs select-none pt-0.5">☰</span>

      <div className="flex-1 min-w-0">
        {!editing && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-200 text-sm truncate">
              {displayNombre}
            </span>
            <span className="text-slate-500 text-xs shrink-0">
              {ejercicio.series ? `${ejercicio.series}×` : ''}
              {ejercicio.repeticiones}
              {ejercicio.carga ? ` · ${ejercicio.carga}` : ''}
              {ejercicio.descanso ? ` · ${ejercicio.descanso}″` : ''}
            </span>
          </div>
        )}

        {editing && (
          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                Nombre del ejercicio
              </label>
              <input
                ref={nombreRef}
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                className="w-full bg-slate-800 border border-green-500/40 rounded-lg px-3 py-2
                  text-sm text-white font-medium placeholder-slate-600
                  focus:outline-none focus:border-green-500/70 focus:ring-1 focus:ring-green-500/20"
                placeholder="Ej: Sentadilla con barra, Press de banca..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Series</label>
                <input
                  type="number"
                  value={series}
                  onChange={(e) => setSeries(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5
                    text-sm text-white focus:outline-none focus:border-slate-500"
                  placeholder="3"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Reps</label>
                <input
                  type="text"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5
                    text-sm text-white focus:outline-none focus:border-slate-500"
                  placeholder="12 o 30seg"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Carga</label>
                <input
                  type="text"
                  value={carga}
                  onChange={(e) => setCarga(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5
                    text-sm text-white focus:outline-none focus:border-slate-500"
                  placeholder="20kg / PC"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Descanso</label>
                <input
                  type="text"
                  value={descanso}
                  onChange={(e) => setDescanso(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5
                    text-sm text-white focus:outline-none focus:border-slate-500"
                  placeholder="60 seg"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Notas</label>
                <input
                  type="text"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5
                    text-sm text-white focus:outline-none focus:border-slate-500"
                  placeholder="Observaciones para el alumno..."
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm py-2
                  rounded-lg font-semibold transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  if (isNuevo) { onDelete(); return }
                  setNombre(ejercicio.nombre ?? '')
                  setEditing(false)
                }}
                className="px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm
                  py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {!editing && (
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex flex-col gap-0.5">
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className="w-6 h-6 text-[10px] rounded flex items-center justify-center
                text-slate-600 hover:bg-slate-700 hover:text-white
                disabled:opacity-20 transition-colors"
            >▲</button>
            <button
              onClick={onMoveDown}
              disabled={index === total - 1}
              className="w-6 h-6 text-[10px] rounded flex items-center justify-center
                text-slate-600 hover:bg-slate-700 hover:text-white
                disabled:opacity-20 transition-colors"
            >▼</button>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="w-8 h-8 rounded flex items-center justify-center
              text-slate-500 hover:bg-slate-700 hover:text-white transition-colors"
            title="Editar"
          >✎</button>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded flex items-center justify-center
              text-slate-600 hover:bg-red-900/40 hover:text-red-400 transition-colors"
            title="Eliminar"
          >×</button>
        </div>
      )}
    </div>
  )
}
