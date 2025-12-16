// routes/profile.js
const express = require("express");
const router = express.Router();
const { q } = require("../helpers");

// 查看個人資料頁面
router.get("/", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    const userEmail = req.session.user?.email;
    
    if (!userId) {
      return res.redirect("/login");
    }

    // 獲取用戶資料
    const [user] = await q(
      `SELECT user_id, name, email FROM USER WHERE user_id = ?`,
      [userId]
    );

    if (!user) {
      return res.status(404).send("User not found");
    }

    // 獲取購物車數量
    const [cartCount] = await q(
      "SELECT COUNT(*) as count FROM CART WHERE user_id = ?",
      [userId]
    );

    // 獲取訂單數量
    const [orderCount] = await q(
      "SELECT COUNT(*) as count FROM `ORDER` WHERE user_id = ?",
      [userId]
    );

    res.render("layout_full", {
      title: "My Profile",
      userEmail: userEmail,
      userId: userId,
      userName: user.name || "User",
      userEmailDisplay: user.email,
      cartItemCount: cartCount.count || 0,
      totalOrders: orderCount.count || 0,
      partials: {
        sidebar: 'sidebar',
        content: 'profile/simple'
      }
    });
  } catch (err) {
    console.error('[Profile] Error:', err.message);
    res.status(500).send("Error loading profile");
  }
});

module.exports = router;
