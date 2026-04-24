import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useTheme } from '../hooks/useTheme'
import { toast } from '../store/toastStore'
import api from '../api/axios'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, setAuth, logout } = useAuthStore()
  const { isDark, toggleTheme } = useTheme()

  const [name, setName] = useState(user?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)

  const bg = isDark ? '#1a1a2e' : '#f7f7f8'
  const surface = isDark ? '#16213e' : '#ffffff'
  const border = isDark ? '#2d2d4e' : '#eee'
  const text = isDark ? '#e2e8f0' : '#1a1a1a'
  const muted = isDark ? '#94a3b8' : '#666'
  const inputBg = isDark ? '#0f3460' : '#fff'

  // Update name
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Name cannot be empty')
      return
    }

    setLoadingProfile(true)
    try {
      const res = await api.patch('/auth/profile', { name })
      const token = localStorage.getItem('accessToken') || ''
      setAuth(res.data.user, token)
      toast.success('Name updated successfully!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update name')
    } finally {
      setLoadingProfile(false)
    }
  }

  // Update password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoadingPassword(true)
    try {
      await api.patch('/auth/profile', { currentPassword, newPassword })
      toast.success('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password')
    } finally {
      setLoadingPassword(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.info('Logged out successfully')
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This will delete your account and all boards permanently.')) return
    if (!confirm('This cannot be undone. Are you absolutely sure?')) return
    toast.error('Account deletion coming soon')
  }

  return (
    <div style={{ ...styles.container, backgroundColor: bg, color: text }}>

      {/* Navbar */}
      <div style={{
        ...styles.navbar,
        backgroundColor: surface,
        borderBottom: `1px solid ${border}`
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ ...styles.backBtn, color: text, border: `1px solid ${border}` }}
        >
          ← Dashboard
        </button>

        <h1 style={styles.logo}>Drawlify</h1>

        <button
          onClick={toggleTheme}
          style={{
            ...styles.iconBtn,
            backgroundColor: isDark ? '#2d2d4e' : '#f0f0f0',
            color: text
          }}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Main content */}
      <div style={styles.main}>
        <h2 style={{ ...styles.pageTitle, color: text }}>
          Account Settings
        </h2>

        {/* Profile avatar card */}
        <div style={{
          ...styles.card,
          backgroundColor: surface,
          border: `1px solid ${border}`
        }}>
          <div style={styles.avatarSection}>
            <div style={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ ...styles.avatarName, color: text }}>
                {user?.name}
              </h3>
              <p style={{ ...styles.avatarEmail, color: muted }}>
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Update name card */}
        <div style={{
          ...styles.card,
          backgroundColor: surface,
          border: `1px solid ${border}`
        }}>
          <h3 style={{ ...styles.cardTitle, color: text }}>
            Personal Information
          </h3>
          <p style={{ ...styles.cardSubtitle, color: muted }}>
            Update your display name
          </p>

          <form onSubmit={handleUpdateName} style={styles.form}>
            <div style={styles.field}>
              <label style={{ ...styles.label, color: muted }}>
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                style={{
                  ...styles.input,
                  backgroundColor: inputBg,
                  border: `1px solid ${border}`,
                  color: text
                }}
              />
            </div>

            <div style={styles.field}>
              <label style={{ ...styles.label, color: muted }}>
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                style={{
                  ...styles.input,
                  backgroundColor: isDark ? '#0a1628' : '#f5f5f5',
                  border: `1px solid ${border}`,
                  color: muted,
                  cursor: 'not-allowed'
                }}
              />
              <span style={{ fontSize: '11px', color: muted }}>
                Email cannot be changed
              </span>
            </div>

            <button
              type="submit"
              disabled={loadingProfile}
              style={styles.primaryBtn}
            >
              {loadingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change password card */}
        <div style={{
          ...styles.card,
          backgroundColor: surface,
          border: `1px solid ${border}`
        }}>
          <h3 style={{ ...styles.cardTitle, color: text }}>
            Change Password
          </h3>
          <p style={{ ...styles.cardSubtitle, color: muted }}>
            Use a strong password with at least 6 characters
          </p>

          <form onSubmit={handleUpdatePassword} style={styles.form}>
            <div style={styles.field}>
              <label style={{ ...styles.label, color: muted }}>
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  ...styles.input,
                  backgroundColor: inputBg,
                  border: `1px solid ${border}`,
                  color: text
                }}
              />
            </div>

            <div style={styles.field}>
              <label style={{ ...styles.label, color: muted }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  ...styles.input,
                  backgroundColor: inputBg,
                  border: `1px solid ${border}`,
                  color: text
                }}
              />
            </div>

            <div style={styles.field}>
              <label style={{ ...styles.label, color: muted }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  ...styles.input,
                  backgroundColor: inputBg,
                  border: `1px solid ${border}`,
                  color: text
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loadingPassword}
              style={styles.primaryBtn}
            >
              {loadingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Stats card */}
        <div style={{
          ...styles.card,
          backgroundColor: surface,
          border: `1px solid ${border}`
        }}>
          <h3 style={{ ...styles.cardTitle, color: text }}>
            Account Info
          </h3>
          <div style={styles.statRow}>
            <span style={{ color: muted }}>Account ID</span>
            <span style={{
              ...styles.statValue,
              color: text,
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              {user?.id?.slice(0, 8)}...
            </span>
          </div>
          <div style={{ ...styles.statRow, borderTop: `1px solid ${border}` }}>
            <span style={{ color: muted }}>Theme</span>
            <span style={{ color: text }}>
              {isDark ? '🌙 Dark' : '☀️ Light'}
            </span>
          </div>
        </div>

        {/* Danger zone */}
        <div style={{
          ...styles.card,
          backgroundColor: surface,
          border: '1px solid #fca5a5'
        }}>
          <h3 style={{ ...styles.cardTitle, color: '#ef4444' }}>
            Danger Zone
          </h3>
          <p style={{ ...styles.cardSubtitle, color: muted }}>
            These actions are permanent and cannot be undone
          </p>

          <div style={styles.dangerRow}>
            <div>
              <p style={{ fontWeight: '500', color: text, marginBottom: '4px' }}>
                Sign out
              </p>
              <p style={{ fontSize: '13px', color: muted }}>
                Sign out of your account on this device
              </p>
            </div>
            <button onClick={handleLogout} style={styles.dangerBtn}>
              Sign Out
            </button>
          </div>

          <div style={{
            ...styles.dangerRow,
            borderTop: `1px solid #fca5a5`,
            marginTop: '12px',
            paddingTop: '16px'
          }}>
            <div>
              <p style={{ fontWeight: '500', color: '#ef4444', marginBottom: '4px' }}>
                Delete Account
              </p>
              <p style={{ fontSize: '13px', color: muted }}>
                Permanently delete your account and all boards
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              style={styles.deleteAccountBtn}
            >
              Delete
            </button>
          </div>
        </div>

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
    fontSize: '20px',
    fontWeight: '700',
    color: '#4f46e5',
    margin: 0
  },
  backBtn: {
    padding: '8px 14px',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
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
  main: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    margin: 0
  },
  card: {
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#4f46e5',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '700',
    flexShrink: 0
  },
  avatarName: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 4px'
  },
  avatarEmail: {
    fontSize: '14px',
    margin: 0
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 4px'
  },
  cardSubtitle: {
    fontSize: '13px',
    margin: '0 0 20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '500'
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    width: '100%'
  },
  primaryBtn: {
    padding: '11px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px'
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    fontSize: '14px'
  },
  statValue: {
    fontWeight: '500'
  },
  dangerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px'
  },
  dangerBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0
  },
  deleteAccountBtn: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0
  }
}

export default ProfilePage