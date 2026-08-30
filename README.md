# PIVON — Lead Response System for Real Estate Builders

A full-stack, enterprise-ready web platform for **PIVON** — an AI-powered lead-response automation agency for real estate builders in Indore.

The system combines a **cinematic 3D marketing experience** (Three.js / React Three Fiber / GSAP) with a **scalable, enterprise-grade backend** powered by **Next.js 14, NextAuth.js, Prisma ORM, and PostgreSQL (Supabase)**.

---

## 🌟 Overview & Key Features

- **Instant Lead Response Demo**: Interactive live demonstration of lead qualification with real-time feedback.
- **Enterprise-Grade Database**: Powered by **PostgreSQL** (hosted on Supabase) to handle thousands of concurrent users, visitors, and leads with high performance and zero data loss.
- **User Authentication (Sign Up & Log In)**: Complete authentication flow via **NextAuth.js** (Credentials Provider + JWT sessions + bcrypt password hashing).
- **Rich Lead & User Profile Data**: Captures comprehensive user/lead information:
  - Full Name
  - Email Address
  - Phone / Mobile Number
  - Location (City / State)
  - Business / Company Details
  - Motive / Objective (What automation they need)
  - Project Interest
- **Admin Management APIs**: Protected API endpoints to retrieve user lists, lead records, and dashboard performance metrics.
- **Visitor Analytics**: Silent session and scroll-depth tracking via `sendBeacon` and IP logging.
- **Dual-Engine Frontend**: Automatic hardware detection (`shouldUseLiteMode()`) routes lower-power mobile devices to a lightweight 2D CSS background while high-end devices enjoy full 3D brass skyline visuals.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Purpose & Benefits |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | React Server Components, API routes, SSR, optimized image & asset handling |
| **Language** | TypeScript 5 | End-to-end type safety across database models, API handlers, and UI components |
| **Database** | PostgreSQL (Supabase / Neon / Railway) | Relational database built for high concurrency, relational integrity, and enterprise scale |
| **ORM** | Prisma (v5.17) | Type-safe query builder, migrations, indexing, and connection management |
| **Authentication** | NextAuth.js + `@next-auth/prisma-adapter` | JWT-based authentication, bcrypt password hashing, secure session management |
| **3D Rendering** | Three.js + React Three Fiber + `@react-three/drei` | Declarative 3D scene, procedural skyline, brass shaders, performance monitoring |
| **Scroll Sync** | Lenis + GSAP ScrollTrigger | Smooth frame-budget scroll smoothing synchronized with 3D camera rig |
| **UI & Motion** | Framer Motion + Tailwind CSS | Fluid glassmorphism cards, section reveals, micro-animations |
| **Email Service** | Resend (Optional) | Instant notification dispatch to sales team when leads/users convert |

---

## 📁 Project Structure

```
pivon/
├── app/
│   ├── layout.tsx                 # Root layout with fonts, grain overlay & SEO metadata
│   ├── page.tsx                   # Main landing page combining 3D background & sections
│   ├── globals.css                # Custom CSS design system (tokens, glassmorphism, forms)
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/     # NextAuth.js authentication handler
│       │   └── register/          # User sign-up / registration API endpoint
│       ├── leads/                 # Lead capture API endpoint (with rate limiting & validation)
│       │   └── route.ts
│       ├── visitors/              # Silent visitor session analytics endpoint
│       │   └── route.ts
│       └── admin/                 # Protected admin data endpoints
│           ├── users/             # GET /api/admin/users (paginated user directory)
│           ├── leads/             # GET /api/admin/leads (paginated lead directory)
│           └── stats/             # GET /api/admin/stats (analytics & growth trends)
├── components/
│   ├── canvas/                    # 3D canvas experience components
│   │   ├── ExperienceRoot.tsx     # Hardware check switcher (3D vs 2D fallback)
│   │   ├── Scene.tsx              # Three.js canvas setup, lighting, postprocessing
│   │   ├── Skyline.tsx            # Instanced mesh procedural towers & shaders
│   │   ├── CameraRig.tsx          # Scroll-synced camera animation path
│   │   └── LiteBackground.tsx     # 2D SVG/gradient fallback for low-power devices
│   ├── sections/                  # UI sections (Hero, ProblemSolution, HowItWorks, etc.)
│   └── ui/                        # Reusable UI controls (LeadForm, MagneticButton, CountUp)
├── lib/
│   ├── auth.ts                    # NextAuth configuration & Credentials provider logic
│   ├── prisma.ts                  # Global Prisma client singleton instance
│   ├── lenis.ts                   # Smooth scroll engine configuration
│   ├── gsap.ts                    # GSAP & ScrollTrigger setup
│   └── utils.ts                   # Utility functions & WebGL2 performance detector
├── prisma/
│   └── schema.prisma              # PostgreSQL database schema & indexing setup
├── public/                        # Static assets (textures, videos, icons)
├── .env.example                   # Environment configuration template
├── package.json                   # Dependencies and npm scripts
└── README.md                      # Comprehensive documentation
```

---

## 📊 Database Schema

