// components/routines/RoutineBlockCard.tsx
'use client'

import { useState } from 'react'
import type { RoutineBlock, RoutineExercise, RoutineBlockType, BlockFormData } from '@/types/routines'
import { BLOCK_TYPE_CONFIG } from '@/types/routines'
import { BlockTypeBadge } from './BlockTypeBadge'
import { RoutineExerciseItem } from './RoutineExerciseItem'
import { ReorderButtons } from './ReorderButtons'

interface Props {
  block: RoutineBlock
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onDuplicate: () => void
  onUpdate: (data: Partial<BlockFormData>) => void
  onAddExercise: (blockId: string) => void
  onUpdateExercise: (exerciseId: string, data: Partial<RoutineExercise>) => void
  onDeleteExercise: (exerciseId: string) => void
  onMoveExercise: (exerciseId: string, direction: 'up' | 'down') => void
}

const BLOCK_TYPES: RoutineBlockType[] = [
  'normal',
  'circuito',
  'superserie',
  'entrada_en_calor',
  'vuelta_a_la_calma',
]

export function RoutineBlockCard({
  block, index, total,
  onMoveUp, onMoveDown, onDelete, onDuplicate,
  onUpdate, onAddExercise, onUpdateExercise, onDeleteExercise, onMoveExercise
}: Props) {
  const [expanded, setExpanded] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const config = BLOCK_TYPE_CONFIG[block.type]
  const exercises = block.exercises ?? []
  const isCircuitLike = block.type === 'circuito' || block.type === 'superserie'

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
          {editingName ? (
            <input
              autoFocus
              type="text"
              defaultValue={block.name}
              onBlur={(e) => {
                onUpdate({ name: e.target.value })
                setEditingName(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                if (e.key === 'Escape') setEditingName(false)
              }}
              className="w-full bg-transparent border-b border-slate-500 text-white font-semibold
                text-sm focus:outline-none focus:border-blue-400 pb-0.5"
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="text-left font-semibold text-white text-sm hover:text-blue-300 transition-colors w-full truncate"
            >
              {block.name}
            </button>
          )}
          <div className="flex items-center gap-2 mt-1">
            <BlockTypeBadge type={block.type} />
            {isCircuitLike && block.rounds && (
              <span className="text-xs text-slate-400">{block.rounds} rondas</span>
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
              <label className="text-[10px] text-slate-500 uppercase tracking-wider blo
