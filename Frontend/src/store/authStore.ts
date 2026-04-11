import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
}

interface AuthStore {
  user: User | null
  accessToken: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('accessToken'),

  setAuth: (user, accessToken) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, accessToken })
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    set({ user: null, accessToken: null })
  },

  isAuthenticated: () => !!get().accessToken
}))