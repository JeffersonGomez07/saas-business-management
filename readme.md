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

Copy `Backend/.env.example` to `Backend/.env` and set values for your local SQL Server and a unique JWT signing secret. `.env` files are ignored by Git; never commit production credentials.

```env
PORT=4000
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=SaaS
DB_USER=your_sql_server_user
DB_PASSWORD=your_sql_server_password
JWT_SECRET=replace-this-with-a-random-secret-of-at-least-32-characters
```

`JWT_SECRET` must be a private random value (at least 32 characters) and must be identical anywhere the backend signs or verifies tokens. Do not reuse the example value.
If a credential was previously committed, rotate it; ignoring `.env` does not remove values from Git history.

---

# Database

The application uses Microsoft SQL Server. For a new installation, run `Script/schema.sql`. To upgrade an existing installation, first back up the database and run `Script/migrate-multiempresa.sql`.

The migration creates a separate company for each existing user to avoid merging accounts based on possibly duplicated `company_name` values. If multiple users should share a tenant, review and reassign their `company_id` values explicitly. Legacy customers, products, sales, sale details, categories and suppliers have no reliable ownership information, so they remain unassigned (`company_id IS NULL`) and are intentionally hidden from tenant-scoped API responses. Review and assign those records to the correct company before making them available. Do not assign historical data to a tenant unless that ownership is confirmed.

New registrations create a company, a default `General` category, and user preferences. Each private API request requires a valid bearer JWT; company and user identity are taken from the verified token.

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
- Audit logs
- Swagger API documentation
- Unit and integration testing
- Docker support
- CI/CD pipeline

---

# Author

**Jefferson Gómez**

Software Developer
