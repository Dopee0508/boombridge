# BOOMBRIDGE 系統安裝與使用說明

## 📋 目錄
1. [系統需求](#系統需求)
2. [專案下載](#專案下載)
3. [Docker 容器建置](#docker-容器建置)
4. [資料庫初始化](#資料庫初始化)
5. [啟動應用程式](#啟動應用程式)
6. [系統登入](#系統登入)
7. [常見問題](#常見問題)

---

## 🔧 系統需求

### 必要軟體
- **Docker Desktop** 20.10 或更新版本
- **Docker Compose** 1.29 或更新版本
- **Git** (用於下載專案)
- **Web 瀏覽器** (Chrome, Firefox, Edge 等)

### 系統需求
- **作業系統**: Windows 10/11, macOS, Linux
- **記憶體**: 至少 4GB RAM
- **硬碟空間**: 至少 2GB 可用空間

---

## 📥 專案下載

### 從 GitHub 克隆專案

```bash
# 克隆專案到本地
git clone https://github.com/your-username/BOOMBRIDGE_PROJECT.git

# 進入專案目錄
cd BOOMBRIDGE_PROJECT/hw5
```

---

## 🐳 Docker 容器建置

### 1. 建立 MySQL 資料庫容器

```bash
# 建立 MySQL 容器（名稱: boombridge）
docker run -d \
  --name boombridge \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=boombridge \
  -p 3306:3306 \
  mysql:9.4.0

# 等待 MySQL 完全啟動（約 30 秒）
docker logs -f boombridge
# 看到 "ready for connections" 表示啟動完成，按 Ctrl+C 退出
```

**Windows PowerShell 版本：**
```powershell
docker run -d `
  --name boombridge `
  -e MYSQL_ROOT_PASSWORD=password `
  -e MYSQL_DATABASE=boombridge `
  -p 3306:3306 `
  mysql:9.4.0
```

### 2. 建立 Node.js 應用程式容器

```bash
# 建立 Node.js 容器（名稱: BOOMBRIDGE_WEB）
docker run -d \
  --name BOOMBRIDGE_WEB \
  --link boombridge:mysql \
  -p 8080:8080 \
  -v $(pwd):/app/hw5 \
  -w /app/hw5 \
  node:20-alpine \
  sh -c "npm install && tail -f /dev/null"
```

**Windows PowerShell 版本：**
```powershell
docker run -d `
  --name BOOMBRIDGE_WEB `
  --link boombridge:mysql `
  -p 8080:8080 `
  -v ${PWD}:/app/hw5 `
  -w /app/hw5 `
  node:20-alpine `
  sh -c "npm install && tail -f /dev/null"
```

### 3. 驗證容器狀態

```bash
# 檢查容器是否正常運行
docker ps

# 應該看到兩個容器：
# - boombridge (MySQL)
# - BOOMBRIDGE_WEB (Node.js)
```

---

## 🗄️ 資料庫初始化

### 1. 執行資料庫建置腳本

```bash
# 進入 MySQL 容器
docker exec -it boombridge mysql -u root -p

# 輸入密碼: password
```

### 2. 在 MySQL 命令列執行

```sql
-- 使用 boombridge 資料庫
USE boombridge;

-- 建立主要資料表（從容器外執行 SQL 檔案）
```

**退出 MySQL**：輸入 `exit`

### 3. 從外部執行 SQL 檔案

```bash
# 方法一：逐一執行 SQL 檔案
docker exec -i boombridge mysql -u root -ppassword boombridge < sql/setup_database.sql
docker exec -i boombridge mysql -u root -ppassword boombridge < sql/create_cart.sql

# 方法二：如果有完整的初始化腳本
docker exec -i boombridge mysql -u root -ppassword boombridge < sql/setup_database.sql
```

**Windows PowerShell 版本：**
```powershell
Get-Content sql/setup_database.sql | docker exec -i boombridge mysql -u root -ppassword boombridge
Get-Content sql/create_cart.sql | docker exec -i boombridge mysql -u root -ppassword boombridge
```

### 4. 驗證資料表建立

```bash
# 進入 MySQL 檢查
docker exec -it boombridge mysql -u root -ppassword boombridge -e "SHOW TABLES;"

# 應該看到以下資料表：
# - USER
# - PRODUCT
# - SUPPLIER
# - CATEGORY
# - CART
# - ORDER
# - ORDER_DETAIL
```

---

## 🚀 啟動應用程式

### 方法一：使用 Node.js 直接啟動

```bash
# 在 BOOMBRIDGE_WEB 容器中啟動應用程式
docker exec BOOMBRIDGE_WEB sh -c "cd /app/hw5 && node app.js"
```

### 方法二：使用 Nodemon 自動重新載入（開發模式）

```bash
# 安裝 nodemon（如果尚未安裝）
docker exec BOOMBRIDGE_WEB sh -c "cd /app/hw5 && npm install -g nodemon"

# 使用 nodemon 啟動（檔案變更會自動重啟）
docker exec BOOMBRIDGE_WEB sh -c "cd /app/hw5 && nodemon -L app.js"
```

### 3. 驗證應用程式啟動

開啟瀏覽器，訪問：
```
http://localhost:8080
```

如果看到登入頁面，表示啟動成功！

---

## 🔐 系統登入

### 預設測試帳號

```
Email: import@boombridge.com
密碼: password
```

### 登入後可用功能

1. **儀表板** - 系統總覽
2. **個人資料** - 查看用戶資訊、購物車和訂單統計
3. **購物車** - 新增/修改/刪除商品、結帳
4. **訂單管理** - 查看訂單歷史
5. **產品管理** - CRUD 操作
6. **供應商管理** - CRUD 操作
7. **分類管理** - CRUD 操作
8. **用戶管理** - CRUD 操作

---

## ❓ 常見問題

### Q1: 容器啟動失敗怎麼辦？

```bash
# 停止並移除舊容器
docker stop BOOMBRIDGE_WEB boombridge
docker rm BOOMBRIDGE_WEB boombridge

# 重新建立容器（參考上面的建置步驟）
```

### Q2: MySQL 連線失敗

**檢查事項：**
1. MySQL 容器是否正常運行
   ```bash
   docker logs boombridge
   ```

2. 檢查 `config.js` 中的資料庫設定
   ```javascript
   db: {
     host: 'boombridge',  // Docker 容器名稱
     user: 'root',
     password: 'password',
     database: 'boombridge'
   }
   ```

3. 確保兩個容器在同一網路
   ```bash
   docker network inspect bridge
   ```

### Q3: Port 8080 已被佔用

```bash
# 方法一：停止佔用 Port 的程式
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9

# 方法二：改用其他 Port（例如 3000）
docker run -d \
  --name BOOMBRIDGE_WEB \
  --link boombridge:mysql \
  -p 3000:8080 \  # 改為 3000
  ...
```

### Q4: 找不到 node_modules

```bash
# 在容器中重新安裝 npm 套件
docker exec BOOMBRIDGE_WEB sh -c "cd /app/hw5 && npm install"
```

### Q5: 如何停止應用程式

```bash
# 停止 Node.js 程序（如果在前景執行，按 Ctrl+C）

# 或停止整個容器
docker stop BOOMBRIDGE_WEB

# 重新啟動容器
docker start BOOMBRIDGE_WEB
```

### Q6: 如何清除所有資料重新開始

```bash
# 停止並移除所有容器
docker stop BOOMBRIDGE_WEB boombridge
docker rm BOOMBRIDGE_WEB boombridge

# 移除 MySQL 資料（如果需要完全重置）
docker volume prune

# 重新執行建置步驟
```

### Q7: 無法看到檔案變更

```bash
# 使用 nodemon 的 legacy watch 模式（適用於 Docker volume）
docker exec BOOMBRIDGE_WEB sh -c "cd /app/hw5 && nodemon -L app.js"
# -L 參數啟用 legacy watch，解決 Docker volume 變更偵測問題
```

---

## 🛠️ 開發工具建議

### 推薦的開發環境
- **IDE**: Visual Studio Code
- **VS Code 擴充套件**:
  - Docker
  - MySQL
  - JavaScript (ES6) code snippets
  - Prettier - Code formatter

### 除錯模式

```bash
# 使用 Node.js 除錯模式啟動
docker exec BOOMBRIDGE_WEB sh -c "cd /app/hw5 && node --inspect=0.0.0.0:9229 app.js"

# 在 Chrome 開啟 chrome://inspect 進行除錯
```

---

## 📝 專案檔案結構

```
hw5/
├── app.js              # 主程式進入點
├── config.js           # 資料庫和 Session 配置
├── package.json        # Node.js 依賴套件
├── routes/             # 路由模組
│   ├── cart.js         # 購物車功能
│   ├── profile.js      # 個人資料
│   ├── orders.js       # 訂單管理
│   └── ...
├── views/              # Hogan.js 模板
├── public/             # 靜態資源（CSS, JS, Bootstrap）
└── sql/                # 資料庫初始化腳本
    ├── setup_database.sql
    └── create_cart.sql
```

---

## 📞 技術支援

如遇到問題，請檢查：
1. Docker 容器狀態：`docker ps -a`
2. 容器日誌：`docker logs BOOMBRIDGE_WEB`
3. MySQL 日誌：`docker logs boombridge`
4. Node.js 錯誤訊息

---

## 📄 授權

本專案僅供學術研究使用。

---

**最後更新**: 2025-12-16
