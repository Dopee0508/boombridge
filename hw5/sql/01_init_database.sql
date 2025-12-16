-- ================================================================
-- BOOMBRIDGE Database Initialization Script
-- ================================================================
-- This script creates the database schema and loads initial data
-- Execution order: 01 (First)
-- ================================================================

-- Step 1: Create Database and Staging Tables
CREATE DATABASE IF NOT EXISTS BOOMBRIDGE COLLATE utf8mb4_unicode_ci;
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

-- Step 3: Create Production Tables
CREATE TABLE USER (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    password_hash VARCHAR(255) NOT NULL
) COLLATE utf8mb4_unicode_ci;

CREATE TABLE CATEGORY (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT
) COLLATE utf8mb4_unicode_ci;

CREATE TABLE SUPPLIER (
    supplier_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    address TEXT,
    phone VARCHAR(100),
    email VARCHAR(255),
    comments TEXT
) COLLATE utf8mb4_unicode_ci;

CREATE TABLE PRODUCT (
    product_id VARCHAR(100) PRIMARY KEY,
    vmd_sncs VARCHAR(255) NOT NULL,
    unit VARCHAR(50),
    category_id INT,
    avg_price DECIMAL(10,2),
    std_dev DECIMAL(10,2),
    no_samples INT,
    FOREIGN KEY (category_id) REFERENCES CATEGORY(category_id)
) COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ORDER` (
    order_id VARCHAR(100) PRIMARY KEY,
    user_id INT NOT NULL,
    order_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    project_id INT NULL,
    FOREIGN KEY (user_id) REFERENCES USER(user_id)
) COLLATE utf8mb4_unicode_ci;

CREATE TABLE ORDER_DETAIL (
    order_id VARCHAR(100),
    product_id VARCHAR(100),
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES `ORDER`(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id)
) COLLATE utf8mb4_unicode_ci;

CREATE TABLE CART (
    cart_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
) COLLATE utf8mb4_unicode_ci;

-- Step 4: ETL Process - Load Data into Production Tables

-- ETL 4.1: Create Categories
INSERT INTO CATEGORY (name, description) VALUES
('Pipes - HDPE', 'High-density polyethylene pipes'),
('Cement', 'Portland and various cement types'),
('Tiles - Concrete', 'Concrete floor and wall tiles'),
('Metal Materials', 'Various metal construction materials'),
('Safety Equipment', 'Occupational safety equipment'),
('Labor', 'General labor services'),
('Labor - Equipment Operator', 'Heavy equipment operators'),
('Concrete', 'Structural and ready-mix concrete'),
('Adhesives', 'Construction adhesives and bonding agents'),
('Other Materials', 'Miscellaneous construction materials');

-- ETL 4.2: Processing SUPPLIER
INSERT INTO SUPPLIER (supplier_id, name, description, address, phone, email, comments)
SELECT
    company_id,
    name,
    description,
    address,
    phone,
    email,
    comments
FROM staging_companies
WHERE company_id IS NOT NULL AND company_id != '';

-- ETL 4.3: Processing PRODUCT
INSERT INTO PRODUCT (product_id, vmd_sncs, unit, avg_price, std_dev, no_samples, category_id)
SELECT
    m.material_id,
    CASE
        WHEN m.Item LIKE 'Product: %' THEN TRIM(SUBSTRING_INDEX(m.Item, ':', -1))
        WHEN m.Item LIKE 'Product. %' THEN TRIM(SUBSTRING_INDEX(m.Item, '.', 1))
        WHEN m.Item LIKE 'Products. %' THEN TRIM(SUBSTRING_INDEX(m.Item, '.', 1))
        ELSE TRIM(m.Item)
    END AS product_name,
    m.Unit,
    m.PriceAvg,
    m.PriceStdev,
    m.NoSamples,
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

-- ETL 4.4: Create System User (Admin)
INSERT INTO USER (user_id, name, email, role, password_hash)
VALUES (1, 'System Import User', 'import@boombridge.com', 'admin', 'password');

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

-- Step 5: Cleanup Staging Tables
DROP TABLE IF EXISTS staging_companies;
DROP TABLE IF EXISTS staging_materials;
DROP TABLE IF EXISTS staging_transactions;

-- Step 6: Create Indexes for Performance
CREATE INDEX idx_user_email ON USER(email);
CREATE INDEX idx_product_category ON PRODUCT(category_id);
CREATE INDEX idx_order_user ON `ORDER`(user_id);
CREATE INDEX idx_order_date ON `ORDER`(order_date);
CREATE INDEX idx_cart_user ON CART(user_id);
