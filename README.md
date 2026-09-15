# SubTrack — Personal Finance & Subscription Tracker

SubTrack is a modern, real-time control center designed to help users manage their recurring subscriptions, monitor free trial expirations, and analyze their monthly and annual spending. 

Built with React, Supabase, and Stripe, SubTrack includes a built-in automated background cron system that scans for upcoming renewals and sends email alerts 3 days in advance.

## ✨ Features

- **Real-time Dashboard:** Instantly view monthly spend, annual run rate, and category breakdowns.
- **Smart Alerts:** Automated email notifications (via Resend) sent 3 days before any subscription renews or a free trial ends.
- **Tier Limits & Monetization:** Built-in Free Tier (limited to 5 subscriptions) and a Pro Tier ($5/mo) powered by the Stripe Customer Portal.
- **Secure Authentication:** Passwordless & email-based auth using Supabase.
- **Privacy First:** Self-contained architecture with database-level Row Level Security (RLS) ensuring users only ever see their own data.

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion, Recharts
- **Backend & Database:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Payments:** Stripe Checkout & Customer Portal
- **Serverless Automation:** Netlify Functions & Cron Jobs
- **Email Delivery:** Resend API
- **Observability:** Sentry (Error Tracking) & PostHog (Analytics)

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- A [Supabase](https://supabase.com/) account (Free tier is fine)
- A [Stripe](https://stripe.com/) account (for Pro tier testing)

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory based on the `.env.example` file. 

You will need to fill in:
- `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` (From your Supabase Project settings)
- `SUPABASE_SERVICE_ROLE_KEY` (For the Netlify admin functions)
- `VITE_STRIPE_PUBLIC_KEY` & `STRIPE_SECRET_KEY` (From your Stripe Dashboard)
- `RESEND_API_KEY` (For email notifications)

### 4. Database Initialization
1. Navigate to the SQL Editor in your Supabase Dashboard.
2. Copy the entire contents of `supabase/schema.sql` from this repository.
3. Paste and run the SQL query to create all necessary tables, Postgres triggers, and Row Level Security (RLS) policies.

### 5. Start the App
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 🚢 Deployment (Netlify)

This project is optimized for deployment on Netlify, as it relies on Netlify Functions for the Stripe webhooks and the cron job engine.

1. **Push your code to GitHub.**
2. **Connect your repository to Netlify.**
3. **Build Command:** `npm run build`
4. **Publish Directory:** `dist`
5. **Environment Variables:** In the Netlify dashboard, add all the environment variables from your local `.env` file, ensuring you swap your Stripe `pk_test_...` keys for live `pk_live_...` keys, and use your production Supabase database.

> The cron job `netlify/functions/cron-check.ts` is configured via Netlify's Scheduled Functions to run daily at 8:00 AM.
