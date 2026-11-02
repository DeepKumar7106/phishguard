# PhishGuard 🛡️

PhishGuard is a full-stack, real-time scam and phishing detection engine and audit registry. It flags fraudulent job postings, onboarding fee demands, suspicious educational programs, and domain/messaging pivots targeting users for financial exploitation. Powered by hybrid rule-based heuristics and local AI/LLM models, PhishGuard provides rapid threat scoring and public reporting.

---

## 🏗️ Architecture & Tech Stack

- **Frontend:** React (Vite), React Router, Tailwind CSS, Axios
- **Backend:** Node.js, Express.js (REST API)
- **Database:** Neon PostgreSQL (Serverless DB)
- **ORM:** Prisma Client & Migrations
- **Caching & Rate Limiting:** Upstash Redis
- **AI/LLM Engine:** Ollama (Local/Cloud Qwen model deployment)
- **Hosting:** Vercel (Frontend SPA), Render (Backend API)

---

## 🚀 Key Features

- **Multi-Vector Scam Analysis:** Detects common scam patterns including training fee scams, suspicious Telegram/WhatsApp pivots, and fake university portal phishing.
- **Hybrid Threat Scoring:** Combines heuristic/regex checks with LLM context analysis for rapid, accurate risk assessments.
- **Redis Caching & Rate Limiting:** Accelerates response times for recurring URL/text lookups and prevents API abuse.
- **Auditing & Metrics:** Stores persistent scam logs, public reports, and verification metrics in Neon PostgreSQL.

---

## 🛠️ Repository Structure

```text
phishguard/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database models & provider configuration
│   │   └── migrations/         # PostgreSQL migration history
│   ├── src/
│   │   ├── index.js            # Express application entry & CORS middleware
│   │   ├── routes/             # API endpoints
│   │   └── services/           # Redis & Ollama clients
│   ├── render.yaml             # Render infrastructure deployment blueprint
│   └── package.json
└── frontend/
    ├── src/                    # React components & page views
    ├── vercel.json             # Vercel SPA routing rules
    └── package.json
```

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- **Node.js:** `v18+`
- **Database:** Neon PostgreSQL connection strings (`DATABASE_URL`, `DIRECT_URL`)
- **Cache:** Upstash Redis instance (`REDIS_URL`)
- **LLM Engine:** Ollama installed and running locally (`qwen` or similar model)

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file inside `backend/`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@ep-pooler.region.aws.neon.tech/neondb?sslmode=require"
   DIRECT_URL="postgresql://user:password@ep-direct.region.aws.neon.tech/neondb?sslmode=require"
   REDIS_URL="rediss://default:token@your-upstash-redis.upstash.io:6379"
   OLLAMA_HOST="http://127.0.0.1:11434"
   CORS_ORIGIN="http://localhost:5173"
   ```

3. Run database migrations & generate the Prisma client:
   ```bash
   npx prisma migrate dev --name init_neon_postgres
   npx prisma generate
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   npm install
   ```

2. Create a `.env` file inside `frontend/`:
   ```env
   VITE_BACKEND_URL="http://localhost:5000"
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## 🌐 Production Deployment Guide

### Backend (Render)
- **Root Directory:** `backend`
- **Build Command:** `npm install && npx prisma generate`
- **Pre-Deploy Command:** `npx prisma migrate deploy`
- **Start Command:** `npm start`
- **Environment Variables:** Set `DATABASE_URL`, `DIRECT_URL`, `REDIS_URL`, `OLLAMA_HOST`, and `CORS_ORIGIN` (pointing to your Vercel URL).

### Frontend (Vercel)
- **Root Directory:** `frontend`
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:** Set `VITE_BACKEND_URL` (pointing to your Render API URL).

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Uptime check endpoint for monitor pings |
| `POST` | `/api/analyze` | Submit a link or text payload for scam detection |
| `GET` | `/api/reports` | Retrieve latest public scam reports |

---

## 📝 License

This project is open-source under the [MIT License](LICENSE).