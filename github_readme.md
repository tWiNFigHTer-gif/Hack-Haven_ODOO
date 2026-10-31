# Recur - Unified Subscription & Recurring Billing Engine

Built for the Odoo Hackathon. A software platform for managing recurring products, automated billing cycles, dynamic pricing variants, and financial analytics.

## The Problem

Brightloop Software sells subscriptions across monthly and annual plans. Today, operations face several challenges:

* Customer subscriptions are tracked in manual spreadsheets.
* Renewal dates are frequently missed or forgotten.
* Invoices are created manually every billing cycle.
* Payments are manually matched by searching bank statements.
* Quarterly revenue reports take days to compile.

## The Solution

This project provides a unified system to automate the full subscription lifecycle:

1. Product Catalog & Variants: Manage products, billing frequencies (daily, weekly, monthly, yearly), and brand price surcharges.
2. Subscription State Engine: Convert quotation templates into subscriptions across formal states (Draft to Quotation to Confirmed to Active to Closed).
3. Automated Billing Engine: Automatically generate non-duplicative invoices on billing day with calculated taxes and discounts.
4. Financial Dashboard: Real-time visibility into active subscriptions, collected revenue, outstanding amounts, and overdue invoices with sub-2-second response times.
5. Customer Self-Service Portal: Allows customers to view their active plans, download invoices, and manage accounts directly.

## Tech Stack

* Backend: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Redis
* Frontend: React (Vite), TypeScript, Tailwind CSS
* Infrastructure: Docker Compose

## Setup Instructions

### Prerequisites

* Node.js (v18+)
* Docker and Docker Compose
* Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/brightloop-subscription-system.git
   cd brightloop-subscription-system
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Project

1. Start database and cache services:
   ```bash
   docker-compose up -d
   ```

2. Run database migrations and seed mock data:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

3. Start backend API server:
   ```bash
   npm run dev
   ```

4. Start frontend development server:
   ```bash
   cd ../frontend
   npm run dev
   ```

The application interface will be available at `http://localhost:5173`.

## System Features

* Role-Based Access Control: Granular access for Admins, Staff, and Customers with secure password validation.
* Variant Pricing Logic: Automatic calculation of variant costs (such as brand surcharges).
* Idempotent Billing: Prevents duplicate invoice generation during scheduled billing runs.
* Automatic Discounts: Supports percentage and fixed-amount discounts with usage limits and expiry dates.
* Performance Optimization: Indexed database queries and cached analytics delivering sub-2-second response times.

## Team Roles

* Member 1 (Backend & Billing Lead): Product catalog APIs, subscription state machine, automated billing worker, discount evaluator.
* Member 2 (Database Architect & Security): Database schema, Prisma migrations, data seeder, authentication, RBAC middleware.
* Member 3 (Frontend & Analytics Lead): Executive analytics dashboard, admin portal, customer self-service portal, API integration.