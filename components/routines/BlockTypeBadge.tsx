// components/routines/BlockTypeBadge.tsx

import { TIPO_BLOQUE_CONFIG, type TipoBloque } from '@/types/routines'

interface Props {
  tipo: TipoBloque
  size?: 'sm' | 'md'
}

export function BlockTypeBadge({ tipo, size = 'sm' }: Props) {
  const config = TIPO_BLOQUE_CONFIG[tipo]
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
