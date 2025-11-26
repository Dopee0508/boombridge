// routes/order_details.js
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
    
    let countSQL = "SELECT COUNT(*) as total FROM ORDER_DETAIL";
    let dataSQL = `
        SELECT 
            od.order_id,
            od.product_id,
            p.vmd_sncs as product_name,
            od.quantity,
            od.unit_price
        FROM ORDER_DETAIL od
        LEFT JOIN PRODUCT p ON od.product_id = p.product_id
    `;
    let params = [];
    
    if (search) {
        const searchPattern = `%${search}%`;
        countSQL += " WHERE order_id LIKE ? OR product_id LIKE ?";
        dataSQL += " WHERE od.order_id LIKE ? OR od.product_id LIKE ?";
        params = [searchPattern, searchPattern];
    }
    
    doSQL(countSQL, params, res, function(countResult) {
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push({ number: i, active: i === page });
        }
        
        dataSQL += ` ORDER BY od.order_id, od.product_id LIMIT ${limit} OFFSET ${offset}`;
        
        doSQL(dataSQL, params, res, function (data) {
            let ordersSQL = "SELECT order_id FROM \`ORDER\`";
            let productsSQL = "SELECT product_id, vmd_sncs FROM PRODUCT";
            
            app.doSQL(ordersSQL, [], res, function (orders) {
                app.doSQL(productsSQL, [], res, function (products) {
                    res.render('layout_full', {
                        title: 'Order Detail Management',
                        order_details: data,
                        orders: orders,
                        products: products,
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
                            content: 'order_details/index_simple',
                            order_detail_row: 'order_details/row'
                        }
                    });
                });
            });
        });
    });
});

app.post("/", function (req, res) {
    const { order_id, product_id, quantity, unit_price } = req.body;
    let SQL = "INSERT INTO ORDER_DETAIL (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)";
    
    doSQL(SQL, [order_id, product_id, quantity, unit_price], res, function (data) {
        let selectSQL = `
            SELECT 
                od.order_id,
                od.product_id,
                p.vmd_sncs as product_name,
                od.quantity,
                od.unit_price
            FROM ORDER_DETAIL od
            LEFT JOIN PRODUCT p ON od.product_id = p.product_id
            WHERE od.order_id = ? AND od.product_id = ?
        `;
        
        app.doSQL(selectSQL, [order_id, product_id], res, function (result) {
            res.render('order_details/row', result[0]);
        });
    });
});

app.get("/:ORDER_ID/:PRODUCT_ID/edit", function (req, res) {
    let SQL = "SELECT order_id, product_id, quantity, unit_price FROM ORDER_DETAIL WHERE order_id = ? AND product_id = ?";
    
    doSQL(SQL, [req.params.ORDER_ID, req.params.PRODUCT_ID], res, function (data) {
        const detail = data[0];
        
        res.render('order_details/edit_form', {
            order_id: detail.order_id,
            product_id: detail.product_id,
            quantity: detail.quantity,
            unit_price: detail.unit_price
        });
    });
});

app.put("/:ORDER_ID/:PRODUCT_ID", function (req, res) {
    const { quantity, unit_price, action } = req.body;
    const order_id = req.params.ORDER_ID;
    const product_id = req.params.PRODUCT_ID;

    let showRow = function(orderId, prodId) {
        let SQL = `
            SELECT 
                od.order_id,
                od.product_id,
                p.vmd_sncs as product_name,
                od.quantity,
                od.unit_price
            FROM ORDER_DETAIL od
            LEFT JOIN PRODUCT p ON od.product_id = p.product_id
            WHERE od.order_id = ? AND od.product_id = ?
        `;
        app.doSQL(SQL, [orderId, prodId], res, function (data) {
            res.render('order_details/row', data[0]);
        });
    };

    if (action === "update") {
        let SQL = "UPDATE ORDER_DETAIL SET quantity = ?, unit_price = ? WHERE order_id = ? AND product_id = ?";
        doSQL(SQL, [quantity, unit_price, order_id, product_id], res, function (data) {
            showRow(order_id, product_id); 
        });
    } else { 
        showRow(order_id, product_id); 
    }
});

app.delete("/:ORDER_ID/:PRODUCT_ID", function (req, res) {
    let SQL = "DELETE FROM ORDER_DETAIL WHERE order_id = ? AND product_id = ?";
    
    doSQL(SQL, [req.params.ORDER_ID, req.params.PRODUCT_ID], res, function (data) {
        res.send("OK");
    });
});

module.exports = app;
