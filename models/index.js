require('dotenv').config();
const { Sequelize } = require('sequelize');

// create a single Sequelize instance for the project
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT, 10),
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = { sequelize };
