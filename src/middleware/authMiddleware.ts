// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // ожидаем формат "Bearer TOKEN"

  if (!token) {
    // Вызываем sendStatus, но не возвращаем его результат
    res.sendStatus(401);
    return;
  }

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET || 'youraccesstokensecret',
    (err: VerifyErrors | null, decoded: any): void => {
      if (err) {
        res.sendStatus(403);
        return;
      }
      req.user = decoded;
      next();
    }
  );
};
