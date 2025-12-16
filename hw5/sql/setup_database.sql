-- Step 1: Create Database and Staging Tables
CREATE DATABASE BOOMBRIDGE COLLATE utf8mb4_unicode_ci;
USE BOOMBRIDGE;

CREATE TABLE staging_companies (
    company_id VARCHAR(100),
    name VARCHAR(255),
    description TEXT,
    address TEXT,
    phone VARCHAR(100),
    email VARCHAR(255),
    comments TEXT
) COLLATE utf8mb4_unicode_ci;

CREATE TABLE staging_materials (
    material_id VARCHAR(100),
    Item TEXT,
    Unit VARCHAR(50),
    PriceAvg FLOAT,
    PriceStdev FLOAT,
    NoSamples INT
) COLLATE utf8mb4_unicode_ci;

CREATE TABLE staging_transactions (
    transaction_id VARCHAR(100),
    company_id VARCHAR(100),
    material_id VARCHAR(100),
    quantity FLOAT,
    price_per_unit FLOAT,
    discount_rate FLOAT,
    total_price FLOAT,
    transaction_date DATE,
    notes TEXT
) COLLATE utf8mb4_unicode_ci;

-- Step 2: Load raw data
LOAD DATA INFILE '/var/lib/mysql-files/companies.tsv'
INTO TABLE staging_companies
CHARACTER SET utf8mb4
FIELDS TERMINATED BY '\t'
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE '/var/lib/mysql-files/materials.tsv'
INTO TABLE staging_materials
CHARACTER SET utf8mb4
FIELDS TERMINATED BY '\t'
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE '/var/lib/mysql-files/transactions.tsv'
INTO TABLE staging_transactions
CHARACTER SET utf8mb4
FIELDS TERMINATED BY '\t'
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Step 3: Create 3NF Target Tables
CREATE TABLE USER (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    email VARCHAR(255)
) COLLATE utf8mb4_unicode_ci;

CREATE TABLE SUPPLIER (
    supplier_id VARCHAR(100) PRIMARY KEY,
    company_name VARCHAR(255),
    contact_info TEXT
) COLLATE utf8mb4_unicode_ci;

CREATE TABLE CATEGORY (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE
) COLLATE utf8mb4_unicode_ci;

