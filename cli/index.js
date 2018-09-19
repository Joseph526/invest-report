// Require dependencies
require("dotenv").config();
const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

// Declare global variables
let txnArr = []; // Array to store queried transactions locally

// MySQL DB Connection Information
const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PW,
    database: process.env.MYSQL_DB
});

// Initiate MySQL Connection.
connection.connect(function(err) {
    if (err) {
        console.error("error connecting: " + err.stack);
        return;
    }
    console.log("connected as id " + connection.threadId);
});
