// routes/products.js
const express = require('express');
const app = express.Router();

function doSQL(SQL, parms, res, callback) {
    app.doSQL(SQL, parms, res, callback);
}

// 權限檢查中間件
function requireAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('<div class="alert alert-danger m-3"><i class="bi bi-shield-x me-2"></i>Access Denied: Admin privileges required</div>');
    }
}

app.get(['/', '/index'], function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    
    let countSQL = `SELECT COUNT(*) as total FROM PRODUCT p`;
    let dataSQL = `
        SELECT 
            p.product_id,
            p.vmd_sncs,
            p.category_id,
            c.name as category_name,
            p.supplier_id,
            s.name as supplier_name,
            p.list_price,
            p.bim_code,
            p.stock_qty
        FROM PRODUCT p
        LEFT JOIN CATEGORY c ON p.category_id = c.category_id
        LEFT JOIN SUPPLIER s ON p.supplier_id = s.supplier_id
    `;
    let params = [];
    
    if (search) {
        const searchPattern = `%${search}%`;
        countSQL += " WHERE p.product_id LIKE ? OR p.vmd_sncs LIKE ?";
        dataSQL += " WHERE p.product_id LIKE ? OR p.vmd_sncs LIKE ?";
        params = [searchPattern, searchPattern];
    }
    
    doSQL(countSQL, params, res, function(countResult) {
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        
        dataSQL += ` LIMIT ${limit} OFFSET ${offset}`;
        doSQL(dataSQL, params, res, function (data) {
        let categoriesSQL = "SELECT category_id, name FROM CATEGORY";
        let suppliersSQL = "SELECT supplier_id, name as company_name FROM SUPPLIER";
        
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push({ number: i, active: i === page });
        }
        
        app.doSQL(categoriesSQL, [], res, function (categories) {
            app.doSQL(suppliersSQL, [], res, function (suppliers) {
                res.render('layout_full', {
                    title: 'Product Management',
                    products: data,
                    categories: categories,
                    suppliers: suppliers,
                    currentPage: page,
                    totalPages: totalPages,
                    pages: pages,
                    hasPrevious: page > 1,
                    hasNext: page < totalPages,
                    previousPage: page - 1,
                    nextPage: page + 1,
                    search: search,
                    partials: { 
                        sidebar: 'sidebar',
                        content: 'products/index_simple',
                        product_row: 'products/row'
                    }
                });
            });
        });
        });
    });
});

app.post("/", function (req, res) {
    const { product_id, vmd_sncs, category_id, supplier_id, list_price, stock_qty } = req.body;
    let SQL = "INSERT INTO PRODUCT (product_id, vmd_sncs, category_id, supplier_id, list_price, stock_qty) VALUES (?, ?, ?, ?, ?, ?)";
    
    doSQL(SQL, [product_id, vmd_sncs, category_id, supplier_id, list_price, stock_qty], res, function (data) {
        let selectSQL = `
            SELECT 
                p.product_id,
                p.vmd_sncs,
                p.category_id,
                c.name as category_name,
                p.supplier_id,
                s.name as supplier_name,
                p.list_price,
                p.stock_qty
            FROM PRODUCT p
            LEFT JOIN CATEGORY c ON p.category_id = c.category_id
            LEFT JOIN SUPPLIER s ON p.supplier_id = s.supplier_id
            WHERE p.product_id = ?
        `;
        
        app.doSQL(selectSQL, [product_id], res, function (result) {
            res.render('products/row', result[0]);
        });
    });
});

app.get("/:ID/edit", requireAdmin, function (req, res) {
    let SQL = "SELECT product_id, vmd_sncs, category_id, supplier_id, list_price, stock_qty FROM PRODUCT WHERE product_id = ?";
    
    doSQL(SQL, [req.params.ID], res, function (data) {
        let categoriesSQL = "SELECT category_id, name FROM CATEGORY";
        let suppliersSQL = "SELECT supplier_id, name as company_name FROM SUPPLIER";
        
        app.doSQL(categoriesSQL, [], res, function (categories) {
            app.doSQL(suppliersSQL, [], res, function (suppliers) {
                const product = data[0];
                
                // Mark selected category
                categories.forEach(c => {
                    if (c.category_id === product.category_id) {
                        c.selected = true;
                    }
                });
                
                // Mark selected supplier
                suppliers.forEach(s => {
                    if (s.supplier_id === product.supplier_id) {
                        s.selected = true;
                    }
                });
                
                res.render('products/edit_form', {
                    product_id: product.product_id,
                    vmd_sncs: product.vmd_sncs,
                    category_id: product.category_id,
                    supplier_id: product.supplier_id,
                    list_price: product.list_price,
                    stock_qty: product.stock_qty,
                    categories: categories,
                    suppliers: suppliers
                });
            });
        });
    });
});

app.put("/:ID", requireAdmin, function (req, res) {
    const { vmd_sncs, category_id, supplier_id, list_price, stock_qty, action } = req.body;
    const product_id = req.params.ID;

    let showRow = function(id) {
        let SQL = `
            SELECT 
                p.product_id,
                p.vmd_sncs,
                p.category_id,
                c.name as category_name,
                p.supplier_id,
                s.name as supplier_name,
                p.list_price,
                p.stock_qty
            FROM PRODUCT p
            LEFT JOIN CATEGORY c ON p.category_id = c.category_id
            LEFT JOIN SUPPLIER s ON p.supplier_id = s.supplier_id
            WHERE p.product_id = ?
        `;
        app.doSQL(SQL, [id], res, function (data) {
            res.render('products/row', data[0]);
        });
    };

    if (action === "update") {
        let SQL = "UPDATE PRODUCT SET vmd_sncs = ?, category_id = ?, supplier_id = ?, list_price = ?, stock_qty = ? WHERE product_id = ?";
        doSQL(SQL, [vmd_sncs, category_id, supplier_id, list_price, stock_qty, product_id], res, function (data) {
            showRow(product_id); 
        });
    } else { 
        showRow(product_id); 
    }
});

app.delete("/:ID", requireAdmin, function (req, res) {
    let SQL = "DELETE FROM PRODUCT WHERE product_id = ?";
    
    doSQL(SQL, [req.params.ID], res, function (data) {
        res.send("OK");
    });
});

module.exports = app;
