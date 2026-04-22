import React, { useEffect } from 'react'
import { useToastStore } from '../store/toastStore'
const Toast = () => {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div style={styles.container}>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: {
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
  }
  onRemove: (id: string) => void
}

const ToastItem = ({ toast, onRemove }: ToastItemProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const colors = {
    success: {
      bg: '#f0fdf4',
      border: '#86efac',
      icon: '✅',
      text: '#166534'
    },
    error: {
      bg: '#fef2f2',
      border: '#fca5a5',
      icon: '❌',
      text: '#991b1b'
    },
    info: {
      bg: '#eff6ff',
      border: '#93c5fd',
      icon: 'ℹ️',
      text: '#1e40af'
    },
    warning: {
      bg: '#fffbeb',
      border: '#fcd34d',
      icon: '⚠️',
      text: '#92400e'
    }
  }

  const color = colors[toast.type]

  return (
    <div
      style={{
        ...styles.toast,
        backgroundColor: color.bg,
        border: `1px solid ${color.border}`,
        color: color.text
      }}
    >
      <span style={styles.icon}>{color.icon}</span>
      <span style={styles.message}>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{ ...styles.closeBtn, color: color.text }}
      >
        ✕
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    zIndex: 9999
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '10px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
    minWidth: '260px',
    maxWidth: '380px',
    animation: 'slideIn 0.25s ease'
  },
  icon: {
    fontSize: '16px',
    flexShrink: 0
  },
  message: {
    fontSize: '14px',
    fontWeight: '500',
    flex: 1,
    lineHeight: '1.4'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '0 4px',
    opacity: 0.6,
    flexShrink: 0
  }
}

export default Toast