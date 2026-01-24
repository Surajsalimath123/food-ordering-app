# food-ordering-app  
**Expo + React Native + Supabase + Stripe (Test Mode)**

This repository contains my take-home submission for the Food Ordering App, built using Expo Router with a Supabase backend and Stripe test payments.

---

## 🔀 Important: Branch to Review
Please check out the submission branch:

```bash
git checkout submission/nevryk-takehome
All features and documentation are finalized on this branch.

🧱 Tech Stack
Expo + React Native

TypeScript

Expo Router

Supabase (Auth + PostgreSQL)

Stripe (test payment flow)

✨ Additional Features Implemented
1️⃣ Best Seller Badge (UI Enhancement)
Products marked as popular are highlighted with a “Best Seller” badge to improve discoverability and UX in the menu screen.

2️⃣ Loyalty Reward System (Progress + Discount)
Displays order progress (1 → 5) for the logged-in user.

After completing 5 paid orders, the 6th order automatically receives 50% off.

UI updates dynamically to show progress and when the reward is active.

3️⃣ Customer Support Tickets (User → Admin Workflow)
Users can submit support tickets with subject + message.

Tickets are stored in Supabase and linked to the user account.

Admin dashboard allows:

Viewing all tickets

Seeing ticket ID, user ID, timestamp, status

Marking tickets as Closed

▶️ Running the App Locally
1️⃣ Install Dependencies
bash
Copy code
npm install
2️⃣ Environment Variables Setup
Create a .env file from the template:

bash
Copy code
cp .env.example .env
Fill in .env with the provided test credentials (shared separately by email):

env
Copy code
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
⚠️ .env is intentionally not committed to GitHub.
Use .env.example as the reference.

3️⃣ Start the App
bash
Copy code
npx expo start -c
Important:
Expo does NOT reload environment variables automatically.
Always restart with -c after changing .env.

💳 Stripe Test Payment
Use the following Stripe test card during checkout:

Card Number: 4242 4242 4242 4242

Expiry Date: Any future date (e.g. 12/34)

CVC: 123

ZIP: 12345

📚 What I Learned From This Project
Structuring a production-style Expo Router app with role-based navigation.

Managing environment variables safely for mobile apps.

Implementing real-world features like loyalty rewards and support ticket workflows.

Integrating Stripe test payments with proper UX handling.

Designing a clean admin vs user experience using Supabase Auth and data rules.

📌 Notes for Reviewers
This project runs entirely in test mode.

No secrets are committed to the repository.

All custom features are documented above.

Code is structured for clarity and reviewability.

Thank you for reviewing my submission!

yaml
Copy code


# Food Ordering App — AI Order Assistant (Mastra + Supabase)

This project extends a Food Ordering mobile app with an **AI Order Assistant** built using **Mastra**.  
The assistant is **tool-grounded** (no hallucinated menu items) and **persists cart updates in Supabase** via backend tool calls.

## Key Requirements Met ✅
- Built with **Mastra Agent**
- Assistant uses tools to:
  - **Search menu (Supabase products)** via `searchMenu`
  - **Recommend items only from tool results**
  - **Add/update/remove cart items** via tool calls
  - Cart updates persist in **Supabase** and are visible in the app
- Supports multi-turn flows like:
  - “I want pizza suggestions” → “Add the first one”
  - “Show my cart”
  - Quantity updates via repeated “add first”
- Backend provides:
  - `POST /ai/chat` for assistant chat
  - `GET /cart?userId=<uuid>` for cart tab in UI

---

## Tech Stack
- **Expo + React Native** (TypeScript)
- **Supabase** (Postgres + Auth + Storage)
- **Backend**: Node + Express
- **Mastra** Agent with tool calls (Supabase Admin client)
- **Model**: OpenAI (via `@ai-sdk/openai`)

---

## Project Structure
food-ordering-app/
src/ # Expo app
backend/ # Node + Express + Mastra agent + tools
supabase/ # Supabase migrations + seed (required for submission)

yaml
Copy code

---

## Setup Instructions

### 1) App (Expo)
```bash
npm install
npx expo start -c
2) Supabase (Local or Hosted)
This app uses Supabase Auth and Postgres tables.

Option A: Hosted Supabase
Create a Supabase project

