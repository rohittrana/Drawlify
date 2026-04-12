import { useNavigate } from 'react-router-dom'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <h1 style={styles.code}>404</h1>
      <p style={styles.message}>Page not found</p>
      <button
        onClick={() => navigate('/dashboard')}
        style={styles.button}
      >
        Go to Dashboard
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px'
  },
  code: {
    fontSize: '80px',
    fontWeight: '700',
    color: '#4f46e5'
  },
  message: {
    fontSize: '20px',
    color: '#666'
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600'
  }
}

export default NotFoundPage