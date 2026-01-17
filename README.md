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
