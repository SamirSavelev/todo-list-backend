import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import { connectDB } from './config/db';

const app = express();
const PORT = process.env.PORT || 5000;

// Подключаемся к базе данных
connectDB();

// Middleware для работы с JSON и CORS
app.use(express.json());
app.use(cors());

// Подключаем маршруты для аутентификации
app.use('/auth', authRoutes);

// Маршрут для документации Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Тестовый роут для проверки сервера
app.get('/', (req, res) => {
  res.send('Backend работает!');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
