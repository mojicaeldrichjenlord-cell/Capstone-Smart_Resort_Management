const mysql = require("mysql2");

const useSSL = String(process.env.DB_SSL || "").toLowerCase() === "true";

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // IMPORTANT:
  // Keeps MySQL DATE/DATETIME/TIMESTAMP values as raw strings.
  // This prevents mysql2/Node from shifting times automatically.
  dateStrings: true,

  ssl: useSSL
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database pool connection failed:", err.message);
  } else {
    console.log("Connected to MySQL database");
    connection.release();
  }
});

module.exports = db;