The system uses a production-ready PostgreSQL database schema defined in `prisma/schema.prisma`:

### Models Overview

1. **`User`**: Registered accounts storing user details.
   - `id`, `name`, `email` (unique), `password` (bcrypt hashed), `phone`, `location`, `business`, `motive`, `createdAt`, `updatedAt`
2. **`Lead`**: Demo form submissions and inbound sales enquiries.
   - `id`, `name`, `email`, `company`, `phone`, `location`, `business`, `motive`, `intent`, `source`, `createdAt`
3. **`Account` / `Session` / `VerificationToken`**: NextAuth.js standard tables for OAuth and JWT session management.
4. **`VisitorEvent`**: Behavioral engagement metrics.
   - `id`, `event` (`session_start` | `session_end`), `scrollDepth`, `durationMs`, `userAgent`, `ip`, `createdAt`

---

## 🔌 API Documentation

### Authentication Endpoints

#### 1. `POST /api/auth/register`
Creates a new user account.
- **Request Body**:
  ```json
  {
    "name": "Rajesh Kumar",
    "email": "rajesh@shreebuilders.com",
    "password": "SecurePassword123!",
    "phone": "+91 98765 43210",
    "location": "Indore, MP",
    "business": "Real Estate Developer",
    "motive": "Automate WhatsApp lead response for 3 projects"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "ok": true,
    "user": {
      "id": "clx...",
      "name": "Rajesh Kumar",
      "email": "rajesh@shreebuilders.com"
    }
  }
  ```

#### 2. `POST /api/auth/callback/credentials` (NextAuth)
Logs in an existing user using NextAuth credentials handler.

---

### Lead & Analytics Endpoints

#### 3. `POST /api/leads`
Captures demo form submission or landing page lead. Includes IP rate-limiting (10 requests/minute).
- **Request Body**:
  ```json
  {
    "name": "Rajesh Kumar",
    "email": "rajesh@shreebuilders.com",
    "company": "Shree Builders",
    "phone": "+91 98765 43210",
    "location": "Indore, MP",
    "business": "Real Estate Builder",
    "motive": "Instant WhatsApp follow-up",
    "intent": "Green Valley Phase 2"
  }
  ```

#### 4. `POST /api/visitors`
Silent beacon logging for session tracking and scroll depth.

---

### Protected Admin Endpoints

All admin endpoints require an authenticated session matching the `ADMIN_EMAIL` configured in `.env`.

- `GET /api/admin/users?page=1&limit=50`: Paginated list of registered users.
- `GET /api/admin/leads?page=1&limit=50`: Paginated list of captured leads.
- `GET /api/admin/stats`: Summary statistics, total counts, growth trends (24h, 7d, 30d), and recent activity logs.

---

## 🚀 Setup & Local Development Guide

### Prerequisites
- Node.js 18.x or 20.x
- npm / yarn / pnpm
- A PostgreSQL database instance (Free account on [Supabase](https://supabase.com), [Neon](https://neon.tech), or local Postgres)

### Step 1: Clone & Install Dependencies
```bash
cd pivon
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Update `.env` with your actual PostgreSQL connection string and secret keys:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secure-random-secret-key"
ADMIN_EMAIL="admin@pivon.ai"
```

> **Tip**: Generate a strong `NEXTAUTH_SECRET` in PowerShell or terminal using:
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Step 3: Run Database Migrations
Initialize the PostgreSQL schema with Prisma:
```bash
npx prisma db push
```
Or create a versioned migration:
```bash
npx prisma migrate dev --name init_postgres
```

Generate Prisma Client:
```bash
npx prisma generate
```

### Step 4: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Enterprise Deployment Guide

### Deploying to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the repository into **Vercel**.
3. Configure the Environment Variables in Vercel project settings:
   - `DATABASE_URL`: Your production PostgreSQL connection string (use Supabase Transaction Pooler port `6543` for serverless environments if using pooled connections).
   - `NEXTAUTH_URL`: Your custom domain (e.g., `https://pivon.agency`).
   - `NEXTAUTH_SECRET`: Your production secret.
   - `ADMIN_EMAIL`: Designated admin email address.
   - `RESEND_API_KEY`: (Optional) Resend API key for instant lead alert emails.
4. Set the Build Command: `npm run build` (Next.js automatically executes `prisma generate` during `postinstall`).
5. Click **Deploy**.

---

## 🔒 Security & Performance Features

1. **Password Security**: Passwords stored using `bcryptjs` with salt factor of 12.
2. **API Rate Limiting**: In-memory sliding window rate limiter protects endpoints from spam and automated bot submissions.
3. **Database Indexing**: High-query fields (`email`, `createdAt`, `userId`, `event`) are indexed for fast lookup even with millions of records.
4. **Resilient Error Handling**: Form components provide clear visual error notifications without hanging or failing silently.
5. **Serverless Optimized**: Global Prisma Client singleton prevents connection pool exhaustion in serverless Next.js API routes.

---

## 📄 License & Attribution

Designed and developed for **PIVON Agency** (Indore, Madhya Pradesh). All rights reserved.
