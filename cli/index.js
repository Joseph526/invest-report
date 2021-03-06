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
                message: "Please enter the Report ID you would like to view:",
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
                    app.report1();
                    break;
                case 2:
                    app.report2();
                    break;
                case 3:
                    app.report3();
                    break;
                case 4:
                    app.report4();
                    break;
                default:
                    return null;
            }
        });
    },
    // Sales Summary
    report1: function() {
        console.log("Report 1 - " + reportTypes[0].name);
        const query = "SELECT SALES_REP, TXN_TYPE, CAST(SUM((CASE WHEN MONTH(NOW()) = MONTH(TXN_DATE) AND NOW() >= TXN_DATE THEN TXN_SHARES * TXN_PRICE ELSE '0' END)) AS DECIMAL(10,2)) AS MTD_SALES, CAST(SUM((CASE WHEN QUARTER(NOW()) = QUARTER(TXN_DATE) AND NOW() >= TXN_DATE THEN TXN_SHARES * TXN_PRICE ELSE '0' END)) AS DECIMAL(10,2)) AS QTD_SALES, CAST(SUM((CASE WHEN YEAR(NOW()) = YEAR(TXN_DATE) AND NOW() >= TXN_DATE THEN TXN_SHARES * TXN_PRICE ELSE '0' END)) AS DECIMAL(10,2)) AS YTD_SALES, CAST(SUM((CASE WHEN NOW() >= TXN_DATE THEN TXN_SHARES * TXN_PRICE ELSE '0' END)) AS DECIMAL(10,2)) AS ITD_SALES FROM invest WHERE TXN_TYPE = 'SELL' GROUP BY SALES_REP";
        connection.query(query, function(err, result) {
            if (err) {
                console.error("query error: " + err);
            }
            // Clear the txnArr for each new query
            txnArr = [];
            for (let i = 0; i < result.length; i++) {
                txnArr.push(result[i]);
            }
            // Display results in table format
            console.table(txnArr);

            // Goto checkout for new report or quit
            app.checkout();
        });
    },
    // Assets Under Management Summary
    report2: function() {
        console.log("Report 2 - " + reportTypes[1].name);
        const query = "SELECT SALES_REP, CAST(SUM((CASE WHEN TXN_TYPE = 'SELL' THEN -TXN_SHARES * TXN_PRICE ELSE TXN_SHARES * TXN_PRICE END)) AS DECIMAL(10,2)) AS ASSET_VALUE FROM invest GROUP BY SALES_REP";
        connection.query(query, function(err, result) {
            if (err) {
                console.error("query error: " + err);
            }
            // Clear the txnArr for each new query
            txnArr = [];
            for (let i = 0; i < result.length; i++) {
                txnArr.push(result[i]);
            }

            // Display results in table format
            console.table(txnArr);

            // Goto checkout for new report or quit
            app.checkout();
        });
    },
    // Break Report
    report3: function() {
        console.log("Report 3 - " + reportTypes[2].name);
        const query = "SELECT INVESTOR, FUND, SUM((CASE WHEN TXN_TYPE = 'SELL' THEN -TXN_SHARES ELSE TXN_SHARES END)) AS TXN_SHARES, CAST(SUM((CASE WHEN TXN_TYPE = 'SELL' THEN -TXN_SHARES * TXN_PRICE ELSE TXN_SHARES * TXN_PRICE END)) AS DECIMAL(10,2)) AS ASSET_VALUE FROM invest GROUP BY INVESTOR, FUND";
        connection.query(query, function(err, result) {
            if (err) {
                console.error("query error: " + err);
            }
            // Clear the txnArr for each new query
            txnArr = [];
            for (let i = 0; i < result.length; i++) {
                txnArr.push(result[i]);
            }
            // Add error message to array object if negative cash or share balance
            let resultArr = txnArr.map(function(item) {
                try {
                    item.ERROR_MSG = "";
                    if (item.ASSET_VALUE < 0) {
                        item.ERROR_MSG += "Negative cash balance ";
                    }
                    if (item.TXN_SHARES < 0) {
                        item.ERROR_MSG += "Negative share balance ";
                    }
                    return item;
                }
                catch (e) {
                    console.error(e.type + ": " + e.message);
                }
            });
            // Display results in table format
            console.table(resultArr);

            // Goto checkout for new report or quit
            app.checkout();
        });
    },
    // Investor Profit
    report4: function() {
        console.log("Report 4 - " + reportTypes[3].name);
        const query = "SELECT INVESTOR, FUND, TXN_TYPE, CAST((CASE WHEN TXN_TYPE = 'SELL' THEN -TXN_SHARES * TXN_PRICE ELSE TXN_SHARES * TXN_PRICE END) AS DECIMAL(10,2)) AS PROFIT_OR_LOSS FROM invest";
        connection.query(query, function(err, result) {
            if (err) {
                console.error("query error: " + err);
            }
            // Clear the txnArr for each new query
            txnArr = [];
            for (let i = 0; i < result.length; i++) {
                txnArr.push(result[i]);
            }
            // Sum the PROFIT_OR_LOSS for each investor and fund, using a reduce array method
            let resultArr = [];
            // Filter for only Stock Fund results first
            let stockFund = txnArr.filter(function(item) {
                if (item.FUND === "STOCK FUND") {
                    return item;
                }
            });
            let stockFundReducer = stockFund.reduce(function(res, obj) {
                try {
                    if (!(obj.INVESTOR in res)) {
                        res.__array.push(res[obj.INVESTOR] = obj);
                    }
                    else {
                        res[obj.INVESTOR].PROFIT_OR_LOSS += obj.PROFIT_OR_LOSS;
                    }
                    return res;
                }
                catch (e) {
                    console.error(e.type + ": " + e.message);
                }
            }, { __array: [] });

            // Repeat the procedure for Bond Fund
            let bondFund = txnArr.filter(function(item) {
                if (item.FUND === "BOND FUND") {
                    return item;
                }
            });
            let bondFundReducer = bondFund.reduce(function(res, obj) {
                try {
                    if (!(obj.INVESTOR in res)) {
                        res.__array.push(res[obj.INVESTOR] = obj);
                    }
                    else {
                        res[obj.INVESTOR].PROFIT_OR_LOSS += obj.PROFIT_OR_LOSS;
                    }
                    return res;
                }
                catch (e) {
                    console.error(e.type + ": " + e.message);
                }
            }, { __array: [] });

            // Concatenate and display the results
            resultArr = resultArr.concat(stockFundReducer.__array).concat(bondFundReducer.__array);
            console.table(resultArr);

            // Goto checkout for new report or quit
            app.checkout();
        });
    },
    // Prompt user to run another report or quit
    checkout: function() {
        inquirer.prompt({
            name: "restart",
            type: "confirm",
            message: "Would you like to run another report?"
        }).then(function(answer) {
            if (answer.restart) {
                // Restart the order process
                app.main();
            }
            else {
                console.log("Thanks for viewing!");
                connection.end();
            }
        });
    }
};

module.exports = app;
