import React from 'react'
import { useCanvasStore } from '../../store/canvasStore'

const PropertiesPanel = () => {
  const { shapes, selectedId, updateShape, deleteShape } = useCanvasStore()

  const selectedShape = shapes.find((s) => s.id === selectedId)

  if (!selectedId || !selectedShape) return null

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Properties</span>
        <button
          onClick={() => deleteShape(selectedId)}
          style={styles.deleteBtn}
          title="Delete shape"
        >
          🗑️
        </button>
      </div>

      <div style={styles.body}>

        {/* Shape type badge */}
        <div style={styles.typeBadge}>
          {selectedShape.type.charAt(0).toUpperCase() + selectedShape.type.slice(1)}
        </div>

        {/* Fill color — not for pen/line/arrow */}
        {!['pen', 'line', 'arrow', 'text'].includes(selectedShape.type) && (
          <div style={styles.row}>
            <label style={styles.label}>Fill</label>
            <div style={styles.colorRow}>
              <input
                type="color"
                value={selectedShape.fill === 'transparent' ? '#ffffff' : selectedShape.fill}
                onChange={(e) => updateShape(selectedId, { fill: e.target.value })}
                style={styles.colorInput}
              />
              <button
                onClick={() => updateShape(selectedId, { fill: 'transparent' })}
                style={{
                  ...styles.transparentBtn,
                  border: selectedShape.fill === 'transparent'
                    ? '2px solid #4f46e5'
                    : '1px solid #ddd'
                }}
                title="No fill"
              >
                ∅
              </button>
            </div>
          </div>
        )}

        {/* Stroke color */}
        <div style={styles.row}>
          <label style={styles.label}>Stroke</label>
          <input
            type="color"
            value={selectedShape.stroke}
            onChange={(e) => updateShape(selectedId, { stroke: e.target.value })}
            style={styles.colorInput}
          />
        </div>

        {/* Stroke width */}
        <div style={styles.row}>
          <label style={styles.label}>
            Stroke width — {selectedShape.strokeWidth}px
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={selectedShape.strokeWidth}
            onChange={(e) =>
              updateShape(selectedId, { strokeWidth: Number(e.target.value) })
            }
            style={styles.slider}
          />
        </div>

        {/* Opacity */}
        <div style={styles.row}>
          <label style={styles.label}>
            Opacity — {Math.round(selectedShape.opacity * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={selectedShape.opacity}
            onChange={(e) =>
              updateShape(selectedId, { opacity: Number(e.target.value) })
            }
            style={styles.slider}
          />
        </div>

        {/* Font size — only for text */}
        {selectedShape.type === 'text' && (
          <div style={styles.row}>
            <label style={styles.label}>
              Font size — {selectedShape.fontSize || 18}px
            </label>
            <input
              type="range"
              min="8"
              max="72"
              value={selectedShape.fontSize || 18}
              onChange={(e) =>
                updateShape(selectedId, { fontSize: Number(e.target.value) })
              }
              style={styles.slider}
            />
          </div>
        )}

        {/* Position */}
        <div style={styles.row}>
          <label style={styles.label}>Position</label>
          <div style={styles.positionRow}>
            <div style={styles.positionField}>
              <span style={styles.posLabel}>X</span>
              <input
                type="number"
                value={Math.round(selectedShape.x)}
                onChange={(e) =>
                  updateShape(selectedId, { x: Number(e.target.value) })
                }
                style={styles.numberInput}
              />
            </div>
            <div style={styles.positionField}>
              <span style={styles.posLabel}>Y</span>
              <input
                type="number"
                value={Math.round(selectedShape.y)}
                onChange={(e) =>
                  updateShape(selectedId, { y: Number(e.target.value) })
                }
                style={styles.numberInput}
              />
            </div>
          </div>
        </div>

        {/* Width and Height — only for rect and ellipse */}
        {['rectangle', 'ellipse'].includes(selectedShape.type) && (
          <div style={styles.row}>
            <label style={styles.label}>Size</label>
            <div style={styles.positionRow}>
              <div style={styles.positionField}>
                <span style={styles.posLabel}>W</span>
                <input
                  type="number"
                  value={Math.round(Math.abs(selectedShape.width || 0))}
                  onChange={(e) =>
                    updateShape(selectedId, { width: Number(e.target.value) })
                  }
                  style={styles.numberInput}
                />
              </div>
              <div style={styles.positionField}>
                <span style={styles.posLabel}>H</span>
                <input
                  type="number"
                  value={Math.round(Math.abs(selectedShape.height || 0))}
                  onChange={(e) =>
                    updateShape(selectedId, { height: Number(e.target.value) })
                  }
                  style={styles.numberInput}
                />
              </div>
            </div>
          </div>
        )}

        {/* Rotation */}
        <div style={styles.row}>
          <label style={styles.label}>
            Rotation — {Math.round(selectedShape.rotation || 0)}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={selectedShape.rotation || 0}
            onChange={(e) =>
              updateShape(selectedId, { rotation: Number(e.target.value) })
            }
            style={styles.slider}
          />
        </div>

        {/* Preset colors */}
        <div style={styles.row}>
          <label style={styles.label}>Quick colors</label>
          <div style={styles.colorPresets}>
            {[
              '#000000', '#ffffff', '#ef4444', '#f97316',
              '#eab308', '#22c55e', '#3b82f6', '#8b5cf6',
              '#ec4899', '#6b7280'
            ].map((color) => (
              <div
                key={color}
                onClick={() => updateShape(selectedId, { stroke: color })}
                style={{
                  ...styles.colorDot,
                  backgroundColor: color,
                  border: selectedShape.stroke === color
                    ? '2px solid #4f46e5'
                    : '1px solid #ddd'
                }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Duplicate button */}
        <button
          onClick={() => {
            const newShape = {
              ...selectedShape,
              id: Math.random().toString(36).slice(2),
              x: selectedShape.x + 20,
              y: selectedShape.y + 20
            }
            useCanvasStore.getState().addShape(newShape)
          }}
          style={styles.duplicateBtn}
        >
          ⧉ Duplicate Shape
        </button>

      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'fixed',
    top: '60px',
    right: '12px',
    width: '220px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    zIndex: 100,
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: '#fafafa'
  },
  headerTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333'
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '2px 6px',
    borderRadius: '6px',
    color: '#e53e3e'
  },
  body: {
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: 'calc(100vh - 120px)',
    overflowY: 'auto'
  },
  typeBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    backgroundColor: '#ede9fe',
    color: '#4f46e5',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    textAlign: 'center'
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '11px',
    color: '#999',
    textTransform: 'uppercase' as const,
    fontWeight: '500'
  },
  colorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  colorInput: {
    width: '40px',
    height: '32px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    padding: '2px'
  },
  transparentBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  slider: {
    width: '100%',
    accentColor: '#4f46e5'
  },
  positionRow: {
    display: 'flex',
    gap: '8px'
  },
  positionField: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flex: 1
  },
  posLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#999',
    minWidth: '12px'
  },
  numberInput: {
    width: '100%',
    padding: '4px 6px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '12px',
    outline: 'none'
  },
  colorPresets: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px'
  },
  colorDot: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    cursor: 'pointer'
  },
  duplicateBtn: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#f5f3ff',
    color: '#4f46e5',
    border: '1px solid #ede9fe',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    marginTop: '4px'
  }
}

export default PropertiesPanel