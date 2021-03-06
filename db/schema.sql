### Schema

DROP DATABASE IF EXISTS invest_db;
CREATE DATABASE invest_db;
USE invest_db;

CREATE TABLE invest (
	ID INT NOT NULL AUTO_INCREMENT,
    TXN_DATE DATE NOT NULL,
    TXN_TYPE VARCHAR(255) NOT NULL,
    TXN_SHARES DECIMAL(10, 4) NOT NULL,
    TXN_PRICE DECIMAL(10, 2) NOT NULL,
    FUND VARCHAR(255) NOT NULL,
    INVESTOR VARCHAR(255) NOT NULL,
    SALES_REP VARCHAR(255) NOT NULL,
    PRIMARY KEY (ID)
);
