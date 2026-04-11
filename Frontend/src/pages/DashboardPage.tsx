import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'

interface Board {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

const DashboardPage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  // Load all boards on page load
  useEffect(() => {
    fetchBoards()
  }, [])

  const fetchBoards = async () => {
    try {
      const res = await api.get('/boards')
      setBoards(res.data.boards)
    } catch (err) {
      setError('Failed to load boards')
    } finally {
      setLoading(false)
    }
  }

  const createBoard = async () => {
    setCreating(true)
    try {
      const res = await api.post('/boards', { title: 'Untitled Board' })
      const newBoard = res.data.board
      setBoards([newBoard, ...boards])
      // Immediately open the new board
      navigate(`/board/${newBoard.id}`)
    } catch (err) {
      setError('Failed to create board')
    } finally {
      setCreating(false)
    }
  }

  const deleteBoard = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this board?')) return

    try {
      await api.delete(`/boards/${id}`)
      setBoards(boards.filter(b => b.id !== id))
    } catch (err) {
      setError('Failed to delete board')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h1 style={styles.logo}>Drawlify</h1>
        <div style={styles.navRight}>
          <span style={styles.userName}>Hi, {user?.name} 👋</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={styles.main}>
        {/* Header row */}
        <div style={styles.headerRow}>
          <h2 style={styles.heading}>My Boards</h2>
          <button
            onClick={createBoard}
            disabled={creating}
            style={styles.createBtn}
          >
            {creating ? 'Creating...' : '+ New Board'}
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Loading */}
        {loading && (
          <div style={styles.center}>
            <p style={{ color: '#666' }}>Loading boards...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && boards.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🎨</div>
            <h3 style={styles.emptyTitle}>No boards yet</h3>
            <p style={styles.emptyText}>
              Create your first board to start drawing
            </p>
            <button
              onClick={createBoard}
              disabled={creating}
              style={styles.createBtn}
            >
              {creating ? 'Creating...' : '+ Create Board'}
            </button>
          </div>
        )}

        {/* Boards grid */}
        {!loading && boards.length > 0 && (
          <div style={styles.grid}>
            {boards.map(board => (
              <div
                key={board.id}
                style={styles.card}
                onClick={() => navigate(`/board/${board.id}`)}
              >
                {/* Board preview area */}
                <div style={styles.preview}>
                  <span style={styles.previewIcon}>🖼️</span>
                </div>

                {/* Board info */}
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{board.title}</h3>
                  <p style={styles.cardDate}>
                    Updated {formatDate(board.updatedAt)}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => deleteBoard(board.id, e)}
                  style={styles.deleteBtn}
                  title="Delete board"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f7f7f8',
    fontFamily: 'sans-serif'
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    height: '60px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #eee',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logo: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#4f46e5',
    margin: 0
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  userName: {
    fontSize: '14px',
    color: '#555'
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#555'
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 32px'
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px'
  },
  heading: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0
  },
  createBtn: {
    padding: '10px 20px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  error: {
    backgroundColor: '#fff0f0',
    color: '#e53e3e',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px'
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    padding: '60px 0'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 0',
    gap: '12px'
  },
  emptyIcon: {
    fontSize: '48px'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: 0
  },
  emptyText: {
    fontSize: '14px',
    color: '#666',
    margin: 0
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #eee',
    cursor: 'pointer',
    overflow: 'hidden',
    position: 'relative',
    transition: 'box-shadow 0.2s',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
  },
  preview: {
    height: '160px',
    backgroundColor: '#f0f0ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewIcon: {
    fontSize: '40px'
  },
  cardBody: {
    padding: '14px 16px'
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 4px'
  },
  cardDate: {
    fontSize: '12px',
    color: '#999',
    margin: 0
  },
  deleteBtn: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'rgba(255,255,255,0.9)',
    border: '1px solid #eee',
    borderRadius: '6px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'none'
  }
}

export default DashboardPage