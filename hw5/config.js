const config = {
  db: {
    host: "127.0.0.1",       // 👈 เปลี่ยนจาก 172.17.0.2 เป็นอันนี้
    user: "root",
    password: "se2025",
    database: "BOOMBRIDGE",
    connectTimeout: 60000
  },
  session_secret: "a_very_long_and_secure_secret_key_for_boombridge",
};

module.exports = config;
