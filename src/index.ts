import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware для работы с JSON и CORS
app.use(express.json());
app.use(cors());

// Простой тестовый роут
app.get('/', (req, res) => {
  res.send('Backend работает!');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
