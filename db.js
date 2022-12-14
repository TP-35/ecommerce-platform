const mysql = require("mysql2");
require("dotenv").config();

// Connect to local db
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    multipleStatements: false
}) 

module.exports = pool.promise();