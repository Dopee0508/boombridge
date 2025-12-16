// routes/orders.js
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
    
    let countSQL = "SELECT COUNT(*) as total FROM \`ORDER\`";
    let dataSQL = `
        SELECT 
            o.order_id,
            o.user_id,
            u.name as user_name,
            o.order_date,
            o.status
        FROM \`ORDER\` o
        LEFT JOIN USER u ON o.user_id = u.user_id
    `;
    let params = [];
    
    if (search) {
        const searchPattern = `%${search}%`;
        countSQL += " WHERE order_id LIKE ? OR status LIKE ?";
        dataSQL += " WHERE o.order_id LIKE ? OR o.status LIKE ?";
        params = [searchPattern, searchPattern];
    }
    
    doSQL(countSQL, params, res, function(countResult) {
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push({ number: i, active: i === page });
        }
        
        dataSQL += ` ORDER BY o.order_date DESC LIMIT ${limit} OFFSET ${offset}`;
        
        doSQL(dataSQL, params, res, function (data) {
            let usersSQL = "SELECT user_id, name FROM USER";
            
            app.doSQL(usersSQL, [], res, function (users) {
                res.render('layout_full', {
                    title: 'Order Management',
                    orders: data,
                    users: users,
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
                        content: 'orders/index_simple',
                        order_row: 'orders/row'
                    }
                });
            });
        });
    });
});

app.get("/:ID", function (req, res) {
    let SQL = `
        SELECT 
            o.order_id,
            o.user_id,
            u.name as user_name,
            o.order_date,
            o.status
        FROM \`ORDER\` o
        LEFT JOIN USER u ON o.user_id = u.user_id
        WHERE o.order_id = ?
    `;
    
    doSQL(SQL, [req.params.ID], res, function (data) {
        res.render('orders/row', data[0]);
    });
});

app.post("/", function (req, res) {
    const { order_id, user_id, order_date, status } = req.body;
    let SQL = "INSERT INTO \`ORDER\` (order_id, user_id, order_date, status) VALUES (?, ?, ?, ?)";
    
    doSQL(SQL, [order_id, user_id, order_date, status], res, function (data) {
        let selectSQL = `
            SELECT 
                o.order_id,
                o.user_id,
                u.name as user_name,
                o.order_date,
                o.status
            FROM \`ORDER\` o
            LEFT JOIN USER u ON o.user_id = u.user_id
            WHERE o.order_id = ?
        `;
        
        app.doSQL(selectSQL, [order_id], res, function (result) {
            res.render('orders/row', result[0]);
        });
    });
});

app.get("/:ID/edit", function (req, res) {
    let SQL = "SELECT order_id, user_id, order_date, status FROM \`ORDER\` WHERE order_id = ?";
    
    doSQL(SQL, [req.params.ID], res, function (data) {
        let usersSQL = "SELECT user_id, name FROM USER";
        
        app.doSQL(usersSQL, [], res, function (users) {
            const order = data[0];
            
            // Mark selected user
            users.forEach(u => {
                if (u.user_id === order.user_id) {
                    u.selected = true;
                }
            });
            
            res.render('orders/edit_form', {
                order_id: order.order_id,
                user_id: order.user_id,
                order_date: order.order_date,
                status: order.status,
                users: users
            });
        });
    });
});

app.put("/:ID", function (req, res) {
    const { user_id, order_date, status, action } = req.body;
    const order_id = req.params.ID;

    let showRow = function(id) {
        let SQL = `
            SELECT 
                o.order_id,
                o.user_id,
                u.name as user_name,
                o.order_date,
                o.status
            FROM \`ORDER\` o
            LEFT JOIN USER u ON o.user_id = u.user_id
            WHERE o.order_id = ?
        `;
        app.doSQL(SQL, [id], res, function (data) {
            res.render('orders/row', data[0]);
        });
    };

    if (action === "update") {
        let SQL = "UPDATE \`ORDER\` SET user_id = ?, order_date = ?, status = ? WHERE order_id = ?";
        doSQL(SQL, [user_id, order_date, status, order_id], res, function (data) {
            showRow(order_id); 
        });
    } else { 
        showRow(order_id); 
    }
});

app.delete("/:ID", function (req, res) {
    // 先刪除訂單明細
    let deleteDetailsSQL = "DELETE FROM ORDER_DETAIL WHERE order_id = ?";
    
    doSQL(deleteDetailsSQL, [req.params.ID], res, function (detailsResult) {
        // 再刪除訂單
        let deleteOrderSQL = "DELETE FROM `ORDER` WHERE order_id = ?";
        
        doSQL(deleteOrderSQL, [req.params.ID], res, function (data) {
            res.status(200).send("");
        });
    });
});

module.exports = app;
