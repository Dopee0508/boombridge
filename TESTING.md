# CRUD 功能測試指南

## 測試前準備
1. 確認應用已啟動: http://localhost:8080
2. 登入帳號: import@boombridge.com / password

## 測試步驟

### 1. Users (使用者管理) - http://localhost:8080/users

#### 測試新增 (Create)
1. 在表格底部的表單輸入:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
2. 點擊 "Add User" 按鈕
3. ✅ 應該看到新記錄出現在表格中，user_id 自動產生

#### 測試編輯 (Update)
1. 找到剛新增的記錄，點擊 "編輯" 按鈕（鉛筆圖示）
2. 修改 Name 為: Test User Updated
3. 點擊 "Save" 按鈕（綠色勾勾）
4. ✅ 記錄應該更新，顯示新的名稱

#### 測試取消編輯
1. 點擊任一記錄的 "編輯" 按鈕
2. 點擊 "Cancel" 按鈕（X 圖示）
3. ✅ 應該回到顯示模式，不儲存變更

#### 測試刪除 (Delete)
1. 找到測試用的記錄，點擊 "刪除" 按鈕（垃圾桶圖示）
2. 確認刪除提示
3. ✅ 記錄應該從表格中消失

---

### 2. Suppliers (供應商管理) - http://localhost:8080/suppliers

#### 測試新增
1. 點擊 "Add New Supplier" 按鈕
2. 輸入:
   - ID: TEST001
   - Company Name: Test Supplier Co.
   - Contact Info: 123 Test St., test@supplier.com, 555-1234
3. 點擊 "Create" 按鈕
4. ✅ 新記錄應該出現

#### 測試編輯
1. 點擊測試記錄的 "Edit" 按鈕
2. 修改 Company Name
3. 點擊 "Save" 按鈕
4. ✅ 應該更新成功

#### 測試刪除
1. 點擊 "Delete" 按鈕
2. 確認刪除
3. ✅ 記錄消失

---

### 3. Categories (分類管理) - http://localhost:8080/categories

#### 測試新增
1. 在表單輸入: Category Name: Test Category
2. 點擊 "Add Category"
3. ✅ category_id 自動產生

#### 測試編輯
1. 點擊編輯按鈕
2. 修改名稱
3. 點擊勾勾儲存
4. ✅ 更新成功

#### 測試刪除
1. 點擊刪除按鈕
2. 確認
3. ✅ 刪除成功

---

### 4. Products (產品管理) - http://localhost:8080/products

#### 測試新增
1. 輸入:
   - Product ID: TEST_PROD_001
   - VMD SNCS: Test Product Name
   - Category: 選擇一個分類
   - Supplier: 選擇一個供應商
   - List Price: 100.00
   - Stock Qty: 50
2. 點擊 "Add Product"
3. ✅ 新產品出現，顯示分類名稱和供應商名稱

#### 測試編輯
1. 點擊編輯按鈕
2. 修改價格和庫存
3. 儲存
4. ✅ 更新成功

#### 測試刪除
1. 刪除測試產品
2. ✅ 刪除成功

---

### 5. Orders (訂單管理) - http://localhost:8080/orders

#### 測試新增
1. 輸入:
   - Order ID: TEST_ORD_001
   - User: 選擇使用者
   - Order Date: 選擇日期
   - Status: Pending
2. 點擊 "Add Order"
3. ✅ 新訂單出現，顯示使用者名稱

#### 測試編輯
1. 修改狀態為 "Completed"
2. 儲存
3. ✅ 狀態更新

#### 測試刪除
1. 刪除測試訂單
2. ✅ 刪除成功

---

### 6. Order Details (訂單明細) - http://localhost:8080/order_details

#### 測試新增
1. 選擇:
   - Order: 選擇一個訂單
   - Product: 選擇一個產品
   - Quantity: 5
   - Unit Price: 100.00
2. 點擊 "Add Detail"
3. ✅ 新明細出現

#### 測試編輯
1. 點擊編輯按鈕（注意：使用複合主鍵 order_id + product_id）
2. 修改數量和單價
3. 儲存
4. ✅ 更新成功

#### 測試刪除
1. 刪除測試明細
2. ✅ 刪除成功

---

## 驗證 Dashboard 更新

1. 在各模組進行新增/刪除操作
2. 回到 Dashboard: http://localhost:8080/dashboard
3. ✅ 統計數字應該即時反映變更

---

## 常見問題排查

### 問題：按鈕沒反應
**檢查**:
1. 瀏覽器控制台 (F12) 是否有錯誤
2. HTMX 是否正確載入
3. 路由是否正確註冊

### 問題：編輯後沒有更新
**檢查**:
1. 確認 form 的 hx-put 路徑正確
2. 確認 action="update" 參數存在
3. 檢查後端路由的 PUT 處理邏輯

### 問題：新增後沒有出現
**檢查**:
1. 確認 hx-target 和 hx-swap 設定正確
2. 檢查後端是否正確返回 row.hjs 渲染結果
3. 確認資料庫 INSERT 成功

### 問題：刪除確認沒出現
**檢查**:
1. 確認有 hx-confirm 屬性
2. HTMX 版本是否支援 confirm

---

## 測試完成檢查清單

- [ ] Users: 新增、編輯、刪除 ✅
- [ ] Suppliers: 新增、編輯、刪除 ✅
- [ ] Categories: 新增、編輯、刪除 ✅
- [ ] Products: 新增、編輯、刪除 ✅
- [ ] Orders: 新增、編輯、刪除 ✅
- [ ] Order Details: 新增、編輯、刪除 ✅
- [ ] Dashboard 統計數字即時更新 ✅
- [ ] 所有表單驗證正常 ✅
- [ ] 無 JavaScript 錯誤 ✅

---

## 進階測試

### 測試資料完整性
1. 嘗試刪除被引用的分類（應該有外鍵約束）
2. 嘗試刪除被引用的供應商
3. 嘗試新增重複的分類名稱（應該失敗，UNIQUE 約束）

### 測試 HTMX 行為
1. 編輯時點擊取消，確認不儲存
2. 快速連續點擊按鈕，確認不會重複提交
3. 刪除時取消確認，確認不執行刪除

### 測試會話管理
1. 登入後等待 30 分鐘
2. ✅ 應該自動登出，重定向到登入頁

---

**測試日期**: ___________
**測試人員**: ___________
**測試結果**: [ ] 全部通過 [ ] 部分失敗 [ ] 需要修正
