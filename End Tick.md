# End Tick: SubTrack Launch Tracker

Status: **Between Phase 3 and Phase 4.** Phase 3 still has blockers, so it is not closed yet.

---

## Phase 1: The Foundation (Owner: You)

- [x] 1. Design direction chosen (Figma or reference screenshots)
- [x] 2. Setup and installation (packages, Vite, Tailwind v4, TypeScript)

## Phase 2: The Frontend (Owner: Agent)

### 2.1 UI (responsive, modular, pixel-perfect)

- [x] Landing page, auth screen, dashboard, modals, legal pages
- [x] Responsive layout including mobile sign-out menu
- [ ] Missing brand assets: `favicon.ico` and `og-image.jpg` are referenced but do not exist in the repo (no `public/` folder)
- [ ] Remove remaining "Resend / SendGrid" and "Resend API" copy in `ProfileModal.tsx`, `UpgradeModal.tsx`, and `PricingTable.tsx`
- [ ] Replace hardcoded `subtrack.app` placeholders (`index.html`, `ProductPreview.tsx`) once the domain is final

### 2.2 UX (frontend functionality, ready for backend)

- [x] Forgot password flow
- [x] Profile and email update via `supabase.auth.updateUser`
- [x] Guest mode via anonymous sign-in
- [x] Account deletion UI with type-to-confirm
- [ ] Post-checkout feedback: success_url uses `?upgrade=success`, but no handler reads it, so users get no confirmation after paying

## Phase 3: The Backend (Owner: Agent, production-grade)

### 3.1 Authentication

- [x] Supabase Auth in use (email, password, anonymous guest)
- [ ] **Decision needed:** the plan named Clerk + Supabase. The project currently uses Supabase Auth only. Either keep Supabase Auth (update the plan) or integrate Clerk.
- [ ] Re-enable email confirmation with custom SMTP (Resend), after a verified sending domain
- [ ] Renewal emails send from `alerts@resend.dev` (sandbox). Switch to a verified domain sender.

### 3.2 Database (Supabase)

- [x] Schema with RLS on profiles, subscriptions, notifications
- [x] Free-tier 5-subscription limit enforced by DB trigger
- [ ] **CRITICAL:** The `Users can update own profile` policy has no column restrictions. Any logged-in user can set `tier = 'pro'` or change `stripe_customer_id` through the REST API without paying. Fix with a column-restricted policy or trigger, and block client updates to `tier`, `stripe_*`, and `subscription_expires_at`.
- [ ] Free-tier trigger only runs on INSERT. Reactivating a paused subscription bypasses the limit. Add an UPDATE trigger.
- [ ] Schema lives only in `supabase/schema.sql` with no migrations folder. Adopt Supabase migrations so production changes are tracked.

### 3.3 Payments (Stripe)

- [x] Checkout session, Customer Portal, and webhook functions exist
- [ ] **CRITICAL:** `stripe-webhook.ts` falls back to parsing unverified JSON when `STRIPE_WEBHOOK_SECRET` is missing. Remove the fallback so unsigned requests are rejected.
- [ ] Verify `checkout.session.completed` has `payment_status === 'paid'` before upgrading
- [ ] Handle `customer.subscription.updated` and `invoice.payment_failed` (downgrade or grace period)
- [ ] Verify the Stripe API version string `2025-01-27.acacia` matches the installed `stripe` v22 SDK
- [ ] Test-mode end-to-end: checkout, webhook, tier upgrade, portal cancel, downgrade
- [ ] Live keys, live webhook endpoint, and live price (Netlify env vars)

### 3.4 API (Netlify Functions)

- [x] `stripe-checkout`, `stripe-portal`, `stripe-webhook`, `delete-account`, `cron-check` (daily 08:00)
- [ ] Confirm `delete-account` cancels the Stripe subscription and deletes the customer before deleting the user (otherwise billing continues)
- [ ] Derive `userId` from the verified JWT in `stripe-checkout` and `stripe-portal` instead of trusting the request body; add rate limiting
- [ ] Cron: add retry or logging for failed Resend sends (currently fails silently and still marks the alert as sent)

### 3.5 Config and Verification

- [ ] Set `RESEND_API_KEY`, `STRIPE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SENTRY_DSN`, `VITE_POSTHOG_KEY` in Netlify
- [ ] Confirm Sentry and PostHog receive events in production

## Phase 4: Polishing & Deployment (Owner: You for deployment)

### 4.1 Final Test & Review

- [ ] Full test pass: signup, guest, subscription limit, upgrade, cancel, delete account, cron alert, legal pages
- [x] `npm run lint` (`tsc --noEmit`) passes
- [x] `npm run build` succeeds (bundle is 1.58 MB; code splitting is a nice-to-have)
- [ ] Go/no-go decision

### 4.2 Frontend Polish (dedicated time)

- [ ] Fix the items listed in Phase 2 above
- [ ] Bundle size: code-split routes and charts
- [ ] Final mobile and browser pass

### 4.3 Backend Polish (dedicated time)

- [ ] All Phase 3 critical items (RLS tier hole, webhook verification, delete-account Stripe cleanup)
- [ ] Verified sending domain for auth and alert emails

### 4.4 Deployment (Owner: You)

- [ ] Connect the repo to GitHub and push the final branch
- [ ] Set all production environment variables in Netlify (see 3.5)
- [ ] Confirm the Netlify build, the daily cron schedule, and the `/api/*` redirect
- [ ] Point the custom domain at Netlify and update `index.html`, `ProductPreview.tsx`, and the legal pages to match
- [ ] Run a live smoke test: signup, upgrade with a real card, cancel, and one real renewal email
- [ ] Monitor Sentry and PostHog for the first 48 hours

## Current Position

- **You are in Phase 4 (Polish & Deploy), but Phase 3 is not complete.** The blockers are the RLS tier hole (3.2), the unverified webhook fallback (3.3), and the Clerk-vs-Supabase Auth decision (3.1). Fix these before the Phase 4 test pass counts as final.
- Phase 4 tasks are checked off only after they pass in the test run, not when the code is written.
