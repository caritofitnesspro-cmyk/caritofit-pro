// lib/routine-blocks.ts

import { supabase } from '@/lib/supabase'
import type { RoutineBlock, RoutineExercise, BlockFormData } from '@/types/routines'

// ── Leer bloques con sus ejercicios ──────────────────────
export async function getBlocksWithExercises(dayId: string): Promise<RoutineBlock[]> {
  const { data, error } = await supabase
    .from('routine_blocks')
    .select(`
      *,
      exercises:routine_exercises(
        *,
        exercise:exercises(id, name, muscle_group, video_url, image_url)
      )
    `)
    .eq('day_id', dayId)
    .order('order', { ascending: true })
    .order('order', { referencedTable: 'routine_exercises', ascending: true })

  if (error) throw error
  return data ?? []
}

// ── Leer ejercicios sin bloque (legacy) ──────────────────
export async function getLegacyExercises(dayId: string): Promise<RoutineExercise[]> {
  const { data, error } = await supabase
    .from('routine_exercises')
    .select(`*, exercise:exercises(id, name, muscle_group)`)
    .eq('day_id', dayId)
    .is('block_id', null)
    .order('order', { ascending: true })

  if (error) throw error
  return data ?? []
}

// ── Crear bloque ──────────────────────────────────────────
export async function createBlock(
  dayId: string,
  formData: BlockFormData,
  currentCount: number
): Promise<RoutineBlock> {
  const { data, error } = await supabase
    .from('routine_blocks')
    .insert({
      day_id: dayId,
      name: formData.name || `Bloque ${String.fromCharCode(65 + currentCount)}`,
      type: formData.type,
      description: formData.description || null,
      rounds: formData.rounds || null,
      rest_between_rounds: formData.rest_between_rounds || null,
      order: currentCount,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Actualizar bloque ─────────────────────────────────────
export async function updateBlock(
  blockId: string,
  updates: Partial<BlockFormData>
): Promise<void> {
  const { error } = await supabase
    .from('routine_blocks')
    .update(updates)
    .eq('id', blockId)

  if (error) throw error
}

// ── Eliminar bloque ───────────────────────────────────────
export async function deleteBlock(blockId: string): Promise<void> {
  const { error } = await supabase
    .from('routine_blocks')
    .delete()
    .eq('id', blockId)

  if (error) throw error
}

// ── Duplicar bloque con sus ejercicios ───────────────────
export async function duplicateBlock(
  block: RoutineBlock,
  newOrder: number
): Promise<RoutineBlock> {
  const { data: newBlock, error: blockError } = await supabase
    .from('routine_blocks')
    .insert({
      day_id: block.day_id,
      name: `${block.name} (copia)`,
      type: block.type,
      description: block.description,
      rounds: block.rounds,
      rest_between_rounds: block.rest_between_rounds,
      order: newOrder,
    })
    .select()
    .single()

  if (blockError) throw blockError

  if (block.exercises && block.exercises.length > 0) {
    const copies = block.exercises.map((ex) => ({
      day_id: ex.day_id,
      block_id: newBlock.id,
      exercise_id: ex.exercise_id,
      sets: ex.sets,
      reps: ex.reps,
      rest: ex.rest,
      notes: ex.notes,
      order: ex.order,
    }))

    const { error: exError } = await supabase
      .from('routine_exercises')
      .insert(copies)

    if (exError) throw exError
  }

  return newBlock
}

// ── Reordenar bloques ─────────────────────────────────────
export async function reorderBlocks(
  blocks: { id: string; order: number }[]
): Promise<void> {
  for (const b of blocks) {
    await supabase
      .from('routine_blocks')
      .update({ order: b.order })
      .eq('id', b.id)
  }
}

// ── Reordenar ejercicios ──────────────────────────────────
export async function reorderExercises(
  exercises: { id: string; order: number }[]
): Promise<void> {
  for (const ex of exercises) {
    await supabase
      .from('routine_exercises')
      .update({ order: ex.order })
      .eq('id', ex.id)
  }
}
