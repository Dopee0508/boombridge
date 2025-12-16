const config = {
  db: {
    host: "172.17.0.2",
    user: "root",
    password: "se2025",
    database: "BOOMBRIDGE",
    connectTimeout: 60000,
    charset: "utf8mb4"
  },
  session_secret: "a_very_long_and_secure_secret_key_for_boombridge",
};

module.exports = config;
