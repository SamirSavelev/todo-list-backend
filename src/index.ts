// src/index.ts

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile'; // импортируем маршруты профиля
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import { config } from 'dotenv';

// Загружаем переменные окружения (если используете .env)
config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware для работы с JSON и CORS
app.use(express.json());
app.use(cors());

// Подключаем маршруты аутентификации
app.use('/auth', authRoutes);

// Подключаем маршрут получения профиля (защищённый авторизацией)
app.use('/profile', profileRoutes);

// Маршрут для документации Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Тестовый роут
app.get('/', (req, res) => {
  res.send('Backend работает!');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
