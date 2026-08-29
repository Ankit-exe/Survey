# 📋 SurveyFlow — Dynamic Survey Platform

A full-stack survey application built with **Next.js 14**, **Prisma**, **PostgreSQL**, **Zod**, and **NextAuth.js**. Create dynamic surveys with conditional logic, collect responses, and analyze data through a beautiful dashboard.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://postgresql.org)

---

## ✨ Features

### Admin Panel (Survey Builder)

- 🏗️ **Drag-and-drop** question reordering with `@dnd-kit`
- 📝 **4 question types**: Text, Multiple Choice, Checkbox, Rating (1–5)
- ⚡ **Conditional logic**: Show/hide questions based on previous answers
- ✅ **Required fields** toggle per question
- 📤 **Publish/unpublish** surveys with version tracking
- 📊 **Analytics dashboard** per survey

### Public Survey Form

- 🔓 **No login required** for respondents
- 🎯 **Real-time conditional rendering** — hidden questions excluded from submission
- ✔️ **Client + server validation** with Zod
- 📈 **Progress bar** showing completion percentage
- 🎉 **Success state** after submission

### Analytics Dashboard

- 📊 **Total response count** and daily trend chart
- 🔘 **Multiple Choice / Checkbox** → horizontal bar charts with option counts
- ⭐ **Rating** → average score + distribution bar chart
- 📝 **Text** → scrollable list of all responses

### Extra features

- 🔐 **JWT Authentication** (NextAuth.js v5 with credentials provider)
- 📌 **Survey versioning** (version bumps on every save)
- 💾 **Partial response saving** (save progress without submitting)
- 🛡️ **Rate limiting** (5 submissions/hour/IP with hashed IP storage)

---

## 🏗️ Tech Stack

| Layer       | Technology                    | Purpose                      |
| ----------- | ----------------------------- | ---------------------------- |
| Framework   | **Next.js 14** (App Router)   | SSR, API routes, routing     |
| Language    | **TypeScript**                | Type safety across codebase  |
| ORM         | **Prisma**                    | Database access + migrations |
| Database    | **PostgreSQL**                | Data persistence             |
| Validation  | **Zod**                       | Shared client/server schemas |
| Auth        | **NextAuth.js v5**            | JWT sessions + credentials   |
| Styling     | **Tailwind CSS** + custom CSS | Dark mode design system      |
| State       | **React Hook Form**           | Form state management        |
| Drag & Drop | **@dnd-kit**                  | Question reordering          |
| Charts      | **Recharts**                  | Analytics visualizations     |
| Deployment  | **Vercel** + **Neon**         | Serverless hosting           |

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)
- npm or pnpm

### 1. Clone & Install

```bash
git clone https://github.com/Ankit-exe/Survey.git
cd Survey
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/surveyflow"
AUTH_SECRET="your-secret-key"           # openssl rand -base64 32
NEXT_PUBLIC_APP_URL="http://localhost:3000"
HASH_SECRET="your-hash-secret"
```

### 3. Database Setup

**Option A — Docker (recommended for local dev):**

```bash
docker-compose up -d
```

**Option B — Neon (free cloud Postgres):**

