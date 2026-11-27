# PlacementNex – AI-Ready Placement Management System

### A Full-Stack Placement Management Platform for Students, Recruiters, and College Placement Cells

**PlacementNex** is a centralized placement management platform designed to streamline campus recruitment activities and simplify the interaction between students, recruiters, and placement officers.

The platform provides a unified environment where students can manage their professional profiles, explore placement opportunities, and track applications, while recruiters and placement officers can manage recruitment drives and monitor application progress.

**Live application:** https://placementnex.onrender.com  
**Login page:** https://placementnex.onrender.com/login  
**Backend health check:** https://placementnex-api.onrender.com/api/health  
**GitHub repository:** https://github.com/radhikatyagi388/FSD-Project-2026

---

## Author

**Radhika Tyagi**  
Project Author & Developer  
ABES Engineering College

---

## Project Overview

Campus placement processes often involve multiple disconnected tools for student records, recruitment announcements, application tracking, and placement coordination.

PlacementNex aims to bring these activities together through a role-based web application with a centralized backend and database. The system provides dedicated interfaces and functionalities for different user roles, making placement management more organized, accessible, and efficient.

## Key Features

### 1. Student Dashboard
- Personalized student dashboard.
- View available placement opportunities.
- Monitor application statistics.
- Track application progress.
- Access profile information.

### 2. Student Profile Management
- Create and update professional profiles.
- Maintain academic and personal details.
- Upload profile documents and resumes.
- Monitor profile completion.

### 3. Placement Opportunities
- Browse available placement opportunities.
- View job and recruitment drive details.
- Apply for relevant opportunities.
- Access application-related information.

### 4. Application Tracking
- View submitted applications.
- Track application statuses.
- Monitor recruitment progress.

### 5. Recruiter & Placement Officer Dashboard
- Create and manage placement opportunities.
- View recruitment drives.
- Access submitted applications.
- Update application statuses.
- Manage recruitment activities.

### 6. Admin Dashboard
- Centralized administrative dashboard.
- View placement statistics.
- Monitor registered users.
- Manage placement opportunities.
- Monitor applications.
- Manage user account status.

### 7. Role-Based Authentication
- Secure user registration and login.
- JWT-based authentication.
- Password hashing using bcrypt.
- Protected routes and role-based access control.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| Styling | Tailwind CSS, CSS |
| Routing | React Router DOM |
| UI Icons | Lucide React |
| Data Visualization | Recharts |
| HTTP Client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JWT, bcryptjs |
| File Uploads | Multer |
| Deployment | Render |

## System Architecture

PlacementNex follows a client-server architecture.

```text
                 USER
                   |
                   v
          React.js Frontend
                (Vite)
                   |
                   v
           Axios API Requests
                   |
                   v
          Node.js + Express
               Backend
                   |
          -------------------
          |        |        |
          v        v        v
        Auth   Business   Upload
        APIs     APIs      APIs
          |        |        |
          -------------------
                   |
                   v
             MongoDB Atlas
```

### Architecture Components

**Frontend**
- Provides role-specific user interfaces.
- Handles navigation and application state.
- Communicates with backend APIs using Axios.

**Backend**
- Handles authentication and authorization.
- Processes placement and application operations.
- Manages profile updates and document uploads.
- Provides REST API endpoints.

**Database**
- MongoDB Atlas stores user profiles, placement opportunities, and application records.
- Mongoose manages database schemas and interactions.

## Project Structure

```text
PlacementNex/
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── auth/
│       │   └── dashboard/
│       ├── context/
│       ├── pages/
│       │   ├── admin/
│       │   ├── applications/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── opportunities/
│       │   ├── profile/
│       │   └── staff/
│       ├── services/
│       ├── App.jsx
│       ├── App.css
│       └── main.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB Atlas account
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/radhikatyagi388/FSD-Project-2026.git
cd FSD-Project-2026
```

### 2. Backend Setup

Navigate to the backend:

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm start
```

The backend will run at `http://localhost:5001`.

### 3. Frontend Setup

Open another terminal from the project root:

```bash
cd client
npm install
```

Create a `.env` file inside the `client` directory:

```env
VITE_API_URL=http://localhost:5001
```

Start the frontend:

```bash
npm run dev
```

Vite will display the local frontend URL in the terminal.

### 4. Production Build

```bash
cd client
npm run build
```

## Backend API Modules

The backend exposes REST API modules for the following operations. All routes are prefixed with `/api`.

| Module | Base Route | Purpose |
|---|---|---|
| Authentication | `/api/auth` | Registration and login |
| Profile | `/api/profile` | Student profile management |
| Uploads | `/api/uploads` | Document uploads |
| Opportunities | `/api/opportunities` | Placement drive management |
| Applications | `/api/applications` | Application management |
| Administration | `/api/admin` | Administrative operations |
| Health Check | `/api/health` | Backend and database status |

