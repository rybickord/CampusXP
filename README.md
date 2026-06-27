# CampusXP

Real-time activity credit system for campus events — students earn XP, faculty manage events, leaderboard updates live.

## Quick start

```bash
# 1. Install dependencies
npm install
pip install -r backend/requirements.txt

# 2. Environment (copy and fill in your Google OAuth client ID)
cp .env.example .env
cp backend/.env.example backend/.env

# 3. Database + demo accounts
cd backend && python manage.py migrate && python manage.py seed_demo && cd ..

# 4. Run frontend + backend together
npm run dev:all
```

Open **http://localhost:5173**

## Login

**Student portal**
- PRN: `BCOM2024042` (any password)
- Or **Continue with Google** (requires OAuth setup)

**Faculty portal**
- Staff ID: `FAC-2024-089` (any password)
- Or **Continue with Google**

## Google OAuth setup

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → Create **OAuth 2.0 Client ID** (Web application)
2. **Authorized JavaScript origins:** `http://localhost:5173`, `http://127.0.0.1:5173`
3. Paste the Client ID into both:
   - `.env` → `VITE_GOOGLE_CLIENT_ID=...`
   - `backend/.env` → `GOOGLE_CLIENT_ID=...`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Frontend only (port 5173) |
| `npm run dev:backend` | Django API (port 8000) |
| `npm run dev:all` | Both servers |
| `npm run seed` | Seed demo student/faculty |
| `npm run build` | Production build |

## Repo

https://github.com/rybickord/CampusXP
