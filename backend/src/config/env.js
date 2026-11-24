import 'dotenv/config';

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  dbStorage: process.env.DB_STORAGE || './data/dev.sqlite',
  jwtSecret: process.env.JWT_SECRET || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
