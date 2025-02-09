// src/routes/auth.ts

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';

const router = Router();

// Интерфейс пользователя
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  password: string; // Храним хеш пароля
}

// Временное хранилище пользователей (пока в памяти)
const users: User[] = [];

// POST /auth/register - регистрация пользователя
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, firstName, lastName, password } = req.body;

    // Проверка обязательных полей
    if (!email || !firstName || !lastName || !password) {
      res.status(400).json({ message: 'Пожалуйста, заполните все поля' });
      return;
    }

    // Проверка, существует ли уже пользователь с такой почтой
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      res
        .status(400)
        .json({ message: 'Пользователь с такой почтой уже существует' });
      return;
    }

    // Хэширование пароля с использованием bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создание нового пользователя
    const newUser: User = {
      id: Date.now(), // Для простоты используем timestamp в качестве id
      email,
      firstName,
      lastName,
      password: hashedPassword,
    };

    // Сохраняем пользователя в массив
    users.push(newUser);

    // Возвращаем успешный ответ
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
