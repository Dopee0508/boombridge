# BOOMBRIDGE Construction Management System

🚀 **快速開始** | [詳細文檔 SETUP.md](SETUP.md) | [English Version](#english-version)

---

## 🎯 一鍵啟動

### 從 GitHub 下載並運行

```bash
# 1. 克隆專案
git clone https://github.com/Dopee0508/boombridge.git
cd boombridge/hw5

# 2. 啟動所有服務（自動初始化資料庫）
docker-compose up -d

# 3. 等待啟動完成（約 30-60 秒）
docker-compose logs -f
```

**完成！** 打開瀏覽器訪問：**http://localhost:8080**

預設管理員帳號：
- **Email**: import@boombridge.com
- **Password**: password

---

## 📋 系統簡介

BOOMBRIDGE 是一個全功能的建築管理系統，基於 Node.js、Express 和 MySQL 構建。

### ✨ 核心功能
- 🛒 **購物車系統**: 產品加入購物車、結帳功能
- 👤 **角色權限管理**: Admin/User 雙角色系統
- 📦 **訂單管理**: 個人訂單追蹤（My Orders）和全局訂單管理（All Orders）
- 🏢 **供應商管理**: 供應商資料完整 CRUD
- 📑 **產品目錄**: 產品分類、搜索、分頁
- 🔐 **認證系統**: 登入、註冊、會話管理
- 📊 **Dashboard**: 系統概覽和統計
- 🎨 **現代化 UI**: Bootstrap 5 + HTMX 動態交互

### 🛠️ 技術棧
- **後端**: Node.js + Express 5.1.0
- **資料庫**: MySQL 9.4.0
- **模板引擎**: HJS (Hogan.js) 0.0.6
- **前端**: Bootstrap 5.3.8, HTMX 2.0.8, Bootstrap Icons
- **會話管理**: express-session
- **容器化**: Docker + Docker Compose

---

## 📦 使用 Docker Compose（推薦）

### 啟動服務

```bash
# 啟動所有服務（MySQL + Node.js）
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down

# 完全重置（包含資料庫）
docker-compose down -v
docker-compose up -d
```

### 服務說明

**docker-compose.yml 會自動：**
1. ✅ 啟動 MySQL 9.4.0 容器（端口 3306）
2. ✅ 啟動 Node.js 20 應用容器（端口 8080）
3. ✅ 自動執行資料庫初始化腳本 `sql/01_init_database.sql`
4. ✅ 自動載入測試資料（companies, materials, transactions）
5. ✅ 創建管理員帳號和購物車表
6. ✅ 安裝 npm 依賴並啟動應用

---

## 📂 專案結構

```
hw5/
├── docker-compose.yml       # Docker 服務配置
├── package.json             # Node.js 依賴
├── app.js                   # 應用主程式
├── config.js               # 資料庫配置
├── helpers.js              # 工具函數
├── sql/
│   └── 01_init_database.sql # 資料庫初始化腳本（自動執行）
├── routes/                  # 路由模組
│   ├── cart.js             # 購物車
│   ├── my-orders.js        # 個人訂單
│   ├── orders.js           # 全局訂單（Admin）
│   ├── profile.js          # 個人資料
│   ├── products.js         # 產品管理
│   ├── suppliers.js        # 供應商
│   ├── categories.js       # 分類
│   └── users.js            # 用戶管理
├── views/                   # HJS 模板
├── public/                  # 靜態資源
├── companies.tsv           # 供應商資料
├── materials.tsv           # 產品資料
├── transactions.tsv        # 交易資料
└── SETUP.md               # 詳細安裝文檔
```

---

## 🔑 預設帳號

### 管理員帳號（自動創建）
- **Email**: import@boombridge.com
- **Password**: password
- **Role**: Admin

### 註冊新帳號
訪問 http://localhost:8080 點擊「Register」即可註冊。

---

## 🎭 功能權限

### 一般用戶（User）
- ✅ Dashboard
- ✅ Profile（個人資料）
- ✅ Products（瀏覽產品）
- ✅ BIM Objects
- ✅ Shopping Cart（購物車）
- ✅ My Orders（個人訂單）

### 管理員（Admin）
- ✅ 所有一般用戶功能
- ✅ All Orders（所有訂單管理）
- ✅ User Management（用戶管理）
- ✅ Suppliers（供應商管理）
- ✅ Categories（分類管理）
- ✅ Order Details（訂單明細）
- ✅ Product Edit/Delete（產品編輯/刪除）

---

## 📝 資料庫說明

### 自動初始化
`sql/01_init_database.sql` 會在容器首次啟動時自動執行：

1. **創建資料庫**: BOOMBRIDGE（UTF8MB4）
2. **載入資料**: 從 TSV 檔案導入供應商、產品、交易資料
3. **建立表格**: USER, PRODUCT, SUPPLIER, CATEGORY, ORDER, ORDER_DETAIL, CART
4. **初始數據**: 創建分類、管理員帳號、測試訂單
5. **索引優化**: 為常用查詢建立索引

### 表格結構
- **USER**: 用戶（含 role: admin/user）
- **SUPPLIER**: 供應商
- **CATEGORY**: 產品分類
- **PRODUCT**: 產品（含分類、價格）
- **ORDER**: 訂單（含用戶、日期、狀態）
- **ORDER_DETAIL**: 訂單明細（複合主鍵：order_id + product_id）
- **CART**: 購物車（含數量、加入日期）

---

## 🐛 常見問題

### 1. 端口被占用
```bash
# 修改 docker-compose.yml 中的端口映射
ports:
  - "8081:80"  # 改用 8081
```

### 2. 資料庫連接失敗
```bash
# 等待資料庫完全啟動（30 秒）
docker-compose logs db

# 重啟 Web 服務
docker-compose restart web
```

### 3. 代碼修改未生效
```bash
# 容器內使用 nodemon，會自動重啟
# 或手動重啟
docker-compose restart web
```

### 4. 完全重置
```bash
# 刪除所有容器和資料卷
docker-compose down -v

# 重新啟動
docker-compose up -d
```

---

## 🔄 開發模式

### 本地開發（不使用 Docker）

```bash
# 安裝依賴
npm install

# 確保 MySQL 運行在 localhost:3306
# 修改 config.js 中的連接設定

# 啟動應用
npm start
```

---

## English Version

### Overview
BOOMBRIDGE is a comprehensive web-based construction management system built with Node.js, Express, and MySQL. It provides complete CRUD operations for managing users, suppliers, categories, products, orders, and order details.

### Quick Start with Docker Compose

```bash
# Clone the repository
git clone https://github.com/Dopee0508/boombridge.git
cd boombridge/hw5

# Start all services (auto-initialize database)
docker-compose up -d

# Access at http://localhost:8080
```

**Default Admin Account:**
- Email: import@boombridge.com
- Password: password

### Features
- 🛒 **Shopping Cart**: Add to cart, checkout functionality
- 👤 **Role-Based Access Control**: Admin/User dual-role system
- 📦 **Order Management**: Personal orders (My Orders) and global orders (All Orders)
- 🏢 **Supplier Management**: Complete CRUD for supplier data
- 📑 **Product Catalog**: Product categories, search, pagination
- 🔐 **Authentication**: Login, registration, session management
- 📊 **Dashboard**: System overview and statistics
- 🎨 **Modern UI**: Bootstrap 5 + HTMX dynamic interactions

### Technology Stack
- **Backend**: Node.js + Express 5.1.0
- **Database**: MySQL 9.4.0
- **Template Engine**: HJS (Hogan.js) 0.0.6
- **Frontend**: Bootstrap 5.3.8, HTMX 2.0.8
- **Session**: express-session
- **Container**: Docker + Docker Compose

For detailed documentation, see [SETUP.md](SETUP.md)

---

## 📄 License
Educational purposes only.

#### Manual Setup
1. Install dependencies:
```bash
npm install
```

2. Configure database connection in `config.js`:
```javascript
db: {
    host: "your-mysql-host",
    user: "root",
    password: "your-password",
    database: "BOOMBRIDGE"
}
```

3. Start the application:
```bash
node app.js
```

### Usage

#### Login
- Navigate to `http://localhost:8080/login`
- Demo account: `import@boombridge.com` / `password`
- Or register a new account

#### Main Modules
1. **Dashboard**: Overview of all modules with record counts
2. **Users**: Manage user accounts
3. **Suppliers**: Manage supplier information
4. **Categories**: Organize product categories
5. **Products**: Manage product inventory
6. **Orders**: Process customer orders
7. **Order Details**: View and manage order line items

#### Operations
- **Add**: Click "Add New" button to create records
- **Edit**: Click edit icon on any row to modify
- **Delete**: Click delete icon to remove records
- **Search**: Use search bar to filter records
- **Pagination**: Navigate pages using Previous/Next or jump to specific page

### API Endpoints

#### Authentication
- `GET /login` - Login page
- `POST /login` - Process login
- `GET /register` - Registration page
- `POST /register` - Process registration
- `GET /logout` - Logout

#### CRUD Routes
- `GET /{module}` - List all records with pagination
- `GET /{module}/:ID` - Get single record
- `GET /{module}/:ID/edit` - Edit form
- `POST /{module}` - Create new record
- `PUT /{module}/:ID` - Update record
- `DELETE /{module}/:ID` - Delete record

Modules: `users`, `suppliers`, `categories`, `products`, `orders`, `order_details`

### Project Structure
```
BOOMBRIDGE_PROJECT/
├── app.js                  # Main application file
├── config.js              # Database and session configuration
├── package.json           # Dependencies
├── routes/                # Route handlers
│   ├── users.js
│   ├── suppliers.js
│   ├── categories.js
│   ├── products.js
│   ├── orders.js
│   └── order_details.js
├── views/                 # HJS templates
│   ├── auth/             # Login and registration
│   ├── index/            # Dashboard
│   ├── layout_full.hjs   # Main layout
│   └── [modules]/        # Module-specific views
└── public/               # Static assets
    ├── bootstrap files
    ├── htmx.min.js
    └── fonts/
```

### Database Schema
- **USER**: user_id, name, email, password_hash
- **SUPPLIER**: supplier_id, company_name, contact details
- **CATEGORY**: category_id, name
- **PRODUCT**: product_id, vmd_sncs, category_id, supplier_id, list_price, stock_qty
- **ORDER**: order_id, user_id, order_date, status
- **ORDER_DETAIL**: order_id, product_id, quantity, unit_price

### License
This project is for educational purposes.

---

## 中文版

### 概述
BOOMBRIDGE 是一個基於 Node.js、Express 和 MySQL 構建的綜合性建築管理系統。提供完整的 CRUD 操作來管理用戶、供應商、類別、產品、訂單和訂單明細。

### 功能特色
- **用戶管理**：創建、讀取、更新和刪除用戶帳戶，包含身份驗證
- **供應商管理**：管理供應商資訊和聯絡方式
- **類別管理**：組織產品分類
- **產品管理**：追蹤產品庫存、價格和數量
- **訂單管理**：處理和管理客戶訂單
- **訂單明細**：詳細追蹤訂單項目
- **搜尋與分頁**：內建搜尋功能與頁面導航
- **認證系統**：安全的登入和註冊，包含會話管理
- **響應式介面**：現代化 Bootstrap 5 界面，使用 HTMX 實現動態交互

### 技術架構
- **後端**：Node.js with Express 5.1.0
- **資料庫**：MySQL 2 (version 3.15.3)
- **模板引擎**：HJS (Hogan.js) 0.0.6
- **前端**：Bootstrap 5、HTMX、Bootstrap Icons
- **會話管理**：express-session
- **容器化**：Docker

### 安裝步驟

#### 環境需求
- Docker 和 Docker Compose
- Node.js（如果不使用 Docker）

#### 使用 Docker
1. 克隆專案：
```bash
git clone https://github.com/Dopee0508/boombridge.git
cd boombridge
```

2. 啟動 Docker 容器：
```bash
docker-compose up -d
```

3. 在瀏覽器訪問 `http://localhost:8080`

#### 手動安裝
1. 安裝依賴套件：
```bash
npm install
```

2. 在 `config.js` 中配置資料庫連接：
```javascript
db: {
    host: "your-mysql-host",
    user: "root",
    password: "your-password",
    database: "BOOMBRIDGE"
}
```

3. 啟動應用程式：
```bash
node app.js
```

### 使用說明

#### 登入
- 訪問 `http://localhost:8080/login`
- 測試帳號：`import@boombridge.com` / `password`
- 或註冊新帳號

#### 主要模組
1. **儀表板**：所有模組的概覽和記錄數量
2. **用戶**：管理用戶帳號
3. **供應商**：管理供應商資訊
4. **類別**：組織產品類別
5. **產品**：管理產品庫存
6. **訂單**：處理客戶訂單
7. **訂單明細**：查看和管理訂單項目

#### 操作方式
- **新增**：點擊「新增」按鈕創建記錄
- **編輯**：點擊任何行的編輯圖標進行修改
- **刪除**：點擊刪除圖標移除記錄
- **搜尋**：使用搜尋欄過濾記錄
- **分頁**：使用上一頁/下一頁導航，或直接跳轉到指定頁面

### API 端點

#### 認證
- `GET /login` - 登入頁面
- `POST /login` - 處理登入
- `GET /register` - 註冊頁面
- `POST /register` - 處理註冊
- `GET /logout` - 登出

#### CRUD 路由
- `GET /{模組}` - 列出所有記錄（含分頁）
- `GET /{模組}/:ID` - 獲取單一記錄
- `GET /{模組}/:ID/edit` - 編輯表單
- `POST /{模組}` - 創建新記錄
- `PUT /{模組}/:ID` - 更新記錄
- `DELETE /{模組}/:ID` - 刪除記錄

模組：`users`、`suppliers`、`categories`、`products`、`orders`、`order_details`

### 專案結構
```
BOOMBRIDGE_PROJECT/
├── app.js                  # 主應用程式檔案
├── config.js              # 資料庫和會話配置
├── package.json           # 依賴套件
├── routes/                # 路由處理器
│   ├── users.js
│   ├── suppliers.js
│   ├── categories.js
│   ├── products.js
│   ├── orders.js
│   └── order_details.js
├── views/                 # HJS 模板
│   ├── auth/             # 登入和註冊
│   ├── index/            # 儀表板
│   ├── layout_full.hjs   # 主要佈局
│   └── [模組]/           # 模組特定視圖
└── public/               # 靜態資源
    ├── bootstrap 檔案
    ├── htmx.min.js
    └── fonts/
```

### 資料庫結構
- **USER**：user_id、name、email、password_hash
- **SUPPLIER**：supplier_id、company_name、聯絡資訊
- **CATEGORY**：category_id、name
- **PRODUCT**：product_id、vmd_sncs、category_id、supplier_id、list_price、stock_qty
- **ORDER**：order_id、user_id、order_date、status
- **ORDER_DETAIL**：order_id、product_id、quantity、unit_price

### 授權
本專案僅供教育用途使用。
