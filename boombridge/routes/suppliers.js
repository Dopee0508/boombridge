// routes/suppliers.js
const express = require('express');
const app = express.Router();

// 輔助函數：執行 SQL 查詢 (使用注入的 doSQL)
function doSQL(SQL, parms, res, callback) {
    app.doSQL(SQL, parms, res, callback);
}

// === R (Retrieve): 顯示供應商列表 ===
app.get(['/', '/index'], function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    
    let countSQL = "SELECT COUNT(*) as total FROM SUPPLIER";
    let dataSQL = "SELECT supplier_id, company_name, contact_info FROM SUPPLIER";
    let params = [];
    
    if (search) {
        const searchPattern = `%${search}%`;
        countSQL += " WHERE supplier_id LIKE ? OR company_name LIKE ? OR contact_info LIKE ?";
        dataSQL += " WHERE supplier_id LIKE ? OR company_name LIKE ? OR contact_info LIKE ?";
        params = [searchPattern, searchPattern, searchPattern];
    }
    
    doSQL(countSQL, params, res, function(countResult) {
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push({ number: i, active: i === page });
        }
        
        dataSQL += ` LIMIT ${limit} OFFSET ${offset}`;
        doSQL(dataSQL, params, res, function (data) {
            res.render('layout_full', {
                title: 'Supplier Management',
                suppliers: data,
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
                    content: 'suppliers/index_simple',
                    supplier_row: 'suppliers/row' 
                }
            });
        });
    });
});

// === C (Create): 處理新增供應商請求 ===
app.post("/", function (req, res) {
    const { supplier_id, company_name, contact_info } = req.body;
    let SQL = "INSERT INTO SUPPLIER (supplier_id, company_name, contact_info) VALUES (?, ?, ?)";

    doSQL(SQL, [supplier_id, company_name, contact_info], res, function (data) {
        res.render('suppliers/row', {
            supplier_id: supplier_id,
            company_name: company_name,
            contact_info: contact_info
        });
    });
});

// === U (Update - Form): 獲取編輯表單 (GET) ===
app.get("/:ID/edit", function (req, res) {
    let SQL = "SELECT supplier_id, company_name, contact_info FROM SUPPLIER WHERE supplier_id = ?";
    
    doSQL(SQL, [req.params.ID], res, function (data) {
        if (data.length > 0) {
            res.render('suppliers/edit_form', {
                supplier: data[0]
            });
        } else {
            res.status(404).send('Supplier not found');
        }
    });
});

// === U (Update - Action): 處理更新請求 (PUT) ===
app.put("/:ID", function (req, res) {
    const { company_name, contact_info, action } = req.body;
    const supplier_id = req.params.ID;

    let showRow = function(id) {
        let SQL = "SELECT supplier_id, company_name, contact_info FROM SUPPLIER WHERE supplier_id = ?";
        app.doSQL(SQL, [id], res, function (data) {
            res.render('suppliers/row', { 
                supplier_id: data[0].supplier_id,
                company_name: data[0].company_name,
                contact_info: data[0].contact_info
            });
        });
    };

    if (action === "update") {
        let SQL = "UPDATE SUPPLIER SET company_name = ?, contact_info = ? WHERE supplier_id = ?";
        doSQL(SQL, [company_name, contact_info, supplier_id], res, function (data) {
            showRow(supplier_id); 
        });
    } else { 
        showRow(supplier_id); 
    }
});

// === D (Delete): 處理刪除請求 (DELETE) ===
app.delete("/:ID", function (req, res) {
    let SQL = "DELETE FROM SUPPLIER WHERE supplier_id = ?";
    
    doSQL(SQL, [req.params.ID], res, function (data) {
        res.send(""); 
    });
});

module.exports = app;
