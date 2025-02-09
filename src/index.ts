// src/index.ts

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth'; // Импортируем маршруты для аутентификации

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware для работы с JSON и CORS
app.use(express.json());
app.use(cors());

// Подключаем маршруты для аутентификации (регистрация, авторизация)
app.use('/auth', authRoutes);

// Тестовый роут для проверки сервера
app.get('/', (req, res) => {
  res.send('Backend работает!');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
