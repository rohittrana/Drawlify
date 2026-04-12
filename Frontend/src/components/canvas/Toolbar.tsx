import React from 'react'
import { useCanvasStore } from '../../store/canvasStore'
import { Tool } from '../../types/canvas'

const tools: { tool: Tool; icon: string; label: string }[] = [
  { tool: 'select', icon: '🖱️', label: 'Select' },
  { tool: 'rectangle', icon: '⬜', label: 'Rectangle' },
  { tool: 'ellipse', icon: '⭕', label: 'Ellipse' },
  { tool: 'line', icon: '📏', label: 'Line' },
  { tool: 'arrow', icon: '➡️', label: 'Arrow' },
  { tool: 'pen', icon: '✏️', label: 'Pen' },
  { tool: 'text', icon: '🔤', label: 'Text' },
  { tool: 'eraser', icon: '🧹', label: 'Eraser' },
]

const Toolbar = () => {
  const {
    tool,
    setTool,
    fillColor,
    setFillColor,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    undo,
    redo,
    clearCanvas,
    historyIndex,
    history
  } = useCanvasStore()

  return (
    <div style={styles.toolbar}>
      <div style={styles.section}>
        {tools.map((t) => (
          <button
            key={t.tool}
            onClick={() => setTool(t.tool)}
            title={t.label}
            style={{
              ...styles.toolBtn,
              backgroundColor: tool === t.tool ? '#4f46e5' : 'transparent',
              color: tool === t.tool ? '#fff' : '#333'
            }}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.colorGroup}>
          <label style={styles.colorLabel}>Fill</label>
          <input
            type="color"
            value={fillColor}
            onChange={(e) => setFillColor(e.target.value)}
            style={styles.colorInput}
            title="Fill color"
          />
        </div>
        <div style={styles.colorGroup}>
          <label style={styles.colorLabel}>Stroke</label>
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            style={styles.colorInput}
            title="Stroke color"
          />
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <label style={styles.colorLabel}>Width</label>
        <input
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          style={{ width: '70px' }}
        />
        <span style={styles.widthLabel}>{strokeWidth}px</span>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          title="Undo Ctrl+Z"
          style={styles.actionBtn}
        >
          ↩️
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title="Redo Ctrl+Y"
          style={styles.actionBtn}
        >
          ↪️
        </button>
        <button
          onClick={() => {
            if (confirm('Clear entire canvas?')) clearCanvas()
          }}
          title="Clear all"
          style={{ ...styles.actionBtn, color: '#e53e3e' }}
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    position: 'fixed',
    top: '50%',
    left: '16px',
    transform: 'translateY(-50%)',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    zIndex: 100
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },
  toolBtn: {
    width: '40px',
    height: '40px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionBtn: {
    width: '40px',
    height: '40px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  divider: {
    width: '32px',
    height: '1px',
    backgroundColor: '#eee',
    margin: '4px 0'
  },
  colorGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px'
  },
  colorLabel: {
    fontSize: '10px',
    color: '#999',
    textTransform: 'uppercase' as const
  },
  colorInput: {
    width: '36px',
    height: '28px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    padding: '2px'
  },
  widthLabel: {
    fontSize: '11px',
    color: '#666'
  }
}

export default Toolbar