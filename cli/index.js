// Require dependencies
require("dotenv").config();
const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

// Declare global variables
let txnArr = []; // Array to store queried transactions locally
const reportTypes = [
    {
        id: 1,
        name: "Sales Summary"
    },
    {
        id: 2,
        name: "Assets Under Management Summary"
    },
    {
        id: 3,
        name: "Break Report"
    },
    {
        id: 4,
        name: "Investor Profit"
    }
];

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
    app.main();
});

// Declare functions
const app = {
    main: function() {
        // Goto display
        this.display(this.prompt);
    },
    // Display table of all transactions
    display: function(callback) {
        console.table(reportTypes);
        // Goto prompt via callback
        setTimeout(callback, 500);
    },
    // Prompt user for input
    prompt: function() {
        inquirer.prompt([
            {
                name: "id",
                type: "input",
                message: "Please enter the Report ID you would like to view",
                validate: function(value) {
                    if (isNaN(value) === false) {
                        // Check that report ID is valid
                        for (let i = 0; i < reportTypes.length; i++) {
                            if (reportTypes[i].id === parseInt(value)) {
                                return true;
                            }
                        }
                    }
                    return false;
                }
            }
        ]).then(function(answer) {
            // Switch case based upon user input
            console.log("You chose Report ID: " + answer.id);
            switch (parseInt(answer.id)) {
                case 1:
                    console.log("Report 1");
                    break;
                case 2:
                    app.report2();
                    break;
                case 3:
                    app.report3();
                    break;
                case 4:
                    console.log("Report 4");
                    break;
                default:
                    return null;
            }
        });
    },
    // Assets Under Management Summary
    report2: function() {
        console.log("Report 2 - " + reportTypes[1].name);
        const query = "SELECT SALES_REP, INVESTOR, TXN_TYPE, (CASE WHEN TXN_TYPE = 'SELL' THEN -TXN_SHARES * TXN_PRICE ELSE TXN_SHARES * TXN_PRICE END) AS ASSET_VALUE FROM invest";
        connection.query(query, function(err, result) {
            if (err) {
                console.error("query error: " + err);
            }
            // Clear the txnArr for each new query
            txnArr = [];
            for (let i = 0; i < result.length; i++) {
                txnArr.push(result[i]);
            }
            // Sum the ASSET_VALUE held for each investor, using a reduce array method
            let resultArr = txnArr.reduce(function(res, obj) {
                try {
                    if (!(obj.INVESTOR in res)) {
                        res.__array.push(res[obj.INVESTOR] = obj);
                    }
                    else {
                        res[obj.INVESTOR].ASSET_VALUE += obj.ASSET_VALUE;
                    }
                    return res;
                }
                catch (e) {
                    console.error(e.type + ": " + e.message);
                }
            }, { __array: [] });
            console.table(resultArr.__array);
        });
    },
    // Break Report
    report3: function() {
        console.log("Report 3 - " + reportTypes[2].name);
    }
};
