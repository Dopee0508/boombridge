const config = {
  db: {
    host: "db",
    user: "root",
    password: "password",
    database: "BOOMBRIDGE",
    connectTimeout: 60000,
    charset: "utf8mb4"
  },
  session_secret: "a_very_long_and_secure_secret_key_for_boombridge",
};

module.exports = config;
