// src/types/routines.ts

export type RoutineBlockType =
  | 'normal'
  | 'circuito'
  | 'superserie'
  | 'entrada_en_calor'
  | 'vuelta_a_la_calma';

export interface RoutineBlock {
  id: string;
  day_id: string;
  name: string;
  type: RoutineBlockType;
  description?: string | null;
  rounds?: number | null;
  rest_between_rounds?: number | null;
  order: number;
  created_at?: string;
  updated_at?: string;
  exercises?: RoutineExercise[];
}

export interface RoutineExercise {
  id: string;
  day_id: string;
  block_id?: string | null;
  exercise_id: string;
  sets?: number | null;
  reps?: string | null;
  rest?: number | null;
  notes?: string | null;
  order: number;
  exercise?: {
    id: string;
    name: string;
    muscle_group?: string;
    video_url?: string;
    image_url?: string;
  };
}

export interface RoutineDayWithBlocks {
  id: string;
  routine_id: string;
  day_number: number;
  name?: string | null;
  blocks: RoutineBlock[];
  legacy_exercises: RoutineExercise[];
  has_blocks: boolean;
}

export interface BlockFormData {
  name: string;
  type: RoutineBlockType;
  description?: string;
  rounds?: number;
  rest_between_rounds?: number;
}

export const BLOCK_TYPE_CONFIG: Record
  RoutineBlockType,
  { label: string; color: string; bgColor: string; emoji: string }
> = {
  normal:            { label: 'Normal',            color: 'text-blue-400',   bgColor: 'bg-blue-950/40 border-blue-800',    emoji: '🔵' },
  circuito:          { label: 'Circuito',          color: 'text-green-400',  bgColor: 'bg-green-950/40 border-green-800',  emoji: '🟢' },
  superserie:        { label: 'Superserie',        color: 'text-violet-400', bgColor: 'bg-violet-950/40 border-violet-800',emoji: '🟣' },
  entrada_en_calor:  { label: 'Entrada en calor',  color: 'text-orange-400', bgColor: 'bg-orange-950/40 border-orange-800',emoji: '🟠' },
  vuelta_a_la_calma: { label: 'Vuelta a la calma', color: 'text-cyan-400',   bgColor: 'bg-cyan-950/40 border-cyan-800',    emoji: '🩵' },
};
