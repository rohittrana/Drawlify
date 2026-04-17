export type Tool =
  | 'select'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'pen'
  | 'text'
  | 'eraser'

export type ShapeType =
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'pen'
  | 'text'

export interface Shape {
  id: string
  type: ShapeType
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
  fontSize?: number
  fontFamily?: string
}