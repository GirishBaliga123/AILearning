# MyBillLedger

A production-ready monthly expense tracker for ~50 users.

## Tech Stack
- Next.js 16 (App Router), React 19, Tailwind CSS 4, Chart.js
- NextAuth.js (Email/Password, Google, GitHub, Guest)
- MySQL + Prisma ORM
- jsPDF for PDF export

## Setup
```bash
npm install
cp .env.example .env.local
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

## Features
- Dashboard with monthly summary and budget warnings
- Transaction CRUD with search, filters, pagination
- Category breakdown with pie charts
- Spending reports with trend/daily charts
- Budget limits per category
- Recurring expenses (auto-created monthly)
- PDF export
- Responsive design
- OAuth + Guest login