CREATE TABLE PRODUCT (
    product_id VARCHAR(100) PRIMARY KEY,
    supplier_id VARCHAR(100) NULL,
    category_id INT NULL,
    bim_object_id INT NULL,
    vmd_sncs VARCHAR(255),
    stock_qty INT NULL,
    list_price FLOAT,
    CONSTRAINT FK_Product_Supplier FOREIGN KEY (supplier_id) REFERENCES SUPPLIER(supplier_id),
    CONSTRAINT FK_Product_Category FOREIGN KEY (category_id) REFERENCES CATEGORY(category_id)
) COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ORDER` (
    order_id VARCHAR(100) PRIMARY KEY,
    user_id INT,
    quote_id INT NULL,
    order_date DATE,
    status VARCHAR(50),
    CONSTRAINT FK_Order_User FOREIGN KEY (user_id) REFERENCES USER(user_id)
) COLLATE utf8mb4_unicode_ci;

CREATE TABLE ORDER_DETAIL (
    order_id VARCHAR(100),
    product_id VARCHAR(100),
    quantity FLOAT,
    unit_price FLOAT,
    CONSTRAINT pk_OrderDetail PRIMARY KEY (order_id, product_id),
    CONSTRAINT FK_OrderDetail_Order FOREIGN KEY (order_id) REFERENCES `ORDER`(order_id),
    CONSTRAINT FK_OrderDetail_Product FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id)
) COLLATE utf8mb4_unicode_ci;

-- Step 4: Execute ETL
-- ETL 4.1: Processing SUPPLIER
INSERT INTO SUPPLIER (supplier_id, company_name, contact_info)
SELECT
    company_id,
    name,
    CONCAT(
        'Address: ', IFNULL(address, 'N/A'),
        '\nPhone: ', IFNULL(phone, 'N/A'),
        '\nEmail: ', IFNULL(email, 'N/A')
    )
FROM staging_companies
WHERE company_id IS NOT NULL AND company_id != '';

-- ETL 4.2: Handling CATEGORY
INSERT INTO CATEGORY (name)
SELECT DISTINCT
    CASE
        WHEN Item LIKE 'Product: High-density polyethylene pipe%' THEN 'Pipes - HDPE'
        WHEN Item LIKE 'Product. Portland Cement%' THEN 'Cement'
        WHEN Item LIKE 'Product: High-pressure concrete floor tiles%' THEN 'Tiles - Concrete'
        WHEN Item LIKE 'Products. Metal Materials%' THEN 'Metal Materials'
        WHEN Item LIKE 'Products. Occupational Safety%' THEN 'Safety Equipment'
        WHEN Item LIKE '%worker%' THEN 'Labor'
        WHEN Item LIKE '%Technician%' THEN 'Labor'
        WHEN Item LIKE '%operator%' THEN 'Labor - Equipment Operator'
        WHEN Item LIKE 'Structural concrete%' THEN 'Concrete'
        WHEN Item LIKE '%Adhesive%' THEN 'Adhesives'
        ELSE 'Other Materials'
    END AS category_name
FROM staging_materials;

-- ETL 4.3: Processing PRODUCT
INSERT INTO PRODUCT (product_id, list_price, vmd_sncs, category_id)
SELECT
    m.material_id,
    m.PriceAvg,
    CASE
        WHEN m.Item LIKE 'Product: %' THEN TRIM(SUBSTRING_INDEX(m.Item, '.', 1))
        WHEN m.Item LIKE 'Product. %' THEN TRIM(SUBSTRING_INDEX(m.Item, '.', 1))
        WHEN m.Item LIKE 'Products. %' THEN TRIM(SUBSTRING_INDEX(m.Item, '.', 1))
        ELSE TRIM(m.Item)
    END AS product_name,
    (SELECT c.category_id FROM CATEGORY c WHERE c.name =
        CASE
            WHEN m.Item LIKE 'Product: High-density polyethylene pipe%' THEN 'Pipes - HDPE'
            WHEN m.Item LIKE 'Product. Portland Cement%' THEN 'Cement'
            WHEN m.Item LIKE 'Product: High-pressure concrete floor tiles%' THEN 'Tiles - Concrete'
            WHEN m.Item LIKE 'Products. Metal Materials%' THEN 'Metal Materials'
            WHEN m.Item LIKE 'Products. Occupational Safety%' THEN 'Safety Equipment'
            WHEN m.Item LIKE '%worker%' THEN 'Labor'
            WHEN m.Item LIKE '%Technician%' THEN 'Labor'
            WHEN m.Item LIKE '%operator%' THEN 'Labor - Equipment Operator'
            WHEN m.Item LIKE 'Structural concrete%' THEN 'Concrete'
            WHEN m.Item LIKE '%Adhesive%' THEN 'Adhesives'
            ELSE 'Other Materials'
        END
    ) AS category_id
FROM staging_materials m
WHERE m.material_id IS NOT NULL AND m.material_id != ''
AND m.PriceAvg IS NOT NULL AND m.PriceAvg > 0;

-- ETL 4.4: Create Virtual USER
INSERT INTO USER (user_id, name, email, password_hash)
VALUES (1, 'System Import User', 'import@boombridge.com', 'password');

-- ETL 4.5: Processing ORDER
INSERT INTO `ORDER` (order_id, user_id, order_date, status)
SELECT
    transaction_id,
    1,
    transaction_date,
    'Completed'
FROM staging_transactions
WHERE transaction_date IS NOT NULL
AND material_id IN (SELECT product_id FROM PRODUCT);

-- ETL 4.6: Processing ORDER_DETAIL
INSERT INTO ORDER_DETAIL (order_id, product_id, quantity, unit_price)
SELECT
    transaction_id,
    material_id,
    quantity,
    price_per_unit
FROM staging_transactions
WHERE transaction_id IN (SELECT order_id FROM `ORDER`);
