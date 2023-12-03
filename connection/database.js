const { Client } = require("pg");
require("dotenv").config();
console.log("database");

const client = new Client({
  host: process.env.HOST_NAME,
  port: process.env.PORT_NUMBER,
  user: process.env.USER_NAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});
client.connect();
module.exports = client;
