// app_simple.js - 簡化版本
const express = require('express');
const path = require('path');   
const db = require('mysql2');
const session = require('express-session');
const configs = require('./config');

const app = express();
const connection = db.createConnection(configs.db);

// 輔助函數
function doSQL(SQL, parms, res, callback) {
    connection.execute(SQL, parms, function (err, data) {
        if (err) {
            console.error(err);
            res.status(404).send(err.sqlMessage); 
        } else {
            callback(data);
        }
    });
}

// 資料庫連線
connection.connect((err) => {
    if (err) {
        console.error("Database connection failed", err); 
    } else {
        console.log("Connected to database: BOOMBRIDGE");
    }
});

// 中介軟體設定
app.set('view engine', 'hjs');
app.set('views', __dirname + '/views');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));  // 靜態檔案
app.use("/bim_thumbs", express.static("public/bim_thumbs"));
app.use('/bim_files', express.static(            //  /bim_files/*
  path.join(__dirname, 'public/bim_files')
));
app.use(session({
    secret: configs.session_secret,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 * 30 }
}));

// 中間件：自動添加 role 資訊到所有 render
app.use((req, res, next) => {
    const originalRender = res.render;
    res.render = function(view, options, callback) {
        options = options || {};
        if (req.session.user) {
            options.userRole = req.session.user.role;
            options.isAdmin = req.session.user.role === 'admin';
        }
        originalRender.call(this, view, options, callback);
    };
    next();
});

// 登入驗證
function requireLogin(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        if (req.get("HX-Request")) {
            res.set("HX-Redirect", "/login");
            res.end();
        } else {
            res.redirect('/login');
        }
    }
}

// 權限檢查中間件：只有管理員才能執行
function requireAdmin(req, res, next) {
    if (!req.session.user) {
        if (req.get("HX-Request")) {
            res.set("HX-Redirect", "/login");
            res.end();
        } else {
            res.redirect('/login');
        }
        return;
    }
    
    if (req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('<div class="alert alert-danger m-3"><i class="bi bi-shield-x me-2"></i>Access Denied: Admin privileges required</div>');
    }
}

// === 路由 ===

// 登入頁面
app.get('/login', (req, res) => {
    res.render('layout_login', {
        title: 'Login',
        where: '/login/form'
    });
});

// 登入表單
app.get('/login/form', (req, res) => {
    res.render('auth/login_form', { error: req.query.error });
});

// 處理登入
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    // Demo 帳號
    if (email === 'import@boombridge.com' && password === 'password') {
        req.session.user = { id: 1, email: email, role: 'admin' };
        res.set('HX-Redirect', '/dashboard'); 
        res.end();
        return;
    }
    
    // 檢查資料庫中的用戶，包含 role
    const SQL = "SELECT user_id, name, email, password_hash, role FROM USER WHERE email = ?";
    doSQL(SQL, [email], res, function(data) {
        if (data.length > 0 && data[0].password_hash === password) {
            req.session.user = { 
                id: data[0].user_id, 
                email: data[0].email, 
                name: data[0].name,
                role: data[0].role || 'user'  // 預設為 user
            };
            res.set('HX-Redirect', '/dashboard'); 
            res.end();
        } else {
            // 返回錯誤訊息 HTML
            res.send('<div class="alert alert-danger alert-dismissible fade show" style="border-radius: 8px; border-left: 4px solid #dc3545; animation: slideDown 0.3s ease-out;"><i class="bi bi-exclamation-triangle-fill me-2"></i>Invalid email or password<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div><style>@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); }}</style>');
        }
    });
});

// 註冊頁面
app.get('/register', (req, res) => {
    res.render('layout_login', {
        title: 'Register',
        where: '/register/form'
    });
});

// 註冊表單
app.get('/register/form', (req, res) => {
    res.render('auth/register_form');
});

// 處理註冊
app.post('/register', (req, res) => {
    const { name, email, password, role } = req.body;
    
    // 驗證 role 值
    const validRole = ['admin', 'user'].includes(role) ? role : 'user';
    
    // 檢查郵箱是否已存在
    const checkSQL = "SELECT user_id FROM USER WHERE email = ?";
    doSQL(checkSQL, [email], res, function(existing) {
        if (existing.length > 0) {
            res.send('<div class="alert alert-danger alert-dismissible fade show" style="border-radius: 8px; border-left: 4px solid #dc3545; animation: slideDown 0.3s ease-out;"><i class="bi bi-exclamation-triangle-fill me-2"></i>Email already registered<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div><style>@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); }}</style>');
        } else {
            // 插入新用戶，包含 role
            const insertSQL = "INSERT INTO USER (name, email, password_hash, role) VALUES (?, ?, ?, ?)";
            doSQL(insertSQL, [name, email, password, validRole], res, function(data) {
                // 獲取剛插入的用戶
                const selectSQL = "SELECT user_id, name, email, role FROM USER WHERE email = ?";
                doSQL(selectSQL, [email], res, function(newUser) {
                    // 自動登入，session 中包含 role
                    req.session.user = { 
                        id: newUser[0].user_id, 
                        email: newUser[0].email, 
                        name: newUser[0].name,
                        role: newUser[0].role 
                    };
                    res.set('HX-Redirect', '/dashboard');
                    res.end();
                });
            });
        }
    });
});

