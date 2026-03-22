// components/routines/RoutineDayEditor.tsx
'use client'

import { useEffect } from 'react'
import { useRoutineBlocks } from '@/hooks/useRoutineBlocks'
import { RoutineBlockCard } from './RoutineBlockCard'
import { supabase } from '@/lib/supabase'
import type { RoutineExercise } from '@/types/routines'

interface Props {
  dayId: string
  dayName: string
  dayNumber: number
  onOpenExercisePicker: (blockId: string, dayId: string) => void
}

export function RoutineDayEditor({ dayId, dayName, dayNumber, onOpenExercisePicker }: Props) {
  const {
    blocks, loading, error,
    load, addBlock, updateBlock, removeBlock, duplicateBlock, moveBlock
  } = useRoutineBlocks(dayId)

  useEffect(() => {
    load()
  }, [load])

  const handleUpdateExercise = async (exerciseId: string, data: Partial<RoutineExercise>) => {
    await supabase.from('routine_exercises').update(data).eq('id', exerciseId)
    await load()
  }

  const handleDeleteExercise = async (exerciseId: string) => {
    await supabase.from('routine_exercises').delete().eq('id', exerciseId)
    await load()
  }

  const handleMoveExercise = async (
    blockId: string,
    exerciseId: string,
    direction: 'up' | 'down'
  ) => {
    const block = blocks.find((b) => b.id === blockId)
    if (!block?.exercises) return

    const exs = [...block.exercises]
    const idx = exs.findIndex((e) => e.id === exerciseId)
    const newIdx = direction === 'up' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= exs.length) return

    ;[exs[idx], exs[newIdx]] = [exs[newIdx], exs[idx]]

    for (let i = 0; i < exs.length; i++) {
      await supabase
        .from('routine_exercises')
        .update({ order: i })
        .eq('id', exs[i].id)
    }

    await load()
  }

  return (
    <section className="space-y-4">

      {/* Header del día */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center
          text-white font-bold text-sm shrink-0">
          {dayNumber}
        </div>
        <h3 className="font-bold text-white text-base">
          {dayName || `Día ${dayNumber}`}
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
