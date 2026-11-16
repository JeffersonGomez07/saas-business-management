# SaaS Business Management System

A full-stack SaaS application for business management built with React, TypeScript, Node.js, Express, and SQL Server. The system provides tools to manage sales, inventory, customers, reports, user profiles, and notifications through a modern administrative dashboard.

## Features

### Authentication
- User registration
- User login
- JWT authentication
- Protected routes
- Company roles and email-bound, single-use invitations

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

The migration never creates or joins companies based on `company_name`. Before its first successful run, create each intended company in `dbo.companies` and populate `dbo.LegacyCompanyAssignments` with an explicit mapping for every existing user (`entity_name = 'users'`) and each `Categorias`, `Clientes`, `Proveedores`, `Productos` and `Ventas` row. Set each user mapping's `company_role` to `owner`, `admin`, or `member`; every company with users must have at least one owner. Leave `company_role` NULL for business-data mappings. Multiple users may map to the same `company_id` only when you have confirmed they belong to the same business. The migration derives sale details from their sale and notifications from their user, verifies all records, and applies the assignments and tenant-consistent foreign keys in one transaction. If a mapping is missing or related records belong to different companies, it rolls back. If you already ran an earlier version of this migration, fill `company_role` on every existing user assignment before rerunning this update. The migration-state marker allows safe reruns after new users sign up. Use the final ownership-count query to audit the result. Example: `INSERT dbo.LegacyCompanyAssignments (entity_name, record_id, company_id, company_role) VALUES ('users', 7, 3, 'owner'); INSERT dbo.LegacyCompanyAssignments (entity_name, record_id, company_id) VALUES ('Clientes', 42, 3);`.

New registrations without an invitation create a company, a default `General` category, and user preferences, and the registering user becomes its owner. Owners and admins can issue invitations from Configuración. Each invitation is stored as a hash, bound to one email, expires after seven days, and can be used once; signup with a valid code joins the inviter's company as a member without creating another company. Existing users may share a company only through the confirmed migration mappings. Each private API request requires a valid bearer JWT; company and user identity are taken from the verified token.

Backend tests: run `npm test` from `Backend`. The SQL integration test is skipped unless `RUN_SQL_INTEGRATION_TESTS=1` and `DB_DATABASE=SaaS_Test`; restore or create that disposable database with the application schema first. The integration test exercises registration/login, invitation acceptance and authorization, customers, inventory, sales, reports, and cross-company access, then removes only the companies and records it created.

Main entities include:

- Companies and company invitations
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
