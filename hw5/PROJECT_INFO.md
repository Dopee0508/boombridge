# BOOMBRIDGE 建築管理平台 | Construction Management Platform

[中文版](#中文版) | [English Version](#english-version)

---

## 中文版

### 專案結構

```
hw5/
├── docker-compose.yml  # Docker 服務配置
├── app.js              # 主應用程式
├── config.js           # 資料庫和 session 配置
├── helpers.js          # 資料庫查詢輔助函數
├── package.json        # 專案依賴
├── routes/             # 路由模組
│   ├── cart.js         # 購物車功能
│   ├── my-orders.js    # 個人訂單
│   ├── profile.js      # 個人資料頁面
│   ├── orders.js       # 訂單管理 (Admin)
│   ├── products.js     # 產品管理
│   ├── categories.js   # 分類管理
│   ├── suppliers.js    # 供應商管理
│   └── users.js        # 用戶管理
├── views/              # 視圖模板 (Hogan.js)
│   ├── layout_full.hjs # 完整版面配置
│   ├── sidebar.hjs     # 側邊欄 (依角色顯示)
│   ├── cart/           # 購物車視圖
│   ├── my-orders/      # 個人訂單視圖
│   ├── profile/        # 個人資料視圖
│   └── ...
├── public/             # 靜態資源
│   ├── bootstrap.min.css      # Bootstrap 5.3.8
│   ├── bootstrap.bundle.min.js
│   ├── htmx.min.js            # HTMX 2.0.8
│   └── bootstrap-icons.min.css
└── sql/                # 資料庫 SQL 腳本
    └── 01_init_database.sql   # 初始化腳本 (自動執行)
```

### 功能特色

#### 🔐 角色權限系統
- **管理員 (Admin)**: 完整系統管理權限
- **一般用戶 (User)**: 購物和個人訂單管理

#### 🛒 購物系統
- 產品瀏覽和搜索
- 購物車管理 (HTMX 動態更新)
- 一鍵結帳功能

#### 📦 訂單管理
- **My Orders**: 個人訂單追蹤
- **All Orders**: 全局訂單管理 (Admin only)
- 訂單詳情查看

#### 🏢 資料管理 (Admin)
- 產品管理 (CRUD)
- 供應商管理
- 分類管理
- 用戶管理

### 啟動方式

#### 使用 Docker Compose (推薦)
```bash
# 啟動所有服務
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down
```

#### 手動啟動
```bash
# 使用 nodemon 啟動（自動重新載入）
docker exec BOOMBRIDGE_WEB sh -c "cd /app/hw5 && nodemon -L app.js"

# 或直接啟動
docker exec BOOMBRIDGE_WEB sh -c "cd /app/hw5 && node app.js"
```

### 技術棧

- **後端**: Node.js + Express 5.1.0
- **模板引擎**: Hogan.js (hjs) 0.0.6
- **資料庫**: MySQL 9.4.0
- **前端**: Bootstrap 5.3.8 + HTMX 2.0.8
- **Session**: express-session
- **容器化**: Docker + Docker Compose

### 主要路由

#### 公開路由
- `/login` - 登入頁面
- `/register` - 註冊頁面

#### 認證路由 (需登入)
- `/dashboard` - 儀表板
- `/profile` - 個人資料
- `/cart` - 購物車
- `/my-orders` - 我的訂單
- `/products` - 產品目錄

#### 管理員路由 (需 Admin 權限)
- `/orders` - 所有訂單管理
- `/suppliers` - 供應商管理
- `/categories` - 分類管理
- `/users` - 用戶管理
- `/order_details` - 訂單明細

### 資料庫表

- `USER` - 用戶資料 (含 role: admin/user)
- `PRODUCT` - 產品資料
- `SUPPLIER` - 供應商資料
- `CATEGORY` - 分類資料
- `CART` - 購物車
- `ORDER` - 訂單
- `ORDER_DETAIL` - 訂單明細 (複合主鍵: order_id + product_id)

### 預設登入帳號

```
Email: import@boombridge.com
Password: password
Role: Admin
```

---

## English Version

### Project Structure

```
hw5/
├── docker-compose.yml  # Docker services configuration
├── app.js              # Main application
├── config.js           # Database and session config
├── helpers.js          # Database query helpers
├── package.json        # Project dependencies
├── routes/             # Route modules
│   ├── cart.js         # Shopping cart
│   ├── my-orders.js    # Personal orders
│   ├── profile.js      # User profile
│   ├── orders.js       # Order management (Admin)
│   ├── products.js     # Product management
│   ├── categories.js   # Category management
│   ├── suppliers.js    # Supplier management
│   └── users.js        # User management
├── views/              # View templates (Hogan.js)
│   ├── layout_full.hjs # Full page layout
│   ├── sidebar.hjs     # Sidebar (role-based)
│   ├── cart/           # Cart views
│   ├── my-orders/      # Personal order views
│   ├── profile/        # Profile views
│   └── ...
├── public/             # Static assets
│   ├── bootstrap.min.css      # Bootstrap 5.3.8
│   ├── bootstrap.bundle.min.js
│   ├── htmx.min.js            # HTMX 2.0.8
│   └── bootstrap-icons.min.css
└── sql/                # Database SQL scripts
    └── 01_init_database.sql   # Init script (auto-executed)
```

### Key Features

#### 🔐 Role-Based Access Control
- **Admin**: Full system management privileges
- **User**: Shopping and personal order management

#### 🛒 Shopping System
- Product browsing and search
- Shopping cart management (HTMX dynamic updates)
- One-click checkout

#### 📦 Order Management
- **My Orders**: Personal order tracking
- **All Orders**: Global order management (Admin only)
- Order detail viewing

#### 🏢 Data Management (Admin)
- Product management (CRUD)
- Supplier management
- Category management
- User management

### How to Start

#### Using Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Manual Start
```bash
# Start with nodemon (auto-reload)
docker exec BOOMBRIDGE_WEB sh -c "cd /app/hw5 && nodemon -L app.js"

# Or direct start
docker exec BOOMBRIDGE_WEB sh -c "cd /app/hw5 && node app.js"
```

### Tech Stack

- **Backend**: Node.js + Express 5.1.0
- **Template Engine**: Hogan.js (hjs) 0.0.6
- **Database**: MySQL 9.4.0
- **Frontend**: Bootstrap 5.3.8 + HTMX 2.0.8
- **Session**: express-session
- **Container**: Docker + Docker Compose

### Main Routes

#### Public Routes
- `/login` - Login page
- `/register` - Registration page

#### Authenticated Routes (Login required)
- `/dashboard` - Dashboard
- `/profile` - User profile
- `/cart` - Shopping cart
- `/my-orders` - My orders
- `/products` - Product catalog

#### Admin Routes (Admin privilege required)
- `/orders` - All orders management
- `/suppliers` - Supplier management
- `/categories` - Category management
- `/users` - User management
- `/order_details` - Order details

### Database Tables

- `USER` - User data (with role: admin/user)
- `PRODUCT` - Product data
- `SUPPLIER` - Supplier data
- `CATEGORY` - Category data
- `CART` - Shopping cart
- `ORDER` - Orders
- `ORDER_DETAIL` - Order details (composite key: order_id + product_id)

### Default Login Account

```
Email: import@boombridge.com
Password: password
Role: Admin
```
