# 🎯 ProTasker: Advanced Productivity & Time Tracking Suite

A **premium full-stack productivity application** built with **NestJS**, **React**, and **TypeScript**.
---

## ✨ Key Features

* **🔐 Secure Authentication**

  * JWT-based auth with password hashing, protected routes, session persistence.

* **📝 Advanced Task Management**

  * CRUD tasks with **Priority Levels**: Low, Medium, High.
  * **Categorization**: Group tasks by project or type (Work, Personal).
  * **Smart Filtering & Sorting**: Filter by status/priority, sort by date or effort.
  * **Live Search**: Instant real-time task searching.

* **⏱️ Precision Time Tracking**

  * Start/Stop timers for one task at a time.
  * Automatic duration logging and historical tracking.

* **📊 Interactive Analytics Dashboard**

  * **Data Visualization**: Pie charts showing time distribution across categories.
  * **Progress Tracking**: Weekly/daily targets with dynamic progress bars.
  * **Productivity Stats**: Tasks completed and focused hours.

* **🌓 Theme Support**

  * Toggle **Light/Night Mode** with persistent preference.

* **📥 Data Portability**

  * Export task data & time logs as **CSV**.

* **🎨 Premium UI/UX**

  * **Glassmorphism Design**: Sleek modern dark theme.
  * **Micro-animations**: Smooth transitions and pulse effects.
  * **Responsive**: Optimized for desktop & mobile.

---

## 🛠️ Technologies Used

### Backend

* **NestJS v11.0.1** | **TypeScript v5.7.3**
* PostgreSQL with **TypeORM v0.3.28**
* Authentication: Passport.js + JWT
* Validation: class-validator & class-transformer

### Frontend

* **React v18.3.1** | **Vite v5.4.10**
* Routing: React Router DOM v7.13.0
* Visualization: Recharts v3.7.0
* Icons: Lucide React v0.563.0
* Styling: Vanilla CSS, Custom Design System

---

## 🚀 Setup Instructions

### 1️⃣ Prerequisites

* Node.js v18.x or v20.x
* PostgreSQL instance

### 2️⃣ Database Setup

```sql
CREATE DATABASE task_tracker;
```

> TypeORM will auto-create tables on dev start (`synchronize: true`).

### 3️⃣ Backend

```bash
cd backend
npm install
```

* Create `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_DATABASE=task_tracker
JWT_SECRET=your_secure_secret
JWT_EXPIRES_IN=1d
```

```bash
npm run start:dev
```

### 4️⃣ Frontend

```bash
cd frontend
npm install
```

* Create `.env`:

```env
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

---

## 🔌 API Documentation

### Authentication (`/auth`)

| Endpoint         | Method | Body                | Description         |
| ---------------- | ------ | ------------------- | ------------------- |
| `/auth/register` | POST   | `{email, password}` | Register user       |
| `/auth/login`    | POST   | `{email, password}` | Login + receive JWT |

### Tasks (`/tasks`)

| Endpoint                 | Method | Body                                       | Description        |
| ------------------------ | ------ | ------------------------------------------ | ------------------ |
| `/tasks`                 | GET    | -                                          | Get all user tasks |
| `/tasks`                 | POST   | `{title, description, category, priority}` | Create new task    |
| `/tasks/:id`             | PATCH  | `{status, priority, category}`             | Update task        |
| `/tasks/:id`             | DELETE | -                                          | Remove task        |
| `/tasks/:id/start-timer` | POST   | -                                          | Start task timer   |
| `/tasks/:id/stop-timer`  | POST   | -                                          | Stop task timer    |

### Dashboard (`/dashboard`)

| Endpoint           | Method | Description                                  |
| ------------------ | ------ | -------------------------------------------- |
| `/dashboard/stats` | GET    | Fetch productivity stats & time distribution |

---

## 🏗️ Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── auth/           # JWT & Passport
│   │   ├── users/          # User management
│   │   ├── tasks/          # Task CRUD
│   │   ├── time-entries/   # Time tracking
│   │   └── dashboard/      # Analytics
├── frontend/
│   ├── src/
│   │   ├── context/        # Global state
│   │   ├── components/     # UI elements
│   │   ├── pages/          # Views
│   │   └── index.css       # Design system
```

---

> Developed for the **Full-Stack Development Assignment**

---


