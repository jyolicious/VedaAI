# VedaAI

A full-stack AI teaching assistant for creating assignments, managing resources, and supporting teacher workflows.

## What this repo contains

- `frontend/` — Next.js + TypeScript app
- `backend/` — Express + TypeScript API
- `backend/public/library` — public file storage for uploaded library assets

## Key features

- Teacher dashboard pages with a sidebar:
  - `/assignments`
  - `/library`
  - `/toolkit`
- Public routes without sidebar:
  - `/login`
  - `/signup`
- Library upload flow with title support and download links
- Authenticated API access using JWT tokens
- Background paper generation using BullMQ and Redis

## Requirements

- Node.js 18+
- MongoDB running locally or remotely
- Redis running locally or accessible from `REDIS_URL`
- Optional: Anthropic API key if AI generation is enabled

> Redis is required for the paper-generation queue, PDF export queue, and WebSocket progress support. If Redis is unavailable, paper generation and live updates will fail.

## Run locally

### Backend

```bash
cd backend
npm install
# create or update .env with the values below
npm run dev
```

The backend listens on `http://localhost:4000` by default.

### Frontend

```bash
cd frontend
npm install
# create or update .env.local with the values below
npm run dev
```

The frontend listens on `http://localhost:3000` by default.

## Recommended env vars

### Backend `.env`

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
GROQ_API_KEY=
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
JWT_SECRET=make_this_a_long_random_string_1234567890
ANTHROPIC_API_KEY=
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

## Notes

- Sidebar pages hide the top-level header and render the dashboard layout instead.
- `/library` supports file upload and download links.
- `backend/public/library` is the visible storage area for uploaded files.
- If paper generation does not work, check Redis and BullMQ connectivity first.

## Push checklist

- `git add .`
- `git commit -m "Update README with Redis requirements and setup"
- `git push`
