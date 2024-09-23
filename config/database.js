const mysql = require('mysql2/promise');
require("dotenv").config();

// Create the connection to the database using environment variables
const db = mysql.createPool({
    host: process.env.DATABASE_HOST,
    
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
});
module.exports = db;