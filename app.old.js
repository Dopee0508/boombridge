// app.js
const express = require('express');
const db = require('mysql2');
const session = require('express-session');
const fileupload = require('express-fileupload');
const configs = require('./config');

const app = express();
const connection = db.createConnection(configs.db);

// === 輔助函數：執行 SQL 查詢 (中央注入) ===
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

// === 資料庫連線 ===
connection.connect((err) => {
    if (err) {
        console.error("致命錯誤：資料庫連線失敗", err); 
    } else {
        console.log("Connected to database: BOOMBRIDGE");
    }
});

// === 應用程式設定與中介軟體 ===
app.set('view engine', 'hjs');
app.set('views', __dirname + '/views');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(fileupload());
app.use(session({
    secret: configs.session_secret,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 * 30 }
}));

// 登入驗證中介軟體 (Require Login Middleware)
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

// === 基礎路由 ===
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

// === 引入與掛載路由 (將 doSQL 注入路由) ===

// 1. 登入路由 (不需要登入)
const authRouter = require('./routes/auth');
authRouter.doSQL = doSQL; 
app.use('/login', authRouter);

// 登出路由
app.get('/logout', function(req, res) {
    req.session.destroy(err => {
        if (err) {
            console.error("Logout Error:", err);
            res.status(500).send("Logout failed.");
            return;
        }
        res.redirect('/login');
    });
});

// 2. 主頁/儀表板路由 (需要登入)
const indexRouter = require('./routes/index');
indexRouter.doSQL = doSQL; 
app.use('/dashboard', requireLogin, indexRouter); 

// 3. 供應商 CRUD 路由
const supplierRouter = require('./routes/suppliers');
supplierRouter.doSQL = doSQL; 
app.use('/suppliers', requireLogin, supplierRouter);

app.listen(80, function () {
    console.log('Web server listening on port 80!');
});