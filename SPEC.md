# Task Management System - Technical Specification

## 1. Project Overview

**Project Name:** TaskFlow - Task Management System
**Project Type:** Full-stack Web Application
**Core Functionality:** A comprehensive task management platform with user authentication, role-based access control, task CRUD operations, document attachments, and admin dashboard
**Target Users:** Teams and organizations requiring task tracking with document management capabilities

## 2. Technical Stack

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Database:** PostgreSQL with Sequelize ORM
- **Authentication:** JWT (jsonwebtoken)
- **File Storage:** Local filesystem with multer
- **Password Hashing:** bcryptjs
- **Validation:** express-validator
- **Testing:** Jest with supertest

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **State Management:** Redux Toolkit
- **UI Framework:** Material UI v5
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form
- **Testing:** Jest with React Testing Library

### DevOps
- **Containerization:** Docker & Docker Compose
- **Database:** PostgreSQL 15 (via Docker)

## 3. UI/UX Specification

### Color Palette
- **Primary:** #1976D2 (Blue)
- **Primary Dark:** #1565C0
- **Primary Light:** #42A5F5
- **Secondary:** #26A69A (Teal)
- **Background:** #F5F5F5
- **Surface:** #FFFFFF
- **Error:** #D32F2F
- **Success:** #388E3C
- **Warning:** #F57C00
- **Text Primary:** #212121
- **Text Secondary:** #757575
- **Divider:** #E0E0E0

### Typography
- **Font Family:** 'Roboto', 'Segoe UI', sans-serif
- **Headings:**
  - H1: 2rem, weight 700
  - H2: 1.5rem, weight 600
  - H3: 1.25rem, weight 600
- **Body:** 1rem, weight 400
- **Caption:** 0.875rem, weight 400

### Layout Structure

#### Authentication Pages (Login/Register)
- Centered card layout
- Logo at top
- Form fields below
- Switch between login/register

#### Main Application Layout
- **Header:** Fixed top, 64px height, contains logo, user menu, logout
- **Sidebar:** 240px width, collapsible, navigation links
- **Content Area:** Flexible width, scrollable

### Responsive Breakpoints
- **Mobile:** < 600px (sidebar hidden, hamburger menu)
- **Tablet:** 600px - 960px (collapsed sidebar)
- **Desktop:** > 960px (full sidebar)

### Components

#### Task Card
- White background with subtle shadow
- Title, description preview, status badge, priority indicator
- Due date with color coding (overdue: red, soon: orange, normal: default)
- Assigned user avatar
- Document count indicator

#### Task Form Modal
- Title input (required)
- Description textarea
- Status dropdown (Todo, In Progress, Review, Done)
- Priority select (Low, Medium, High, Urgent)
- Due date picker
- Assignee dropdown
- Document upload area (drag & drop, max 3 PDFs)

#### Data Table (Admin/User List)
- Sortable columns
- Pagination controls
- Row actions (edit, delete)
- Search/filter inputs

#### Status Badges
- Todo: #757575 (gray)
- In Progress: #1976D2 (blue)
- Review: #F57C00 (orange)
- Done: #388E3C (green)

#### Priority Indicators
- Low: #757575 (gray dot)
- Medium: #1976D2 (blue dot)
- High: #F57C00 (orange dot)
- Urgent: #D32F2F (red dot)

### Animations
- Page transitions: 200ms fade
- Modal: 250ms slide up + fade
- Button hover: 150ms background color transition
- Card hover: 3px elevation increase
- Loading spinner: rotating circle

## 4. Data Models

### User
```
id: UUID (primary key)
email: VARCHAR(255) UNIQUE NOT NULL
password: VARCHAR(255) NOT NULL (hashed)
firstName: VARCHAR(100) NOT NULL
lastName: VARCHAR(100) NOT NULL
role: ENUM('user', 'admin') DEFAULT 'user'
createdAt: TIMESTAMP
updatedAt: TIMESTAMP
```

