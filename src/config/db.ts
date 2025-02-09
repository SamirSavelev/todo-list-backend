// src/config/db.ts

import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI =
      process.env.MONGO_URI || 'mongodb://localhost:27017/todo-list';
    await mongoose.connect(mongoURI); // Опции больше не нужны в Mongoose 6+
    console.log('MongoDB подключена');
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error);
    process.exit(1); // Прерываем работу сервера, если подключение не удалось
  }
};
