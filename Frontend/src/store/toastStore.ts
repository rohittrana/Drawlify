import { create } from 'zustand'

interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

interface ToastStore {
  toasts: ToastItem[]
  addToast: (message: string, type?: ToastItem['type']) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2)
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }))
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  }
}))

export const toast = {
  success: (message: string) =>
    useToastStore.getState().addToast(message, 'success'),
  error: (message: string) =>
    useToastStore.getState().addToast(message, 'error'),
  info: (message: string) =>
    useToastStore.getState().addToast(message, 'info'),
  warning: (message: string) =>
    useToastStore.getState().addToast(message, 'warning')
}