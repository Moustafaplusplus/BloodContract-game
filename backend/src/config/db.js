import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT),
  dialect:  'postgres',
  logging: false,
};

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

export { sequelize };
export default sequelize;
