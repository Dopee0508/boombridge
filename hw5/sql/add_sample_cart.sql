-- 添加一些購物車範例商品
-- 清空現有購物車
DELETE FROM CART WHERE user_id = 1;

-- 添加5個不同的建材商品到購物車
INSERT INTO CART (user_id, product_id, quantity, added_date) VALUES
(1, '00076758', 2, NOW()),
(1, '00289289', 5, NOW()),
(1, '00435578', 1, NOW()),
(1, '00965138', 3, NOW()),
(1, '01297845', 10, NOW());
