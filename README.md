# BOOMBRIDGE Project - 專案說明文件

## 專案概述
BOOMBRIDGE 是一個基於 Node.js + Express + MySQL 的企業管理系統，提供六個核心模組的 CRUD 功能。

## 技術架構

### 後端技術
- **框架**: Express.js (Node.js)
- **資料庫**: MySQL 8.0 (運行於 Docker 容器)
- **模板引擎**: Handlebars (hjs)
- **會話管理**: express-session (30分鐘逾時)

### 前端技術
- **CSS 框架**: Bootstrap 5
- **圖示**: Bootstrap Icons
- **動態更新**: HTMX (實現無刷新 CRUD 操作)

### Docker 部署
- **應用容器**: BOOMBRIDGE_WEB (node:latest)
  - 容器端口: 80
  - 主機端口: 8080
- **資料庫容器**: boombridge (mysql:latest)
  - 內部 IP: 172.17.0.2
  - 端口: 3306

## 專案結構

```
BOOMBRIDGE_PROJECT/
├── app.js                    # 主應用程式入口（原 app_simple.js）
├── config.js                 # 資料庫和會話配置
├── package.json              # 專案依賴和啟動腳本
├── public/                   # 靜態資源
│   ├── bootstrap.min.css     # Bootstrap 5 樣式
│   ├── bootstrap-icons.min.css
│   ├── bootstrap.bundle.min.js
│   ├── htmx.min.js          # HTMX 庫
│   └── fonts/               # 字體檔案
├── routes/                  # 路由模組
│   ├── users.js            # 使用者管理
│   ├── suppliers.js        # 供應商管理
│   ├── categories.js       # 分類管理
│   ├── products.js         # 產品管理
│   ├── orders.js           # 訂單管理
│   └── order_details.js    # 訂單明細管理
└── views/                  # 視圖模板
    ├── layout_full.hjs     # 主版面（含側邊欄）
    ├── layout_login.hjs    # 登入頁面版面
    ├── sidebar.hjs         # 側邊導航選單
    ├── auth/              # 登入相關視圖
    ├── index/             # 儀表板
    ├── users/             # 使用者 CRUD 視圖
    ├── suppliers/         # 供應商 CRUD 視圖
    ├── categories/        # 分類 CRUD 視圖
    ├── products/          # 產品 CRUD 視圖
    ├── orders/            # 訂單 CRUD 視圖
    └── order_details/     # 訂單明細 CRUD 視圖
```

## 資料庫結構

### 資料庫名稱: BOOMBRIDGE

#### 1. USER (使用者表)
```sql
- user_id: INT AUTO_INCREMENT PRIMARY KEY
- name: VARCHAR
- email: VARCHAR
- password_hash: VARCHAR
```

#### 2. SUPPLIER (供應商表)
```sql
- supplier_id: VARCHAR(100) PRIMARY KEY (手動輸入)
- company_name: VARCHAR
- contact_info: TEXT
```

#### 3. CATEGORY (分類表)
```sql
- category_id: INT AUTO_INCREMENT PRIMARY KEY
- name: VARCHAR UNIQUE
```

#### 4. PRODUCT (產品表)
```sql
- product_id: VARCHAR(100) PRIMARY KEY
- supplier_id: VARCHAR(100) FOREIGN KEY
- category_id: INT FOREIGN KEY
- bim_object_id: VARCHAR
- vmd_sncs: VARCHAR(255) (產品名稱/規格)
- stock_qty: INT (庫存數量)
- list_price: FLOAT (定價)
```

#### 5. ORDER (訂單表)
```sql
- order_id: VARCHAR(100) PRIMARY KEY
- user_id: INT FOREIGN KEY
- quote_id: VARCHAR
- order_date: DATE
- status: VARCHAR(50)
```

#### 6. ORDER_DETAIL (訂單明細表)
```sql
- order_id: VARCHAR(100) PRIMARY KEY (複合主鍵)
- product_id: VARCHAR(100) PRIMARY KEY (複合主鍵)
- quantity: FLOAT
- unit_price: FLOAT
```

## 核心功能

### 1. 身份驗證
- **登入頁面**: `/login`
- **測試帳號**: import@boombridge.com / password
- **會話管理**: 30 分鐘自動登出
- **登出功能**: `/logout`

### 2. 儀表板 (Dashboard)
- **路徑**: `/dashboard`
- **功能**: 
  - 即時顯示六個模組的統計數據
  - 使用 UNION ALL 查詢確保數據即時更新
  - 彩色卡片顯示各模組記錄數量
  - 快速連結到各模組管理頁面

### 3. CRUD 操作模組

#### Users (使用者管理)
- **路徑**: `/users`
- **功能**: 新增、查看、編輯、刪除使用者
- **特殊說明**: user_id 自動遞增

#### Suppliers (供應商管理)
- **路徑**: `/suppliers`
- **功能**: 新增、查看、編輯、刪除供應商
- **特殊說明**: supplier_id 需手動輸入（例：S001）

