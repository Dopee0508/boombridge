# BOOMBRIDGE 建築管理平台

## 專案結構

```
hw5/
├── app.js              # 主應用程式
├── config.js           # 資料庫和 session 配置
├── helpers.js          # 資料庫查詢輔助函數
├── package.json        # 專案依賴
├── routes/             # 路由模組
│   ├── cart.js         # 購物車功能
│   ├── profile.js      # 個人資料頁面
│   ├── orders.js       # 訂單管理
│   ├── products.js     # 產品管理
│   ├── categories.js   # 分類管理
│   ├── suppliers.js    # 供應商管理
│   └── users.js        # 用戶管理
├── views/              # 視圖模板 (Hogan.js)
│   ├── layout_full.hjs # 完整版面配置
│   ├── sidebar.hjs     # 側邊欄
│   ├── cart/           # 購物車視圖
│   ├── profile/        # 個人資料視圖
│   └── ...
├── public/             # 靜態資源
│   ├── bootstrap/      # Bootstrap CSS/JS
│   ├── htmx.min.js     # HTMX 庫
│   └── ...
└── sql/                # 資料庫 SQL 腳本
    ├── setup_database.sql
    ├── create_cart.sql
    └── ...
```

## 功能特色

- **用戶系統**: 登入/登出、個人資料頁面
- **購物車**: 加入商品、數量調整、結帳
- **訂單管理**: 創建訂單、查看訂單歷史
- **產品管理**: CRUD 操作
- **供應商管理**: CRUD 操作
- **分類管理**: CRUD 操作

## 啟動方式

```bash
# 使用 nodemon 啟動（自動重新載入）
docker exec BOOMBRIDGE_WEB sh -c "cd /app/hw5 && nodemon -L app.js"

# 或直接啟動
docker exec BOOMBRIDGE_WEB sh -c "cd /app/hw5 && node app.js"
```

## 技術棧

- **後端**: Node.js + Express 5.1.0
- **模板引擎**: Hogan.js (hjs)
- **資料庫**: MySQL 9.4.0
- **前端**: Bootstrap 5.3.8 + HTMX 2.0.8
- **Session**: express-session

## 主要路由

- `/login` - 登入頁面
- `/dashboard` - 儀表板
- `/profile` - 個人資料
- `/cart` - 購物車
- `/orders` - 訂單管理
- `/products` - 產品管理
- `/suppliers` - 供應商管理
- `/categories` - 分類管理
- `/users` - 用戶管理

## 資料庫表

- `USER` - 用戶資料
- `PRODUCT` - 產品資料
- `SUPPLIER` - 供應商資料
- `CATEGORY` - 分類資料
- `CART` - 購物車
- `ORDER` - 訂單
- `ORDER_DETAIL` - 訂單明細

## 預設登入帳號

```
Email: import@boombridge.com
Password: password
```
