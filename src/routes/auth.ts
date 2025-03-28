// src/routes/auth.ts

import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { loadUsers, saveUsers } from "../utils/storage";

const router = Router();

// Интерфейс для пользователя (для типизации)
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  password: string; // Хэш пароля
}

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
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: test@example.com
 *         password:
 *           type: string
 *           example: 123456
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *
 *     RefreshRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *
 *     RefreshResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
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
// POST /auth/register - регистрация пользователя
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, firstName, lastName, password } = req.body;

    // Проверка обязательных полей
    if (!email || !firstName || !lastName || !password) {
      res.status(400).json({ message: "Пожалуйста, заполните все поля" });
      return;
    }

    // Загружаем пользователей из файла
    const users: User[] = await loadUsers();

    // Проверяем, существует ли пользователь с таким email
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      res
        .status(400)
        .json({ message: "Пользователь с такой почтой уже существует" });
      return;
    }

    // Хэшируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создаем нового пользователя
    const newUser: User = {
      id: Date.now(), // Используем timestamp как уникальный id
      email,
      firstName,
      lastName,
      password: hashedPassword,
    };

    // Добавляем пользователя в массив и сохраняем в файл
    users.push(newUser);
    await saveUsers(users);

    // Возвращаем успешный ответ
    res.status(201).json({
      message: "Пользователь успешно зарегистрирован",
      userId: newUser.id,
    });
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - auth
 *     summary: Вход в систему
 *     description: Аутентификация пользователя по email и паролю с выдачей access и refresh токенов.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Успешная аутентификация.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Неверные учетные данные.
 *       500:
 *         description: Внутренняя ошибка сервера.
 */
// POST /auth/login - аутентификация пользователя
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res
        .status(400)
        .json({ message: "Пожалуйста, предоставьте email и пароль" });
      return;
    }

    // Загружаем пользователей из файла
    const users: User[] = await loadUsers();

    // Ищем пользователя по email
    const user = users.find((user) => user.email === email);
    if (!user) {
      res.status(400).json({ message: "Неверные учетные данные" });
      return;
    }

    // Сравниваем пароль
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Неверные учетные данные" });
      return;
    }

    // Генерация токенов
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET || "youraccesstokensecret",
      { expiresIn: "30m" } // Access токен действителен 30 минут
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET || "yourrefreshtokensecret",
      { expiresIn: "7d" } // Refresh токен действителен 7 дней
    );

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Ошибка при логине:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags:
 *       - auth
 *     summary: Обновление access-токена
 *     description: Получение нового access-токена по действительному refresh-токену.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: Новый access-токен успешно выдан.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshResponse'
 *       400:
 *         description: Не предоставлен refresh-токен.
 *       403:
 *         description: Неверный или просроченный refresh-токен.
 *       500:
 *         description: Внутренняя ошибка сервера.
 */
// POST /auth/refresh - обновление access-токена
router.post("/refresh", async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: "Refresh-токен обязателен" });
      return;
    }

    // Проверяем refresh-токен
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || "yourrefreshtokensecret",
      (err: VerifyErrors | null, decoded: any) => {
        if (err) {
          res
            .status(403)
            .json({ message: "Неверный или просроченный refresh-токен" });
          return;
        }

        // Если токен валиден, генерируем новый access-токен
        const payload = {
          id: (decoded as any).id,
          email: (decoded as any).email,
        };
        const newAccessToken = jwt.sign(
          payload,
          process.env.ACCESS_TOKEN_SECRET || "youraccesstokensecret",
          { expiresIn: "30m" }
        );
        res.status(200).json({ accessToken: newAccessToken });
      }
    );
  } catch (error) {
    console.error("Ошибка при обновлении токена:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
