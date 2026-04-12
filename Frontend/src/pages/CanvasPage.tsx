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

  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const isDrawing = useRef(false)
  const currentShapeId = useRef<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [boardTitle, setBoardTitle] = useState('Untitled Board')
  const [saving, setSaving] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null)
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') undo()
      if (e.ctrlKey && e.key === 'y') redo()
      if (e.key === 'Delete' && selectedId) deleteShape(selectedId)
      if (e.key === 'Escape') setSelectedId(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId])

  // Transformer
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return
    const stage = stageRef.current
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
    const stage = stageRef.current
    if (!stage) return
    const dataURL = stage.toDataURL({ pixelRatio: 2 })
    const link = document.createElement('a')
    link.download = `${boardTitle}.png`
    link.href = dataURL
    link.click()
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

  // Mouse down
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (tool === 'select' || tool === 'eraser') {
        if (e.target === e.target.getStage()) setSelectedId(null)
        return
      }

      const stage = stageRef.current
      if (!stage) return
      const pos = stage.getPointerPosition()
      if (!pos) return

      isDrawing.current = true
      const newId = uuidv4()
      currentShapeId.current = newId

      const baseShape: Shape = {
        id: newId,
        type: tool as ShapeType,
        x: pos.x,
        y: pos.y,
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
        addShape({ ...baseShape, points: [pos.x, pos.y] })
      } else if (tool === 'text') {
        // Show inline textarea at exact click position
        setTextPosition({ x: pos.x, y: pos.y })
        setTextInput('')
        isDrawing.current = false
        currentShapeId.current = null
        setTimeout(() => textareaRef.current?.focus(), 50)
      }
    },
    [tool, fillColor, strokeColor, strokeWidth]
  )

  // Mouse move
  const handleMouseMove = useCallback(() => {
    if (!isDrawing.current || !currentShapeId.current) return
    const stage = stageRef.current
    if (!stage) return
    const pos = stage.getPointerPosition()
    if (!pos) return

    const shapeId = currentShapeId.current
    const shape = shapes.find((s) => s.id === shapeId)
    if (!shape) return

    if (tool === 'rectangle' || tool === 'ellipse') {
      updateShape(shapeId, {
        width: pos.x - shape.x,
        height: pos.y - shape.y
      })
    } else if (tool === 'line' || tool === 'arrow') {
      updateShape(shapeId, {
        points: [0, 0, pos.x - shape.x, pos.y - shape.y]
      })
    } else if (tool === 'pen') {
      const existing = shape.points || []
      updateShape(shapeId, { points: [...existing, pos.x, pos.y] })
    }
  }, [tool, shapes])

  // Mouse up
  const handleMouseUp = useCallback(() => {
    isDrawing.current = false
    currentShapeId.current = null
  }, [])

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
            fontSize={18}
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
            Del: delete • Ctrl+Z: undo • Ctrl+Y: redo
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

      {/* Inline text input — appears where user clicked */}
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
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        style={{
          backgroundColor: '#fafafa',
          cursor:
            tool === 'select'
              ? 'default'
              : tool === 'eraser'
              ? 'cell'
              : 'crosshair'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
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
  }
}

export default CanvasPage