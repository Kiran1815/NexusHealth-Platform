# NEXUS HEALTH — AI-Native Healthcare Platform

> *"From symptom to solution in seconds."*

A full-stack AI-powered healthcare platform built with React (Vite) + Node.js (Express).

---

## 🚀 Quick Start

### Backend (Port 5000)
```bash
cd nexus-health-backend
npm install
node src/server.js
```

### Frontend (Port 5173)
```bash
cd nexus-health-frontend
npm install
npm run dev
```

Open → **http://localhost:5173**

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Patient | patient@nexushealth.com | password123 |
| Doctor | doctor@nexushealth.com | password123 |
| Admin | admin@nexushealth.com | password123 |

---

## 🌟 Features

### AI Modules
- **ARIA** — Adaptive symptom assessment with Clinical Priority Score (0–100)
- **SENTINEL** — Continuous patient risk monitoring
- **PULSE** — Disease outbreak heatmap & hospital surge prediction
- **ECHO** — PHQ-4 mental health check-in with crisis escalation

### Core Modules
- 🏥 Smart doctor search with real-time slot booking
- 📅 AI-powered appointment scheduling
- 🧾 Medical records with timeline view
- 🚨 One-tap Emergency SOS with ambulance dispatch
- 💊 Pharmacy search + drug interaction checker
- 📊 Health Score with trend analytics

---

## 🏗 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, TailwindCSS, Recharts, Lucide |
| Backend | Node.js, Express, Socket.IO, JWT |
| Styling | TailwindCSS with custom dark theme |
| Auth | JWT Bearer Tokens (in-memory store) |

---

## 🔐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/patients/health-score` | Health score |
| GET | `/api/doctors` | List doctors |
| GET | `/api/doctors/:id/slots` | Available slots |
| POST | `/api/appointments` | Book appointment |
| POST | `/api/ai/aria/assess` | ARIA symptom check |
| GET | `/api/ai/sentinel/risk` | Risk report |
| POST | `/api/ai/echo/checkin` | Mental health check-in |
| GET | `/api/ai/pulse/heatmap` | Outbreak data |
| GET | `/api/emergency/active` | Active emergency |
| POST | `/api/emergency/sos` | Trigger SOS |

---

## 📁 Project Structure

```
nexus-health-complete/
├── nexus-health-backend/       # Express API + WebSocket
│   └── src/
│       ├── server.js
│       ├── config/database.js  # In-memory data store
│       ├── middleware/auth.js
│       └── routes/             # All API routes
└── nexus-health-frontend/      # React + Vite + TailwindCSS
    └── src/
        ├── App.jsx
        ├── components/Layout.jsx
        ├── hooks/useAuth.jsx
        ├── pages/              # All pages
        └── utils/api.js        # Axios API client
```
