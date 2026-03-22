// components/routines/StudentRoutineView.tsx

import type { RoutineDayWithBlocks, RoutineBlock, RoutineExercise } from '@/types/routines'
import { BLOCK_TYPE_CONFIG } from '@/types/routines'
import { BlockTypeBadge } from './BlockTypeBadge'

// ── Fila de ejercicio ────────────────────────────────────
function ExerciseRow({ ex }: { ex: RoutineExercise }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-800 last:border-0">
      <div>
        <span className="text-slate-200 text-sm font-medium">
          {ex.exercise?.name ?? 'Ejercicio'}
        </span>
        {ex.notes && (
          <p className="text-slate-500 text-xs mt-0.5">{ex.notes}</p>
        )}
      </div>
      <div className="text-right shrink-0 ml-3">
        {(ex.sets || ex.reps) && (
          <span className="text-white font-bold text-sm">
            {ex.sets ? `${ex.sets}×` : ''}{ex.reps}
          </span>
        )}
        {ex.rest && (
          <p className="text-slate-500 text-xs">{ex.rest}″ desc.</p>
        )}
      </div>
    </div>
  )
}

// ── Card de bloque ───────────────────────────────────────
function BlockView({ block }: { block: RoutineBlock }) {
  const config = BLOCK_TYPE_CONFIG[block.type]
  const isCircuitLike = block.type === 'circuito' || block.type === 'superserie'
  const exercises = block.exercises ?? []

  return (
    <div className={`rounded-xl border overflow-hidden ${config.bgColor}`}>

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <BlockTypeBadge type={block.type} size="md" />
          <span className="font-bold text-white text-sm truncate">
            {block.name}
          </span>
        </div>
        {isCircuitLike && block.rounds && (
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <span className="text-lg">🔁</span>
            <span className="text-white font-bold text-sm">{block.rounds}</span>
          </div>
        )}
      </div>

      {/* Descripción */}
      {block.description && (
        <div className="px-4 py-2 bg-slate-900/30">
