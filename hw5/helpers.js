// helpers.js
const mysql = require("mysql2/promise");
const configs = require("./config");

// สร้าง connection pool ใช้งานร่วมกันทั้งระบบ
const pool = mysql.createPool(configs.db);

// ฟังก์ชัน q เอาไว้ยิง SQL แบบ async/await
async function q(sql, params) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = { q, pool };
