# StaffSync: HR Management System

A full-stack HR management web app with role-based access for **HR**, **Managers** and **Employees**. It brings employee records, leave, attendance, announcements and training into one workspace.

**Live demo:** https://staff-sync-hrms.vercel.app

## Features
- Login and registration with JWT authentication and role-based access control
- Employee directory with create, read, update and delete (HR)
- Leave management: employees request leave, managers and HR approve or reject
- Attendance tracking with office or remote check-in
- Announcements and company news
- Training and development programs
- Overview dashboard with live workspace summary
- One-click demo login for each role

## Tech Stack
React · TypeScript · Node.js · Express · Mongoose · JWT

## Getting Started
```bash
npm install
npm run dev
```
Create a `.env` file based on `.env.example` and set a long random `JWT_SECRET`.

## Demo Accounts
Use the one-click buttons on the login page:

| Role | Email |
|---|---|
| HR Admin | hr@staffsync.io |
| Manager | manager@staffsync.io |
| Employee | alex@staffsync.io |

For demo use only.

## Project Structure
```
server.ts      Express server entry
server/        Config, models, controllers, services
src/           React frontend
```

## Notes
Built with Google AI Studio. Secrets such as `JWT_SECRET` are not
