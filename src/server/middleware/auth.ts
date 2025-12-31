import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';

export const requireAuth = (req: Request & any, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: 'Invalid token' });
  req.user = payload;
  next();
};
