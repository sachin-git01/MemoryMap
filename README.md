# PhotoFlow / MemoryMap

PhotoFlow (branded as **MemoryMap** in the UI) is an interactive, milestone-driven visual memory roadmap application built with a React frontend and a Node.js/Express/MongoDB MVC backend.

## Project Structure

```
PhotoFlow/
├── backend/                  # Node.js + Express + MongoDB (MVC Architecture)
│   ├── config/               # Database connection (db.js)
│   ├── controllers/          # Business logic (authController, journeyController)
│   ├── middleware/           # JWT auth guard and error handling
│   ├── models/               # Mongoose schemas (User, Journey, Checkpoint, Note)
│   ├── routes/               # API endpoints (/api/auth, /api/journeys)
│   ├── .env                  # PORT, MONGO_URI, JWT_SECRET
│   ├── package.json
│   └── server.js             # Express entry point
│
├── frontend/                 # Vite + React 19 + Tailwind CSS Single-Page Application
│   ├── public/               # Static assets & icons
│   ├── src/                  # React views, components, contexts, and hooks
│   │   ├── components/       # Reusable UI (Sidebar, Navbar, Modals, ErrorBoundary)
│   │   ├── context/          # State management (AuthContext, JourneyContext, ThemeContext)
│   │   ├── pages/            # Page screens (Landing, Dashboard, JourneyMap, Gallery, Notes)
│   │   └── ...
│   ├── .env                  # VITE_API_URL=http://localhost:5000/api
│   ├── package.json
│   └── vite.config.js
│
├── README.md                 # Project guide
└── brain.md                  # Single source of truth for architecture & maintenance
```

## Quick Start

### 1. Start the Backend Server

```bash
cd backend
npm install
npm run dev     # Runs on http://localhost:5000 with MongoDB
```

### 2. Start the Frontend Dev Server

```bash
cd frontend
npm install
npm run dev     # Runs on http://localhost:5173
```

## API Documentation

- `POST /api/auth/register` - Create user account (returns JWT token)
- `POST /api/auth/login` - Authenticate user (returns JWT token)
- `GET /api/auth/me` - Get current user profile (JWT protected)
- `GET /api/journeys` - Get user journeys (JWT protected)
- `POST /api/journeys` - Create new journey (JWT protected)
- `GET /api/journeys/:id` - Get specific journey
- `PUT /api/journeys/:id` - Update journey
- `DELETE /api/journeys/:id` - Delete journey and all checkpoints/notes
- `GET /api/health` - Server health check

## Project Notes

`brain.md` is the single source of truth for architecture, data flow, key files, limitations, and maintenance rules.
