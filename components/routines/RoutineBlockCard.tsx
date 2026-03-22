// components/routines/RoutineBlockCard.tsx
'use client'

import { useState } from 'react'
import type { Bloque, Ejercicio, TipoBloque, BloqueFormData } from '@/types/routines'
import { TIPO_BLOQUE_CONFIG } from '@/types/routines'
import { BlockTypeBadge } from './BlockTypeBadge'
import { RoutineExerciseItem } from './RoutineExerciseItem'
import { ReorderButtons } from './ReorderButtons'

interface Props {
  bloque: Bloque
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onDuplicate: () => void
  onUpdate: (data: Partial<BloqueFormData>) => void
  onAddEjercicio: (bloqueId: string) => void
  onUpdateEjercicio: (ejercicioId: string, data: Partial<Ejercicio>) => void
  onDeleteEjercicio: (ejercicioId: string) => void
  onMoveEjercicio: (ejercicioId: string, direccion: 'up' | 'down') => void
}

const TIPOS: TipoBloque[] = [
  'normal',
  'circuito',
  'superserie',
  'entrada_en_calor',
  'vuelta_a_la_calma',
]

export function RoutineBlockCard({
  bloque, index, total,
  onMoveUp, onMoveDown, onDelete, onDuplicate,
  onUpdate, onAddEjercicio, onUpdateEjercicio, onDeleteEjercicio, onMoveEjercicio
}: Props) {
  const [expanded, setExpanded] = useState(true)
  const [editingNombre, setEditingNombre] = useState(false)
  const config = TIPO_BLOQUE_CONFIG[bloque.tipo]
  const ejercicios = bloque.ejercicios ?? []
  const isCircuito = bloque.tipo === 'circuito' || bloque.tipo === 'superserie'

  return (
    <div className={`rounded-xl border ${config.bgColor} transition-all duration-200`}>

      {/* ── Header ── */}
      <div className="flex items-center gap-2 p-3">
        <ReorderButtons
          onUp={onMoveUp}
          onDown={onMoveDown}
          disableUp={index === 0}
          disableDown={index === total - 1}
        />

        <div className="flex-1 min-w-0">
          {editingNombre ? (
            <input
              autoFocus
              type="text"
              defaultValue={bloque.nombre}
              onBlur={(e) => {
                onUpdate({ nombre: e.target.value })
                setEditingNombre(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                if (e.key === 'Escape') setEditingNombre(false)
              }}
              className="w-full bg-transparent border-b border-slate-500 text-white font-semibold
                text-sm focus:outline-none focus:border-blue-400 pb-0.5"
            />
          ) : (
            <button
              onClick={() => setEditingNombre(true)}
              className="text-left font-semibold text-white text-sm hover:text-blue-300 transition-colors w-full truncate"
            >
              {bloque.nombre}
            </button>
          )}
          <div className="flex items-center gap-2 mt-1">
            <BlockTypeBadge tipo={bloque.tipo} />
            {isCircuito && bloque.rondas && (
              <span className="text-xs text-slate-400">{bloque.rondas} rondas</span>
            )}
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-8 h-8 rounded flex items-center justify-center text-slate-400
            hover:bg-slate-700 hover:text-white transition-colors text-xs"
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* ── Contenido expandible ── */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3">

          {/* Config del bloque */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                Tipo
              </label>
              <select
                value={bloque.tipo}
                onChange={(e) => onUpdate({ tipo: e.target.value as TipoBloque })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5
                  text-slate-200 text-xs focus:outline-none focus:border-blue-500"
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>{TIPO_BLOQUE_CONFIG[t].label}</option>
                ))}
              </select>
            </div>

            {isCircuito && (
              <>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                    Rondas
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={bloque.rondas ?? ''}
                    onChange={(e) => onUpdate({ rondas: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5
                      text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                    placeholder="3"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                    Descanso entre rondas (seg)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bloque.descanso_entre_rondas ?? ''}
                    onChange={(e) => onUpdate({ descanso_entre_rondas: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5
                      text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                    placeholder="60"
                  />
                </div>
              </>
            )}

            <div className="col-span-2">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={bloque.descripcion ?? ''}
                onChange={(e) => onUpdate({ descripcion: e.target.value || undefined })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5
                  text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                placeholder="Instrucciones para este bloque..."
              />
            </div>
          </div>

          {/* Lista de ejercicios */}
          <div className="rounded-lg bg-slate-900/50 p-2">
            {ejercicios.length === 0 ? (
              <p className="text-center text-slate-600 text-xs py-3">
                Sin ejercicios todavía
              </p>
            ) : (
              ejercicios.map((ej, i) => (
                <RoutineExerciseItem
                  key={ej.id}
                  ejercicio={ej}
                  index={i}
                  total={ejercicios.length}
                  onMoveUp={() => onMoveEjercicio(ej.id, 'up')}
                  onMoveDown={() => onMoveEjercicio(ej.id, 'down')}
                  onDelete={() => onDeleteEjercicio(ej.id)}
                  onUpdate={(data) => onUpdateEjercicio(ej.id, data)}
                />
              ))
            )}
            <button
              onClick={() => onAddEjercicio(bloque.id)}
              className="mt-2 w-full py-2 rounded-lg border border-dashed border-slate-700
                text-slate-500 text-xs hover:border-blue-600 hover:text-blue-400
                transition-colors flex items-center justify-center gap-1"
            >
              <span className="text-base leading-none">+</span> Agregar ejercicio
            </button>
          </div>

          {/* Footer */}
          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={onDuplicate}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800
                hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-colors"
            >
              ⧉ Duplicar
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800
                hover:bg-red-900/50 text-slate-400 hover:text-red-400 text-xs transition-colors"
            >
              🗑 Eliminar
            </button>
          </div>

        </div>
      )}
    </div>
  )
}
