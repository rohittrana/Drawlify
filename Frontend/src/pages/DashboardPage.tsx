import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useTheme } from '../hooks/useTheme'
import api from '../api/axios'
import { toast } from '../store/toastStore'
interface Board {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

const DashboardPage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme } = useTheme()

  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchBoards()
  }, [])

  const fetchBoards = async () => {
    try {
      const res = await api.get('/boards')
      setBoards(res.data.boards)
    } catch {
      setError('Failed to load boards')
    } finally {
      setLoading(false)
    }
  }

  const createBoard = async () => {
    setCreating(true)
    try {
      const res = await api.post('/boards', { title: 'Untitled Board' })
      navigate(`/board/${res.data.board.id}`)
    } catch {
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
      setBoards(boards.filter((b) => b.id !== id))
    } catch {
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

  const filteredBoards = boards.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  )

  const bg = isDark ? '#1a1a2e' : '#f7f7f8'
  const surface = isDark ? '#16213e' : '#ffffff'
  const border = isDark ? '#2d2d4e' : '#eee'
  const text = isDark ? '#e2e8f0' : '#1a1a1a'
  const muted = isDark ? '#94a3b8' : '#666'
  const cardHover = isDark ? '#1e2a4a' : '#f9f9f9'

  return (
    <div style={{ ...styles.container, backgroundColor: bg, color: text }}>

      {/* Navbar */}
      <div style={{ ...styles.navbar, backgroundColor: surface, borderBottom: `1px solid ${border}` }}>
        <h1 style={{ ...styles.logo }}>Drawlify</h1>
        <div style={styles.navRight}>
          <span style={{ fontSize: '14px', color: muted }}>
            Hi, {user?.name} 👋
          </span>

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            style={{
              ...styles.iconBtn,
              backgroundColor: isDark ? '#2d2d4e' : '#f0f0f0',
              color: text
            }}
            title="Toggle dark mode"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          <button
            onClick={handleLogout}
            style={{
              ...styles.logoutBtn,
              border: `1px solid ${border}`,
              color: muted
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>

        {/* Header row */}
        <div style={styles.headerRow}>
          <h2 style={{ ...styles.heading, color: text }}>My Boards</h2>
          <div style={styles.headerActions}>
            {/* Search */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search boards..."
              style={{
                ...styles.searchInput,
                backgroundColor: surface,
                border: `1px solid ${border}`,
                color: text
              }}
            />
            <button
              onClick={createBoard}
              disabled={creating}
              style={styles.createBtn}
            >
              {creating ? 'Creating...' : '+ New Board'}
            </button>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Loading */}
        {loading && (
          <div style={styles.center}>
            <p style={{ color: muted }}>Loading boards...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredBoards.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🎨</div>
            <h3 style={{ ...styles.emptyTitle, color: text }}>
              {search ? 'No boards found' : 'No boards yet'}
            </h3>
            <p style={{ ...styles.emptyText, color: muted }}>
              {search
                ? `No boards match "${search}"`
                : 'Create your first board to start drawing'}
            </p>
            {!search && (
              <button onClick={createBoard} style={styles.createBtn}>
                + Create Board
              </button>
            )}
          </div>
        )}

        {/* Boards grid */}
        {!loading && filteredBoards.length > 0 && (
          <div style={styles.grid}>
            {filteredBoards.map((board) => (
              <div
                key={board.id}
                style={{
                  ...styles.card,
                  backgroundColor: surface,
                  border: `1px solid ${border}`
                }}
                onClick={() => navigate(`/board/${board.id}`)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = cardHover
                  const btn = e.currentTarget.querySelector('button') as HTMLButtonElement
                  if (btn) btn.style.display = 'flex'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = surface
                  const btn = e.currentTarget.querySelector('button') as HTMLButtonElement
                  if (btn) btn.style.display = 'none'
                }}
              >
                {/* Preview */}
                <div style={{
                  ...styles.preview,
                  backgroundColor: isDark ? '#0f3460' : '#f0f0ff'
                }}>
                  <span style={styles.previewIcon}>🖼️</span>
                </div>

                {/* Info */}
                <div style={styles.cardBody}>
                  <h3 style={{ ...styles.cardTitle, color: text }}>
                    {board.title}
                  </h3>
                  <p style={{ ...styles.cardDate, color: muted }}>
                    Updated {formatDate(board.updatedAt)}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => deleteBoard(board.id, e)}
                  style={{
                    ...styles.deleteBtn,
                    backgroundColor: isDark
                      ? 'rgba(30,30,60,0.9)'
                      : 'rgba(255,255,255,0.9)',
                    border: `1px solid ${border}`
                  }}
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
    fontFamily: 'sans-serif'
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    height: '60px',
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
    gap: '12px'
  },
  iconBtn: {
    width: '36px',
    height: '36px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
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
    marginBottom: '32px',
    flexWrap: 'wrap' as const,
    gap: '16px'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  heading: {
    fontSize: '24px',
    fontWeight: '700',
    margin: 0
  },
  searchInput: {
    padding: '9px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    width: '220px'
  },
  createBtn: {
    padding: '10px 20px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const
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
  emptyIcon: { fontSize: '48px' },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0
  },
  emptyText: {
    fontSize: '14px',
    margin: 0
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '20px'
  },
  card: {
    borderRadius: '12px',
    cursor: 'pointer',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    transition: 'background-color 0.15s'
  },
  preview: {
    height: '160px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewIcon: { fontSize: '40px' },
  cardBody: { padding: '14px 16px' },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '600',
    margin: '0 0 4px'
  },
  cardDate: {
    fontSize: '12px',
    margin: 0
  },
  deleteBtn: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    borderRadius: '6px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'none'
  }
}

export default DashboardPage