# MediDrip - Clinical Fluid Tracking Chrome Extension

A Chrome browser extension (Manifest V3) for clinical fluid intake/output tracking with smart hydration reminders.

## 🏗️ Architecture

```
MediDrip/
├── extension/          # React + Vite Chrome Extension (Frontend)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx      # Main fluid tracking dashboard
│   │   │   ├── LoginScreen.jsx    # Asgardeo authentication screen
│   │   │   ├── ProgressBar.jsx    # Animated progress bar component
│   │   │   └── AddFluidModal.jsx  # Modal for adding intake/output
│   │   ├── App.jsx                # Root component with state management
│   │   ├── main.jsx               # Entry point with AuthProvider
│   │   ├── background.js          # Service worker (alarms/notifications)
│   │   └── index.css              # Tailwind + custom animations
│   ├── manifest.json              # Chrome Extension Manifest V3
│   └── vite.config.js             # Vite + CRXJS configuration
│
└── backend/            # Node.js/Express API (Middleware)
    ├── prisma/
    │   └── schema.prisma          # FluidLog model definition
    ├── src/
    │   ├── routes/logs.js         # POST /api/logs, GET /api/logs/daily
    │   ├── middleware/auth.js     # JWT verification via Asgardeo JWKS
    │   └── index.js               # Express server entry point
    └── .env                       # Environment configuration
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Extension | `@crxjs/vite-plugin` (Manifest V3) |
| Authentication | WSO2 Asgardeo (`@asgardeo/auth-react`) |
| Backend | Node.js + Express |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier)
- A [WSO2 Asgardeo](https://asgardeo.io) organization (free tier)

### 1. Backend Setup

```bash
cd backend
cp .env .env.local   # Edit with your Supabase + Asgardeo credentials
npm install
npx prisma db push   # Push schema to Supabase
npm run dev           # Starts on http://localhost:3001
```

### 2. Extension Setup

```bash
cd extension
cp .env .env.local   # Edit with your Asgardeo client ID
npm install
npm run dev          # Starts Vite dev server with HMR
```

### 3. Load in Chrome

1. Navigate to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/dist` folder (after `npm run build`) or use the Vite dev server

## 🔐 Environment Variables

### Extension (`extension/.env`)
```
VITE_ASGARDEO_CLIENT_ID=your_client_id
VITE_ASGARDEO_BASE_URL=https://api.asgardeo.io/t/your_org
VITE_ASGARDEO_SCOPE=openid profile email
VITE_API_BASE_URL=http://localhost:3001
```

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
ASGARDEO_BASE_URL=https://api.asgardeo.io/t/your_org
PORT=3001
ALLOWED_ORIGIN=chrome-extension://your_extension_id
```

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/logs` | Add fluid log `{ type: "INTAKE"\|"OUTPUT", amount: number }` |
| `GET` | `/api/logs/daily` | Get today's totals for authenticated user |

## ⏰ Reminders

The background service worker uses `chrome.alarms` to trigger hydration reminders every 2 hours. Notifications appear as system-level alerts via `chrome.notifications`.
