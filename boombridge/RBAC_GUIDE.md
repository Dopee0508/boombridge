# 角色權限系統說明 | Role-Based Access Control Guide

[中文版](#中文版) | [English Version](#english-version)

---

## 中文版

### 📋 概述

BOOMBRIDGE 實作了完整的角色權限控制系統，將用戶分為兩種角色：

- **Admin (管理員)**: 擁有完整系統管理權限
- **User (一般用戶)**: 只能進行購物相關操作

---

### 👤 角色權限說明

#### 🔐 管理員 (Admin)

管理員擁有完整的系統管理權限，可以：

**查看與管理**
- ✅ 用戶管理 (User Management)
- ✅ 供應商管理 (Suppliers)
- ✅ 分類管理 (Categories)
- ✅ 產品管理 (Products) - 完整 CRUD
- ✅ 所有訂單 (All Orders)
- ✅ 訂單詳情 (All Order Details)

**產品操作**
- ✅ 編輯產品 (Edit)
- ✅ 刪除產品 (Delete)
- ✅ 新增產品
- ✅ 加入購物車
- ✅ BIM 物件管理

#### 👥 一般用戶 (User)

一般用戶只能進行購物相關操作：

**可用功能**
- ✅ 儀表板 (Dashboard)
- ✅ 個人資料 (Profile)
- ✅ 瀏覽產品 (View Products)
- ✅ 加入購物車 (Add to Cart)
- ✅ 購物車管理 (Shopping Cart)
- ✅ 建立訂單 (Create Orders)
- ✅ 查看我的訂單 (My Orders)
- ✅ BIM 物件瀏覽

**限制**
- ❌ 無法編輯或刪除產品
- ❌ 無法存取用戶管理
- ❌ 無法存取供應商管理
- ❌ 無法存取分類管理
- ❌ 無法查看所有訂單 (All Orders)
- ❌ 無法查看其他用戶的訂單詳情

---

### 🔧 技術實作

#### 1. 資料庫變更

```sql
-- USER 表新增 role 欄位
ALTER TABLE USER 
ADD COLUMN role ENUM('admin', 'user') NOT NULL DEFAULT 'user';

-- 設定管理員
UPDATE USER 
SET role = 'admin' 
WHERE email = 'import@boombridge.com';
```

#### 2. 註冊功能

註冊時可選擇角色：
- **User**: 一般用戶
- **Administrator**: 管理員

#### 3. 中間件保護

```javascript
// 需要登入
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

// 需要管理員權限
function requireAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send('Access denied');
    }
    next();
}
```

#### 4. 路由保護

以下路由需要管理員權限：
```javascript
app.use('/users', requireLogin, requireAdmin, userRouter);
app.use('/suppliers', requireLogin, requireAdmin, supplierRouter);
app.use('/categories', requireLogin, requireAdmin, categoryRouter);
app.use('/order_details', requireLogin, requireAdmin, orderDetailRouter);
app.use('/orders', requireLogin, requireAdmin, orderRouter);
```

Products 路由的編輯/刪除操作也需要管理員權限：
```javascript
app.get("/:ID/edit", requireAdmin, ...)
app.put("/:ID", requireAdmin, ...)
app.delete("/:ID", requireAdmin, ...)
```

#### 5. 視圖層級控制

側邊欄根據角色顯示不同選單：

```handlebars
<!-- 所有用戶可見 -->
<a href="/dashboard">Dashboard</a>
<a href="/profile">Profile</a>
<a href="/products">Products</a>
<a href="/cart">Shopping Cart</a>
<a href="/my-orders">My Orders</a>

<!-- 只有管理員可見 -->
{{#isAdmin}}
<a href="/orders">All Orders</a>
<a href="/users">User Management</a>
<a href="/suppliers">Suppliers</a>
<a href="/categories">Categories</a>
<a href="/order_details">Order Details</a>
{{/isAdmin}}
```

產品列表的按鈕也根據角色顯示：

```handlebars
<!-- 所有用戶都能加入購物車 -->
<button hx-post="/cart/add/{{product_id}}">Add to Cart</button>

<!-- 只有管理員能編輯/刪除 -->
{{#isAdmin}}
<a href="/products/{{product_id}}/edit">Edit</a>
<button hx-delete="/products/{{product_id}}">Delete</button>
{{/isAdmin}}
```

---

### 🧪 測試帳號

#### 管理員帳號
```
Email: import@boombridge.com
Password: password
Role: admin
```

#### 一般用戶帳號
可以自行註冊並選擇 "User" 角色

---

### 🚀 使用方式

#### 建立管理員帳號
1. 訪問 http://localhost:8080/register
2. 填寫資料（姓名、Email、密碼）
3. 在 "Account Type" 選擇 "Administrator"
4. 點擊 "Register" 完成註冊

#### 建立一般用戶帳號
1. 訪問 http://localhost:8080/register
2. 填寫資料（姓名、Email、密碼）
3. 在 "Account Type" 選擇 "User"
4. 點擊 "Register" 完成註冊

#### 測試權限
1. **以管理員登入**：可看到完整側邊欄選單和所有操作按鈕
2. **以一般用戶登入**：只能看到購物相關選單，產品頁面無編輯/刪除按鈕
3. **嘗試直接訪問受保護路由**：會被重定向或返回 403 錯誤

---

### 🔒 安全性

#### 前端保護
- 側邊欄選單根據角色顯示/隱藏
- 操作按鈕根據權限顯示/隱藏
- UI 層級提供良好的使用者體驗

#### 後端保護
- 路由層級使用 `requireAdmin` 中間件驗證
- 即使前端顯示按鈕，後端也會驗證權限
- 未授權存取會返回 403 Forbidden
- Session 驗證確保安全性

---

### 📝 後續改進建議

1. **密碼加密**: 目前密碼以明文儲存，建議使用 bcrypt 或 argon2 加密
2. **更多角色**: 可增加 "Manager"、"Warehouse" 等更細緻的角色
3. **權限記錄**: 記錄敏感操作的審計日誌 (Audit Log)
4. **Session 安全**: 增加 CSRF 保護和 Session timeout
5. **密碼政策**: 強制密碼複雜度要求（長度、特殊字元）
6. **Two-Factor Authentication**: 雙因素認證增強安全性

---

## English Version

### 📋 Overview

BOOMBRIDGE implements a complete Role-Based Access Control (RBAC) system with two user roles:

- **Admin (Administrator)**: Full system management privileges
- **User (Regular User)**: Shopping-related operations only

---

### 👤 Role Permissions

#### 🔐 Administrator (Admin)

Administrators have full system management privileges:

**View & Manage**
- ✅ User Management
- ✅ Supplier Management
- ✅ Category Management
- ✅ Product Management - Full CRUD
- ✅ All Orders
- ✅ All Order Details

**Product Operations**
- ✅ Edit Products
- ✅ Delete Products
- ✅ Add Products
- ✅ Add to Cart
- ✅ BIM Object Management

#### 👥 Regular User

Regular users can only perform shopping-related operations:

**Available Features**
- ✅ Dashboard
- ✅ Profile
- ✅ View Products
- ✅ Add to Cart
- ✅ Shopping Cart Management
- ✅ Create Orders
- ✅ View My Orders
- ✅ Browse BIM Objects

**Restrictions**
- ❌ Cannot edit or delete products
- ❌ Cannot access User Management
- ❌ Cannot access Supplier Management
- ❌ Cannot access Category Management
- ❌ Cannot view All Orders
- ❌ Cannot view other users' order details

---

### 🔧 Technical Implementation

#### 1. Database Changes

```sql
-- Add role column to USER table
ALTER TABLE USER 
ADD COLUMN role ENUM('admin', 'user') NOT NULL DEFAULT 'user';

-- Set administrator
UPDATE USER 
SET role = 'admin' 
WHERE email = 'import@boombridge.com';
```

#### 2. Registration Feature

Users can choose their role during registration:
- **User**: Regular user
- **Administrator**: Admin

#### 3. Middleware Protection

```javascript
// Require login
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

// Require admin privilege
function requireAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send('Access denied');
    }
    next();
}
```

#### 4. Route Protection

The following routes require admin privileges:
```javascript
app.use('/users', requireLogin, requireAdmin, userRouter);
app.use('/suppliers', requireLogin, requireAdmin, supplierRouter);
app.use('/categories', requireLogin, requireAdmin, categoryRouter);
app.use('/order_details', requireLogin, requireAdmin, orderDetailRouter);
app.use('/orders', requireLogin, requireAdmin, orderRouter);
```

Product edit/delete operations also require admin:
```javascript
app.get("/:ID/edit", requireAdmin, ...)
app.put("/:ID", requireAdmin, ...)
app.delete("/:ID", requireAdmin, ...)
```

#### 5. View-Level Control

Sidebar displays different menus based on role:

```handlebars
<!-- Visible to all users -->
<a href="/dashboard">Dashboard</a>
<a href="/profile">Profile</a>
<a href="/products">Products</a>
<a href="/cart">Shopping Cart</a>
<a href="/my-orders">My Orders</a>

<!-- Admin only -->
{{#isAdmin}}
<a href="/orders">All Orders</a>
<a href="/users">User Management</a>
<a href="/suppliers">Suppliers</a>
<a href="/categories">Categories</a>
<a href="/order_details">Order Details</a>
{{/isAdmin}}
```

Product list buttons also controlled by role:

```handlebars
<!-- All users can add to cart -->
<button hx-post="/cart/add/{{product_id}}">Add to Cart</button>

<!-- Admin only can edit/delete -->
{{#isAdmin}}
<a href="/products/{{product_id}}/edit">Edit</a>
<button hx-delete="/products/{{product_id}}">Delete</button>
{{/isAdmin}}
```

---

### 🧪 Test Accounts

#### Administrator Account
```
Email: import@boombridge.com
Password: password
Role: admin
```

#### Regular User Account
You can register and choose "User" role

---

### 🚀 Usage

#### Create Administrator Account
1. Visit http://localhost:8080/register
2. Fill in details (Name, Email, Password)
3. Select "Administrator" in "Account Type"
4. Click "Register" to complete

#### Create Regular User Account
1. Visit http://localhost:8080/register
2. Fill in details (Name, Email, Password)
3. Select "User" in "Account Type"
4. Click "Register" to complete

#### Test Permissions
1. **Login as Admin**: Full sidebar menu and all operation buttons visible
2. **Login as User**: Only shopping-related menus, no edit/delete buttons on products
3. **Try accessing protected routes**: Will be redirected or return 403 error

---

### 🔒 Security

#### Frontend Protection
- Sidebar menu shown/hidden based on role
- Operation buttons displayed based on permissions
- UI-level provides good user experience

#### Backend Protection
- Route-level validation with `requireAdmin` middleware
- Backend validates permissions even if frontend shows buttons
- Unauthorized access returns 403 Forbidden
- Session validation ensures security

---

### 📝 Future Improvements

1. **Password Encryption**: Currently plain text, recommend bcrypt or argon2
2. **More Roles**: Add "Manager", "Warehouse" for granular control
3. **Audit Logging**: Record sensitive operations
4. **Session Security**: Add CSRF protection and session timeout
5. **Password Policy**: Enforce complexity (length, special characters)
6. **Two-Factor Authentication**: Enhance security with 2FA

---

**Last Updated**: 2025-12-16

```handlebars
<!-- 所有用戶可見 -->
<a href="/dashboard">Dashboard</a>
<a href="/products">Products</a>
<a href="/cart">Shopping Cart</a>

<!-- 只有管理員可見 -->
{{#isAdmin}}
<a href="/users">User Management</a>
<a href="/suppliers">Suppliers</a>
{{/isAdmin}}
```

產品列表的按鈕也根據角色顯示：

```handlebars
<!-- 所有用戶都能加入購物車 -->
<button>Add to Cart</button>

<!-- 只有管理員能編輯/刪除 -->
{{#isAdmin}}
<button>Edit</button>
<button>Delete</button>
{{/isAdmin}}
```

---

## 🧪 測試帳號

### 管理員帳號
```
Email: import@boombridge.com
Password: password
Role: admin
```

### 一般用戶帳號
可以自行註冊並選擇 "一般用戶 (User)" 角色

---

## 🚀 使用方式

### 建立管理員帳號
1. 訪問 http://localhost:8080/register
2. 填寫資料
3. 在 "Account Type" 選擇 "管理員 (Admin)"
4. 註冊完成

### 建立一般用戶帳號
1. 訪問 http://localhost:8080/register
2. 填寫資料
3. 在 "Account Type" 選擇 "一般用戶 (User)"
4. 註冊完成

### 測試權限
1. 以管理員登入：可看到完整側邊欄選單和所有操作按鈕
2. 以一般用戶登入：只能看到購物相關選單，產品頁面無編輯/刪除按鈕

---

## 🔒 安全性

### 前端保護
- 側邊欄選單根據角色顯示/隱藏
- 操作按鈕根據權限顯示/隱藏

### 後端保護
- 路由層級使用 `requireAdmin` 中間件
- 即使前端顯示按鈕，後端也會驗證權限
- 未授權存取會返回 403 錯誤

---

## 📝 後續改進建議

1. **密碼加密**: 目前密碼以明文儲存，建議使用 bcrypt 加密
2. **更多角色**: 可增加 "店長"、"倉管" 等更細緻的角色
3. **權限記錄**: 記錄敏感操作的日誌
4. **Session 安全**: 增加 CSRF 保護
5. **密碼政策**: 強制密碼複雜度要求

---

**最後更新**: 2025-12-16