1. Create account at [neon.tech](https://neon.tech)
2. Copy connection string to `DATABASE_URL`

**Run migrations:**

```bash
npm run db:push       # Push schema (dev)
# OR
npm run db:migrate    # Create migration files (production)
```

**Seed sample data:**

```bash
npm run db:seed
# Admin: admin@surveyflow.com / admin123
# Sample survey at: /s/employee-satisfaction
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/                    # Protected admin routes
│   │   ├── layout.tsx            # Auth guard + sidebar
│   │   ├── page.tsx              # Dashboard (survey list)
│   │   ├── login/page.tsx        # Login form
│   │   ├── register/page.tsx     # Registration form
│   │   └── surveys/
│   │       ├── new/page.tsx      # Create survey
│   │       └── [id]/
│   │           ├── edit/page.tsx     # Survey builder
│   │           └── analytics/page.tsx # Analytics
│   ├── s/[slug]/page.tsx         # Public survey form
│   ├── api/
│   │   ├── auth/                 # NextAuth + register
│   │   ├── surveys/              # Survey CRUD
│   │   └── responses/            # Submit + analytics
│   ├── layout.tsx                # Root layout + metadata
│   └── page.tsx                  # Landing page
├── components/
│   ├── admin/AdminSidebar.tsx    # Navigation sidebar
│   ├── survey-builder/           # Builder components
│   │   ├── SurveyBuilderClient.tsx    # Main builder
│   │   ├── SortableQuestionCard.tsx   # Individual question editor
│   │   ├── OptionsEditor.tsx          # MC/Checkbox options
│   │   └── ConditionalLogicEditor.tsx # Show/hide rules
│   ├── survey-form/
│   │   └── SurveyFormClient.tsx  # Public form renderer
│   └── analytics/
│       └── AnalyticsDashboardClient.tsx # Charts
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # NextAuth configuration
│   ├── rate-limit.ts             # In-memory rate limiter
│   ├── utils.ts                  # Shared utilities
│   └── validations/index.ts      # Zod schemas
├── middleware.ts                  # Route protection
prisma/
├── schema.prisma                 # DB models
└── seed.ts                       # Sample data
```

---

## 🔌 API Reference

| Method   | Endpoint                              | Auth      | Description                    |
| -------- | ------------------------------------- | --------- | ------------------------------ |
| `GET`    | `/api/surveys`                        | ✅ Admin  | List own surveys               |
| `POST`   | `/api/surveys`                        | ✅ Admin  | Create survey                  |
| `GET`    | `/api/surveys/[id]`                   | ✅ Admin  | Get survey with questions      |
| `PUT`    | `/api/surveys/[id]`                   | ✅ Admin  | Update survey (bumps version)  |
| `DELETE` | `/api/surveys/[id]`                   | ✅ Admin  | Delete survey                  |
| `GET`    | `/api/surveys/public/[slug]`          | 🔓 Public | Get published survey           |
| `POST`   | `/api/responses`                      | 🔓 Public | Submit response (rate-limited) |
| `GET`    | `/api/responses/[surveyId]/analytics` | ✅ Admin  | Analytics data                 |
| `POST`   | `/api/auth/register`                  | 🔓 Public | Create admin account           |

---

## 🏛️ Architecture Decisions

### 1. JSON Schema for Survey Questions

Survey questions are stored as structured Prisma relations (`Question` model) rather than one big JSON blob. This enables efficient querying, ordering, and per-question analytics via database aggregation.

### 2. Shared Zod Schemas

The same Zod schemas (`src/lib/validations/`) are used on both the API route handlers (server) and React Hook Form resolvers (client). This ensures validation logic is never duplicated and stays in sync automatically.

### 3. Conditional Logic as JSON on Questions

Each question stores its visibility conditions as a JSON array: `[{dependsOnId, operator, value}]`. This is flexible (multiple conditions per question), efficient (no extra table), and easy to evaluate client-side with a simple reduce loop.

### 4. Answers as JSON in Response Table

Response answers are stored as `{questionId: answer}` JSON in the `Response.answers` field. This allows any question type and schema to be answered without per-question-type DB tables.

### 5. Server Components + Client Islands

The admin dashboard, analytics, and public survey page are server components that fetch data at request time. The survey builder, form, and charts are client components (islands). This minimizes JavaScript bundle size for data-heavy pages.

### 6. In-Memory Rate Limiting

For simplicity and demo purposes, rate limiting uses an in-memory store. In production, replace with **Upstash Redis** + `@upstash/ratelimit` for distributed, persistent rate limiting across serverless instances.

---

## ⚖️ Trade-offs & Assumptions

| Decision                               | Trade-off                                   | Rationale                                   |
| -------------------------------------- | ------------------------------------------- | ------------------------------------------- |
| Delete + re-create questions on update | Data loss if response IDs mismatch          | Simpler than diffing; versioning mitigates  |
| In-memory rate limit                   | Resets on restart, doesn't work distributed | Fast to implement; swap Redis in production |
| No email verification                  | Security risk                               | Demo scope; can add Resend/Nodemailer       |
| Client-side conditional logic          | Logic lives in two places (builder + form)  | UX requires real-time evaluation            |
| `nanoid` slugs (10 chars)              | Collision possible at extreme scale         | ~10^15 combinations — fine for demo         |

---

## 📝 License

MIT