// 登出
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Logout Error:", err);
            res.status(500).send("Logout failed.");
            return;
        }
        res.redirect('/login');
    });
});

// Dashboard
app.get('/dashboard', requireLogin, (req, res) => {
    // นับจำนวน module ต่าง ๆ
    const SQL_COUNTS = `
        SELECT 'Users' AS name, COUNT(*) AS count, 'people' AS icon, 'users' AS link FROM USER
        UNION ALL
        SELECT 'Suppliers' AS name, COUNT(*) AS count, 'building' AS icon, 'suppliers' AS link FROM SUPPLIER
        UNION ALL
        SELECT 'Categories' AS name, COUNT(*) AS count, 'tags' AS icon, 'categories' AS link FROM CATEGORY
        UNION ALL
        SELECT 'Products' AS name, COUNT(*) AS count, 'box-seam' AS icon, 'products' AS link FROM PRODUCT
        UNION ALL
        SELECT 'Orders' AS name, COUNT(*) AS count, 'receipt' AS icon, 'orders' AS link FROM \`ORDER\`
        UNION ALL
        SELECT 'Order Details' AS name, COUNT(*) AS count, 'list-check' AS icon, 'order_details' AS link FROM ORDER_DETAIL;
    `;

    // นับจำนวนตาม status
    const SQL_STATUS = `
        SELECT status, COUNT(*) AS count
        FROM \`ORDER\`
        GROUP BY status;
    `;

    // mock recent activities ไว้ก่อน
    const activities = [
        {
            icon: '🧾',
            title: 'New order imported – Order #49305',
            time: 'Just now'
        },
        {
            icon: '👤',
            title: 'User login – import@boombridge.com',
            time: '5 minutes ago'
        },
        {
            icon: '📦',
            title: 'Products data updated',
            time: 'Today'
        }
    ];

    // 1) ดึง counts
    doSQL(SQL_COUNTS, [], res, function (data) {
        const gradients = {
            'users': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            'suppliers': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            'categories': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            'products': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            'orders': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            'order_details': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
        };
        const linkTexts = {
            'users': 'View Users',
            'suppliers': 'Manage Suppliers',
            'categories': 'View Categories',
            'products': 'View Products',
            'orders': 'View Orders',
            'order_details': 'View Order Details'
        };

        const enrichedData = data.map(item => ({
            ...item,
            gradient: gradients[item.link] || 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
            linkText: linkTexts[item.link] || 'View/Manage'
        }));

        // 2) ดึง status
        doSQL(SQL_STATUS, [], res, function (rows) {

            const orderStatus = rows.map(r => {
                let badgeClass = 'secondary';
                if (r.status === 'Completed')   badgeClass = 'success';
                else if (r.status === 'Processing') badgeClass = 'warning';

                return {
                    label: r.status,
                    count: r.count,
                    badgeClass
                };
            });

            // เตรียมตัวเลขสำหรับกราฟ
            let completedCount = 0;
            let processingCount = 0;
            orderStatus.forEach(s => {
                if (s.label === 'Completed')  completedCount  = s.count;
                if (s.label === 'Processing') processingCount = s.count;
            });

            res.render('layout_full', {
                title: 'Dashboard',
                counts: enrichedData,
                activities: activities,
                orderStatus: orderStatus,
                completedCount: completedCount,     // << สำคัญ
                processingCount: processingCount,   // << สำคัญ
                userEmail: req.session.user.email,
                partials: {
                    sidebar: 'sidebar',
                    content: 'index/dashboard'
                }
            });
        });
    });
});


// === CRUD Routes ===
const userRouter = require('./routes/users');
userRouter.doSQL = doSQL;
app.use('/users', requireLogin, requireAdmin, userRouter);

const supplierRouter = require('./routes/suppliers');
supplierRouter.doSQL = doSQL;
app.use('/suppliers', requireLogin, requireAdmin, supplierRouter);

const categoryRouter = require('./routes/categories');
categoryRouter.doSQL = doSQL;
app.use('/categories', requireLogin, requireAdmin, categoryRouter);

const productRouter = require('./routes/products');
productRouter.doSQL = doSQL;
app.use('/products', requireLogin, productRouter);
const bimRouter = require("./routes/bim");
app.use("/bim", bimRouter);

const cartRouter = require('./routes/cart');
app.use('/cart', requireLogin, cartRouter);

const profileRouter = require('./routes/profile');
app.use('/profile', requireLogin, profileRouter);

const orderRouter = require('./routes/orders');
orderRouter.doSQL = doSQL;
app.use('/orders', requireLogin, orderRouter);

const orderDetailRouter = require('./routes/order_details');
orderDetailRouter.doSQL = doSQL;
app.use('/order_details', requireLogin, requireAdmin, orderDetailRouter);

// 根路徑重定向
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

app.listen(80, function () {
    console.log('Web server listening on port 80!');
});
