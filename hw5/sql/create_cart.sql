SET NAMES utf8mb4;
USE BOOMBRIDGE;

-- 創建購物車表
CREATE TABLE IF NOT EXISTS CART (
    cart_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
) COLLATE utf8mb4_unicode_ci;

-- 為 ORDER 表添加 project_id 欄位（為未來專案管理做準備）
ALTER TABLE `ORDER` ADD COLUMN project_id INT NULL;
