// backend/src/config/publicationsDatabase.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const publicationsPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.PUB_DB_NAME,          // <- only DB name differs
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

export default publicationsPool;