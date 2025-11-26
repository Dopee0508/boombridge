// routes/users.js
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
    
    let countSQL = "SELECT COUNT(*) as total FROM USER";
    let dataSQL = "SELECT user_id, name, email FROM USER";
    let params = [];
    
    if (search) {
        const searchPattern = `%${search}%`;
        countSQL += " WHERE name LIKE ? OR email LIKE ?";
        dataSQL += " WHERE name LIKE ? OR email LIKE ?";
        params = [searchPattern, searchPattern];
    }
    
    doSQL(countSQL, params, res, function(countResult) {
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        
        // 生成頁碼陣列
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push({
                number: i,
                active: i === page
            });
        }
        
        dataSQL += ` LIMIT ${limit} OFFSET ${offset}`;
        doSQL(dataSQL, params, res, function (data) {
            res.render('layout_full', {
                title: 'User Management',
                users: data,
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
                    content: 'users/index_simple'
                }
            });
        });
    });
});

app.post("/", function (req, res) {
    const { name, email, password_hash } = req.body;
    let SQL = "INSERT INTO USER (name, email, password_hash) VALUES (?, ?, ?)";
    
    doSQL(SQL, [name, email, password_hash], res, function (data) {
        res.render('users/row', {
            user_id: data.insertId,
            name: name,
            email: email
        });
    });
});

app.get("/:ID/edit", function (req, res) {
    let SQL = "SELECT user_id, name, email FROM USER WHERE user_id = ?";
    
    doSQL(SQL, [req.params.ID], res, function (data) {
        res.render('users/edit_form', {
            user: data[0]
        });
    });
});

app.put("/:ID", function (req, res) {
    const { name, email, action } = req.body;
    const user_id = req.params.ID;

    let showRow = function(id) {
        let SQL = "SELECT user_id, name, email FROM USER WHERE user_id = ?";
        app.doSQL(SQL, [id], res, function (data) {
            res.render('users/row', data[0]);
        });
    };

    if (action === "update") {
        let SQL = "UPDATE USER SET name = ?, email = ? WHERE user_id = ?";
        doSQL(SQL, [name, email, user_id], res, function (data) {
            showRow(user_id); 
        });
    } else { 
        showRow(user_id); 
    }
});

app.delete("/:ID", function (req, res) {
    let SQL = "DELETE FROM USER WHERE user_id = ?";
    
    doSQL(SQL, [req.params.ID], res, function (data) {
        res.send("OK");
    });
});

module.exports = app;
