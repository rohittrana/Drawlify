import { Response } from 'express'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

// Create new board
export const createBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title } = req.body

    const board = await prisma.board.create({
      data: {
        title: title || 'Untitled Board',
        userId: req.userId!,
        shapes: []
      }
    })

    res.status(201).json({ board })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get all boards for logged in user
export const getBoards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const boards = await prisma.board.findMany({
      where: { userId: req.userId! },
      orderBy: { updatedAt: 'desc' }
    })

    res.json({ boards })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get single board by id
export const getBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params['id'] as string   // ← fix here

    if (!id) {
      res.status(400).json({ message: 'Board id is required' })
      return
    }

    const board = await prisma.board.findFirst({
      where: { id, userId: req.userId! }
    })

    if (!board) {
      res.status(404).json({ message: 'Board not found' })
      return
    }

    res.json({ board })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Save shapes to board
export const updateBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params['id'] as string   // ← fix here
    const { shapes, title } = req.body

    if (!id) {
      res.status(400).json({ message: 'Board id is required' })
      return
    }

    const board = await prisma.board.findFirst({
      where: { id, userId: req.userId! }
    })

    if (!board) {
      res.status(404).json({ message: 'Board not found' })
      return
    }

    const updated = await prisma.board.update({
      where: { id },
      data: {
        ...(shapes !== undefined && { shapes }),
        ...(title !== undefined && { title })
      }
    })

    res.json({ board: updated })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Delete board
export const deleteBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params['id'] as string   // ← fix here

    if (!id) {
      res.status(400).json({ message: 'Board id is required' })
      return
    }

    const board = await prisma.board.findFirst({
      where: { id, userId: req.userId! }
    })

    if (!board) {
      res.status(404).json({ message: 'Board not found' })
      return
    }

    await prisma.board.delete({ where: { id } })

    res.json({ message: 'Board deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}