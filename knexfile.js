require("dotenv").config();

//connect setup
module.exports = {
  client: "mysql2",
  connection: {
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    charset : 'utf8mb4'
  },
};