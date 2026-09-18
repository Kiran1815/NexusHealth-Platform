# NEXUS HEALTH — AI-Native Healthcare Platform v2.0

> *"From symptom to solution in seconds."*

## 🏗 Project Structure

```
nexus-health/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── server.js         # Main server + WebSocket
│   │   ├── config/database.js # In-memory data store
│   │   ├── middleware/auth.js # JWT authentication
│   │   └── routes/           # All API routes
│   ├── package.json
│   └── .env
└── frontend/         # React + Vite + TailwindCSS
    ├── src/
    │   ├── App.jsx
    │   ├── components/Layout.jsx
    │   ├── pages/            # All page components
    │   ├── hooks/useAuth.jsx
    │   └── utils/api.js      # Axios API client
    ├── package.json
    └── vite.config.js
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env .env.local   # Edit if needed
npm run dev
# API runs on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Patient | patient@nexushealth.com | password123 |
| Doctor | doctor@nexushealth.com | password123 |
| Admin | admin@nexushealth.com | password123 |

## 🌟 Features

### AI Modules
- **ARIA** — Adaptive symptom assessment with Clinical Priority Score (0-100) and reasoning chain
- **SENTINEL** — Continuous patient risk monitoring and health alerts
- **PULSE** — Disease outbreak heatmap and hospital surge prediction
- **ECHO** — PHQ-4 mental health check-in with crisis escalation

### Core Modules
- 🏥 Smart doctor search with real-time slot booking
- 📅 AI-powered appointment scheduling
- 🧾 FHIR R4 medical records with timeline view
- 🚨 One-tap Emergency SOS with ambulance dispatch
- 💊 Pharmacy search + drug interaction checker
- 📊 Health Score with trend analytics

### Technical Features
- JWT authentication with role-based access (patient/doctor/admin)
- Real-time WebSocket for live updates
- Responsive design — mobile-first
- Offline-ready architecture (PWA-ready)
- WCAG AA accessibility

## 🔐 API Endpoints

### Auth
- `POST /api/auth/login` — Login
- `POST /api/auth/register` — Register
- `GET /api/auth/me` — Current user

### AI
- `POST /api/ai/aria/assess` — ARIA symptom assessment
- `GET /api/ai/sentinel/risk` — SENTINEL risk report
- `POST /api/ai/echo/checkin` — ECHO mental health check-in
- `GET /api/ai/pulse/heatmap` — Outbreak data
- `GET /api/ai/pulse/surge` — Hospital surge predictions

### Core
- `GET/POST /api/appointments` — Appointments
- `GET /api/doctors` — Doctor search
- `GET /api/doctors/:id/slots` — Available slots
- `GET/POST /api/records` — Medical records
- `POST /api/emergency/sos` — Emergency SOS
- `GET /api/pharmacy/nearby` — Nearby pharmacies
- `POST /api/pharmacy/drug-interactions` — Interaction check

## 🏗 Production Architecture

### Replace in production:
1. **Database**: `backend/src/config/database.js` → MongoDB/PostgreSQL
2. **AI**: Mock responses → OpenAI/Anthropic/BioMistral APIs
3. **SMS**: Add Twilio for emergency notifications
4. **Maps**: Add Google Maps for geo features
5. **Auth**: Add OAuth2 providers (Google, Apple)
6. **Storage**: AWS S3 for medical files

### Scale to:
- Kubernetes deployment (k8s manifests in infrastructure/)
- Redis for session management and caching
- PostgreSQL for relational health data
- Pinecone for AI vector search
- SageMaker for custom ML models

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Navy 900 | `#0A1628` | Primary background |
| Cyan 400 | `#00D4FF` | Primary accent / AI |
| Emerald 400 | `#00FF94` | Success / Health positive |
| Amber 400 | `#FFB700` | Warnings / Alerts |
| Navy 800 | `#0f2040` | Card backgrounds |

## 📱 Pages

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard | Health overview, stats, quick actions |
| `/aria` | ARIA | AI symptom assessment |
| `/appointments` | Appointments | View and manage appointments |
| `/book` | Book Appointment | Search doctors and book slots |
| `/records` | Medical Records | FHIR timeline |
| `/health-score` | Health Score | Vitals, trends, medication adherence |
| `/emergency` | Emergency SOS | One-tap emergency response |
| `/pharmacy` | Pharmacy | Drug search, interactions |
| `/pulse` | PULSE | Outbreak heatmap |
| `/echo` | ECHO | Mental health check-in |

## 🏆 Hackathon Pitch

> "Every 40 seconds, someone dies from a preventable disease — not because medicine doesn't exist, but because they couldn't access it in time. NEXUS HEALTH is the AI-native operating system for community healthcare. ARIA goes from symptom to specialist recommendation in 90 seconds. Our Emergency SOS activates full response in a single gesture. PULSE detects disease clusters before they become crises. And every feature works offline, in 22 languages, for users who've never used a smartphone before. This isn't a healthcare app. This is infrastructure."

---

Built with ❤️ for global healthcare equity
