# ROAD BUDDY FINANCE

A modern, high-performance financial & expense management system built for partnership businesses.

## Stack & Architecture

- **Framework**: Next.js (App Router) + TypeScript + React
- **Styling**: Tailwind CSS (SaaS white/light theme, modern typography, crisp card layouts)
- **Database**: MongoDB Atlas via Mongoose ORM
- **Serverless Security**: Mongoose connection caching in `lib/mongodb.ts`. MongoDB credentials remain strictly server-side.
- **Exports & Reports**: Excel export (`.xlsx`), Excel import parsing, PDF Financial Summary reports (`jspdf`).

---

## Key Features

1. **Universal "Add Transaction" Form**:
   - **Single universal form/modal component** (`UniversalTransactionForm.tsx`).
   - Dynamically renders adaptive fields based on selected transaction type:
     - `Expense`: Category, Amount, Vehicle, Person, Job, Invoice, Remarks.
     - `Income`: Category, Amount, Vehicle, Job, Customer, Invoice, Remarks.
     - `Investment`: Partner (Required), Amount, Payment Method, Remarks.
     - `Withdrawal`: Partner (Required), Amount, Reason, Remarks.
     - `Dividend`: Partner (Required), Amount, Profit Period, Remarks.
     - `Asset Sale`: Asset (Required), Sale Amount, Buyer/Ref, Remarks.
   - Expandable "More Details" section for clean mobile UX.

2. **Automatic Balance & Financial Rules**:
   - `Current Balance` is calculated automatically from all active transactions.
   - `Investment` is NOT treated as operational income.
   - `Withdrawal` & `Dividend` are NOT treated as operational expenses.
   - Voiding a transaction preserves audit history while excluding it from calculations.

3. **Partnership Profit Distribution**:
   - Configurable profit share percentage (e.g. Partner A 50%, Partner B 50%).
   - Automatic partner equity summary on Dashboard and Reports.

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/road_buddy?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_2026
NODE_ENV=development
```

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run seed script (or click "Seed Data" in app header)
# Default Admin: admin@roadbuddy.com / admin123

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Vercel Deployment Instructions

1. Push codebase to GitHub / Git repository.
2. Import project into Vercel Dashboard.
3. In Vercel Project Settings -> **Environment Variables**:
   - Add `MONGODB_URI` with your MongoDB Atlas connection string.
   - Add `JWT_SECRET` with a secure random key.
4. Deploy! Next.js App Router API handlers and serverless database connections handle all CRUD operations securely.
"# Road_Buddy" 
