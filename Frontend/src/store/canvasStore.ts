export type Tool =
  | 'select'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'pen'
  | 'text'
  | 'eraser'

// Separate type for actual drawn shapes
export type ShapeType =
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'pen'
  | 'text'

export interface Shape {
  id: string
  type: ShapeType    // ← changed from Tool to ShapeType
  x: number
  y: number
  width?: number
  height?: number
  points?: number[]
  text?: string
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
  rotation?: number
}