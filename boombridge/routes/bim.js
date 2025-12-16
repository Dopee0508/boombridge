// routes/bim.js
const express = require("express");
const router = express.Router();
const { q } = require("../helpers");   // helper q ของโปรเจ็กต์

// 🔹 ICON ตามหมวดหมู่
const categoryIcons = {
  "DOOR": "/icons/categories/door.svg",
  "Metal Materials": "/icons/categories/metal.svg",
  "ROOF": "/icons/categories/roof.svg"
};

// =====================================================================
// 1) BIM LIST  GET /bim
// =====================================================================
router.get("/", async (req, res) => {
  try {
    const { category, supplier, q: keyword } = req.query;

    // 1. โหลด category / supplier
    const categoriesRaw = await q(
      "SELECT category_id, name FROM CATEGORY ORDER BY name"
    );

    const suppliersRaw = await q(
      "SELECT supplier_id, company_name FROM SUPPLIER ORDER BY company_name"
    );

    const categories = categoriesRaw.map((c) => ({
      ...c,
      selected: category && category == String(c.category_id),
    }));

    const suppliers = suppliersRaw.map((s) => ({
      supplier_id: s.supplier_id,
      name: s.company_name,  // ใช้ใน dropdown และ list
      selected: supplier && supplier == String(s.supplier_id),
    }));

    // 2. SQL list BIM
    let sql = `
      SELECT 
        p.product_id,
        p.vmd_sncs,
        p.bim_code,
        p.bim_name,
        p.bim_file,
        p.bim_thumbnail,         -- 👈 เพิ่ม thumbnail มาด้วย
        c.name AS category_name,
        s.company_name AS supplier_name
      FROM PRODUCT p
      LEFT JOIN CATEGORY c ON p.category_id = c.category_id
      LEFT JOIN SUPPLIER s ON p.supplier_id = s.supplier_id
      WHERE p.bim_code IS NOT NULL
    `;
    const params = [];

    // (ตอนนี้ยังไม่ฟิลเตอร์ด้วย category/supplier/keyword ถ้าอยากทำเพิ่มค่อยว่ากัน)
    sql += " ORDER BY c.name, p.product_id";

    const rows = await q(sql, params);

    // 3. จัดกลุ่มตามหมวดหมู่ + ใส่ icon
    const grouped = {};
    rows.forEach((r) => {
      const cat = r.category_name || "Uncategorized";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(r);
    });

    const groups = Object.keys(grouped).map((name) => ({
      category_name: name,
      icon: categoryIcons[name] || "/icons/categories/door.svg", // 👈 ให้แต่ละ group มี icon
      items: grouped[name],
    }));

    // 4. ส่งค่าเข้า template bim_list.hjs
    res.render("bim_list", {
      title: "BIM Objects",
      groups,
      categories,
      models: rows,
      categoryIcons,              // จะใช้หรือไม่ใช้ก็ได้ เผื่ออนาคต
      suppliers,
      currentCategory: category || "",
      currentSupplier: supplier || "",
      currentKeyword: keyword || "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("BIM list error");
  }
});

// =====================================================================
// 2) ADD FORM  GET /bim/:product_id/add
// =====================================================================
router.get("/:product_id/add", async (req, res) => {
  try {
    const pid = req.params.product_id;

    const rows = await q(
      `SELECT 
         product_id,
         vmd_sncs,
         bim_code,
         bim_name,
         bim_file,
         bim_notes,
         bim_thumbnail
       FROM PRODUCT
       WHERE product_id = ?`,
      [pid]
    );

    if (rows.length === 0) {
      return res.status(404).send("Product not found");
    }

    const product = rows[0];

    res.render("bim_add", { 
      product,
      product_id: product.product_id
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Database error (GET /bim/:product_id/add)");
  }
});

// =====================================================================
// 3) SAVE BIM  POST /bim/:product_id/add
// =====================================================================
router.post("/:product_id/add", async (req, res) => {
  try {
    const pid = req.params.product_id;
    const { bim_code, bim_name, bim_file, bim_notes, bim_thumbnail } = req.body;

    await q(
      `UPDATE PRODUCT
       SET bim_code = ?,
           bim_name = ?,
           bim_file = ?,
           bim_notes = ?,
           bim_thumbnail = ?
       WHERE product_id = ?`,
      [bim_code, bim_name, bim_file, bim_notes, bim_thumbnail, pid]
    );

    res.redirect("/products");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error (POST /bim/:product_id/add)");
  }
});

// =====================================================================
// 4) DELETE BIM  GET /bim/:product_id/delete
// =====================================================================
router.get("/:product_id/delete", async (req, res) => {
  try {
    const pid = req.params.product_id;

    await q(
      `UPDATE PRODUCT
       SET bim_code = NULL,
           bim_name = NULL,
           bim_file = NULL,
           bim_notes = NULL,
           bim_thumbnail = NULL
       WHERE product_id = ?`,
      [pid]
    );

    res.redirect("/products");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error (DELETE BIM)");
  }
});

// =====================================================================
// 5) DETAIL  GET /bim/:product_id
// =====================================================================
router.get("/:product_id", async (req, res) => {
  try {
    const pid = req.params.product_id;

    const rows = await q(
      `SELECT 
         product_id,
         vmd_sncs,
         bim_code,
         bim_name,
         bim_file,
         bim_notes,
         bim_thumbnail
       FROM PRODUCT
       WHERE product_id = ?`,
      [pid]
    );

    if (rows.length === 0) {
      return res.status(404).send("BIM object not found");
    }

    res.render("bim_detail", { item: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error (BIM detail)");
  }
});

// ========================
// 6) DOWNLOAD BIM FILE + COUNT
// ========================
router.get("/:product_id/download", async (req, res) => {
  try {
    const pid = req.params.product_id;

    const rows = await q(
      `SELECT bim_file FROM PRODUCT WHERE product_id = ?`,
      [pid]
    );

    if (!rows.length || !rows[0].bim_file) {
      return res.status(404).send("BIM file not found");
    }

    const fileName = rows[0].bim_file;
    const filePath = `public/bim_files/${fileName}`;

    await q(
      `UPDATE PRODUCT 
       SET bim_download_count = bim_download_count + 1
       WHERE product_id = ?`,
      [pid]
    );

    res.download(filePath);

  } catch (err) {
    console.error(err);
    res.status(500).send("Download error");
  }
});

module.exports = router;
