# Dating-For-impatient 
# Dating App for Impatient People (MERN Stack)

This is a full-stack dating application I am building as part of my software developer internship at sbs corp using the **MERN stack**.  
The idea is simple: faster matching, at a single venue,less waiting,more privacy by not sharing any of the users personal details on the app.

This repo currently focuses heavily on **Admin authentication, admin dashboard, and system control features**, along with a working frontend for admins.

## Tech Stack Used

Frontend:
- React.js
- React Router
- Axios

Backend:
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs



## What I Built Today (Date: 26-01-2026)

### Backend Work (Node + Express + MongoDB)

Today I mainly worked on **admin architecture and security**, separating admins completely from normal users.

#### Admin Authentication
- Created **Admin Register API** protected using a secret key (`ADMIN_REGISTER_SECRET`)
- Created **Admin Login API** with JWT token generation
- Admins are stored using the same User model but differentiated using `role: "admin"`

#### Admin Authorization
- Implemented JWT based `auth` middleware
- Implemented `adminOnly` middleware to restrict admin routes
- Only admins can access:
  - Admin profile (`/adminme`)
  - Dashboard statistics
  - User management APIs (in progress)

#### Admin Dashboard APIs
Built APIs that return system-level stats for the dashboard:
- Total users
- Active users
- Suspended users
- Banned users
- Admin count
- Venue and report placeholders (to be expanded)

All dashboard APIs are **protected** using:
- JWT authentication
- Role-based authorization

#### Database Models
- User model supports both `user` and `admin`
- Admin does NOT require bio, hobbies, preferences, or photos
- Clean role separation using `role` field

---

### Frontend Work (React.js)

#### Admin Authentication UI
- Built **Admin Register page**
- Built **Admin Login page**
- Secure navigation using protected routes
- Token stored locally and attached to API requests automatically

#### Admin Dashboard UI
- Created a clean admin dashboard page
- Shows:
  - Logged-in admin name & email
  - System statistics cards
- Added logout functionality
- /*need to update by adding phone number of users in our dashboard*/
- Dashboard loads data from backend using parallel API calls

#### Admin Route Protection
- Created `AdminRoute` wrapper
- Prevents access if admin is not logged in
- Automatically redirects to admin login

#### Admin User Management (In Progress)
- Created `/admin/users` page
- Table structure ready for:
  - Name
  - Email
  - Status
  - Role
- Currently wiring backend APIs to populate data

---

## Current Working Features

- Admin register with secret key
- Admin login with JWT
- Secure admin dashboard
- Role-based backend authorization
- Protected admin routes on frontend
- Centralized Axios API handler with token injection

---

## Issues Solved Today

- Fixed route mismatches between frontend and backend
- Fixed JWT auth flow and role checking
- Solved React import/export errors
- Debugged 404 API issues
- Cleaned admin logic so admin is NOT treated like a normal user

---

## What I’m Working On Next

Backend:
- Admin: suspend / ban users
- Match model (user1 ↔ user2)
- Match statistics per user
- trying to reduce response time by using redis cache

Frontend:
- Admin users list page (click → user details)
- Show matched count per user
- Show matched people names
- Admin controls (suspend / ban buttons)
- Improve dashboard UI

---

## Project Status

🟢 Backend: Core admin system complete  
🟡 Frontend: Admin dashboard mostly complete  
🔵 User features & matching logic: in progress  

This project is actively being developed and expanded step-by-step.
