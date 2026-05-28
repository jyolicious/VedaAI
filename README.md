# VedaAI — AI Assessment Creator

> Internship Assignment | Full-Stack AI-Powered Question Paper Generator

## Architecture Overview

```
frontend/          Next.js 14 + TypeScript + Zustand + WebSocket
backend/           Node.js + Express + TypeScript
  ├─ MongoDB       Stores assignments & generated papers
  ├─ Redis         Caching + job state tracking
  ├─ BullMQ        Background job processing (AI generation, PDF export)
  └─ WebSocket     Real-time progress updates to frontend
AI Engine          Claude API (Anthropic) with structured prompt engineering
```

## Flow

```
Teacher fills form → POST /api/assignments
→ BullMQ job queued → Worker calls Claude API
→ Structured JSON parsed → Stored in MongoDB
→ WebSocket event pushed → Frontend renders paper
```

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or Upstash)
- Anthropic API Key

### Backend

```bash
cd backend
cp .env.example .env       # Fill in your keys
npm install
npm run dev                # Starts on :4000
```

### Frontend

```bash
cd frontend
cp .env.example .env.local # Fill in backend URL
npm install
npm run dev                # Starts on :3000
```

### Environment Variables

**Backend `.env`:**
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

## Key Design Decisions

- **Zustand** for global state (assignments list, active generation job, WebSocket connection status)
- **BullMQ** decouples HTTP request from slow AI generation — user gets instant response, paper arrives via WebSocket
- **Structured prompting** — AI returns typed JSON (`sections[]` with `questions[]`), never rendered raw
- **Redis** caches generated papers for 1 hour, reducing repeat AI calls
- **PDF export** uses Puppeteer in a separate BullMQ queue (no blocking the main thread)

## Bonus Features
- Real-time generation progress (WebSocket progress events)
- PDF download (server-side rendered, properly formatted)
- Difficulty badges (Easy / Moderate / Hard) with color coding
- Regenerate action on the output page
- Mobile-responsive layout