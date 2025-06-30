import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,      // database
  process.env.DB_USER,      // user
  process.env.DB_PASS,      // password
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,         // set to console.log to see raw SQL
  }
);
