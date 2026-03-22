// hooks/useRoutineBlocks.ts
'use client'

import { useState, useCallback } from 'react'
import type { RoutineBlock, BlockFormData } from '@/types/routines'
import * as blockQueries from '@/lib/routine-blocks'

export function useRoutineBlocks(dayId: string) {
  const [blocks, setBlocks] = useState<RoutineBlock[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar bloques desde Supabase
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await blockQueries.getBlocksWithExercises(dayId)
      setBlocks(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [dayId])

  // Agregar bloque nuevo
  const addBlock = useCallback(async (formData: BlockFormData) => {
    // Aparece en pantalla al instante (optimistic)
    const tempId = `temp-${Date.now()}`
    const optimistic: RoutineBlock = {
      id: tempId,
      day_id: dayId,
      order: blocks.length,
      exercises: [],
      ...formData,
    }
    setBlocks((prev) => [...prev, optimistic])

    try {
      const real = await blockQueries.createBlock(dayId, formData, blocks.length)
      setBlocks((prev) =>
        prev.map((b) => (b.id === tempId ? { ...real, exercises: [] } : b))
      )
    } catch (e: any) {
      // Si falla, lo saca de pantalla
      setBlocks((prev) => prev.filter((b) => b.id !== tempId))
      setError(e.message)
    }
  }, [dayId, blocks.length])

  // Actualizar nombre, tipo, descripción, etc.
  const updateBlock = useCallback(async (blockId: string, updates: Partial<BlockFormData>) => {
    // Actualiza en pantalla al instante
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, ...updates } : b))
    )
    try {
      await blockQueries.updateBlock(blockId, updates)
    } catch (e: any) {
      setError(e.message)
      await load() // Si falla, recarga desde Supabase
    }
  }, [load])

  // Eliminar bloque
  const removeBlock = useCallback(async (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId))
    try {
      await blockQueries.deleteBlock(blockId)
    } catch (e: any) {
      setError(e.message)
      await load()
    }
  }, [load])

  // Duplicar bloque
  const duplicateBlock = useCallback(async (block: RoutineBlock) => {
    try {
      const copy = await blockQueries.duplicateBlock(block, blocks.length)
      setBlocks((prev) => [
        ...prev,
        { ...copy, exercises: block.exercises ? [...block.exercises] : [] },
      ])
    } catch (e: any) {
      setError(e.message)
    }
  }, [blocks.length])

  // Subir o bajar un bloque
  const moveBlock = useCallback(async (blockId: string, direction: 'up' | 'down') => {
    const idx = blocks.findIndex((b) => b.id === blockId)
    if (idx === -1) return

    const newIdx = direction === 'up' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= blocks.length) return

    const reordered = [...blocks]
    ;[reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]]
    const withOrder = reordered.map((b, i) => ({ ...b, order: i }))

    setBlocks(withOrder)

    try {
      await blockQueries.reorderBlocks(
        withOrder.map((b) => ({ id: b.id, order: b.order }))
      )
    } catch (e: any) {
      setError(e.message)
      await load()
    }
  }, [blocks, load])

  return {
    blocks,
    loading,
    error,
    load,
    addBlock,
    updateBlock,
    removeBlock,
    duplicateBlock,
    moveBlock,
  }
}
