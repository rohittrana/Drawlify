import { create } from 'zustand'

interface ThemeStore {
  isDark: boolean
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  isDark: localStorage.getItem('theme') === 'dark',

  toggleTheme: () => {
    const newTheme = !get().isDark
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    set({ isDark: newTheme })
  }
}))