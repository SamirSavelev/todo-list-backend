// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Ожидаем формат "Bearer TOKEN"

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET || 'youraccesstokensecret',
    (err, decoded) => {
      if (err) return res.sendStatus(403); // Forbidden
      req.user = decoded;
      next();
    }
  );
};
