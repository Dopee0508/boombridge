-- 為 USER 表添加 role 欄位
-- Role types: 'admin' (管理員) 或 'user' (一般用戶)

USE BOOMBRIDGE;

-- 添加 role 欄位，預設為 'user'
ALTER TABLE USER 
ADD COLUMN role ENUM('admin', 'user') NOT NULL DEFAULT 'user' 
AFTER email;

-- 更新現有的 import@boombridge.com 為管理員
UPDATE USER 
SET role = 'admin' 
WHERE email = 'import@boombridge.com';

-- 顯示更新後的結果
SELECT user_id, name, email, role FROM USER;
