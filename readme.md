# SaaS Business Management System

A full-stack SaaS application for business management built with React, TypeScript, Node.js, Express, and SQL Server. The system provides tools to manage sales, inventory, customers, reports, user profiles, and notifications through a modern administrative dashboard.

## Features

### Authentication
- User registration
- User login
- JWT authentication
- Protected routes

### Dashboard
- Business metrics
- Sales summary
- Inventory overview
- Customer statistics
- Interactive charts

### Sales
- Create sales
- Sales history
- Customer selection
- Product selection

### Inventory
- Product management (CRUD)
- Categories
- Suppliers
- Stock control

### Customers
- Customer management
- Customer registration

### Reports
- Financial analysis
- Sales by category
- Top-selling products
- PDF report generation
- Date range filtering

### User Profile
- Personal information
- Change password
- Profile picture upload
- User preferences

### Notifications
- Notification center
- Mark as read
- Notification counter
- Clear notifications

---

# Tech Stack

## Frontend

- React 18
- TypeScript
- Vite
- React Router v7
- Tailwind CSS
- Material UI
- Radix UI
- Axios
- React Hook Form
- Recharts
- Sonner

## Backend

- Node.js
- Express 5
- SQL Server (mssql)
- PostgreSQL (supported)
- JWT
- Bcrypt
- Multer
- PDFKit
- CORS
- Dotenv

---

# Project Structure

```text
SaaS/
│
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── app.js
│   └── server.js
│
└── Frontend/
    ├── src/
    │   ├── components/
    │   ├── hooks/
    │   ├── pages/
    │   ├── routes/
    │   ├── service/
    │   ├── styles/
    │   ├── types/
    │   └── utils/
    └── App.tsx
```

---

# Technologies

| Category | Technologies |
|----------|--------------|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS, Material UI, Radix UI |
| Backend | Node.js, Express |
| Database | SQL Server |
| Authentication | JWT |
| Reports | PDFKit |
| Charts | Recharts |

---

# Installation

## Clone the repository

```bash
git clone https://github.com/your-username/saas-business-management.git
cd saas-business-management
```

## Install dependencies

### Backend

```bash
cd Backend
npm install
```

### Frontend

```bash
cd Frontend
npm install
```

---

# Running the Application

## Start both applications

From the project root:

```bash
npm install
npm run dev
```

This command starts both the frontend and backend using **concurrently**.

### Backend

```bash
npm run dev
```

### Frontend

```bash
npm run dev
```

---

# Environment Variables

Create a `.env` file inside the **Backend** directory.

```env
PORT=4000

DB_SERVER=

DB_DATABASE=

DB_USER=

DB_PASSWORD=

JWT_SECRET=
```

---

# Database

The application is designed to work primarily with Microsoft SQL Server.

Main entities include:

- Users
- Products
- Categories
- Suppliers
- Customers
- Sales
- Sale Details
- Notifications
- User Preferences

---

# Project Highlights

- Full-stack SaaS architecture
- RESTful API with Express
- JWT-based authentication
- Responsive administrative dashboard
- Financial reporting and analytics
- PDF report generation
- Modular architecture following separation of concerns
- Reusable UI components
- Protected routes
- File upload support
- Clean and scalable codebase

---

# Future Improvements

- Excel export
- Email notifications
- Role-based access control
- Multi-tenant architecture
- Audit logs
- Swagger API documentation
- Unit and integration testing
- Docker support
- CI/CD pipeline

---

# License

This project was developed for educational purposes and as part of a professional software development portfolio.

---

# Author

**Jefferson Gómez**

Software Developer
