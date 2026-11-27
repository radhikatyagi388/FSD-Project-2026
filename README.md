# PlacementNex – AI-Ready Placement Management System

**A Full-Stack Placement Management Platform for Students, Recruiters, and College Placement Cells**

PlacementNex is a centralized placement management platform designed to streamline campus recruitment activities and simplify the interaction between students, recruiters, and placement officers.

The platform provides a unified environment where students can manage their professional profiles, explore placement opportunities, and track applications, while recruiters and placement officers can manage recruitment drives and monitor application progress.

---

## Project Overview

Campus placement processes often involve multiple disconnected tools for student records, recruitment announcements, application tracking, and placement coordination.

PlacementNex aims to bring these activities together through a role-based web application with a centralized backend and database.

The system provides dedicated interfaces and functionalities for different user roles, making placement management more organized, accessible, and efficient.

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

---

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

---

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
    Auth     Business   Upload
    APIs      APIs       APIs
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

---

## Project Structure

```text
PlacementNex/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   └── dashboard/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── applications/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── opportunities/
│   │   │   ├── profile/
│   │   │   └── staff/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
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

---

## Getting Started

Follow these steps to run PlacementNex locally.

### Prerequisites

Install the following:

- Node.js
- npm
- MongoDB Atlas account
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/radhikatyagi388/FSD-Project-2026.git
```

Navigate to the project directory:

```bash
cd FSD-Project-2026
```

### 2. Backend Setup

Navigate to the backend:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `server` directory.

Configure the following environment variables:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm start
```

The backend will run on:

`http://localhost:5001`

### 3. Frontend Setup

Open another terminal:

```bash
cd FSD-Project-2026/client
```

Install dependencies:

```bash
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

To generate the frontend production build:

```bash
cd client
npm run build
```

---

## Backend API Modules

The backend exposes REST API modules for the following operations:

| Module | Base Route | Purpose |
|---|---|---|
| Authentication | `/api/auth` | Registration and login |
| Profile | `/api/profile` | Student profile management |
| Uploads | `/api/uploads` | Document uploads |
| Opportunities | `/api/opportunities` | Placement drive management |
| Applications | `/api/applications` | Application management |
| Administration | `/api/admin` | Administrative operations |
| Health Check | `/api/health` | Backend and database status |

---

## Environment Variables

Never commit actual credentials or secret keys to GitHub.

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used for JWT authentication |
| `FRONTEND_URL` | Authorized frontend origin |
| `VITE_API_URL` | Backend API base URL for frontend |

---

## Deployment

PlacementNex is designed to support deployment using Render.

The deployment architecture consists of:

| Component | Render Service |
|---|---|
| React Frontend | Static Site |
| Express Backend | Web Service |
| Database | MongoDB Atlas |

### Frontend Deployment
- Root Directory: `client`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment Variable: `VITE_API_URL`

### Backend Deployment
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Configure `MONGODB_URI`, `JWT_SECRET`, and `FRONTEND_URL`.

Configure a frontend rewrite rule for React Router and use the deployed frontend origin in the backend CORS configuration.

---

## Security Considerations

- Passwords are hashed before database storage.
- JWT tokens are used for authentication.
- Protected routes restrict unauthorized access.
- Role-based middleware controls access to privileged endpoints.
- Environment variables are used for sensitive configuration.
- Secret files are excluded from version control through `.gitignore`.

---

## Future Enhancements

The platform can be extended with:

- AI-powered career guidance and recommendations.
- Resume analysis and improvement suggestions.
- Placement preparation and aptitude practice modules.
- Advanced placement analytics and reporting.
- Real-time notifications.
- Enhanced recruitment insights.

---

## Project Information

**Project Name:** PlacementNex  
**Project Type:** Full-Stack Web Application  
**Domain:** Campus Placement Management  
**Architecture:** Client-Server Architecture  
**Repository:** [FSD-Project-2026](https://github.com/radhikatyagi388/FSD-Project-2026)

---

## Conclusion

PlacementNex aims to simplify campus recruitment by bringing students, recruiters, and placement officers onto a single platform.

By combining modern frontend technologies, RESTful backend services, secure authentication, and cloud-based database management, the project provides a scalable foundation for digital placement management.

**PlacementNex – Connecting Students, Opportunities, and Careers.**