### Task
```
id: UUID (primary key)
title: VARCHAR(255) NOT NULL
description: TEXT
status: ENUM('todo', 'in_progress', 'review', 'done') DEFAULT 'todo'
priority: ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium'
dueDate: DATE
assignedToId: UUID (foreign key -> User)
createdById: UUID (foreign key -> User)
createdAt: TIMESTAMP
updatedAt: TIMESTAMP
```

### Document
```
id: UUID (primary key)
taskId: UUID (foreign key -> Task)
fileName: VARCHAR(255) NOT NULL
filePath: VARCHAR(500) NOT NULL
fileSize: INTEGER (bytes)
mimeType: VARCHAR(100)
createdAt: TIMESTAMP
```

## 5. API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - List all users (paginated, filterable)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Tasks
- `GET /api/tasks` - List tasks (paginated, filterable, sortable)
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Documents
- `POST /api/tasks/:id/documents` - Upload document(s)
- `GET /api/tasks/:id/documents` - List task documents
- `GET /api/documents/:id/download` - Download document
- `DELETE /api/documents/:id` - Delete document

## 6. Functionality Specification

### Authentication Flow
1. User registers with email, password, first name, last name
2. Password hashed with bcrypt (10 rounds)
3. JWT generated on login (24h expiry)
4. Token stored in localStorage
5. Token sent in Authorization header for protected routes

### Role-Based Access Control
- **Standard User:**
  - Create, read, update, delete own tasks
  - View assigned tasks
  - Upload documents to own tasks
  - Cannot access admin routes

- **Admin:**
  - All user permissions
  - Manage all users (CRUD)
  - View all tasks
  - Assign tasks to any user

### Task Management Features
- Create task with title, description, status, priority, due date, assignee
- Edit task properties
- Change task status via drag-drop or dropdown
- Delete task (soft delete optional)
- Filter by: status, priority, assignee, date range
- Sort by: created date, due date, priority, status
- Pagination: 10, 25, 50 items per page

### Document Handling
- Max 3 PDF files per task
- Max file size: 10MB per file
- Validate file type (application/pdf)
- Store in /uploads directory
- Store metadata in database
- Display file name, size, upload date
- Download button per document
- Delete document option

### Frontend Features
- Protected routes based on auth status
- Role-based route guards
- Form validation with error messages
- Loading states for all async operations
- Error toasts/snackbar notifications
- Confirmation dialogs for destructive actions
- Responsive design for all screen sizes

## 7. Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, env config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helpers
│   │   └── app.js          # Express app entry
│   ├── tests/              # Backend tests
│   ├── uploads/            # Uploaded files
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── components/     # Reusable components
│   │   ├── features/       # Feature modules
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store
│   │   ├── theme/          # Material UI theme
│   │   ├── utils/          # Helpers
│   │   ├── App.jsx         # Root component
│   │   └── main.jsx        # Entry point
│   ├── tests/              # Frontend tests
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── README.md
```

## 8. Acceptance Criteria

### Authentication
- [ ] User can register with valid email and password
- [ ] User can login with correct credentials
- [ ] Invalid credentials show appropriate error
- [ ] JWT token persists across page refresh
- [ ] Logout clears token and redirects to login

### Task Management
- [ ] User can create task with all fields
- [ ] User can view task list with pagination
- [ ] User can filter by status, priority
- [ ] User can sort by date, priority
- [ ] User can edit own tasks
- [ ] User can delete own tasks
- [ ] User cannot see/manage other users' tasks

### Document Handling
- [ ] User can upload up to 3 PDFs to a task
- [ ] Upload rejects non-PDF files
- [ ] Upload rejects files > 10MB
- [ ] Documents display in task details
- [ ] User can download documents
- [ ] User can delete documents

### Admin Features
- [ ] Admin can view all users
- [ ] Admin can edit any user
- [ ] Admin can delete any user
- [ ] Admin can view all tasks
- [ ] Admin can assign tasks to any user

### UI/UX
- [ ] Responsive on mobile, tablet, desktop
- [ ] Loading states shown during API calls
- [ ] Error messages displayed for failures
- [ ] Forms validate before submission
- [ ] Navigation works correctly

### Technical
- [ ] Application runs with docker-compose up
- [ ] Database persists data
- [ ] API documentation available
- [ ] Tests pass with 80%+ coverage