# VedaAI

A full-stack AI teaching assistant for creating assignments, handling library uploads, and managing teacher workflows.

## What this repo contains

- `frontend/` — Next.js + TypeScript app
- `backend/` — Express + TypeScript API
- `backend/public/library` — optional storage location for uploaded library files

## Key features

- Teacher dashboard pages with a sidebar:
  - `/assignments`
  - `/library`
  - `/toolkit`
- Public pages without sidebar:
  - `/login`
  - `/signup`
- Library upload flow with file title support and download links
- Authenticated API access using JWT tokens

## Run locally

### Backend

```bash
cd backend
npm install
# ensure .env has the correct values
npm run dev
```

The backend listens on `http://localhost:4000` by default.

### Frontend

```bash
cd frontend
npm install
# ensure .env.local sets NEXT_PUBLIC_API_URL=http://localhost:4000
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
JWT_SECRET=

```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

## Notes

- Sidebar pages now hide the global header and render the dashboard layout instead.
- Library page supports file upload and file download links.
- Keep Redis available for queue and websocket support, but core API pages can still start without it if configured.

## Push checklist

- `git add .`
- `git commit -m "Update README and sidebar/layout behavior"`
- `git push`
