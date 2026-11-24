import { Sequelize } from 'sequelize';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from '../config/env.js';

if (config.dbStorage !== ':memory:') {
  mkdirSync(dirname(config.dbStorage), { recursive: true });
}

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: config.dbStorage,
  logging: false,
});

// SQLite: cheile străine trebuie activate explicit (necesar pentru I2).
export async function initDb() {
  await sequelize.query('PRAGMA foreign_keys = ON');
  await sequelize.authenticate();
}
