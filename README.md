# Subscription Management Platform (Hack-Haven Odoo)

A full-stack Subscription & Billing Management system built for high-velocity recurring billing, product catalog management, automated invoicing, and customer portal self-service.

---

## 📋 System Requirements

### Prerequisites
- **Node.js**: `v18.x` or `v20.x` or higher
- **npm**: `v9.x` or higher (or `pnpm` / `yarn`)
- **Docker & Docker Compose** (Optional for full DB/Redis stack; SQLite supported for local demo)

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database & Cache**: PostgreSQL 16, Redis 7 (or SQLite for lightweight local runs)
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS
- **Authentication**: JWT-based auth with Role-Based Access Control (RBAC)

---

## 🚀 Quick Start Guide

### 1. Clone & Setup Environment

```bash
# Clone the repository
git clone https://github.com/tWiNFigHTer-gif/Hack-Haven_ODOO.git
cd Hack-Haven_ODOO

# Copy environment variables
cp .env.example .env
```

### 2. Start Infrastructure (PostgreSQL & Redis)

```bash
docker-compose up -d
```

*(Note: If running without Docker, configure `DATABASE_URL` in `backend/.env` to point to a local PostgreSQL or SQLite instance).*

---

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Run database migrations / push schema
npx prisma db push

# (Optional) Seed initial data (plans, admin users)
npm run prisma:seed

# Start backend dev server
npm run dev
```

The backend API will run on `http://localhost:5000`.
- Health check: `http://localhost:5000/health`
- API documentation root: `http://localhost:5000/api/v1/meta`

---

### 4. Frontend Setup

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite frontend
npm run dev
```

The frontend will run on `http://localhost:5173`.

---

## 🎯 Key Functional Features

### 1. Subscription Lifecycle State Machine
Strict transition integrity across subscription states:
- `DRAFT` $\rightarrow$ `QUOTATION`
- `QUOTATION` $\rightarrow$ `CONFIRMED` or `CLOSED`
- `CONFIRMED` $\rightarrow$ `ACTIVE`
- `ACTIVE` $\rightarrow$ `PAUSED` or `CLOSED`
- `PAUSED` $\rightarrow$ `ACTIVE` or `CLOSED`
- `CLOSED` (Terminal)

### 2. Product Catalog & Pricing Engine
- Products with base pricing (`salesPrice`, `costPrice`).
- Product variants with dynamic price surcharges (`priceExtra`).
- Line-item financial calculation with rounding protection:
  $$\text{Unit Price} = \text{Base Price} + \text{Variant Extra}$$
  $$\text{Line Total} = \text{Unit Price} \times \text{Quantity}$$

### 3. Automated Billing & Invoicing
- Batch billing runner (`POST /api/billing/run`) querying active subscriptions and creating invoices.
- Invoice payment tracking (`DRAFT`, `OPEN`, `PAID`, `VOID`).

### 4. Customer Portal ("Brightloop") & Admin Dashboard
- Dual-role dashboard to view metrics (MRR, active subscribers, churn rate).
- Customer portal for managing subscription plans, payment methods, and invoice PDF downloads.

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

Executes test suites covering authentication, role-based access control (RBAC), and catalog calculations.
