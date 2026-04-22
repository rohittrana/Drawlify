import { useEffect, useCallback, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Stage,
  Layer,
  Rect,
  Ellipse,
  Line,
  Arrow,
  Text,
  Transformer
} from 'react-konva'
import Konva from 'konva'
import { v4 as uuidv4 } from 'uuid'
import { useCanvasStore } from '../store/canvasStore'
import { Shape, ShapeType } from '../types/canvas'
import Toolbar from '../components/canvas/Toolbar'
import api from '../api/axios'
import { useTheme } from '../hooks/useTheme'
import PropertiesPanel from '../components/canvas/PropertiesPanel'
const CanvasPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    shapes,
    tool,
    fillColor,
    strokeColor,
    strokeWidth,
    addShape,
    updateShape,
    deleteShape,
    selectedId,
    setSelectedId,
    setShapes,
    undo,
    redo
  } = useCanvasStore()

  const stwageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const isDrawing = useRef(false)
  const currentShapeId = useRef<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isPanning = useRef(false)
  const lastPointerPosition = useRef({ x: 0, y: 0 })
const { isDark, toggleTheme } = useTheme()
  const [boardTitle, setBoardTitle] = useState('Untitled Board')
  const [saving, setSaving] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  // Load board
  useEffect(() => {
    const loadBoard = async () => {
      try {
        const res = await api.get(`/boards/${id}`)
        setBoardTitle(res.data.board.title)
        if (res.data.board.shapes && Array.isArray(res.data.board.shapes)) {
          setShapes(res.data.board.shapes as Shape[])
        }
      } catch {
        navigate('/dashboard')
      }
    }
    loadBoard()
  }, [id])

  // Resize
  useEffect(() => {
    const handleResize = () => {
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Zoom with Ctrl + Scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return
      e.preventDefault()

      const scaleBy = 1.08
      const stageRef = useRef<Konva.Stage>(null)
      if (!stageRef.current) return

      const oldScale = scale
      const pointer = stageRef.current.getPointerPosition()
      if (!pointer) return

      const mousePointTo = {
        x: (pointer.x - position.x) / oldScale,
        y: (pointer.y - position.y) / oldScale
      }

      const newScale =
        e.deltaY < 0
          ? Math.min(oldScale * scaleBy, 5)
          : Math.max(oldScale / scaleBy, 0.1)

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale
      }

      setScale(newScale)
      setPosition(newPos)
    }

    const container = document.querySelector('canvas')
    container?.addEventListener('wheel', handleWheel, { passive: false })
    return () => container?.removeEventListener('wheel', handleWheel)
  }, [scale, position])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') undo()
      if (e.ctrlKey && e.key === 'y') redo()
      if (e.key === 'Delete' && selectedId) deleteShape(selectedId)
      if (e.key === 'Escape') setSelectedId(null)
      if (e.ctrlKey && e.key === '=') { e.preventDefault(); zoomIn() }
      if (e.ctrlKey && e.key === '-') { e.preventDefault(); zoomOut() }
      if (e.ctrlKey && e.key === '0') { e.preventDefault(); resetZoom() }
      if (e.ctrlKey && e.key === 'f') { e.preventDefault(); fitToScreen() }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, scale])

  // Transformer
  useEffect(() => {
    if (!transformerRef.current || !stwageRef.current) return
    const stage = stwageRef.current
    if (selectedId) {
      const node = stage.findOne(`#${selectedId}`)
      if (node) {
        transformerRef.current.nodes([node])
        transformerRef.current.getLayer()?.batchDraw()
      }
    } else {
      transformerRef.current.nodes([])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [selectedId, shapes])

  // Auto save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (shapes.length > 0) saveBoard()
    }, 30000)
    return () => clearInterval(interval)
  }, [shapes, boardTitle])

  // Save board
  const saveBoard = async () => {
    setSaving(true)
    try {
      await api.patch(`/boards/${id}`, { shapes, title: boardTitle })
    } catch {
      alert('Failed to save board')
    } finally {
      setSaving(false)
    }
  }

  // Export PNG
  const exportAsPNG = () => {
    const stage = stwageRef.current
    if (!stage) return
    const dataURL = stage.toDataURL({ pixelRatio: 2 })
    const link = document.createElement('a')
    link.download = `${boardTitle}.png`
    link.href = dataURL
    link.click()
  }

  // Zoom controls
  const zoomIn = () => setScale((s) => Math.min(s * 1.2, 5))
  const zoomOut = () => setScale((s) => Math.max(s / 1.2, 0.1))
  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const fitToScreen = () => {
    if (shapes.length === 0) return

    let minX = Infinity, minY = Infinity
    let maxX = -Infinity, maxY = -Infinity

    shapes.forEach((shape) => {
      const x = shape.x
      const y = shape.y
      const w = shape.width || 100
      const h = shape.height || 100
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x + w)
      maxY = Math.max(maxY, y + h)
    })

    const padding = 80
    const contentWidth = maxX - minX + padding * 2
    const contentHeight = maxY - minY + padding * 2
    const scaleX = stageSize.width / contentWidth
    const scaleY = stageSize.height / contentHeight
    const newScale = Math.min(scaleX, scaleY, 1)

    setScale(newScale)
    setPosition({
      x: (stageSize.width - contentWidth * newScale) / 2 - (minX - padding) * newScale,
      y: (stageSize.height - contentHeight * newScale) / 2 - (minY - padding) * newScale
    })
  }

  // Submit inline text
  const submitText = () => {
    if (textInput.trim() && textPosition) {
      const newId = uuidv4()
      addShape({
        id: newId,
        type: 'text',
        x: textPosition.x,
        y: textPosition.y,
        text: textInput.trim(),
        fill: 'transparent',
        stroke: strokeColor,
        strokeWidth: 1,
        opacity: 1
      })
    }
    setTextPosition(null)
    setTextInput('')
  }
