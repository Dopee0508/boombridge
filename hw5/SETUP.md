# BOOMBRIDGE 系統安裝與使用說明

## 📋 目錄
1. [系統需求](#系統需求)
2. [快速開始](#快速開始)
3. [詳細安裝步驟](#詳細安裝步驟)
4. [系統登入](#系統登入)
5. [功能說明](#功能說明)
6. [常見問題](#常見問題)

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

## 🚀 快速開始

### 從 GitHub 下載並啟動專案

```bash
# 1. 克隆專案到本地
git clone https://github.com/your-username/BOOMBRIDGE_PROJECT.git

# 2. 進入專案目錄
cd BOOMBRIDGE_PROJECT/hw5

# 3. 使用 Docker Compose 啟動所有服務
docker-compose up -d

# 4. 等待服務啟動（約 30-60 秒）
docker-compose logs -f

# 看到以下訊息表示啟動完成：
# - db: "ready for connections"
# - web: "Web server listening on port 80!"
# - web: "Connected to database: BOOMBRIDGE"
```

**就這麼簡單！** 現在打開瀏覽器訪問：http://localhost:8080

預設管理員帳號：
- **Email**: import@boombridge.com
- **Password**: password

---

## 📝 詳細安裝步驟

### 1. 下載專案

```bash
# 克隆專案
git clone https://github.com/your-username/BOOMBRIDGE_PROJECT.git

# 進入 hw5 目錄
cd BOOMBRIDGE_PROJECT/hw5
```

### 2. 檢查必要檔案

確認以下檔案存在：
- `docker-compose.yml` - Docker 服務配置
- `sql/01_init_database.sql` - 資料庫初始化腳本
- `companies.tsv`, `materials.tsv`, `transactions.tsv` - 資料檔案
- `package.json` - Node.js 依賴配置

### 3. 啟動 Docker 服務

```bash
# 啟動所有服務（資料庫 + Web 應用）
docker-compose up -d

# 查看啟動日誌
docker-compose logs -f

# 等到看到以下訊息：
# - MySQL: "ready for connections"
# - Node.js: "Web server listening on port 80!"
# - Node.js: "Connected to database: BOOMBRIDGE"
```

### 4. 驗證服務狀態

```bash
# 檢查容器是否正常運行
docker ps

docker-compose ps
# 應該看到兩個容器都是 "Up" 狀態：
# - boombridge (MySQL)
# - BOOMBRIDGE_WEB (Node.js)

# 查看特定服務日誌
docker-compose logs db    # MySQL 日誌
docker-compose logs web   # Node.js 應用日誌
```

---

## 🔐 系統登入

### 訪問系統

開啟瀏覽器訪問：**http://localhost:8080**

### 預設管理員帳號

```
Email: import@boombridge.com
Password: password
Role: Admin（可管理所有功能）
```

### 註冊新帳號

1. 點擊登入頁面的「Register」按鈕
2. 填寫姓名、Email、密碼
3. 選擇角色：
   - **User**: 一般用戶（可瀏覽產品、購物車、個人訂單）
   - **Administrator**: 管理員（完整權限）
4. 點擊「Register」完成註冊

---

## 📚 功能說明

### 一般用戶功能（User Role）
- ✅ **Dashboard**: 查看系統概覽
- ✅ **Profile**: 查看個人資料和統計
- ✅ **Products**: 瀏覽產品目錄
- ✅ **BIM Objects**: 查看 BIM 物件
- ✅ **Shopping Cart**: 加入購物車、結帳
- ✅ **My Orders**: 查看個人訂單記錄

### 管理員功能（Admin Role）
- ✅ **所有一般用戶功能**
- ✅ **All Orders**: 管理所有訂單
- ✅ **User Management**: 管理用戶帳號
- ✅ **Suppliers**: 管理供應商資料
- ✅ **Categories**: 管理產品分類
- ✅ **Order Details**: 查看所有訂單明細
- ✅ **Product Management**: 新增、編輯、刪除產品

---

## 🛠️ 常用指令

### 啟動和停止服務

```bash
# 啟動所有服務
docker-compose up -d

# 停止所有服務
docker-compose down

# 重啟服務
docker-compose restart

# 重新構建並啟動
docker-compose up -d --build
```

### 查看日誌

```bash
# 查看所有服務日誌
docker-compose logs -f

# 查看特定服務
docker-compose logs -f web
docker-compose logs -f db
```

### 進入容器

```bash
# 進入 Web 容器
docker-compose exec web sh

# 進入資料庫容器
docker-compose exec db mysql -u root -ppassword BOOMBRIDGE
```

### 資料庫管理

```bash
# 備份資料庫
docker-compose exec db mysqldump -u root -ppassword BOOMBRIDGE > backup.sql

# 還原資料庫
docker-compose exec -T db mysql -u root -ppassword BOOMBRIDGE < backup.sql

# 重新初始化資料庫（警告：會刪除所有資料）
docker-compose down -v
docker-compose up -d
```

---

## ❓ 常見問題

### Q1: 容器啟動失敗

**問題**: `docker-compose up` 失敗

**解決方法**:
```bash
# 檢查 Docker Desktop 是否正在運行
# 清除舊容器和資料卷
docker-compose down -v

# 重新啟動
docker-compose up -d
```

### Q2: 無法連接資料庫

**問題**: Web 應用顯示 "Cannot connect to database"

**解決方法**:
```bash
# 檢查資料庫容器狀態
docker-compose logs db

# 確認資料庫已完全啟動（等待 30 秒）
# 重啟 Web 服務
docker-compose restart web
```

### Q3: 端口已被占用

**問題**: `Bind for 0.0.0.0:8080 failed: port is already allocated`

**解決方法**:
```bash
# Windows: 查看端口占用
netstat -ano | findstr :8080

# 修改 docker-compose.yml 中的端口映射
# 將 "8080:80" 改為 "8081:80"
```

### Q4: 資料庫初始化失敗

**問題**: SQL 導入錯誤或表格不存在

**解決方法**:
```bash
# 完全重置資料庫
docker-compose down -v

# 檢查 SQL 檔案路徑
ls -l sql/01_init_database.sql

# 確認 TSV 檔案存在
ls -l *.tsv

# 重新啟動
docker-compose up -d
```

### Q5: 修改代碼後沒有生效

**問題**: 代碼修改後應用沒有更新

**解決方法**:
```bash
# 重啟 Web 服務
docker-compose restart web

# 或者查看日誌確認 nodemon 是否自動重啟
docker-compose logs -f web
```

### Q6: 網頁顯示 404 或 500 錯誤

**問題**: 訪問某些頁面出現錯誤

**解決方法**:
```bash
# 查看應用日誌
docker-compose logs web

# 檢查路由配置
# 確認資料庫連接正常
docker-compose exec web sh -c "cd /app/hw5 && npm list"
```

---

## 🔄 更新專案

### 從 Git 更新最新代碼

```bash
# 拉取最新代碼
git pull origin main

# 重新安裝依賴
docker-compose exec web npm install

# 重啟服務
docker-compose restart web
```

---

## 📞 技術支援

如有問題，請檢查：
1. Docker Desktop 是否正常運行
2. 所有必要檔案是否存在
3. 端口 8080 和 3306 是否被占用
4. 查看容器日誌：`docker-compose logs`

更多資訊請參考：
- [Docker 官方文檔](https://docs.docker.com/)
- [Node.js 官方文檔](https://nodejs.org/)
- [MySQL 官方文檔](https://dev.mysql.com/doc/)

---

## 📄 授權

本專案僅供教學使用。

---
---

# English Version

## 🚀 Quick Start

### Download from GitHub and Launch

```bash
# 1. Clone the project
git clone https://github.com/your-username/BOOMBRIDGE_PROJECT.git

# 2. Enter project directory
cd BOOMBRIDGE_PROJECT/hw5

# 3. Start all services using Docker Compose
docker-compose up -d

# 4. Wait for services to start (about 30-60 seconds)
docker-compose logs -f

# Look for these messages indicating successful startup:
# - db: "ready for connections"
# - web: "Web server listening on port 80!"
# - web: "Connected to database: BOOMBRIDGE"
```

**That's it!** Open your browser and visit: http://localhost:8080

Default admin account:
- **Email**: import@boombridge.com
- **Password**: password

---

## 🔧 System Requirements

### Required Software
- **Docker Desktop** 20.10 or newer
- **Docker Compose** 1.29 or newer
- **Git** (for downloading the project)
- **Web Browser** (Chrome, Firefox, Edge, etc.)

### System Requirements
- **OS**: Windows 10/11, macOS, Linux
- **RAM**: At least 4GB
- **Storage**: At least 2GB available space

---

## 📝 Detailed Setup Steps

### 1. Download Project

```bash
# Clone the project
git clone https://github.com/your-username/BOOMBRIDGE_PROJECT.git

# Enter hw5 directory
cd BOOMBRIDGE_PROJECT/hw5
```

### 2. Check Required Files

Ensure the following files exist:
- `docker-compose.yml` - Docker service configuration
- `sql/01_init_database.sql` - Database initialization script
- `companies.tsv`, `materials.tsv`, `transactions.tsv` - Data files
- `package.json` - Node.js dependencies configuration

### 3. Start Docker Services

```bash
# Start all services (database + web application)
docker-compose up -d

# View startup logs
docker-compose logs -f

# Wait until you see these messages:
# - MySQL: "ready for connections"
# - Node.js: "Web server listening on port 80!"
# - Node.js: "Connected to database: BOOMBRIDGE"
```

### 4. Verify Service Status

```bash
# Check if containers are running
docker-compose ps
# Should see both containers in "Up" status:
# - boombridge (MySQL)
# - BOOMBRIDGE_WEB (Node.js)

# View specific service logs
docker-compose logs db    # MySQL logs
docker-compose logs web   # Node.js application logs
```

---

## 🔐 System Login

### Access System

Open browser and visit: **http://localhost:8080**

### Default Administrator Account

```
Email: import@boombridge.com
Password: password
Role: Admin (can manage all features)
```

### Register New Account

1. Click "Register" button on login page
2. Fill in name, email, password
3. Select role:
   - **User**: Regular user (browse products, shopping cart, personal orders)
   - **Administrator**: Admin (full privileges)
4. Click "Register" to complete

---

## 📚 Features

### Regular User Features (User Role)
- ✅ **Dashboard**: View system overview
- ✅ **Profile**: View personal information and statistics
- ✅ **Products**: Browse product catalog
- ✅ **BIM Objects**: View BIM objects
- ✅ **Shopping Cart**: Add to cart, checkout
- ✅ **My Orders**: View personal order history

### Administrator Features (Admin Role)
- ✅ **All regular user features**
- ✅ **All Orders**: Manage all orders
- ✅ **User Management**: Manage user accounts
- ✅ **Suppliers**: Manage supplier data
- ✅ **Categories**: Manage product categories
- ✅ **Order Details**: View all order details
- ✅ **Product Management**: Add, edit, delete products

---

## 🛠️ Common Commands

### Start and Stop Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# Rebuild and start
docker-compose up -d --build
```

### View Logs

```bash
# View all service logs
docker-compose logs -f

# View specific service
docker-compose logs -f web
docker-compose logs -f db
```

### Enter Containers

```bash
# Enter web container
docker-compose exec web sh

# Enter database container
docker-compose exec db mysql -u root -ppassword BOOMBRIDGE
```

### Database Management

```bash
# Backup database
docker-compose exec db mysqldump -u root -ppassword BOOMBRIDGE > backup.sql

# Restore database
docker-compose exec -T db mysql -u root -ppassword BOOMBRIDGE < backup.sql

# Reinitialize database (WARNING: will delete all data)
docker-compose down -v
docker-compose up -d
```

---

## ❓ FAQ

### Q1: Container Startup Failed

**Problem**: `docker-compose up` fails

**Solution**:
```bash
# Check if Docker Desktop is running
# Clear old containers and volumes
docker-compose down -v

# Restart
docker-compose up -d
```

### Q2: Cannot Connect to Database

**Problem**: Web application shows "Cannot connect to database"

**Solution**:
```bash
# Check database container status
docker-compose logs db

# Ensure database is fully started (wait 30 seconds)
# Restart web service
docker-compose restart web
```

### Q3: Port Already in Use

**Problem**: `Bind for 0.0.0.0:8080 failed: port is already allocated`

**Solution**:
```bash
# Windows: Check port usage
netstat -ano | findstr :8080

# Modify port mapping in docker-compose.yml
# Change "8080:80" to "8081:80"
```

### Q4: Database Initialization Failed

**Problem**: SQL import error or tables don't exist

**Solution**:
```bash
# Completely reset database
docker-compose down -v

# Check SQL file path
ls -l sql/01_init_database.sql

# Verify TSV files exist
ls -l *.tsv

# Restart
docker-compose up -d
```

### Q5: Code Changes Not Taking Effect

**Problem**: Application doesn't update after code changes

**Solution**:
```bash
# Restart web service
docker-compose restart web

# Or check logs to confirm nodemon auto-restart
docker-compose logs -f web
```

### Q6: Webpage Shows 404 or 500 Error

**Problem**: Error when accessing certain pages

**Solution**:
```bash
# View application logs
docker-compose logs web

# Check route configuration
# Verify database connection
docker-compose exec web sh -c "cd /app/hw5 && npm list"
```

---

## 🔄 Update Project

### Update Latest Code from Git

```bash
# Pull latest code
git pull origin main

# Reinstall dependencies
docker-compose exec web npm install

# Restart services
docker-compose restart web
```

---

## 📞 Technical Support

If you encounter issues, please check:
1. Docker Desktop is running properly
2. All required files exist
3. Ports 8080 and 3306 are not occupied
4. View container logs: `docker-compose logs`

For more information:
- [Docker Official Documentation](https://docs.docker.com/)
- [Node.js Official Documentation](https://nodejs.org/)
- [MySQL Official Documentation](https://dev.mysql.com/doc/)

---

## 📄 License

This project is for educational purposes only.
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
