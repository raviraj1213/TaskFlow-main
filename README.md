# TaskFlow - Task Management System

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

A production-ready full-stack task management application with authentication, role-based access control, task CRUD operations, document management, and admin dashboard.

---

## 🌐 Live Link
- **Frontend App:** [https://task-flow-six-orcin.vercel.app/login](https://task-flow-six-orcin.vercel.app/login)
- **Backend API:** [https://taskflow-backend-6pnv.onrender.com/health](https://taskflow-backend-6pnv.onrender.com/health)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [License](#license)

---

## ✨ Features

### Authentication & Authorization
- JWT-based authentication with secure password hashing (bcrypt)
- Role-based access control (User/Admin)
- Protected routes and API endpoints

### Task Management
- Full CRUD operations for tasks
- Task attributes: title, description, status, priority, due date, assignee
- Filtering by status and priority
- Sorting by created date, due date, priority
- Pagination with configurable page size

### Document Handling
- Upload up to 3 PDF documents per task
- Maximum file size: 10MB per file
- Document metadata stored in database
- Download and delete functionality

### Admin Dashboard
- User management (view, edit, delete)
- View all tasks across the platform
- Assign tasks to any user

### Frontend Features
- Responsive design (Mobile, Tablet, Desktop)
- Toast notifications for actions
- Form validation
- Loading states
- Error handling

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | 4.x | Web Framework |
| MongoDB | 7 | Database |
| Mongoose | 8.x | ODM |
| JWT | 9.x | Authentication |
| bcryptjs | 2.x | Password Hashing |
| Multer | 1.x | File Upload |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Framework |
| Redux Toolkit | 2.x | State Management |
| Material UI | 5.x | UI Components |
| React Router | 6.x | Routing |
| React Hook Form | 7.x | Form Handling |
| Vite | 5.x | Build Tool |

---

## 📂 Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js    # Auth endpoints
│   │   │   ├── taskController.js   # Task CRUD
│   │   │   ├── userController.js   # User management
│   │   │   └── documentController.js # Document handling
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT authentication
│   │   │   ├── validate.js         # Input validation
│   │   │   ├── errorHandler.js     # Error handling
│   │   │   └── upload.js           # File upload config
│   │   ├── models/
│   │   │   ├── User.js             # User schema
│   │   │   ├── Task.js             # Task schema
│   │   │   └── Document.js        # Document schema
│   │   ├── routes/
│   │   │   ├── auth.js             # Auth routes
│   │   │   ├── tasks.js            # Task routes
│   │   │   └── users.js            # User routes
│   │   ├── utils/
│   │   │   └── helpers.js          # Utility functions
│   │   └── app.js                  # Express app entry
│   ├── tests/
│   │   ├── auth.test.js            # Auth tests
│   │   └── tasks.test.js           # Task tests
│   ├── uploads/                    # Uploaded files
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js              # Axios configuration
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Toast.jsx       # Toast notifications
│   │   │   │   └── Loading.jsx     # Loading spinner
│   │   │   └── layout/
│   │   │       └── Layout.jsx      # Main layout
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx        # Login page
│   │   │   │   ├── Register.jsx    # User registration
│   │   │   │   └── AdminRegister.jsx # Admin registration
│   │   │   ├── tasks/
│   │   │   │   ├── TaskList.jsx    # Task list page
│   │   │   │   └── TaskDetail.jsx # Task detail/edit
│   │   │   ├── admin/
│   │   │   │   └── UserManagement.jsx # Admin user management
│   │   │   └── Dashboard.jsx       # Dashboard
│   │   ├── store/
│   │   │   ├── store.js            # Redux store
│   │   │   └── slices/
│   │   │       ├── authSlice.js    # Auth state
│   │   │       ├── taskSlice.js    # Task state
│   │   │       ├── userSlice.js    # User state
│   │   │       └── toastSlice.js   # Toast state
│   │   ├── hooks/
│   │   │   └── useAuth.js           # Custom hooks
│   │   ├── utils/
│   │   │   └── helpers.js           # Frontend utilities
│   │   ├── theme/
│   │   │   └── theme.js             # Material UI theme
│   │   ├── App.jsx                  # Root component
│   │   └── main.jsx                 # Entry point
│   ├── tests/
│   │   ├── authSlice.test.js       # Auth slice tests
│   │   ├── taskSlice.test.js        # Task slice tests
│   │   └── userSlice.test.js        # User slice tests
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── Dockerfile
│
├── docker-compose.yml               # Docker orchestration
├── Dockerfile.backend               # Backend Docker image
├── Dockerfile.frontend              # Frontend Docker image
├── README.md                        # This file
├── SPEC.md                          # Technical specification
├── jest.config.json                 # Jest configuration
└── .gitignore                       # Git ignore
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- MongoDB 7 (local or Atlas)
- Docker (optional)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd taskflow
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm start
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

### Using Docker

```bash
docker-compose up --build
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/register-admin` | Register admin (requires secret) | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/me` | Get current user | Protected |

### Task Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/tasks` | List tasks (paginated, filterable) | Protected |
| GET | `/api/tasks/:id` | Get task details | Protected |
| POST | `/api/tasks` | Create new task | Protected |
| PUT | `/api/tasks/:id` | Update task | Protected |
| DELETE | `/api/tasks/:id` | Delete task | Protected |
| GET | `/api/tasks/:id/documents` | List task documents | Protected |
| POST | `/api/tasks/:id/documents` | Upload documents | Protected |
| GET | `/api/tasks/documents/:id/download` | Download document | Protected |
| DELETE | `/api/tasks/documents/:id` | Delete document | Protected |

### User Endpoints (Admin Only)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | List users (paginated) | Admin |
| GET | `/api/users/list` | Get all users for dropdown | Protected |
| GET | `/api/users/:id` | Get user details | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |

### Query Parameters

**Pagination:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Filtering:**
- `status` - Task status (todo, in_progress, review, done)
- `priority` - Task priority (low, medium, high, urgent)
- `assignedTo` - Filter by assignee
- `search` - Search users by name/email

**Sorting:**
- `sortBy` - Field to sort by (createdAt, updatedAt, dueDate, priority, status)
- `sortOrder` - Sort direction (ASC, DESC)

---

## 🗄 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  role: String (enum: 'user', 'admin', default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  status: String (enum: 'todo', 'in_progress', 'review', 'done'),
  priority: String (enum: 'low', 'medium', 'high', 'urgent'),
  dueDate: Date,
  assignedTo: ObjectId (ref: User),
  createdBy: ObjectId (ref: User, required),
  createdAt: Date,
  updatedAt: Date
}
```

### Document Collection
```javascript
{
  _id: ObjectId,
  task: ObjectId (ref: Task, required),
  fileName: String (required),
  filePath: String (required),
  fileSize: Number (required),
  mimeType: String,
  createdAt: Date
}
```

---

## 🔐 Authentication & Authorization

### JWT Token Structure
```javascript
{
  userId: "user_id",
  iat: timestamp,
  exp: timestamp (+24h)
}
```

### Role-Based Access Control

**Standard User:**
- Create, read, update, delete own tasks
- View tasks assigned to them
- Upload documents to own tasks

**Admin:**
- All standard user permissions
- Manage all users
- View all tasks
- Assign tasks to any user

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Test Coverage
- Authentication (register, login, JWT)
- Task CRUD operations
- User management
- Redux slices

---

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
```

### Frontend
```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Deployment Guide

### Backend Deployment (Render)

Render provides a seamless way to deploy Node.js applications with free and paid tiers.

1. **Prepare the Repository:** Ensure your `backend/package.json` has `"start": "node src/app.js"` under the scripts section.
2. **MongoDB Setup (Atlas):** 
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Whitelist all IP addresses (`0.0.0.0/0`) in Network Access so Render can connect.
   - Copy your connection string (MongoDB URI).
3. **Deploy on Render:**
   - Log into [Render](https://render.com/) and click **New > Web Service**.
   - Connect your GitHub repository.
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. **Environment Variables:**
   - Under the "Environment" section, add the following variables:
     - `NODE_ENV`: `production`
     - `PORT`: `5000`
     - `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster0...` (Your Atlas URI)
     - `JWT_SECRET`: `your_secure_production_secret`
     - `JWT_EXPIRES_IN`: `24h`
5. **Finalize:** Click **Create Web Service**. Render will build and deploy your API. Copy the backend URL once deployed (e.g., `https://taskflow-api-xyz.onrender.com`).

### Frontend Deployment (Vercel)

Vercel is optimal for Vite & React applications and provides lightning-fast CDN delivery.

1. **Configure API URL:** Ensure your frontend makes API calls via `import.meta.env.VITE_API_URL`.
2. **Deploy on Vercel:**
   - Log into [Vercel](https://vercel.com/) and click **Add New > Project**.
   - Import your GitHub repository.
3. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables:**
   - Open the "Environment Variables" section before deploying.
   - Add `VITE_API_URL` and set the value to your deployed Render Backend URL (e.g., `https://taskflow-api-xyz.onrender.com`). Do not include a trailing slash.
5. **Finalize:** Click **Deploy**. Vercel will build and host your frontend application.

---

## 📝 Design Decisions

1. **MongoDB over PostgreSQL**: Flexible schema for evolving requirements
2. **Redux Toolkit**: Simplified state management with slices
3. **Material UI**: Consistent, accessible components
4. **JWT Authentication**: Stateless, scalable authentication
5. **Local File Storage**: Simple, cost-effective (swappable to S3)
6. **Multer**: Reliable file upload handling

---

## 📄 License

MIT License - see LICENSE file for details

---

## 👨‍💻 Author

Created for TaskFlow - Task Management System

## 🙏 Acknowledgments

- MongoDB Community
- React Community
- Material UI Team