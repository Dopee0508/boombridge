# BOOMBRIDGE Construction Management System

[中文版](#中文版) | [English Version](#english-version)

---

## English Version

### Overview
BOOMBRIDGE is a comprehensive web-based construction management system built with Node.js, Express, and MySQL. It provides complete CRUD operations for managing users, suppliers, categories, products, orders, and order details.

### Features
- **User Management**: Create, read, update, and delete user accounts with authentication
- **Supplier Management**: Manage supplier information and contacts
- **Category Management**: Organize products into categories
- **Product Management**: Track product inventory with pricing and stock quantities
- **Order Management**: Process and manage customer orders
- **Order Details**: Detailed tracking of order line items
- **Search & Pagination**: Built-in search functionality with page navigation
- **Authentication System**: Secure login and registration with session management
- **Responsive UI**: Modern Bootstrap 5 interface with HTMX for dynamic interactions

### Technology Stack
- **Backend**: Node.js with Express 5.1.0
- **Database**: MySQL 2 (version 3.15.3)
- **Template Engine**: HJS (Hogan.js) 0.0.6
- **Frontend**: Bootstrap 5, HTMX, Bootstrap Icons
- **Session Management**: express-session
- **Containerization**: Docker

### Installation

#### Prerequisites
- Docker and Docker Compose
- Node.js (if running without Docker)

#### Using Docker
1. Clone the repository:
```bash
git clone https://github.com/Dopee0508/boombridge.git
cd boombridge
```

2. Start the Docker containers:
```bash
docker-compose up -d
```

3. Access the application at `http://localhost:8080`

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
