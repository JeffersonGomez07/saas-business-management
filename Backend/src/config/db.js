import dotenv from "dotenv";
dotenv.config();

import sql from "mssql";

const config = {
  server: process.env.DB_SERVER, // PCJGU o localhost
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  port: Number(process.env.DB_PORT || 1433),

  options: {
    trustServerCertificate: true,
    encrypt: false,
  },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on("error", err => {
    console.error("Error de SQL Server:", err);
});

export { poolConnect };
export default pool;