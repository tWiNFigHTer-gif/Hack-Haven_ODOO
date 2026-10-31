# Brightloop

> **Read this file before every task.**

## Overview

**Brightloop** is a billing system demo built for a hackathon. It tells the story of one billing month at Brightloop Software — following a new customer from account creation all the way to the finance lead reviewing the monthly numbers.

---

## Story

A new customer signs up for Brightloop Software, picks a plan, uses the product, changes their plan mid-month, racks up some overage, gets invoiced, has a payment fail and retry, receives a refund/credit, and finally the finance lead opens the dashboard to review the month's performance.

---

## Scenes (in order)

| # | Scene | Description |
|---|-------|-------------|
| 1 | **Signup and plan selection** | New customer creates an account and selects a subscription plan. |
| 2 | **Mid-month plan change with proration** | Customer upgrades or downgrades mid-cycle; system calculates prorated charges. |
| 3 | **Usage tracking and overage** | Customer exceeds plan limits; overage units are tracked and priced. |
| 4 | **Invoice generation** | End-of-month invoice is generated with base fee, prorations, and overage. |
| 5 | **Failed payment and retries** | Payment attempt fails; system schedules and executes retry logic. |
| 6 | **Refund or credit** | A credit or partial refund is applied to the customer's account. |
| 7 | **Finance dashboard** | Finance lead reviews MRR, churn, total revenue, and failed payments. |

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js + Express |
| Database | SQLite |
| Payments | **Mocked** — no real payment processing |

---

## Rules

1. **Keep code simple** — favour readability over cleverness.
2. **Use realistic seed data** — names, amounts, and dates should feel real.
3. **Read this file before every task** — stay aligned with the project story and constraints.
4. **No real payments** — all payment flows are simulated/mocked.
