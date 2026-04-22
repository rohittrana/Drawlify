import { useEffect } from 'react'
import { useThemeStore } from '../store/themeStore'

export const useTheme = () => {
  const { isDark, toggleTheme } = useThemeStore()

  useEffect(() => {
    document.body.style.backgroundColor = isDark ? '#1a1a2e' : '#f7f7f8'
    document.body.style.color = isDark ? '#e2e8f0' : '#1a1a1a'
  }, [isDark])

  return { isDark, toggleTheme }
}