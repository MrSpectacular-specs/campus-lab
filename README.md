# CampusLab — Institutional Project-Based Learning Platform

<p align="center">
  <img src="public/brand/campuslab-logo.svg" alt="CampusLab — New Generation" width="280" />
</p>

<p align="center">
  <strong>Production-grade accredited engineering project lifecycle management for higher education institutions.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/SQLite-WAL_Mode-003B57?logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white" alt="Vercel Ready" />
</p>

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Architecture](#2-system-architecture)
3. [Core Workspaces & Route Matrix](#3-core-workspaces--route-matrix)
4. [Technology Stack](#4-technology-stack)
5. [Local Development](#5-local-development)
6. [Demo Accounts](#6-demo-accounts)
7. [Deployment Guide](#7-deployment-guide)
   - [Deploying to Vercel (Recommended for Web/Serverless)](#option-a-deploying-to-vercel)
   - [Deploying via Vercel CLI](#deploying-via-vercel-cli)
   - [Deploying as Standalone Full-Stack Node.js (Docker / VPS / Render / Railway)](#option-b-deploying-as-standalone-full-stack-nodejs)
   - [Decoupled Architecture (Vercel Frontend + Dedicated Backend)](#option-c-decoupled-architecture)
8. [Vercel Configuration (`vercel.json`)](#8-vercel-configuration-verceljson)
9. [Environment Variables](#9-environment-variables)
10. [Database Schema & Migrations](#10-database-schema--migrations)
11. [Verification & Test Automation](#11-verification--test-automation)
12. [Brand Identity Assets](#12-brand-identity-assets)

---

## 1. Overview

CampusLab is a unified full-stack application designed to structure academic engineering projects into an accredited, milestone-driven workflow. It connects university leadership (Deans / Admins), faculty coordinators, industry practitioners (Mentors), and students in an immutable, auditable execution pipeline:

```
[01 Project Brief] → [02 Mentor Allocation] → [03 Sprint Milestones] → [04 Rubric Defense] → [05 Compliance Audit]
```

### Key Capabilities

- **Institutional Control Center:** Multi-cohort telemetry, automated bottleneck detection ("Needs Attention"), and annual commercial licensing management.
- **Accredited ABET/NBA Evaluation:** Multi-dimensional scoring rubrics, weighted milestone defense scoring, and tamper-resistant audit logs.
- **Industry Practitioner Guidance:** Submissions review queue, milestone feedback history, and code repository inspection.
- **Student Engineering Workspace:** Sprint execution roadmaps, deliverable submissions with pull-request links, and milestone pacing telemetry.
- **Official Brand Design System:** Obsidian canvas (`#050505`), Chalk white typography (`#F5F5F5`), Precision Teal accents (`#14B8A6`), and dynamic PrismFold WebGL ambient shaders.

---

## 2. System Architecture

### Local Full-Stack Architecture

```
┌────────────────────────────────────────────────────────┐
│               React Frontend (Vite 8)                  │
│       Port 5174 • TypeScript • Tailwind CSS • Lucide   │
└──────────────────────────┬─────────────────────────────┘
                           │ REST API calls (/api/*)
                           │ HTTP-only Cookies
                           ▼
┌────────────────────────────────────────────────────────┐
│               Express Backend (Node.js)                │
│       Port 3001 • TypeScript • Cookie-Parser • CORS    │
└──────────────────────────┬─────────────────────────────┘
                           │ better-sqlite3 (WAL Mode)
                           ▼
┌────────────────────────────────────────────────────────┐
│               SQLite Relational Database               │
│               server/data/campuslab.db                 │
└────────────────────────────────────────────────────────┘
```

### Vercel Serverless Architecture

```
                                Vercel Edge Network
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     Static Assets & SPA Routes                           API Routes (/api/*)
  ┌───────────────────────────────┐               ┌───────────────────────────────┐
  │      Vite Production Build    │               │  Vercel Serverless Function   │
  │            (dist/)            │               │         (api/index.ts)        │
  │     Client-Side React Router  │               │      Express 5 Application    │
  └───────────────────────────────┘               └───────────────┬───────────────┘
                                                                  │
                                                                  ▼
                                                  ┌───────────────────────────────┐
                                                  │   SQLite (Ephemeral /tmp)     │
                                                  │    or Managed Turso / Cloud   │
                                                  └───────────────────────────────┘
```

---

## 3. Core Workspaces & Route Matrix

| Route | Access | Role / Purpose |
|---|---|---|
| `/` | Public | Full-viewport product storytelling landing page & workflow demo |
| `/login` | Public | Authentication with 1-click demo credential autofill |
| `/signup` | Public | User self-registration with dynamic institutional affiliation |
| `/projects` | Public | Curated Project Library with keyword search & domain filtering |
| `/projects/:id` | Public / Role-Aware | 8-stage interactive project specification, milestone roadmap & defense rubric |
| `/for-colleges` | Public | Institutional governance overview & pilot request workflow |
| `/dashboard` | **Protected (Admin)** | University overview, 6 KPI cards, bottleneck alerts, license terms |
| `/dashboard/projects` | **Protected (Admin)** | Operational cohort pipeline table, progress tracking, status transitions |
| `/dashboard/mentoring` | **Protected (Admin)** | Supervising mentor directory, unassigned cohort queue, assignment modal |
| `/dashboard/evaluation` | **Protected (Admin)** | Accredited defense rubric registry and average cohort score ledger |
| `/dashboard/settings` | **Protected (Admin)** | Annual commercial license value, platform utilization, tenant UID |
| `/faculty` | **Protected (Faculty/Admin)** | Faculty project coordination dashboard and cohort status |
| `/faculty/teams` | **Protected (Faculty/Admin)** | Student team rosters and milestone allocation |
| `/faculty/milestones` | **Protected (Faculty/Admin)** | Sprint roadmap configuration and deadline management |
| `/faculty/evaluation` | **Protected (Faculty/Admin)** | Examiner defense evaluation pipeline and score entry |
| `/mentor` | **Protected (Mentor)** | Assigned supervisory engineering briefs |
| `/mentor/submissions` | **Protected (Mentor)** | Student deliverable review queue & architecture critique |
| `/mentor/feedback` | **Protected (Mentor)** | Historical guidance and checkpoint feedback ledger |
| `/mentor/evaluation` | **Protected (Mentor)** | Defense rubric scoring and qualitative assessments |
| `/student` | **Protected (Student)** | Enrolled engineering cohorts and project overview |
| `/student/milestones` | **Protected (Student)** | Sprint roadmap, overdue tracking, deliverable submissions |
| `/student/feedback` | **Protected (Student)** | Review comments and marks from industry supervisors |
| `/reports` | **Protected (Admin/Faculty)** | Accreditation compliance, submission verification, status distribution |

---

## 4. Technology Stack

- **Client Runtime:** React 19 (`react`, `react-dom`), React Router v7 (`react-router-dom`)
- **Build Tooling:** Vite 8, Rolldown / esbuild, TypeScript 6
- **Styling & Effects:** Tailwind CSS 3.4, Custom PrismFold WebGL Shaders, Lucide React icons
- **Server Framework:** Express 5 (`express`, `cookie-parser`, `cors`)
- **Server Runtime:** Node.js with native ES Modules (`"type": "module"`), `tsx` execution
- **Database Engine:** SQLite 3 via `better-sqlite3` (WAL mode, foreign key enforcement)
- **Security:** `bcryptjs` password hashing, HTTP-only `SameSite=Lax` session cookies

---

## 5. Local Development

### Prerequisites

- Node.js 18.x or higher (Node.js 20+ LTS recommended)
- npm 9.x or higher

### Installation

```bash
# 1. Clone or navigate to the repository
cd CampusLab

# 2. Install all dependencies
npm install

# 3. Start both backend and frontend concurrently
npm run dev
```

The application will be live at:
- **Frontend:** [http://localhost:5174](http://localhost:5174)
- **Backend API:** [http://localhost:3001/api](http://localhost:3001/api) (automatically proxied via Vite at `http://localhost:5174/api`)

### Database Initialization

On initial launch, the server automatically checks if the database is populated. If empty, it automatically seeds 1 institution, 4 role users, 10 engineering project briefs, milestones, submissions, and evaluation rubrics.

To manually re-seed the database at any time:

```bash
npm run seed
```

---

## 6. Demo Accounts

The login screen ([http://localhost:5174/login](http://localhost:5174/login)) features 1-click autofill buttons for each role:

| Role | Email | Password | Primary Workspace |
|---|---|---|---|
| **Admin (Dean)** | `admin@campuslab.dev` | `Admin@123` | `/dashboard` |
| **Faculty Coordinator** | `faculty@campuslab.dev` | `Faculty@123` | `/faculty` |
| **Industry Mentor** | `mentor@campuslab.dev` | `Mentor@123` | `/mentor` |
| **Student** | `student1@campuslab.dev` | `Student@123` | `/student` |

---

## 7. Deployment Guide

### Option A: Deploying to Vercel

CampusLab is pre-configured with `vercel.json` and a serverless entrypoint in `api/index.ts`.

#### Method 1: Via Vercel Web Dashboard (1-Click Git Integration)

1. Push your CampusLab repository to GitHub, GitLab, or Bitbucket.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Click **"Add New..."** → **"Project"** and import your CampusLab repository.
4. Vercel automatically detects the configuration:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. In **Environment Variables**, add:
   ```env
   NODE_ENV=production
   ```
6. Click **Deploy**. Vercel will build the frontend assets, bundle the serverless API function, and deploy your live URL.

#### Method 2: Deploying via Vercel CLI

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to your Vercel account
vercel login

# 3. Deploy preview build
vercel

# 4. Deploy production build
vercel --prod
```

> **Note on Serverless SQLite Storage:**
> In serverless environments (Vercel Functions), the file system outside `/tmp` is read-only. CampusLab's `server/db/database.ts` automatically detects the Vercel environment (`process.env.VERCEL`) and initializes the database at `/tmp/campuslab-data/campuslab.db`, auto-seeding it on cold starts.
> For long-term persistent production data across serverless cold starts, you can connect CampusLab to Turso (libSQL/SQLite over HTTP), Supabase (PostgreSQL), or use Option B below.

---

### Option B: Deploying as Standalone Full-Stack Node.js

Ideal for institutional servers, Docker, Render, Railway, Fly.io, or dedicated Ubuntu VPS instances where SQLite persists permanently on disk.

```bash
# 1. Build the production client bundle
npm run build

# 2. Start the production server
npm start
```

#### Production Systemd Service Example (Ubuntu/Debian)

```ini
[Unit]
Description=CampusLab Academic Platform
After=network.target

[Service]
Type=simple
User=campuslab
WorkingDirectory=/var/www/campuslab
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
```

#### Nginx Reverse Proxy Configuration

```nginx
server {
    listen 80;
    server_name campuslab.your-university.edu;

    # Serve static assets with aggressive caching
    location /assets/ {
        alias /var/www/campuslab/dist/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API and WebSocket requests to Express
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA Client Routing fallback
    location / {
        root /var/www/campuslab/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

---

### Option C: Decoupled Architecture

Deploy the Vite React frontend to Vercel's global Edge CDN, and host the Express Node.js backend on a dedicated server (e.g., AWS EC2, DigitalOcean, or University Data Center).

1. In the client, configure `VITE_API_URL` to point to `https://api.campuslab.your-university.edu`.
2. Configure CORS in `server/app.ts` to allow your Vercel frontend domain.
3. Deploy the frontend repository directly to Vercel as a standard Vite project.

---

## 8. Vercel Configuration (`vercel.json`)

The included `vercel.json` provides production routing, serverless execution, and security headers:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    },
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/brand/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=86400, stale-while-revalidate=604800"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

## 9. Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3001` | Backend HTTP listening port |
| `NODE_ENV` | `development` | Environment mode (`development` / `production`) |
| `DATABASE_DIR` | `server/data` | Custom directory path for the SQLite database file |
| `DATABASE_PATH` | `server/data/campuslab.db` | Explicit path override for `campuslab.db` |
| `SESSION_SECRET` | *(auto)* | Secret key for signed cookie verification |

---

## 10. Database Schema & Migrations

The relational schema is defined in `server/db/schema.sql` and includes 11 relational entities:

1. **`institutions`** — Academic tenant registry, licensing tier, annual value (`₹2,40,000 / year`), student/mentor capacities.
2. **`users`** — Identity profiles, bcrypt password hashes, and RBAC roles (`admin`, `faculty`, `mentor`, `student`).
3. **`sessions`** — Server-validated HTTP-only session tokens with expiration timestamps.
4. **`projects`** — Engineering problem briefs, category, domain, difficulty, duration, skills, objectives, target outcomes.
5. **`project_members`** — Enrolled student teams and faculty coordinators.
6. **`mentor_assignments`** — Industry practitioner supervisor allocations.
7. **`milestones`** — Structured deliverable sprint specifications.
8. **`milestone_submissions`** — Student deliverables, code repository links, and PR references.
9. **`mentor_feedback`** — Architecture advice, critique notes, and milestone approvals.
10. **`evaluation_criteria`** — ABET/NBA defense rubric dimensions and percentage weights.
11. **`evaluation_results`** — Formal defense marks and examiner scorecards.

---

## 11. Verification & Test Automation

CampusLab includes 4 automated verification test suites totaling **90 comprehensive integration and security checks**:

```bash
# Run all test suites in a single command
npm run test:all
```

Or execute individual suites:

```bash
# 1. Dedicated Routes & Endpoints Verification (22 tests)
node scripts/test-all-routes.mjs

# 2. Role Authorization & Cross-Role Security Boundary Tests (22 tests)
node scripts/test-authorization.mjs

# 3. Navbar Role Awareness & Active Route Evaluator Tests (22 tests)
node scripts/test-navbar-roles.mjs

# 4. Admin Control Center & Operational Pipeline Tests (24 tests)
node scripts/test-admin-control-center.mjs
```

### Build Verification

```bash
# Verify TypeScript strict type-checking across project references
npx tsc -b

# Verify production Vite build
npm run build
```

---

## 12. Brand Identity Assets

CampusLab uses the official brand identity located in `public/brand/`:

- **Official Symbol:** Integrated academic graduation cap, central planetary orbit, institutional building silhouette, and science flask.
- **Component:** `src/components/BrandLogo.tsx` provides reusable `full`, `compact`, `mark`, and `wordmark` variants with sizes `sm`, `md`, and `lg`.
- **Favicon:** Square badge with the official symbol mark at `public/favicon.svg`.

---

## License & Governance

CampusLab is proprietary academic enterprise software designed for institutional deployment under commercial annual licensing contracts.
