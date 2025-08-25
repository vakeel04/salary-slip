require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
    logging: false,
  }
);

sequelize
  .authenticate()
  .then((w) => {
    sequelize.sync( );
    console.log("MySQL connection established successfully.");
  })
  .catch((error) => {
    console.log("MySQL connection established failse Error: ", error);
  });

module.exports = { sequelize };
 