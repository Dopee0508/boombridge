// routes/categories.js
const express = require('express');
const app = express.Router();

function doSQL(SQL, parms, res, callback) {
    app.doSQL(SQL, parms, res, callback);
}

app.get(['/', '/index'], function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    
    let countSQL = "SELECT COUNT(*) as total FROM CATEGORY";
    let dataSQL = "SELECT category_id, name FROM CATEGORY";
    let params = [];
    
    if (search) {
        const searchPattern = `%${search}%`;
        countSQL += " WHERE name LIKE ?";
        dataSQL += " WHERE name LIKE ?";
        params = [searchPattern];
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
                title: 'Category Management',
                categories: data,
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
                    content: 'categories/index_simple',
                    category_row: 'categories/row' 
                }
            });
        });
    });
});

app.post("/", function (req, res) {
    const { name } = req.body;
    let SQL = "INSERT INTO CATEGORY (name) VALUES (?)";
    
    doSQL(SQL, [name], res, function (data) {
        res.render('categories/row', {
            category_id: data.insertId,
            name: name
        });
    });
});

app.get("/:ID/edit", function (req, res) {
    let SQL = "SELECT category_id, name FROM CATEGORY WHERE category_id = ?";
    
    doSQL(SQL, [req.params.ID], res, function (data) {
        res.render('categories/edit_form', {
            category: data[0]
        });
    });
});

app.put("/:ID", function (req, res) {
    const { name, action } = req.body;
    const category_id = req.params.ID;

    let showRow = function(id) {
        let SQL = "SELECT category_id, name FROM CATEGORY WHERE category_id = ?";
        app.doSQL(SQL, [id], res, function (data) {
            res.render('categories/row', data[0]);
        });
    };

    if (action === "update") {
        let SQL = "UPDATE CATEGORY SET name = ? WHERE category_id = ?";
        doSQL(SQL, [name, category_id], res, function (data) {
            showRow(category_id); 
        });
    } else { 
        showRow(category_id); 
    }
});

app.delete("/:ID", function (req, res) {
    let SQL = "DELETE FROM CATEGORY WHERE category_id = ?";
    
    doSQL(SQL, [req.params.ID], res, function (data) {
        res.send("OK");
    });
});

module.exports = app;
