// app_simple.js - 簡化版本
const express = require('express');
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
app.use(session({
    secret: configs.session_secret,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 * 30 }
}));

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
        req.session.user = { id: 1, email: email };
        res.set('HX-Redirect', '/dashboard'); 
        res.end();
        return;
    }
    
    // 檢查資料庫中的用戶
    const SQL = "SELECT user_id, name, email, password_hash FROM USER WHERE email = ?";
    doSQL(SQL, [email], res, function(data) {
        if (data.length > 0 && data[0].password_hash === password) {
            req.session.user = { id: data[0].user_id, email: data[0].email, name: data[0].name };
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
    const { name, email, password } = req.body;
    
    // 檢查郵箱是否已存在
    const checkSQL = "SELECT user_id FROM USER WHERE email = ?";
    doSQL(checkSQL, [email], res, function(existing) {
        if (existing.length > 0) {
            res.send('<div class="alert alert-danger alert-dismissible fade show" style="border-radius: 8px; border-left: 4px solid #dc3545; animation: slideDown 0.3s ease-out;"><i class="bi bi-exclamation-triangle-fill me-2"></i>Email already registered<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div><style>@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); }}</style>');
        } else {
            // 直接插入，讓 AUTO_INCREMENT 自動生成 user_id
            const insertSQL = "INSERT INTO USER (name, email, password_hash) VALUES (?, ?, ?)";
            doSQL(insertSQL, [name, email, password], res, function(data) {
                // 獲取剛插入的用戶
                const selectSQL = "SELECT user_id, name, email FROM USER WHERE email = ?";
                doSQL(selectSQL, [email], res, function(newUser) {
                    // 自動登入
                    req.session.user = { id: newUser[0].user_id, email: newUser[0].email, name: newUser[0].name };
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
    const SQL = `
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
    doSQL(SQL, [], res, function(data) {
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
        
        res.render('layout_full', { 
            title: 'Dashboard',
            counts: enrichedData,
            userEmail: req.session.user.email,
            partials: { 
                sidebar: 'sidebar',
                content: 'index/dashboard'
            }
        });
    });
});

// === CRUD Routes ===
const userRouter = require('./routes/users');
userRouter.doSQL = doSQL;
app.use('/users', requireLogin, userRouter);

const supplierRouter = require('./routes/suppliers');
supplierRouter.doSQL = doSQL;
app.use('/suppliers', requireLogin, supplierRouter);

const categoryRouter = require('./routes/categories');
categoryRouter.doSQL = doSQL;
app.use('/categories', requireLogin, categoryRouter);

const productRouter = require('./routes/products');
productRouter.doSQL = doSQL;
app.use('/products', requireLogin, productRouter);

const orderRouter = require('./routes/orders');
orderRouter.doSQL = doSQL;
app.use('/orders', requireLogin, orderRouter);

const orderDetailRouter = require('./routes/order_details');
orderDetailRouter.doSQL = doSQL;
app.use('/order_details', requireLogin, orderDetailRouter);

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
