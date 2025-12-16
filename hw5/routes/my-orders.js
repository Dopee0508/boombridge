// routes/my-orders.js - 個人訂單路由
const express = require('express');
const router = express.Router();

// 使用 router.doSQL 由 app.js 注入
function doSQL(SQL, params, res, callback) {
    router.doSQL(SQL, params, res, callback);
}

// 查看我的訂單列表
router.get('/', function (req, res) {
    const userId = req.session.user?.id;
    if (!userId) {
        return res.redirect('/login');
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // 計算總數
    let countSQL = "SELECT COUNT(*) as total FROM `ORDER` WHERE user_id = ?";
    
    doSQL(countSQL, [userId], res, function(countResult) {
        const total = countResult[0]?.total || 0;
        const totalPages = Math.ceil(total / limit);
        
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push({ number: i, active: i === page });
        }
        
        // 獲取訂單列表
        let dataSQL = `
            SELECT 
                o.order_id,
                o.order_date,
                o.status
            FROM \`ORDER\` o
            WHERE o.user_id = ?
            ORDER BY o.order_date DESC
            LIMIT ${limit} OFFSET ${offset}
        `;
        
        doSQL(dataSQL, [userId], res, function (orders) {
            // 為每個訂單計算項目數量和總金額
            if (orders.length === 0) {
                return res.render('layout_full', {
                    title: 'My Orders',
                    orders: [],
                    currentPage: page,
                    totalPages: 0,
                    pages: [],
                    hasPrevious: false,
                    hasNext: false,
                    partials: {
                        sidebar: 'sidebar',
                        content: 'my-orders/index'
                    }
                });
            }
            
            // 獲取每個訂單的詳細信息
            const orderIds = orders.map(o => o.order_id);
            const placeholders = orderIds.map(() => '?').join(',');
            
            let detailSQL = `
                SELECT 
                    order_id,
                    COUNT(*) as item_count,
                    COALESCE(SUM(quantity * unit_price), 0) as total_amount
                FROM ORDER_DETAIL
                WHERE order_id IN (${placeholders})
                GROUP BY order_id
            `;
            
            router.doSQL(detailSQL, orderIds, res, function(details) {
                // 合併訂單和詳細信息
                const detailMap = {};
                details.forEach(d => {
                    detailMap[d.order_id] = {
                        item_count: d.item_count,
                        total_amount: d.total_amount
                    };
                });
                
                orders.forEach(o => {
                    const detail = detailMap[o.order_id] || { item_count: 0, total_amount: 0 };
                    o.item_count = detail.item_count;
                    o.total_amount = detail.total_amount.toFixed(2);
                });
                
                res.render('layout_full', {
                    title: 'My Orders',
                    orders: orders,
                    currentPage: page,
                    totalPages: totalPages,
                    pages: pages,
                    hasPrevious: page > 1,
                    hasNext: page < totalPages,
                    previousPage: page - 1,
                    nextPage: page + 1,
                    partials: {
                        sidebar: 'sidebar',
                        content: 'my-orders/index'
                    }
                });
            });
        });
    });
});

// 查看我的訂單詳情
router.get('/:orderId', function (req, res) {
    const userId = req.session.user?.id;
    const orderId = req.params.orderId;
    
    if (!userId) {
        return res.redirect('/login');
    }
    
    // 確保訂單屬於當前用戶
    let orderSQL = `
        SELECT 
            o.order_id,
            o.order_date,
            o.status
        FROM \`ORDER\` o
        WHERE o.order_id = ? AND o.user_id = ?
    `;
    
    doSQL(orderSQL, [orderId, userId], res, function(order) {
        if (order.length === 0) {
            return res.status(403).send('Access denied');
        }
        
        // 獲取訂單明細
        let detailSQL = `
            SELECT 
                od.order_id,
                od.product_id,
                p.vmd_sncs as product_name,
                od.quantity,
                od.unit_price,
                (od.quantity * od.unit_price) as subtotal
            FROM ORDER_DETAIL od
            LEFT JOIN PRODUCT p ON od.product_id = p.product_id
            WHERE od.order_id = ?
        `;
        
        router.doSQL(detailSQL, [orderId], res, function(orderDetails) {
            const total = orderDetails.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
            
            res.render('layout_full', {
                title: 'Order Details',
                order: order[0],
                orderDetails: orderDetails,
                total: total.toFixed(2),
                partials: {
                    sidebar: 'sidebar',
                    content: 'my-orders/detail'
                }
            });
        });
    });
});

module.exports = router;