Copy credentials into .env (use .env.example as template)

Option B: Local Supabase (recommended for reviewers)
bash
Copy code
npx supabase start
npx supabase db reset
If using local, update EXPO_PUBLIC_SUPABASE_URL to local URL.

Backend Setup (Mastra + Tools)
From backend/:

bash
Copy code
npm install
npm run dev
Backend runs at:

http://localhost:8787

Environment variables:

Create backend/.env from .env.example

Must include Supabase service role for server-side DB access

Supabase Schema + Seed
Tables Used
products (menu)

carts (one active per user)

cart_items (items in cart)

Migrations
All schema changes should be in:

bash
Copy code
supabase/migrations/
Seed
Recommended seed file:

bash
Copy code
supabase/seed.sql
To apply locally:

bash
Copy code
npx supabase db reset
Tool Definitions (Mastra)
1) searchMenu
Searches real menu items in Supabase products table by name (case-insensitive).

Input: { query: string }

Output: { matches: Product[], bestMatch }

Rule: assistant must recommend ONLY from tool results.

2) getCart
Fetches user’s current active cart and items (joins products).

Input: { userId: string }

Output: { cartId, status, items[] }

3) add_to_cart
Adds an item to the user's active cart.

If same product+size exists, it increments quantity

Otherwise inserts a new cart_item

Input: { userId, productId, size?, quantity }

4) removeCartItem
Deletes a cart item by cart_items.id.

Input: { userId, cartItemId }

5) updateQuantity
Updates a cart item quantity by cart_items.id.

Input: { userId, cartItemId, quantity }

Example Chat Transcripts (End-to-End with Tool Calls)
Transcript 1 — Pizza suggestions → Add first → Cart updates
User: I want pizza suggestions
Assistant (calls searchMenu query="pizza"):
Pizza suggestions:

Mutton-pizza — $20.00 (productId: 13)

Spoof Pizza — $13.99 (productId: 32)
Say: “add the first one” to add it to your cart.

User: Add the first one
Assistant (calls add_to_cart userId=..., productId=13, size="M", quantity=1):
✅ Added/updated Mutton-pizza in your cart.

User: Show my cart
Assistant (calls getCart userId=...):
🛒 Cart

3× Mutton-pizza (M) …
(visible in app Cart tab as well)

Transcript 2 — Show cart → Update quantity
User: Show my cart
Assistant (calls getCart): returns items

User: Update Mutton-pizza to quantity 2
Assistant (calls getCart, finds matching cart_item_id, then calls updateQuantity):
✅ Updated quantity to 2.

Transcript 3 — Remove an item
User: Remove Ultimate Pepperoni
Assistant (calls getCart, finds cart_item_id, then calls removeCartItem):
✅ Removed Ultimate Pepperoni from your cart.

How Robustness & Scalability Can Be Improved
If I had more time, I would:

Conversation memory / state

Store last search results per user (server-side) so “add the second one” always works even minutes later.

Stronger query grounding

Enhance searchMenu to support filters: price cap, vegetarian, dairy-free, spicy tags, etc.

Add a structured product_attributes table or JSON column for diet tags.

Validation & authorization

Ensure updateQuantity / removeCartItem verify the item belongs to the user before mutating.

Better UX

Format responses nicely (subtotal, totals)

Hide internal IDs in chat UI, keep them only for tool use

Production reliability

Add retries + circuit breaker for DB calls

Add observability: request IDs, structured logs, and tool-call audit logging

AI Tools Used
ChatGPT (for code iteration + debugging)

(Optional) GitHub Copilot / Copilot Chat for inline suggestions (if enabled)

Submission Links
Repo: (paste your repo URL here)
Supabase migrations are included under supabase/migrations.

yaml
Copy code

---

# ✅ What you must do next (to match the email exactly)

## 1) Ensure Supabase migrations exist in `/supabase/migrations`
Right now your repo has a `supabase/` folder — but you must confirm it includes:
- `supabase/migrations/*.sql`
- optionally `supabase/seed.sql`

If you don’t have migrations yet, do this **locally**:

```bash
npx supabase init   # if not already
npx supabase db dump --file supabase/migrations/0001_schema.sql
(That ensures reviewers can recreate schema.)

