import mysql2 from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql2
  .createPool({
    host: process.env.MYSQL_DB_HOST,
    user: process.env.MYSQL_DB_USER,
    password: process.env.MYSQL_DB_PASS,
    database: process.env.MYSQL_DB_NAME,
    port: process.env.MYSQL_DB_PORT || 3306,
    connectionLimit: 10,
    queueLimit: 0,
    waitForConnections: true,
  })
  .promise();

const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await pool.query("SELECT DATABASE() AS db_name");
    console.log("Connected to DB:", rows[0].db_name);
    connection.release();
  } catch (error) {
    console.error("Failed to connect userdb:", error.message);
  }
};

export { pool, checkConnection };