#### Categories (分類管理)
- **路徑**: `/categories`
- **功能**: 新增、查看、編輯、刪除分類
- **特殊說明**: category_id 自動遞增，name 唯一

#### Products (產品管理)
- **路徑**: `/products`
- **功能**: 新增、查看、編輯、刪除產品
- **特殊說明**: 
  - 需選擇供應商和分類
  - 顯示供應商名稱和分類名稱（JOIN 查詢）

#### Orders (訂單管理)
- **路徑**: `/orders`
- **功能**: 新增、查看、編輯、刪除訂單
- **特殊說明**: 
  - 顯示使用者名稱（JOIN 查詢）
  - 訂單狀態管理

#### Order Details (訂單明細管理)
- **路徑**: `/order_details`
- **功能**: 新增、查看、編輯、刪除訂單明細
- **特殊說明**: 
  - 使用複合主鍵 (order_id, product_id)
  - 需選擇訂單和產品
  - 路由模式: `/:ORDER_ID/:PRODUCT_ID`

## 設計風格

### 配色方案
- **側邊欄**: 深色 (#3d4f5d)
- **主內容區**: 淺色 (#ecf0f1)
- **卡片背景**: 白色 (#ffffff)
- **表格**: Bootstrap table-hover 效果

### UI 組件
- **表格**: Bootstrap table 樣式
- **按鈕**: 
  - 編輯: btn-outline-primary (藍色)
  - 刪除: btn-outline-danger (紅色)
  - 儲存: btn-success (綠色)
  - 取消: btn-secondary (灰色)
- **表單**: Bootstrap form-control
- **圖示**: Bootstrap Icons

## 啟動方式

### 本地開發
```bash
npm start
```

### Docker 容器
```bash
# 重啟應用容器
docker restart BOOMBRIDGE_WEB

# 啟動應用
docker exec -d BOOMBRIDGE_WEB node /app/app.js

# 檢查應用狀態
docker logs BOOMBRIDGE_WEB
```

### 訪問應用
- **URL**: http://localhost:8080
- **登入頁**: http://localhost:8080/login

## 資料庫連線

### 連線資訊 (config.js)
```javascript
{
  host: "172.17.0.2",      // Docker 容器內部 IP
  user: "root",
  password: "se2025",
  database: "BOOMBRIDGE",
  connectTimeout: 60000
}
```

### 資料庫操作
```bash
# 進入資料庫容器
docker exec -it boombridge mysql -uroot -pse2025 BOOMBRIDGE

# 查看表結構
DESCRIBE USER;
DESCRIBE SUPPLIER;
# ... 其他表
```

## HTMX 互動模式

所有 CRUD 操作使用 HTMX 實現無刷新頁面更新：

### 新增記錄
```html
<form hx-post="/users" hx-target="#addRow" hx-swap="beforebegin">
```

### 編輯記錄
```html
<button hx-get="/users/123/edit" hx-target="#row-123" hx-swap="outerHTML">
```

### 更新記錄
```html
<form hx-put="/users/123" hx-target="#row-123" hx-swap="outerHTML">
```

### 刪除記錄
```html
<button hx-delete="/users/123" hx-target="#row-123" hx-swap="outerHTML" hx-confirm="確認刪除?">
```

## 已修復的問題

1. ✅ 移除 ORDER 表的 total_amount 欄位引用
2. ✅ 修正 ORDER_DETAIL 使用複合主鍵
3. ✅ 修正 PRODUCT 欄位名稱 (vmd_sncs, list_price, stock_qty)
4. ✅ 修正 SUPPLIER INSERT 使用手動 ID
5. ✅ 修正 CATEGORY 和 USER 使用自動遞增 ID
6. ✅ 更正所有視圖檔案對應正確的資料表
7. ✅ 統一路由和視圖命名規則
8. ✅ 移除不必要的舊檔案 (auth.js, index.js, empty_navbar.hjs)

## 維護建議

1. **定期備份資料庫**: 使用 mysqldump 定期備份
2. **監控容器狀態**: 使用 `docker ps` 和 `docker logs`
3. **更新依賴套件**: 定期執行 `npm update`
4. **代碼版本控制**: 使用 Git 管理代碼變更
5. **安全性**: 修改預設密碼，啟用 HTTPS

## 未來擴充建議

1. 使用者權限管理（RBAC）
2. 密碼加密（bcrypt）
3. 資料驗證和錯誤處理強化
4. API 接口開發（RESTful API）
5. 報表和數據分析功能
6. 檔案上傳功能（產品圖片）
7. 搜索和過濾功能
8. 分頁功能（處理大量數據）

## 技術支援

如遇到問題，請檢查：
1. Docker 容器是否正常運行
2. 資料庫連線是否正常
3. 瀏覽器控制台的錯誤訊息
4. 容器日誌: `docker logs BOOMBRIDGE_WEB`
5. 資料庫日誌: `docker logs boombridge`

---
**版本**: 1.0
**最後更新**: 2025-11-24
**開發環境**: Node.js v18+, MySQL 8.0, Docker
