# TaskFlow — React Frontend

Production-ready React frontend for Spring Boot task management backend.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Open http://localhost:5173

---

## Folder Structure

```
src/
├── pages/
│   ├── auth/
│   │   ├── Login.jsx          # /login
│   │   └── Register.jsx       # /register
│   ├── manager/
│   │   ├── Dashboard.jsx      # /dashboard  (ADMIN/MANAGER only)
│   │   ├── Tasks.jsx          # /tasks      (ADMIN/MANAGER only)
│   │   └── Employees.jsx      # /employees  (ADMIN/MANAGER only)
│   ├── employee/
│   │   ├── MyDashboard.jsx    # /my-dashboard (EMPLOYEE only)
│   │   └── MyTasks.jsx        # /my-tasks     (EMPLOYEE only)
│   ├── Profile.jsx            # /profile (all roles)
│   └── NotFound.jsx           # 404
├── components/
│   └── common/
│       ├── Navbar.jsx
│       ├── Layout.jsx
│       ├── StatCard.jsx
│       ├── Badges.jsx         # StatusBadge, PriorityBadge
│       ├── Spinner.jsx
│       ├── Modal.jsx
│       ├── EmptyState.jsx
│       └── PageHeader.jsx
├── services/
│   └── api.js                 # Axios instance + all API calls
├── context/
│   └── AuthContext.jsx        # JWT auth state
├── routes/
│   └── ProtectedRoute.jsx     # Role-based route guard
├── App.jsx                    # Routes
├── main.jsx
└── index.css                  # Tailwind + global styles
```

---

## API Mapping

| Frontend Action        | API Call                          |
|------------------------|-----------------------------------|
| Login                  | POST /auth/login                  |
| Register               | POST /auth/register               |
| Dashboard data         | GET  /dashboard/{employeeId}      |
| Create task            | POST /task/create                 |
| Assign task            | POST /task/assign                 |
| Update task status     | PUT  /task/update-status          |

---

## Auth

- JWT token stored in `localStorage` as `token`
- Sent as `Authorization: Bearer <token>` on every request
- On 401 → auto redirect to `/login`
- Role stored in `localStorage` as part of `user` object
- Roles: `ADMIN` / `MANAGER` → Manager views | `EMPLOYEE` → Employee views

---

## Backend Response Expectations

The frontend handles flexible response shapes. For login/register:
```json
{
  "token": "eyJ...",
  "id": 1,
  "name": "Jane Smith",
  "email": "jane@co.com",
  "role": "EMPLOYEE"
}
```

For dashboard (`GET /dashboard/{id}`):
```json
{
  "totalEmployees": 12,
  "totalTasks": 45,
  "productivity": 78,
  "riskTasks": 3,
  "employees": [...],
  "tasks": [...],
  "recentTasks": [...]
}
```

---

## Design

- Black & white minimal aesthetic matching provided design
- Font: DM Sans (body) + Playfair Display (headings)
- Fully responsive (mobile + desktop)
- Page transitions with CSS animations
- No scroll-based navigation — all page-based routing
