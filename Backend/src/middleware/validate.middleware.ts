import { Request, Response, NextFunction } from 'express'

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, name } = req.body

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' })
  }

  next()
}

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' })
  }

  next()
}