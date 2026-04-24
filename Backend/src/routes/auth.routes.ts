import { Router } from 'express'
import {
  register,
  login,
  getMe,
  refreshToken,
  updateProfile
} from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { validateRegister, validateLogin } from '../middleware/validate.middleware'

const router = Router()

router.post('/register', validateRegister, register)
router.post('/login', validateLogin, login)
router.post('/refresh', refreshToken)
router.get('/me', authMiddleware, getMe)
router.patch('/profile', authMiddleware, updateProfile)

export default router