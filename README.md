# AuraFit: Premium Health & Fitness Tracker

AuraFit is a modern, high-performance, fully responsive, and gamified Health & Fitness Tracker web application designed to help users monitor workouts, nutrition, body metrics, habits, and fitness goals with rich analytics and automated achievements.

---

## 🚀 Key Features

*   **Interactive Dashboard Overview**: Monitor daily calories balance, active workout burn rates, habit routines progress, and streaks at a glance.
*   **Workout Management**: Browse a categorized global exercise library, create custom workouts, log reps, sets, and weights, and review training history.
*   **Nutrition Macro Tracker**: Search food databases, create custom foods, log servings per meal (Breakfast, Lunch, Dinner, Snacks), and monitor proteins, carbs, and fats.
*   **Habit Builder**: Build consistent routines with consecutive streak logs, best streak tracking, and a GitHub-style 30-day completion grid.
*   **Body Circumferences & Metrics**: Log body weight, fat percentage, chest, waist, hips, arms, thighs, and view auto-calculated BMI classifications.
*   **Analytics & Recommendations Engine**: Interactive data trend charts (weight, calorie balances, macro breakdowns) powered by **Recharts**, with smart wellness tips.
*   **Privacy & Data Export**: Download a full backup of all your workouts, calories, and milestones in a structured JSON package.
*   **Admin Console**: Manage global platform stats, view registered users, and promote or demote user roles.

---

## 🛠 Tech Stack

*   **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
*   **Database**: PostgreSQL + Prisma Client v6 (with schema migrations & seeds)
*   **Authentication**: Auth.js (NextAuth Beta Credentials provider with bcrypt hashing)
*   **Styling**: Tailwind CSS v4 + Lucide Icons + Framer Motion (premium glassmorphism)
*   **Charts & Visuals**: Recharts (fully responsive canvas overlays)
*   **Form Validation**: React Hook Form + Zod schemas
*   **E2E Tests**: Playwright Test Runner

---

## 📦 Getting Started

### 1. Prerequisite Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/health_fitness?schema=public"
AUTH_SECRET="your_32_character_nextauth_secret_key"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Migration & Seeding
Start your PostgreSQL database, run the Prisma migration, and seed the initial exercises and test accounts:
```bash
npx prisma migrate dev
npx prisma db seed
```
*Note: Seeding creates an Admin account (`admin@tracker.com` / password: `Password123`) and standard user accounts for quick testing.*

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🐳 Docker Deployment

You can package and deploy AuraFit locally using the multi-stage `Dockerfile` and `docker-compose.yml`:

```bash
# Start Postgres database & Next.js application containers
docker-compose up --build -d
```
The application will build inside the container environment and launch at [http://localhost:3000](http://localhost:3000).

---

## 🧪 Running E2E Tests

We use Playwright to verify authentication, registration, dashboard updates, and page navigation.

```bash
# Install Playwright browser dependencies (if not done)
npx playwright install chromium

# Run the test suite (ensure Next.js app is running on port 3000)
npx playwright test
```
