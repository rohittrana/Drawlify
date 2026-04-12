import { create } from 'zustand'
import { Shape, Tool } from '../types/canvas'

interface CanvasStore {
  shapes: Shape[]
  selectedId: string | null
  tool: Tool
  fillColor: string
  strokeColor: string
  strokeWidth: number
  history: Shape[][]
  historyIndex: number
  setTool: (tool: Tool) => void
  setFillColor: (color: string) => void
  setStrokeColor: (color: string) => void
  setStrokeWidth: (width: number) => void
  addShape: (shape: Shape) => void
  updateShape: (id: string, updates: Partial<Shape>) => void
  deleteShape: (id: string) => void
  setSelectedId: (id: string | null) => void
  setShapes: (shapes: Shape[]) => void
  clearCanvas: () => void
  saveHistory: () => void
  undo: () => void
  redo: () => void
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  shapes: [],
  selectedId: null,
  tool: 'select',
  fillColor: '#ffffff',
  strokeColor: '#000000',
  strokeWidth: 2,
  history: [[]],
  historyIndex: 0,

  setTool: (tool) => set({ tool, selectedId: null }),
  setFillColor: (fillColor) => set({ fillColor }),
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  setSelectedId: (selectedId) => set({ selectedId }),
  setShapes: (shapes) => set({ shapes }),

  saveHistory: () => {
    const { shapes, history, historyIndex } = get()
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...shapes])
    set({ history: newHistory, historyIndex: newHistory.length - 1 })
  },

  addShape: (shape) => {
    const { shapes, saveHistory } = get()
    saveHistory()
    set({ shapes: [...shapes, shape] })
  },

  updateShape: (id, updates) => {
    const { shapes } = get()
    set({
      shapes: shapes.map((s) => (s.id === id ? { ...s, ...updates } : s))
    })
  },

  deleteShape: (id) => {
    const { shapes, saveHistory } = get()
    saveHistory()
    set({
      shapes: shapes.filter((s) => s.id !== id),
      selectedId: null
    })
  },

  clearCanvas: () => {
    const { saveHistory } = get()
    saveHistory()
    set({ shapes: [], selectedId: null })
  },

  undo: () => {
    const { historyIndex, history } = get()
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    set({ shapes: [...history[newIndex]], historyIndex: newIndex })
  },

  redo: () => {
    const { historyIndex, history } = get()
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    set({ shapes: [...history[newIndex]], historyIndex: newIndex })
  }
}))