# Subscription Management System

Subscription management and recurring billing platform built with Node 20, Express, TypeScript, Prisma, and PostgreSQL.

---

## Prerequisites

- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **Docker & Docker Compose**: for local PostgreSQL 16 & Redis 7 services

---

## Setup

```bash
# 1. Start database and cache services
docker compose up -d

# 2. Configure environment variables
cp .env.example .env
cp .env.example backend/.env

# 3. Install dependencies and initialize database
cd backend
npm i
npx prisma migrate deploy
npm run db:seed

# 4. Start backend development server
npm run dev
```

---

## Demo Accounts

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@brightloop.test` | `Admin@12345` | Full administrative control across catalog, plans, users, taxes, templates, and billing |
| **STAFF** | `staff@brightloop.test` | `Staff@12345` | Read access to catalog, plans, users, taxes, templates; record payments |
| **CUSTOMER** | `customer@brightloop.test` | `Cust@12345` | Access customer portal (`/api/me/*`) to view own subscriptions, invoices, and payment history |

---

## API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System and service health status |
| `POST` | `/api/auth/signup` | Public | Register customer account |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Authenticated | Fetch current user profile |
| `POST` | `/api/auth/forgot` | Public | Request password reset token |
| `POST` | `/api/auth/reset` | Public | Reset password using single-use token |
| `GET` | `/api/users` | ADMIN, STAFF | List users (paginated, filter by `role`, search `q`) |
| `POST` | `/api/users/staff` | ADMIN | Provision new staff account |
| `GET` | `/api/catalog/products` | ADMIN, STAFF | List catalog products (paginated, search `q`) |
| `POST` | `/api/catalog/products` | ADMIN | Create a base product |
| `GET` | `/api/catalog/products/:id` | ADMIN, STAFF | Get product with variants & `finalPrice` |
| `PATCH` | `/api/catalog/products/:id` | ADMIN | Update product details |
| `DELETE`| `/api/catalog/products/:id` | ADMIN | Delete product (rejects if referenced) |
| `GET` | `/api/catalog/products/:id/variants` | ADMIN, STAFF | List variants for a product |
| `POST` | `/api/catalog/products/:id/variants` | ADMIN | Create variant on product |
| `PATCH` | `/api/catalog/variants/:id` | ADMIN | Update variant attributes or pricing |
| `DELETE`| `/api/catalog/variants/:id` | ADMIN | Delete variant (rejects if referenced) |
| `GET` | `/api/catalog/plans` | ADMIN, STAFF | List plans (paginated, search `q`) |
| `POST` | `/api/catalog/plans` | ADMIN | Create subscription plan |
| `GET` | `/api/catalog/plans/:id` | ADMIN, STAFF | Get plan by ID |
| `PATCH` | `/api/catalog/plans/:id` | ADMIN | Update plan details |
| `DELETE`| `/api/catalog/plans/:id` | ADMIN | Delete plan (rejects if referenced) |
| `GET` | `/api/taxes` | ADMIN, STAFF | List tax rates (paginated, search `q`) |
| `POST` | `/api/taxes` | ADMIN | Create tax rate |
| `GET` | `/api/taxes/:id` | ADMIN, STAFF | Get tax rate by ID |
| `PATCH` | `/api/taxes/:id` | ADMIN | Update tax rate |
| `DELETE`| `/api/taxes/:id` | ADMIN | Delete tax rate (rejects if referenced) |
| `GET` | `/api/discounts` | ADMIN, STAFF | List discounts (paginated, search `q`) |
| `POST` | `/api/discounts` | ADMIN | Create discount rule |
| `GET` | `/api/discounts/:id` | ADMIN, STAFF | Get discount by ID |
| `PATCH` | `/api/discounts/:id` | ADMIN | Update discount |
| `DELETE`| `/api/discounts/:id` | ADMIN | Delete discount (rejects if referenced) |
| `GET` | `/api/templates` | ADMIN, STAFF | List quotation templates (paginated, search `q`) |
| `POST` | `/api/templates` | ADMIN | Create quotation template with lines |
| `GET` | `/api/templates/:id` | ADMIN, STAFF | Get quotation template with lines |
| `PATCH` | `/api/templates/:id` | ADMIN | Update template (replaces lines if provided) |
| `DELETE`| `/api/templates/:id` | ADMIN | Delete quotation template |
| `GET` | `/api/me/subscriptions` | CUSTOMER | Customer's own subscriptions with lines |
| `GET` | `/api/me/invoices` | CUSTOMER | Customer's own invoices (filter by `status`) |
| `GET` | `/api/me/invoices/:id` | CUSTOMER | Customer's invoice with lines and payments |
| `GET` | `/api/payments` | ADMIN, STAFF | List recorded payments (paginated, filter `invoiceId`) |
| `POST` | `/api/payments` | ADMIN, STAFF | Record payment with invoice row locking |

