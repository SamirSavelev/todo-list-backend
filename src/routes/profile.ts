// src/routes/profile.ts

import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { loadUsers } from '../utils/storage';

const router = Router();

/**
 * @swagger
 * /profile:
 *   get:
 *     tags:
 *       - profile
 *     summary: Получение данных профиля
 *     description: Возвращает данные профиля аутентифицированного пользователя.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные профиля успешно получены.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                   example: 1675971234567
 *                 email:
 *                   type: string
 *                   example: test@example.com
 *                 firstName:
 *                   type: string
 *                   example: Иван
 *                 lastName:
 *                   type: string
 *                   example: Иванов
 *       401:
 *         description: Пользователь не авторизован.
 *       404:
 *         description: Пользователь не найден.
 *       500:
 *         description: Внутренняя ошибка сервера.
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Предполагается, что middleware authenticateToken добавляет decoded payload в req.user.
    // Приводим req к типу any или используем специальный тип (если вы его определяли в middleware).
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Пользователь не авторизован' });
      return;
    }

    // Загружаем список пользователей из файла
    const users = await loadUsers();

    // Ищем пользователя по id
    const user = users.find((u: any) => u.id === userId);
    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    // Возвращаем данные профиля, исключая пароль
    const { password, ...profile } = user;
    res.status(200).json(profile);
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

export default router;
