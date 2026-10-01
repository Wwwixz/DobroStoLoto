import { PawPrint, PackageOpen, Laptop2, Leaf, HeartHandshake } from 'lucide-react'
import type { ComponentType } from 'react'

// Единая система иконок вместо эмодзи: у каждой карточки задания — свой
// узнаваемый значок на фирменном градиенте, а не случайный символ шрифта.
const iconById: Record<number, ComponentType<{ size?: number; strokeWidth?: number }>> = {
  1: PawPrint,
  2: PackageOpen,
  3: Laptop2,
  4: Leaf,
  5: HeartHandshake,
}

export const getTaskIcon = (taskId: number) => iconById[taskId] ?? HeartHandshake

/** Плитка-«фото» задания: иконка на градиенте с лёгкой диагональной текстурой. */
export const TaskPhoto = ({
  taskId,
  gradient,
  size = 26,
  className = '',
}: {
  taskId: number
  gradient: string
  size?: number
  className?: string
}) => {
  const Icon = getTaskIcon(taskId)
  return (
    <div className={`photo-tile ${className}`} style={{ background: gradient }}>
      <Icon size={size} strokeWidth={1.75} />
    </div>
  )
}
