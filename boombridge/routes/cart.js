// routes/cart.js
const express = require("express");
const router = express.Router();
const { q } = require("../helpers");

// 查看購物車
router.get("/", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      return res.redirect("/login");
    }

    const cartItems = await q(
      `SELECT 
        c.cart_id,
        c.product_id,
        c.quantity,
        p.vmd_sncs AS product_name,
        ROUND(p.list_price, 2) AS list_price,
        s.name AS supplier_name,
        ROUND(c.quantity * p.list_price, 2) AS subtotal
       FROM CART c
       JOIN PRODUCT p ON c.product_id = p.product_id
       LEFT JOIN SUPPLIER s ON p.supplier_id = s.supplier_id
       WHERE c.user_id = ?
       ORDER BY c.added_date DESC`,
      [userId]
    );

    // 添加計算屬性用於模板
    const enhancedCartItems = cartItems.map(item => ({
      ...item,
      quantityPlusOne: item.quantity + 1,
      quantityMinusOne: item.quantity - 1,
      isOne: item.quantity === 1
    }));

    // 計算總額
    const total = enhancedCartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    const itemCount = enhancedCartItems.length;

    // Get user info for layout
    const [user] = await q(
      `SELECT email FROM USER WHERE user_id = ?`,
      [userId]
    );

    res.render("layout_full", {
      title: "Shopping Cart",
      cartItems: enhancedCartItems,
      total: total.toFixed(2),
      itemCount: itemCount,
      hasItems: itemCount > 0,
      userEmail: user?.email || req.session.user?.email,
      userId: userId,
      partials: {
        sidebar: 'sidebar',
        content: 'cart/list'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading cart");
  }
});

// 加入購物車
router.post("/add", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      return res.status(401).send("Please login first");
    }

    const { product_id, quantity = 1 } = req.body;

    // 檢查產品是否已在購物車
    const existing = await q(
      "SELECT cart_id, quantity FROM CART WHERE user_id = ? AND product_id = ?",
      [userId, product_id]
    );

    if (existing.length > 0) {
      // 更新數量
      await q(
        "UPDATE CART SET quantity = quantity + ? WHERE cart_id = ?",
        [quantity, existing[0].cart_id]
      );
    } else {
      // 新增到購物車
      await q(
        "INSERT INTO CART (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [userId, product_id, quantity]
      );
    }

    // 返回成功訊息
    res.send(`
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>
        Product added to cart successfully!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding to cart");
  }
});

// 更新購物車數量
router.post("/update/:cart_id", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    const { cart_id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).send("Quantity must be at least 1");
    }

    await q(
      "UPDATE CART SET quantity = ? WHERE cart_id = ? AND user_id = ?",
      [quantity, cart_id, userId]
    );

    // Return HX-Redirect header for HTMX to handle
    res.set("HX-Redirect", "/cart");
    res.status(200).send("");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating cart");
  }
});

// =====================================================================
// 4) 刪除購物車項目 DELETE /cart/:cart_id
// 刪除購物車項目
router.delete("/:cart_id", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    const { cart_id } = req.params;

    await q(
      "DELETE FROM CART WHERE cart_id = ? AND user_id = ?",
      [cart_id, userId]
    );

    // Return HX-Redirect header
    res.set("HX-Redirect", "/cart");
    res.status(200).send("");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error removing item");
  }
});

// =====================================================================
// 5) 清空購物車 POST /cart/clear
// 清空購物車
router.post("/clear", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    
    await q("DELETE FROM CART WHERE user_id = ?", [userId]);
    
    res.set("HX-Redirect", "/cart");
    res.status(200).send("");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error clearing cart");
  }
});

// =====================================================================
// 6) 結帳（創建訂單） POST /cart/checkout
// 結帳（創建訂單）
router.post("/checkout", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      return res.status(401).send("Please login first");
    }

    // 獲取購物車項目
    const cartItems = await q(
      `SELECT c.product_id, c.quantity, p.list_price
       FROM CART c
       JOIN PRODUCT p ON c.product_id = p.product_id
       WHERE c.user_id = ?`,
      [userId]
    );

    if (cartItems.length === 0) {
      return res.status(400).send("Cart is empty");
    }

    // 生成訂單 ID
    const orderId = `ORD${Date.now()}${userId}`;
    const orderDate = new Date().toISOString().split('T')[0];

    // 創建訂單
    await q(
      `INSERT INTO \`ORDER\` (order_id, user_id, order_date, status)
       VALUES (?, ?, ?, 'Processing')`,
      [orderId, userId, orderDate]
    );

    // 創建訂單明細
    for (const item of cartItems) {
      await q(
        `INSERT INTO ORDER_DETAIL (order_id, product_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.list_price]
      );
    }

    // 清空購物車
    await q("DELETE FROM CART WHERE user_id = ?", [userId]);

    // 返回成功訊息並重定向到購物車頁面
    res.send(`
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>
        <strong>Order created successfully!</strong> Order ID: ${orderId}
        <br>
        <a href="/orders/${orderId}" class="alert-link">View order details</a>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing checkout");
  }
});

// =====================================================================
// 7) 獲取購物車數量（用於導航欄） GET /cart/count
// =====================================================================
router.get("/count", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      return res.send("");
    }

    const result = await q(
      "SELECT COUNT(*) as count FROM CART WHERE user_id = ?",
      [userId]
    );

    const count = result[0].count;
    // Only return count if greater than 0
    res.send(count > 0 ? count.toString() : "");
  } catch (err) {
    console.error(err);
    res.send("");
  }
});

module.exports = router;
