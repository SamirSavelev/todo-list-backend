// src/routes/auth.ts

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
// Импортируем функции для работы с файлом
import { loadUsers, saveUsers } from '../utils/storage';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterUser:
 *       type: object
 *       required:
 *         - email
 *         - firstName
 *         - lastName
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: test@example.com
 *         firstName:
 *           type: string
 *           example: Иван
 *         lastName:
 *           type: string
 *           example: Иванов
 *         password:
 *           type: string
 *           example: 123456
 *
 *     RegisterResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Пользователь успешно зарегистрирован
 *         userId:
 *           type: number
 *           example: 1675971234567
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - auth
 *     summary: Регистрация нового пользователя
 *     description: Регистрация пользователя с email, именем, фамилией и паролем.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUser'
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       400:
 *         description: Неверные данные или пользователь с такой почтой уже существует.
 *       500:
 *         description: Внутренняя ошибка сервера.
 */

// Определяем интерфейс для пользователя (опционально, для типизации)
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  password: string; // Храним хеш пароля
}

// POST /auth/register - регистрация пользователя
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, firstName, lastName, password } = req.body;

    // Проверка обязательных полей
    if (!email || !firstName || !lastName || !password) {
      res.status(400).json({ message: 'Пожалуйста, заполните все поля' });
      return;
    }

    // Загружаем пользователей из файла
    const users: User[] = await loadUsers();

    // Проверяем, существует ли пользователь с таким email
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      res
        .status(400)
        .json({ message: 'Пользователь с такой почтой уже существует' });
      return;
    }

    // Хэшируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создаем нового пользователя
    const newUser: User = {
      id: Date.now(), // Используем timestamp как id
      email,
      firstName,
      lastName,
      password: hashedPassword,
    };

    // Добавляем пользователя в массив и сохраняем в файл
    users.push(newUser);
    await saveUsers(users);

    // Отправляем успешный ответ
    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      userId: newUser.id,
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

export default router;
