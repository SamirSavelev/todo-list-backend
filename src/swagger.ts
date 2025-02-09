// src/swagger.ts

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'To-Do List API',
      version: '1.0.0',
      description: 'Документация для API проекта To-Do List',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
  },
  // Указываем пути к файлам с аннотациями Swagger (например, все файлы в папке routes)
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
