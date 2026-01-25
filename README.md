🍔 Food Ordering App  
Expo · React Native · Supabase · Stripe (Test Mode)

This repository contains my **take-home submission** for the Food Ordering App.
It is a **full-stack mobile application** built with Expo Router, Supabase, Stripe test payments, and an optional AI-powered Order Assistant.

All work is finalized and submitted on the **submission branch**.

---

## 🔀 Branch to Review (Final Submission)

**Branch:** `submission/nevryk-takehome` (default)

```bash
git checkout submission/nevryk-takehome
🧱 Tech Stack
Mobile App
Expo + React Native

TypeScript

Expo Router

Supabase (Auth, PostgreSQL, Storage)

Stripe PaymentSheet (Test Mode)

Backend (AI Assistant)
Node.js + Express

Mastra Agent

Supabase Admin Client

OpenAI model (via AI SDK)

📱 Core App Features
User Features
User authentication (Supabase Auth)

Browse menu items

Product detail view with size selection

Cart management (add, update, remove items)

Secure checkout using Stripe test payments

View order history

Submit customer support tickets

Admin Features
View all support tickets

See ticket metadata (user, timestamp, status)

Update ticket status (Open → Closed)

✨ Custom Features Implemented
1️⃣ Best Seller Badge
Popular products are highlighted with a “Best Seller” badge on the menu screen to improve discoverability and UX.

2️⃣ Loyalty Reward System
A customer loyalty feature built end-to-end:

Displays order progress (1 → 5)

After 5 successful paid orders, the 6th order automatically receives 50% off

Progress updates dynamically per user

Discount is applied automatically at checkout

3️⃣ Customer Support Ticket System
A complete user → admin workflow:

Users submit support tickets with subject & message

Tickets are stored in Supabase and linked to the user

Admin can view and close tickets from the dashboard

🤖 AI Order Assistant (Optional Feature)
This project includes an AI-powered Order Assistant that allows users to interact with the menu and cart using natural language.

Key Characteristics
Built using Mastra Agent

Tool-grounded (no hallucinated items)

All recommendations come from real Supabase products

Cart changes persist to Supabase and sync with the UI

Supports multi-turn conversations

Example AI Commands (Try These)
sql
Copy code
Show me pizza options
Add the first one to my cart
Show my cart
Increase the quantity
Remove the second item
Checkout
The AI assistant interacts with the same cart used by the mobile app, ensuring consistency between AI actions and UI state.

📂 Project Structure
graphql
Copy code
food-ordering-app/
├── src/            # Expo mobile app
├── backend/        # Node + Express + AI Assistant
├── supabase/       # Supabase schema & migrations
├── screenshots/    # App screenshots for review
├── .env.example    # Environment variable template
└── README.md
▶️ Running the App Locally
1️⃣ Install Dependencies
bash
Copy code
npm install
2️⃣ Environment Setup
bash
Copy code
cp .env.example .env
Fill in:

ini
Copy code
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
.env is intentionally not committed.

3️⃣ Start the App
bash
Copy code
npx expo start -c
Expo does not reload environment variables automatically.
Always restart with -c after editing .env.

💳 Stripe Test Payments
Use this test card at checkout:

Card Number: 4242 4242 4242 4242

Expiry: Any future date

CVC: 123

ZIP: 12345

📚 What I Learned
Structuring a production-ready Expo Router app

Managing auth, data, and storage with Supabase

Implementing real-world UX features (loyalty, support workflows)

Stripe PaymentSheet integration with proper state handling

Designing a tool-grounded AI assistant tied to live data

Clean separation between frontend, backend, and AI logic

📌 Notes for Reviewers
Project runs entirely in test mode

No secrets are committed

All features are accessible via the app UI

Final submission branch: submission/nevryk-takehome

markdown
Copy code
