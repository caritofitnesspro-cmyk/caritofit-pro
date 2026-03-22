// components/routines/BlockTypeBadge.tsx

import { BLOCK_TYPE_CONFIG, type RoutineBlockType } from '@/types/routines'

interface Props {
  type: RoutineBlockType
  size?: 'sm' | 'md'
}

export function BlockTypeBadge({ type, size = 'sm' }: Props) {
  const config = BLOCK_TYPE_CONFIG[type]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wider border
        ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'}
        ${config.color} ${config.bgColor}`}
    >
      {config.emoji} {config.label}
    </span>
  )
}
