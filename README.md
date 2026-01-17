# food-ordering-app (Expo + React Native + Supabase)

Take-home project submission built with Expo Router + Supabase backend + Stripe test payments.

## Tech Stack
- Expo + React Native + TypeScript
- Expo Router navigation
- Supabase (Auth + Postgres tables)
- Stripe (test payment flow)

## Additional Features Implemented
### 1) Best Seller badge (UI enhancement)
Highlighted products with a **“Best Seller”** badge for better discoverability in the menu.

### 2) Loyalty Reward (Progress + Discount)
- Shows **progress 1 → 5 orders** in the cart.
- After completing **5 paid orders**, the **6th order gets 50% off** automatically.
- UI updates to show when the reward is ready and displays the discounted estimated total.

### 3) Customer Support Tickets (User → Admin workflow)
- User can submit a support ticket with **subject + message**.
- Ticket is saved to Supabase linked to the user account.
- Admin can view tickets with **ticket id, user id, timestamp, status** and **mark as closed**.

## Running the app locally

### 1) Install dependencies
```bash
npm install
