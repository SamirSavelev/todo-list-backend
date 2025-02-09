// src/utils/storage.ts

import { promises as fs } from 'fs';
import path from 'path';

// Полный путь к файлу с данными.
// __dirname указывает на текущую директорию (src/utils),
// поэтому поднимаемся на два уровня вверх и заходим в папку data.
const dataFilePath = path.join(__dirname, '../../data/users.json');

/**
 * Загружает пользователей из файла.
 */
export async function loadUsers(): Promise<any[]> {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (err: any) {
    // Если файла нет, создаем его с пустым массивом.
    if (err.code === 'ENOENT') {
      await fs.writeFile(dataFilePath, '[]', 'utf-8');
      return [];
    }
    throw err;
  }
}

/**
 * Сохраняет пользователей в файл.
 * @param users Массив пользователей.
 */
export async function saveUsers(users: any[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), 'utf-8');
}
