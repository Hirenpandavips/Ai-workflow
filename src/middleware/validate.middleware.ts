import { Request, Response, NextFunction } from 'express';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterInput(req: Request, res: Response, next: NextFunction): void {
  const { email, password } = req.body as { email: unknown; password: unknown };

  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    res.status(400).json({ message: 'Invalid email format' });
    return;
  }

  if (typeof password !== 'string' || password.length < 8) {
    res.status(400).json({ message: 'Password must be at least 8 characters' });
    return;
  }

  next();
}
