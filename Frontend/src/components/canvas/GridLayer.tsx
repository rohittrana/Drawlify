import React from 'react'
import { Layer, Line } from 'react-konva'
import { useCanvasStore } from '../../store/canvasStore'
import { useThemeStore } from '../../store/themeStore'

interface GridLayerProps {
  width: number
  height: number
  scale: number
  position: { x: number; y: number }
}

const GridLayer = ({ width, height, scale, position }: GridLayerProps) => {
  const { showGrid, gridSize } = useCanvasStore()
  const { isDark } = useThemeStore()

  if (!showGrid) return null

  const gridColor = isDark
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(0,0,0,0.08)'

  const dotColor = isDark
    ? 'rgba(255,255,255,0.2)'
    : 'rgba(0,0,0,0.2)'

  // Calculate grid boundaries adjusted for pan and zoom
  const startX = Math.floor(-position.x / scale / gridSize) * gridSize
  const startY = Math.floor(-position.y / scale / gridSize) * gridSize
  const endX = startX + Math.ceil(width / scale) + gridSize * 2
  const endY = startY + Math.ceil(height / scale) + gridSize * 2

  const verticalLines = []
  const horizontalLines = []
  const dots = []

  // Draw vertical lines
  for (let x = startX; x < endX; x += gridSize) {
    verticalLines.push(
      <Line
        key={`v-${x}`}
        points={[x, startY, x, endY]}
        stroke={gridColor}
        strokeWidth={1 / scale}
        listening={false}
      />
    )
  }

  // Draw horizontal lines
  for (let y = startY; y < endY; y += gridSize) {
    horizontalLines.push(
      <Line
        key={`h-${y}`}
        points={[startX, y, endX, y]}
        stroke={gridColor}
        strokeWidth={1 / scale}
        listening={false}
      />
    )
  }

  // Draw intersection dots
  for (let x = startX; x < endX; x += gridSize) {
    for (let y = startY; y < endY; y += gridSize) {
      dots.push(
        <Line
          key={`d-${x}-${y}`}
          points={[x, y, x + 0.1, y]}
          stroke={dotColor}
          strokeWidth={3 / scale}
          lineCap="round"
          listening={false}
        />
      )
    }
  }

  return (
    <Layer listening={false}>
      {verticalLines}
      {horizontalLines}
      {dots}
    </Layer>
  )
}

export default GridLayer