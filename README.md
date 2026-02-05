# BizTools – Business Calculator App

**Calculate smarter. Earn better.**

React (Vite) frontend + PHP API + MySQL. Nigeria-focused, no auth, 7-day session.

---

## When to Create the Database (XAMPP)

Do this **once**, before using the app. You need a MySQL user and the `biztools_db` database before the API can save users or history.

### 1. Start XAMPP

- Open **XAMPP Control Panel**
- Start **Apache** and **MySQL**

### 2. Create database and user (phpMyAdmin or MySQL)

1. Open **http://localhost/phpmyadmin**
2. Click **User accounts** → **Add user account**
   - **User name:** `biztools_user` (or your choice)
   - **Host name:** `localhost`
   - **Password:** set a strong password
   - **Database for user account:** select **Create database with same name and grant all privileges**  
     OR create a database named `biztools_db` and grant this user **All privileges** on `biztools_db`
3. Click **Go**

### 3. Create the database (if you didn’t in step 2)

- In phpMyAdmin, click **New** (left sidebar)
- Database name: `biztools_db`
- Collation: `utf8mb4_unicode_ci`
- Create

### 4. Run the schema

- In phpMyAdmin, select database **biztools_db**
- Click **Import**
- Choose file: `database/schema.sql` (from this project)
- Click **Go**

You should see tables: `users`, `calculation_history`.

### 5. Configure the API

- In the project, go to folder **api**
- Copy **.env.example** to **.env**
- Edit **.env** and set your DB credentials:

```env
DB_HOST=localhost
DB_NAME=biztools_db
DB_USER=biztools_user
DB_PASS=your_password
```

---

## How to Run

### Backend (PHP) with XAMPP

**Option A – Put API in htdocs**

1. Copy the **api** folder to `C:\xampp\htdocs\biztools-api`
2. Ensure **.env** is there with correct DB settings
3. API base URL: **http://localhost/biztools-api**

**Option B – PHP built-in server (no XAMPP Apache needed)**

From project root:

```bash
cd api
php -S localhost:8000
```

API base URL: **http://localhost:8000**

(MySQL must still be running in XAMPP.)

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown (e.g. **http://localhost:5173**).

Set the API base URL in the app (e.g. in `.env` or config):

- If API is in htdocs: `VITE_API_BASE=http://localhost/biztools-api`
- If API is on port 8000: `VITE_API_BASE=http://localhost:8000`

---

## Project structure

```
BizTools/
├── README.md                 (this file)
├── database/
│   └── schema.sql            (run once in phpMyAdmin)
├── api/                       (PHP backend)
│   ├── .env.example
│   ├── .env                   (you create from .env.example)
│   ├── config/
│   │   └── database.php
│   └── (API endpoints)
└── frontend/                  (React + Vite)
    └── (React app)
```

---

## Features

1. **Budget → Bid** – Total (with VAT/fees) → estimated bid
2. **Bid → Total** – Bid amount → total payable
3. **Selling Price & Profit** – Cost + expenses + margin → selling price
4. **History** – Save, view (full inputs + results), delete, clear

User identification: full name + Nigeria phone (11 digits). No password. Session 7 days.
