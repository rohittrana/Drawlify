import React from 'react'
import { useCanvasStore } from '../../store/canvasStore'
import { useThemeStore } from '../../store/themeStore'

const GridControls = () => {
  const {
    showGrid,
    snapToGrid,
    gridSize,
    toggleGrid,
    toggleSnapToGrid,
    setGridSize
  } = useCanvasStore()

  const { isDark } = useThemeStore()

  const surface = isDark ? '#16213e' : '#ffffff'
  const border = isDark ? '#2d2d4e' : '#eee'
  const text = isDark ? '#e2e8f0' : '#1a1a1a'
  const muted = isDark ? '#94a3b8' : '#888'

  return (
    <div style={{
      ...styles.container,
      backgroundColor: surface,
      border: `1px solid ${border}`
    }}>

      {/* Grid toggle */}
      <div style={styles.row}>
        <div style={styles.labelGroup}>
          <span style={styles.icon}>⊞</span>
          <span style={{ ...styles.label, color: text }}>Grid</span>
        </div>
        <button
          onClick={toggleGrid}
          style={{
            ...styles.toggle,
            backgroundColor: showGrid ? '#4f46e5' : (isDark ? '#2d2d4e' : '#e5e7eb')
          }}
        >
          <div style={{
            ...styles.toggleDot,
            transform: showGrid ? 'translateX(16px)' : 'translateX(0px)'
          }} />
        </button>
      </div>

      {/* Snap to grid toggle */}
      <div style={styles.row}>
        <div style={styles.labelGroup}>
          <span style={styles.icon}>🧲</span>
          <span style={{ ...styles.label, color: text }}>Snap</span>
        </div>
        <button
          onClick={toggleSnapToGrid}
          style={{
            ...styles.toggle,
            backgroundColor: snapToGrid ? '#4f46e5' : (isDark ? '#2d2d4e' : '#e5e7eb')
          }}
        >
          <div style={{
            ...styles.toggleDot,
            transform: snapToGrid ? 'translateX(16px)' : 'translateX(0px)'
          }} />
        </button>
      </div>

      {/* Grid size selector */}
      {showGrid && (
        <div style={styles.sizeRow}>
          <span style={{ ...styles.sizeLabel, color: muted }}>Size</span>
          <div style={styles.sizeOptions}>
            {[10, 20, 40, 80].map((size) => (
              <button
                key={size}
                onClick={() => setGridSize(size)}
                style={{
                  ...styles.sizeBtn,
                  backgroundColor: gridSize === size
                    ? '#4f46e5'
                    : (isDark ? '#2d2d4e' : '#f0f0f0'),
                  color: gridSize === size
                    ? '#fff'
                    : text,
                  border: `1px solid ${gridSize === size ? '#4f46e5' : border}`
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: '72px',
    right: '16px',
    borderRadius: '10px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    zIndex: 100,
    boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
    minWidth: '140px'
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px'
  },
  labelGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  icon: {
    fontSize: '14px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '500'
  },
  toggle: {
    width: '36px',
    height: '20px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    padding: 0,
    transition: 'background-color 0.2s'
  },
  toggleDot: {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '16px',
    height: '16px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    transition: 'transform 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
  },
  sizeRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    paddingTop: '4px',
    borderTop: '1px solid rgba(128,128,128,0.15)'
  },
  sizeLabel: {
    fontSize: '11px',
    fontWeight: '500',
    textTransform: 'uppercase' as const
  },
  sizeOptions: {
    display: 'flex',
    gap: '4px'
  },
  sizeBtn: {
    flex: 1,
    padding: '4px 0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '600'
  }
}

export default GridControls