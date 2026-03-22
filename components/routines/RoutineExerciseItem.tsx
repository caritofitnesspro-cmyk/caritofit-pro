// components/routines/RoutineExerciseItem.tsx
'use client'

import { useState } from 'react'
import type { RoutineExercise } from '@/types/routines'

interface Props {
  exercise: RoutineExercise
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onUpdate: (data: Partial<RoutineExercise>) => void
}

export function RoutineExerciseItem({
  exercise, index, total, onMoveUp, onMoveDown, onDelete, onUpdate
}: Props) {
  const [editing, setEditing] = useState(false)
  const [sets, setSets] = useState(String(exercise.sets ?? ''))
  const [reps, setReps] = useState(exercise.reps ?? '')
  const [rest, setRest] = useState(String(exercise.rest ?? ''))
  const [notes, setNotes] = useState(exercise.notes ?? '')

  const handleSave = () => {
    onUpdate({
      sets: sets ? parseInt(sets) : null,
      reps: reps || null,
      rest: rest ? parseInt(rest) : null,
      notes: notes || null,
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
            {exercise.exercise?.name ?? 'Ejercicio'}
          </span>
          {!editing && (
            <span className="text-slate-500 text-xs">
              {exercise.sets ? `${exercise.sets}×` : ''}
              {exercise.reps}
              {exercise.rest ? ` · ${exercise.rest}″` : ''}
            </span>
          )}
        </div>

        {/* Formulario de edición */}
        {editing && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                Series
              </label>
              <input
                type="number"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="4"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                Reps
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
                Desc (seg)
              </label>
              <input
                type="number"
                value={rest}
                onChange={(e) => setRest(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="60"
              />
            </div>
            <div className="col-span-3">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                Notas
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="Nota para el alumno..."
              />
            </div>
            <div className="col-span-3 flex gap-2">
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
            className="w-6 h-6 text-[10px] rounded flex items-center justify-center text-