### Main API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Get the authenticated user |
| GET / PUT | `/api/profile` | Retrieve or update profile |
| POST | `/api/uploads/:type` | Upload a supported document |
| GET | `/api/opportunities` | List placement opportunities |
| POST | `/api/opportunities` | Create an opportunity (authorized staff) |
| GET | `/api/opportunities/manage/mine` | List opportunities managed by current staff user |
| POST | `/api/applications/:opportunityId` | Apply for an opportunity |
| GET | `/api/applications/my` | List current student's applications |
| GET | `/api/applications` | List applications for authorized staff |
| PATCH | `/api/applications/:applicationId/status` | Update application status |
| GET | `/api/admin/stats` | Retrieve admin dashboard statistics |
| GET | `/api/admin/users` | List users (admin) |
| GET | `/api/admin/opportunities` | List opportunities (admin) |
| GET | `/api/admin/applications` | List applications (admin) |
| PATCH | `/api/admin/users/:id/status` | Update user status (admin) |
| GET | `/api/health` | Check backend and database health |

## Demo Login Credentials

Use dedicated test accounts for project evaluation. Replace the placeholders below with demo accounts you have created and verified.

| Role | Email / Username | Password |
|---|---|---|
| Student | `ADD_STUDENT_EMAIL` | `ADD_STUDENT_DEMO_PASSWORD` |
| Recruiter | `ADD_RECRUITER_EMAIL` | `ADD_RECRUITER_DEMO_PASSWORD` |
| Placement Officer | `ADD_OFFICER_EMAIL` | `ADD_OFFICER_DEMO_PASSWORD` |
| Admin | `ADD_ADMIN_EMAIL` | `ADD_ADMIN_DEMO_PASSWORD` |

> **Security:** Do not publish personal account credentials, production passwords, MongoDB connection strings, JWT secrets, or access tokens. For a public repository, use temporary demo accounts with limited permissions and rotate their passwords after evaluation.

## Environment Variables

Never commit actual credentials or secret keys to GitHub.

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used for JWT authentication |
| `FRONTEND_URL` | Authorized frontend origin |
| `VITE_API_URL` | Backend API base URL for frontend |

## Deployment

PlacementNex is deployed using Render for the frontend and backend, with MongoDB Atlas as the database.

### Live Deployment Links

| Component | Service | URL |
|---|---|---|
| React Frontend | Render Static Site | https://placementnex.onrender.com |
| Express Backend | Render Web Service | https://placementnex-api.onrender.com |
| Backend Health | API endpoint | https://placementnex-api.onrender.com/api/health |
| Database | MongoDB Atlas | Managed database |

### Frontend Deployment

- Root Directory: `client`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment Variable: `VITE_API_URL=https://placementnex-api.onrender.com`

Configure a rewrite rule for React Router:

| Source | Destination | Action |
|---|---|---|
| `/*` | `/index.html` | Rewrite |

### Backend Deployment

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`

Configure these environment variables in Render:

- `MONGODB_URI` — MongoDB Atlas connection string.
- `JWT_SECRET` — private JWT signing secret.
- `NODE_ENV` — `production`.
- `FRONTEND_URL` — `https://placementnex.onrender.com`.

Render supplies the production `PORT` automatically.

## Security Considerations

- Passwords are hashed before database storage.
- JWT tokens are used for authentication.
- Protected routes restrict unauthorized access.
- Role-based middleware controls access to privileged endpoints.
- Environment variables are used for sensitive configuration.
- Secret files are excluded from version control through `.gitignore`.
- Never commit real credentials or secret keys to GitHub.

## Deployment Considerations

- Render free web services may spin down after inactivity; the first request after an idle period can be delayed.
- The current upload implementation stores files on the backend filesystem. Files on an ephemeral filesystem may not survive redeployments or instance replacement. Configure persistent or object storage before relying on long-term resume storage.

## Future Enhancements

- AI-powered career guidance and recommendations.
- Resume analysis and improvement suggestions.
- Placement preparation and aptitude practice modules.
- Advanced placement analytics and reporting.
- Real-time notifications.
- Enhanced recruitment insights.
- Durable cloud storage for uploaded documents.

## Project Information

| Detail | Information |
|---|---|
| Project Name | PlacementNex |
| Project Type | Full-Stack Web Application |
| Domain | Campus Placement Management |
| Architecture | Client-Server Architecture |
| Author | Radhika Tyagi |
| Institution | ABES Engineering College |
| Repository | https://github.com/radhikatyagi388/FSD-Project-2026 |

## Conclusion

PlacementNex aims to simplify campus recruitment by bringing students, recruiters, and placement officers onto a single platform.

By combining modern frontend technologies, RESTful backend services, secure authentication, and cloud-based database management, the project provides a foundation for digital placement management.

**PlacementNex – Connecting Students, Opportunities, and Careers.**
