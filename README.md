🍔 Food Ordering App

Expo · React Native · Supabase · Stripe (Test Mode)

This repository contains my take-home submission for the Food Ordering App.
The project is a full-stack mobile application built using Expo Router with a Supabase backend, Stripe test payments, and an optional AI Order Assistant.

All work is finalized and submitted on the submission branch.

🔀 Branch to Review (Final Submission)

Branch: submission/nevryk-takehome (default)

If running locally:

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

Product details and size selection

Cart management (add, update, remove items)

Secure checkout using Stripe test payments

View order history

Customer support ticket submission

Admin Features

Product management

View and manage support tickets

Close resolved tickets

✨ Custom Features Implemented
1️⃣ Best Seller Badge

Popular products are highlighted with a “Best Seller” badge on the menu screen to improve product visibility and user experience.

2️⃣ Loyalty Reward System

A built-in customer loyalty feature:

Displays order progress (1 → 5) in the UI

After completing 5 successful orders, the 6th order automatically receives 50% off

Progress and reward state update dynamically for the logged-in user

3️⃣ Customer Support Ticket System

A complete user → admin support workflow:

Users submit tickets with subject and message

Tickets are stored in Supabase and linked to the user

Admin can:

View all tickets

See ticket metadata (user, timestamp, status)

Mark tickets as Closed

🤖 AI Order Assistant (Optional Feature)

This project includes an AI Order Assistant that helps users interact with the menu and cart using natural language.

Key Characteristics

Built using Mastra Agent

Tool-grounded (no hallucinated menu items)

All recommendations come from real Supabase products

Cart changes persist to Supabase and sync with the app UI

Supports multi-turn conversations

Example Capabilities

“Show me pizza options”

“Add the first one to my cart”

“Show my cart”

“Update the quantity”

“Remove that item”

The assistant interacts with the same cart used by the mobile app, ensuring consistency between AI actions and UI state.

📂 Project Structure
food-ordering-app/
├── src/            # Expo mobile app
├── backend/        # Node + Express + AI Assistant
├── supabase/       # Supabase schema & migrations
├── .env.example    # Environment variable template
└── README.md

▶️ Running the App Locally
1️⃣ Install Dependencies
npm install

2️⃣ Environment Setup

Create a .env file from the template:

cp .env.example .env


Fill in the required values:

EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key


.env is intentionally not committed.
.env.example is provided as a reference.

3️⃣ Start the App
npx expo start -c


Expo does not automatically reload environment variables.
Always restart with -c after modifying .env.

💳 Stripe Test Payments

Use the following test card during checkout:

Card Number: 4242 4242 4242 4242

Expiry Date: Any future date

CVC: 123

ZIP: 12345

📚 What I Learned

Structuring a production-ready Expo Router application

Managing authentication, data, and storage with Supabase

Implementing real-world UX features like loyalty rewards and support workflows

Integrating Stripe test payments with proper state handling

Designing a tool-grounded AI assistant that safely interacts with live data

Keeping frontend, backend, and AI logic cleanly separated

📌 Notes for Reviewers

Project runs entirely in test mode

No secrets are committed to the repository

All features are implemented and accessible through the app UI

Final submission branch: submission/nevryk-takehome