<PropertiesPanel />
  // Mouse down
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (tool === 'select' || tool === 'eraser') {
        if (e.target === e.target.getStage()) setSelectedId(null)
        return
      }

      const stage = stwageRef.current
      if (!stage) return
      const pos = stage.getPointerPosition()
      if (!pos) return

      // Adjust for zoom and pan
      const adjustedPos = {
        x: (pos.x - position.x) / scale,
        y: (pos.y - position.y) / scale
      }

      isDrawing.current = true
      const newId = uuidv4()
      currentShapeId.current = newId

      const baseShape: Shape = {
        id: newId,
        type: tool as ShapeType,
        x: adjustedPos.x,
        y: adjustedPos.y,
        fill:
          tool === 'pen' || tool === 'line' || tool === 'arrow'
            ? 'transparent'
            : fillColor,
        stroke: strokeColor,
        strokeWidth,
        opacity: 1
      }

      if (tool === 'rectangle') {
        addShape({ ...baseShape, width: 0, height: 0 })
      } else if (tool === 'ellipse') {
        addShape({ ...baseShape, width: 0, height: 0 })
      } else if (tool === 'line' || tool === 'arrow') {
        addShape({ ...baseShape, points: [0, 0, 0, 0] })
      } else if (tool === 'pen') {
        addShape({ ...baseShape, points: [adjustedPos.x, adjustedPos.y] })
      } else if (tool === 'text') {
        setTextPosition({ x: pos.x, y: pos.y })
        setTextInput('')
        isDrawing.current = false
        currentShapeId.current = null
        setTimeout(() => textareaRef.current?.focus(), 50)
      }
    },
    [tool, fillColor, strokeColor, strokeWidth, position, scale]
  )

  // Mouse move
  const handleMouseMove = useCallback(() => {
    if (!isDrawing.current || !currentShapeId.current) return
    const stage = stwageRef.current
    if (!stage) return
    const pos = stage.getPointerPosition()
    if (!pos) return

    // Adjust for zoom and pan
    const adjustedPos = {
      x: (pos.x - position.x) / scale,
      y: (pos.y - position.y) / scale
    }

    const shapeId = currentShapeId.current
    const shape = shapes.find((s) => s.id === shapeId)
    if (!shape) return

    if (tool === 'rectangle' || tool === 'ellipse') {
      updateShape(shapeId, {
        width: adjustedPos.x - shape.x,
        height: adjustedPos.y - shape.y
      })
    } else if (tool === 'line' || tool === 'arrow') {
      updateShape(shapeId, {
        points: [0, 0, adjustedPos.x - shape.x, adjustedPos.y - shape.y]
      })
    } else if (tool === 'pen') {
      const existing = shape.points || []
      updateShape(shapeId, {
        points: [...existing, adjustedPos.x, adjustedPos.y]
      })
    }
  }, [tool, shapes, position, scale])

  // Mouse up
  const handleMouseUp = useCallback(() => {
    isDrawing.current = false
    currentShapeId.current = null
  }, [])

  // Stage mouse down — handles pan + draw
  const handleStageMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.evt.button === 1) {
        isPanning.current = true
        lastPointerPosition.current = { x: e.evt.clientX, y: e.evt.clientY }
        e.evt.preventDefault()
        return
      }
      handleMouseDown(e)
    },
    [handleMouseDown]
  )

  // Stage mouse move — handles pan + draw
  const handleStageMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (isPanning.current) {
        const dx = e.evt.clientX - lastPointerPosition.current.x
        const dy = e.evt.clientY - lastPointerPosition.current.y
        setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
        lastPointerPosition.current = { x: e.evt.clientX, y: e.evt.clientY }
        return
      }
      handleMouseMove()
    },
    [handleMouseMove]
  )

  // Stage mouse up — handles pan + draw
  const handleStageMouseUp = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (isPanning.current) {
        isPanning.current = false
        return
      }
      handleMouseUp()
    },
    [handleMouseUp]
  )

  // Render shapes
  const renderShape = (shape: Shape) => {
    const isSelected = shape.id === selectedId

    const commonProps = {
      id: shape.id,
      key: shape.id,
      opacity: shape.opacity,
      draggable: tool === 'select',
      onClick: () => {
        if (tool === 'select') setSelectedId(shape.id)
        if (tool === 'eraser') deleteShape(shape.id)
      },
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
        updateShape(shape.id, {
          x: e.target.x(),
          y: e.target.y()
        })
      },
      onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
        const node = e.target
        updateShape(shape.id, {
          x: node.x(),
          y: node.y(),
          width: node.width() * node.scaleX(),
          height: node.height() * node.scaleY(),
          rotation: node.rotation()
        })
        node.scaleX(1)
        node.scaleY(1)
      }
    }

    switch (shape.type) {
      case 'rectangle':
        return (
          <Rect
            {...commonProps}
            x={shape.x}
            y={shape.y}
            width={shape.width || 0}
            height={shape.height || 0}
            fill={shape.fill}
            stroke={isSelected ? '#4f46e5' : shape.stroke}
            strokeWidth={shape.strokeWidth}
            rotation={shape.rotation || 0}
          />
        )
      case 'ellipse':
        return (
          <Ellipse
            {...commonProps}
            x={shape.x + (shape.width || 0) / 2}
            y={shape.y + (shape.height || 0) / 2}
            radiusX={Math.abs((shape.width || 0) / 2)}
            radiusY={Math.abs((shape.height || 0) / 2)}
            fill={shape.fill}
            stroke={isSelected ? '#4f46e5' : shape.stroke}
            strokeWidth={shape.strokeWidth}
            rotation={shape.rotation || 0}
          />
        )
      case 'line':
        return (
          <Line
            {...commonProps}
            x={shape.x}
            y={shape.y}
            points={shape.points || []}
            stroke={isSelected ? '#4f46e5' : shape.stroke}
            strokeWidth={shape.strokeWidth}
            lineCap="round"
            lineJoin="round"
          />
        )
      case 'arrow':
        return (
          <Arrow
            {...commonProps}
            x={shape.x}
            y={shape.y}
            points={shape.points || []}
            stroke={isSelected ? '#4f46e5' : shape.stroke}
            strokeWidth={shape.strokeWidth}
            fill={isSelected ? '#4f46e5' : shape.stroke}
          />
        )
      case 'pen':
        return (
          <Line
            {...commonProps}
            x={0}
            y={0}
            points={shape.points || []}
            stroke={isSelected ? '#4f46e5' : shape.stroke}
            strokeWidth={shape.strokeWidth}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
          />
        )
      case 'text':
        return (
          <Text
            {...commonProps}
            x={shape.x}
            y={shape.y}
            text={shape.text || ''}
            fontSize={shape.fontSize || 18}
            fill={shape.stroke}
            rotation={shape.rotation || 0}
          />
        )
      default:
        return null
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>

      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <button
            onClick={() => navigate('/dashboard')}
            style={styles.backBtn}
          >
            ← Back
          </button>
        </div>
        <div style={styles.topCenter}>
          <input
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            style={styles.titleInput}
            placeholder="Board title..."
          />
        </div>
        <div style={styles.topRight}>
          <span style={styles.hint}>
            Del • Ctrl+Z • Ctrl+Y • Ctrl+Scroll zoom
          </span>
          <button onClick={exportAsPNG} style={styles.exportBtn}>
            📥 PNG
          </button>
          <button
            onClick={saveBoard}
            disabled={saving}
            style={styles.saveBtn}
          >
            {saving ? 'Saving...' : '💾 Save'}
          </button>
        </div>
      </div>

      {/* Inline text input */}
      {textPosition && (
        <textarea
          ref={textareaRef}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submitText()
            }
            if (e.key === 'Escape') {
              setTextPosition(null)
              setTextInput('')
            }
          }}
          onBlur={submitText}
          placeholder="Type here... (Enter to confirm)"
          style={{
            position: 'fixed',
            left: textPosition.x,
            top: textPosition.y,
            minWidth: '150px',
            minHeight: '36px',
            background: 'rgba(255,255,255,0.95)',
            border: '1.5px dashed #4f46e5',
            borderRadius: '4px',
            outline: 'none',
            fontSize: '18px',
            fontFamily: 'sans-serif',
            color: strokeColor,
            resize: 'both',
            padding: '4px 8px',
            zIndex: 999,
            lineHeight: '1.4',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
      )}

      {/* Toolbar */}
      <Toolbar />

      {/* Canvas */}
      <Stage
        ref={stwageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        style={{
          backgroundColor: '#fafafa',
          cursor: isPanning.current
            ? 'grabbing'
            : tool === 'select'
              ? 'default'
              : tool === 'eraser'
                ? 'cell'
                : 'crosshair'
        }}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
      >
        <Layer>
          {shapes.map((shape: Shape) => renderShape(shape))}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) return oldBox
              return newBox
            }}
          />
        </Layer>
      </Stage>

      {/* Bottom zoom bar */}
      <div style={styles.bottomBar}>
        <button onClick={zoomOut} style={styles.zoomBtn} title="Zoom out">
          −
        </button>
        <span
          onClick={resetZoom}
          style={styles.zoomLevel}
          title="Click to reset zoom"
        >
          {Math.round(scale * 100)}%
        </span>
        <button onClick={zoomIn} style={styles.zoomBtn} title="Zoom in">
          +
        </button>
        <div style={styles.zoomDivider} />
        <button onClick={fitToScreen} style={styles.fitBtn} title="Fit to screen">
          ⊡ Fit
        </button>
        <button onClick={resetZoom} style={styles.fitBtn} title="Reset view">
          ↺ Reset
        </button>
      </div>

    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  topBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '52px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    zIndex: 100,
    gap: '12px'
  },
  topLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: '100px'
  },
  topCenter: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center'
  },
  topRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: '100px',
    justifyContent: 'flex-end'
  },
  backBtn: {
    padding: '8px 14px',
    backgroundColor: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333'
  },
  titleInput: {
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    fontWeight: '600',
    textAlign: 'center',
    color: '#1a1a1a',
    width: '300px',
    backgroundColor: 'transparent',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  hint: {
    fontSize: '11px',
    color: '#aaa',
    whiteSpace: 'nowrap'
  },
  exportBtn: {
    padding: '8px 14px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  saveBtn: {
    padding: '8px 18px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  bottomBar: {
    position: 'fixed',
    bottom: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    zIndex: 100
  },
  zoomBtn: {
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: '700',
    backgroundColor: 'transparent',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  zoomLevel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
    minWidth: '48px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '6px',
    userSelect: 'none' as const
  },
  zoomDivider: {
    width: '1px',
    height: '20px',
    backgroundColor: '#eee',
    margin: '0 4px'
  },
  fitBtn: {
    padding: '6px 10px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: 'transparent',
    color: '#555'
  }
}

export default CanvasPage