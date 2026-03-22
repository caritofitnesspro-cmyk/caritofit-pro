// components/routines/RoutineExerciseItem.tsx
'use client'

import { useState } from 'react'
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
  const [editing, setEditing] = useState(false)
  const [series, setSeries] = useState(String(ejercicio.series ?? ''))
  const [reps, setReps] = useState(ejercicio.repeticiones ?? '')
  const [descanso, setDescanso] = useState(String(ejercicio.descanso ?? ''))
  const [carga, setCarga] = useState(ejercicio.carga ?? '')
  const [notas, setNotas] = useState(ejercicio.notas ?? '')

  const handleSave = () => {
    onUpdate({
      series: series ? parseInt(series) : null,
      repeticiones: reps || null,
      descanso: descanso ? parseInt(descanso) : null,
      carga: carga || null,
      notas: notas || null,
    })
    setEditing(false)
  }

  return (
    <div className="flex items-start gap-2 py-2 border-b border-slate-800 last:border-0">
      {/* Ícono de agarre */}
      <span className="mt-1 text-slate-600 text-xs select-none">☰</span>

      <div className="flex-1 min-w-0">
        {/* Nombre y resumen */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-200 text-sm truncate">
            {ejercicio.nombre ?? 'Ejercicio'}
          </span>
          {!editing && (
            <span className="text-slate-500 text-xs">
              {ejercicio.series ? `${ejercicio.series}×` : ''}
              {ejercicio.repeticiones}
              {ejercicio.carga ? ` · ${ejercicio.carga}` : ''}
              {ejercicio.descanso ? ` · ${ejercicio.descanso}″` : ''}
            </span>
          )}
        </div>

        {/* Formulario de edición */}
        {editing && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                Series
              </label>
              <input
                type="number"
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="4"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                Repeticiones
              </label>
              <input
                type="text"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="10 o 30seg"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                Carga
              </label>
              <input
                type="text"
                value={carga}
                onChange={(e) => setCarga(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="20kg o peso corporal"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                Descanso (seg)
              </label>
              <input
                type="number"
                value={descanso}
                onChange={(e) => setDescanso(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="60"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                Notas
              </label>
              <input
                type="text"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="Nota para el alumno..."
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm py-1.5 rounded font-medium transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-3 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm py-1.5 rounded transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex items-center gap-1 shrink-0">
        <div className="flex flex-col gap-0.5">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="w-6 h-6 text-[10px] rounded flex items-center justify-center text-slate-500
              hover:bg-slate-700 hover:text-white disabled:opacity-20 transition-colors"
          >▲</button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="w-6 h-6 text-[10px] rounded flex items-center justify-center text-slate-500
              hover:bg-slate-700 hover:text-white disabled:opacity-20 transition-colors"
          >▼</button>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="w-8 h-8 rounded flex items-center justify-center text-slate-400
            hover:bg-slate-700 hover:text-white transition-colors"
          title="Editar"
        >✎</button>
        <button
          onClick={onDelete}
          className="w-8 h-8 rounded flex items-center justify-center text-slate-500
            hover:bg-red-900/40 hover:text-red-400 transition-colors"
          title="Eliminar"
        >×</button>
      </div>
    </div>
  )
}
