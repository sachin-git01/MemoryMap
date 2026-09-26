# PhotoFlow / MemoryMap Brain

## Project Purpose
PhotoFlow, branded in UI as MemoryMap, is a React single-page app for turning dates, photos, notes, and milestones into emotional journey maps. Primary users create themed journeys such as Love Story, Friendship, Family, Personal Life, or Custom, then add checkpoints with media and notes. The app should feel like a journey builder, not a plain gallery.

## High-Level Architecture
- Architecture: Client-Server with Vite React frontend and dedicated Node.js + Express + MongoDB backend (`backend/`).
- Entry points: Frontend in `src/main.jsx`, backend in `backend/server.js`.
- Root wrapped in `ErrorBoundary` to prevent unhandled render crashes.
- Provider stack in `src/App.jsx`: `ErrorBoundary` -> `BrowserRouter` -> `AuthProvider` -> `JourneyProvider` -> `ThemeProvider` -> `AppRoutes`.
- Backend (`backend/`): Express REST API connected to MongoDB via Mongoose, providing user authentication (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`), bcrypt password hashing, and JWT token protection.
- Frontend Auth (`src/context/AuthContext.jsx`): Interacts with `${VITE_API_URL}/auth/*`, persists JWT token in `localStorage`, auto-validates sessions, and includes offline/demo fallback.
- Application state and journeys: Persist in guarded browser `localStorage` with initial seeds from `src/data/mockData.js`.
- Theme state follows `currentJourney` and writes CSS variables/data attributes on `document.documentElement`.

## Folder Responsibilities
- `backend/config`: Database connection (`db.js`).
- `backend/models`: Mongoose schemas (`User.js`, `Journey.js`, `Checkpoint.js`, `Note.js`).
- `backend/controllers`: Request handlers (`authController.js`, `journeyController.js`).
- `backend/routes`: Express route definitions (`authRoutes.js`, `journeyRoutes.js`).
- `backend/middleware`: JWT authentication guard (`authMiddleware.js`) and error handler (`errorMiddleware.js`).
- `frontend/src/pages`: Route-level screens for landing, auth, dashboard, journey map, gallery, notes, settings, checkpoint creation/details, and journey creation.
- `frontend/src/components`: Reusable UI pieces such as navigation, sidebar, journey cards, journey map visualization, photo grid modal, note card, upload box, protected route, and error boundary.
- `frontend/src/context`: App-wide state for auth, journeys/checkpoints/notes, uploads, and active theme.
- `frontend/src/data`: Demo journeys, checkpoints, notes, theme configs, custom presets, and font options.
- `frontend/src/hooks`: Shared route/state hooks, including safe journey route resolution.
- `frontend/src/utils/icons.jsx`: Central lucide-react icon mapping.
- `frontend/src/index.css`: Tailwind import, design tokens, theme CSS variables, animations, skeletons, page transitions, and global component helpers.
- `frontend/public`: Static favicon/icons.
- `frontend/dist`: Build output; generated, do not edit directly.

## Technology Stack
- React `19.2.7`
- React DOM `19.2.7`
- React Router DOM `7.18.1`
- Vite `8.1.1`
- Tailwind CSS `4.3.2` via `@tailwindcss/postcss`
- lucide-react `1.23.0` for icons
- oxlint `1.71.0` for linting

## Execution Flow
1. Browser loads `index.html`.
2. Vite loads `src/main.jsx`.
3. `App` mounts `ErrorBoundary`, router, and providers.
4. `AuthProvider` initializes the local user from `localStorage`.
5. `JourneyProvider` synchronously hydrates journeys from `localStorage` (or seeds from `mockData.js`).
6. When a journey is selected, checkpoints and notes are loaded for that journey.
7. `ThemeProvider` derives the active theme during render, then applies CSS variables and `data-theme`.
8. `AppRoutes` renders public or protected pages based on route and auth state.

## Routing
- `/`: Landing page.
- `/login`: Login.
- `/signup`: Signup.
- `/dashboard`: Journey dashboard.
- `/create-journey`: Two-step journey creation with type/theme/custom options.
- `/journey/:journeyId`: Journey map.
- `/journey/:journeyId/add-checkpoint`: Add checkpoint wizard.
- `/journey/:journeyId/checkpoint/:checkpointId`: Checkpoint detail/edit/media view.
- `/journey/:journeyId/gallery`: Cross-checkpoint photo/video gallery.
- `/journey/:journeyId/notes`: Notes CRUD.
- `/journey/:journeyId/settings`: Journey settings, export, delete.
- `*`: Fallback renders landing page.

## Data Model
Verified from `JourneyContext` and mock data.

### Journey
- `id`
- `userId`
- `journeyName`
- `mapName`
- `journeyType`: `love`, `friendship`, `family`, `personal`, `custom`
- `theme`
- `startDate`
- `privacy`
- `createdAt`
- optional `favoritePhotos`
- custom-only: `customPreset`, `customFont`, `customFontFamily`, `customColors`

### Checkpoint
- `id`
- `userId`
- `journeyId`
- `title`
- `date`
- `description`
- `icon`
- `location`
- `photos`: URL strings; videos are marked by `#video` suffix
- `notes`
- `createdAt`

### Note
- `id`
- `userId`
- `journeyId`
- `title`
- `content`
- `date`
- `category`
- `createdAt`

## Storage And Persistence
- 100% client-side `localStorage` storage model.
- Storage keys:
  - `memorymap_demo_user`
  - `memorymap_local_journeys`
  - `memorymap_local_checkpoints`
  - `memorymap_local_notes`
  - `memorymap_premium_plan`
- Guarded parsing: Invalid/corrupt JSON resets to a safe fallback without crashing.
- In-memory caching: `localArrayCache` Map prevents repeated JSON deserialization on re-renders.
- Checkpoint/note caches are warmed during browser idle time after journeys load.
- Demo uploads use `URL.createObjectURL` for instant in-browser display.
- Upload UI enforces a 20 MB per-file limit for image/video files.

## Core Context APIs
### `AuthContext`
- `currentUser`
- `loading`
- `isDemoMode` (constant false)
- `signup(email, password, displayName)`
- `login(email, password)`
- `logout()`

### `JourneyContext`
- state: `journeys`, `selectedJourneyId`, `currentJourney`, `checkpoints`, `notes`, `loading`, `hasLoaded`
- Synchronously hydrates from `localStorage` on initial mount to avoid theme/brand flicker.
- journey CRUD: `createJourney`, `updateJourney`, `deleteJourney`
- checkpoint CRUD: `addCheckpoint`, `updateCheckpoint`, `deleteCheckpoint`
- note CRUD: `addNote`, `updateNote`, `deleteNote`
- media: `uploadPhoto`
- selection: `selectJourney`, `setCurrentJourney`

### `ThemeProvider`
- Reads `currentJourney` and falls back to the journey id in `/journey/:journeyId` URLs.
- Calculates `activeTheme` and `themeConfig` synchronously during render and applies CSS variables in a layout effect.
- Sets `data-theme` on root element.
- Applies custom CSS variables for custom colors and font.
- Exposes `activeTheme`, `themeConfig`, and `isCustom`.

### `useRouteJourney`
- Used by protected journey route pages to resolve `:journeyId`, select the active journey, and expose `isResolvingJourney`/`journeyNotFound`.

## UI And Theme System
- Global CSS variables are defined in `src/index.css`.
- Preset theme configs live in `THEME_CONFIGS` inside `src/data/mockData.js`.
- Custom themes use `CUSTOM_THEME_PRESETS` and `CUSTOM_FONT_OPTIONS`.
- Shared premium UI helpers in `src/index.css` include `premium-surface`, `skeleton-soft`, `photo-preview-modal`, `gallery-empty-orbit`, and `no-scrollbar`.
- Journey map uses a vertical wavy path, a lightweight theme wash background, and fixed-size circular photo nodes directly on the road. The latest checkpoint has a lightweight rose blink/halo animation.

## Configuration
- `vite.config.js`: React plugin with manual chunks for `vendor-react` and `vendor-icons`.
- `postcss.config.js`: Tailwind PostCSS setup.
- `tailwind.config.js`: Present but Tailwind v4 styles also rely on `@theme` in `src/index.css`.
- `.oxlintrc.json`: oxlint config.

## Commands
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Preview production build: `npm run preview`

## Coding Standards
- JSX React components with named exports for pages/components/context hooks.
- React hooks and local component state for page interactions.
- Tailwind utility classes dominate styling; shared effects/animations live in `src/index.css`.
- Use `getIcon` instead of ad hoc icon imports inside most UI.
- Data mutations should go through `JourneyContext` or `AuthContext`.

## Error Handling
- Global error boundary (`ErrorBoundary.jsx`) wraps the root application in `App.jsx`, catching unhandled runtime errors with a stylized recovery screen.
- Destructive actions use app-owned confirmation UI (`ConfirmDialog`, `LogoutConfirmModal`), not native browser dialogs.
- Page-level failures and validation use styled inline notices (`InlineNotice`), not native browser `alert()`.

## Performance Considerations
- Route-level code splitting is enabled in `AppRoutes`; all pages are lazy-loaded.
- Vite build splits `vendor-react` and `vendor-icons` into isolated chunks.
- With Firebase removed, entire production JavaScript build is ~300 kB total (gzipped ~95 kB).
- `utils/icons.jsx` uses per-icon ESM imports from lucide-react.

## Security Policies & Hardening
- Secrets: No API keys, database credentials, or secret tokens in frontend code or client-exposed env vars (`VITE_`).
- Git & Env: `.env` is strictly ignored in root `.gitignore`, `backend/.gitignore`, and `frontend/.gitignore`. `.env.example` templates provide placeholders only.
- Authentication: All protected API routes run JWT `protect` middleware before handlers; unauthenticated requests return 401.
- Authorization & Ownership: Every route handling resource IDs enforces explicit ownership checks (`req.user._id.toString() === resource.userId`), returning 403 Forbidden on unauthorized access.
- Password Hashing: Uses bcrypt with 10 salt rounds in pre-save hooks on User model; passwords omitted from JSON output.
- Security Headers: `helmet` middleware sets CSP, HSTS (`max-age=31536000`), X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`), and Referrer Policy (`strict-origin-when-cross-origin`).
- CORS: Strict allowlist (`http://localhost:5173`, `http://127.0.0.1:5173`); no wildcard `*` origins.
- Rate Limiting: `authLimiter` restricts login and registration to 10 requests per 15 minutes per IP.
- Error Sanitization: Stack traces, Mongoose schemas, and internal server paths are never exposed in API responses.

## Testing Strategy
- Verification commands: `npm run lint` and `npm run build` in `frontend/`.
- Visual UI validation in the browser.

## Recent UI Stability & Architecture Fixes
- Firebase Decoupling: Completely uninstalled and removed Firebase (`firebase/app`, `auth`, `firestore`, `storage`) and `src/firebase/config.js`. Transformed `AuthContext` and `JourneyContext` into clean, instantaneous client-side state managers with guarded `localStorage` persistence.
- Build Optimization: Removed over 750 kB of Firebase vendor chunks. Configured manual chunks for React and Lucide icons; production build now runs in under 1 second with 0 warnings.
- Global Error Boundary: Added `ErrorBoundary.jsx` around the root provider tree in `App.jsx` with a recovery UI.
- App chrome stability: `Navbar` and `Sidebar` use `.app-chrome` locking them to Outfit/Inter.
- Lightbox stacking and centering: Checkpoint preview renders through `createPortal` with body scroll lock and touch gesture swipe support.
- Editable map branding: Journeys support `mapName` (`LoveMap`, `FriendshipMap`, `FamilyMap`, `LifeMap`, `MyMap`).
- Native popup elimination: Replaced all native `alert()` and `confirm()` calls with `InlineNotice` and `ConfirmDialog`.
- MongoDB + Express Backend: Created dedicated `backend/` folder with Express, Mongoose, JWT auth, bcrypt password hashing, and user routes. Frontend `AuthContext` now connects via `VITE_API_URL` with JWT token persistence and graceful fallback. Environment files configured for both frontend and backend.
- 17-Point Pre-Deployment Security Verification: All 17 automated tests verified and passed live against the backend (including zero database exposure, 401 unauthenticated route rejection, clean git history/untracked .env, 403 IDOR ownership enforcement, zero browser secrets, strict CORS, rate limiting, and bcrypt hashing).
