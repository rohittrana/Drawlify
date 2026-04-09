import { Router } from 'express'
import {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard
} from '../controllers/board.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

// All board routes are protected
router.use(authMiddleware)

router.post('/', createBoard)
router.get('/', getBoards)
router.get('/:id', getBoard)
router.patch('/:id', updateBoard)
router.delete('/:id', deleteBoard)

export default router