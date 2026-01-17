# food-ordering-app (Expo + React Native + Supabase)

Take-home project submission built with **Expo Router** + **Supabase (Auth + Postgres)** + **Stripe test payments**.

---

## Tech Stack
- Expo + React Native + TypeScript
- Expo Router navigation
- Supabase (Auth + Postgres tables)
- Stripe (test payment flow)

---

## Additional Features Implemented (Beyond Tutorial)

### 1) Best Seller Badge (UI enhancement)
- Highlighted products with a **“Best Seller”** badge for better discoverability in the menu.

### 2) Loyalty Reward (Progress + 50% Discount on 6th order)
- Displays a **progress bar (1 → 5 paid orders)** in the cart.
- After **5 paid orders**, the user’s **6th order automatically gets 50% off**.
- UI reflects reward availability and shows discounted estimated total.

### 3) Customer Support Tickets (User → Admin workflow)
- User can submit a support ticket with **subject + message**.
- Ticket is stored in Supabase and linked to the authenticated user.
- Admin dashboard shows **ticket id, user id, timestamp, status** and allows **mark as closed**.

---

## Running the App Locally

### 1) Install dependencies
```bash
npm install
2) Create environment variables
Copy the env template and fill in values:

bash
Copy code
cp .env.example .env
Your .env should look like this (example keys):

env
Copy code
EXPO_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY="YOUR_STRIPE_PUBLISHABLE_KEY"
✅ Note: .env is intentionally not committed. Only .env.example is included.

3) Start the app
bash
Copy code
npx expo start -c
Run using:

iOS Simulator (recommended)
or

Expo Go (if supported for your environment)

Test Accounts / Roles
This project supports User and Admin roles (stored in Supabase profile/role).

User: place orders, view loyalty progress, submit support tickets.

Admin: access admin area and view support tickets dashboard.

(Use the accounts created in your Supabase Auth to test both roles.)

How to Review the Added Features
Feature 1: Best Seller badge
Open Menu → visually confirm “Best Seller” badge appears on tagged items.

Feature 2: Loyalty Progress + 50% reward
Place paid orders as a user.

Observe cart progress increments up to 5/5.

On the 6th order, discount should apply automatically.

Feature 3: Support Tickets
As a user: go to Profile → Customer Support, submit a ticket.

As admin: open Support Tickets dashboard, verify ticket list + mark closed.

What I Learned
Building a full Expo Router application with authenticated flows and role-based routing.

Implementing real-world workflows using Supabase (user tickets + admin dashboard).

Handling conditional pricing logic (loyalty discount) and reflecting it cleanly in UI.

Improving UX with small UI enhancements (badges, simple profile greeting + navigation).

bash
Copy code
