# CLAUDE.md — Ovari (Menstruation & Perimenopause Tracker)

> REBRAND 4 jul 2026: de app heet OVARI (was FemFlow; naamconflict). Interne
> namen (femflow_ storage keys, femflow_ DB-prefix, femflow-api, repo-map)
> blijven bewust FemFlow — alleen het zichtbare merk is Ovari.

This file defines the build guidelines, style system, and architecture for FemFlow.
Read before writing or changing code. Match these patterns exactly.

---

## Product context

FemFlow is a private, health-focused menstruation and perimenopause tracker. Users input
cycle data and optionally connect wearables (Oura Ring) for sleep/HRV/recovery insights.

Design feel: Warm, soft, premium, trustworthy. Earthy palette (sand, caramel, cream).
No emojis in development output. Calm wellness aesthetic.

---

## Architecture

Tech stack:
- Frontend: React 18 + Vite, Router-based navigation, inline styles with CSS variables
- Backend: Express.js + PostgreSQL (Neon), JWT auth (30-day tokens), OTP via email (SendGrid)
- Hosting: Vercel (frontend, canoniek domein femflow.youcaps.app), Render (backend)
- Database: Shared Neon instance with WAB (femflow_ table prefix isolation)
- Backend code staat IN deze repo: femflow-backend/ (geen losse repo)

Mappenstructuur frontend:
- src/pages/dashboard/ — dashboard, results, learning hub, analytics
- src/pages/health/ — cycle/menstruatie/perimenopauze trackers
- src/pages/auth/, account/, legal/, wearable/, fem/ — overige flows
- localStorage keys hebben femflow_ prefix (femflow_jwt, femflow_last_result)

Key patterns:
1. API client in src/api/client.js (centralized requests + token management)
2. localStorage for user preferences + encrypted secure storage for health data
3. Protected routes: check JWT token via getToken() before showing page
4. Consent modals for data collection (GDPR)
5. Error boundaries for crash protection

---

## Build guidelines

### No emojis
- Never use emojis in code, commit messages, or console output
- Use react-feather icons for UI instead

### Stap-voor-stap + goedkeuring
- Major features require step-by-step implementation
- Ask for approval before each step (before building)
- No autonomous feature builds without explicit sign-off

### Data security & consent
- Health data must be encrypted (secureStorage.js with passphrase obfuscation)
- Wearable data: Require explicit consent modal before any collection
- OTP auth: 6-digit codes, 10-minute expiry, email delivery
- Token management: JWT stored in localStorage, cleared on logout

### Database isolation
- All FemFlow tables use femflow_ prefix (femflow_users, femflow_menstruation_data, etc)
- Never touch WAB tables (wab_* prefix)
- Schema changes via SQL in schema.sql (run on Neon manually)

### Component patterns
- Controlled components (useState for form state)
- Prop-based styling (no CSS classes except global var)
- Reusable modals (ConsentModal, WearableConsentModal)
- Error handling via ErrorBoundary wrapper
- Loading states with return null or loading UI

### Environment variables (Vite)
- Frontend leest ALLEEN import.meta.env.VITE_* (nooit process.env / REACT_APP_*)
- Lokaal: .env (zie .env.example) — productie: Vercel project settings
- VITE_API_URL (backend base URL), VITE_GOOGLE_CLIENT_ID (Google OAuth)

### API endpoints
Base URL: import.meta.env.VITE_API_URL (default: https://femflow-api.onrender.com)

Key routes:
- POST /api/v1/auth/request-code (email login)
- POST /api/v1/auth/verify-code (OTP verification)
- GET /api/v1/users/me (profile, protected)
- POST /api/v1/menstruation (save cycle data, protected)
- POST /api/v1/wearable/seed (generate test data, protected)
- POST /api/v1/wearable/request-connect (Oura OAuth, protected)

---

## Color tokens (CSS variables)

```css
:root {
  /* Neutrals */
  --bg:            #F5EFEB;      /* page background */
  --surface:       #FFFFFF;      /* cards */
  --surface-warm:  #FBF6F1;      /* raised panels */
  --ink:           #2A211C;      /* primary text + buttons */
  --ink-2:         #6E635B;      /* secondary text */
  --ink-3:         #A89E95;      /* tertiary text, labels */
  --border:        #E8E0D8;      /* hairlines */
  
  /* Accent */
  --accent:        #D4A373;      /* Warm Ochre (Ovari-stijlgids) */
  --accent-soft:   #ECE0D2;      /* tinted backgrounds */
  
  /* Status */
  --success:       #4F8C5A;
  --error:         #C0492D;
}
```

### Ovari app-palet (donkere ingelogde app, stijlgids 4 jul 2026)

Hardcoded in de v2-schermen en als --d-* tokens in index.html:

- Deep Espresso `#211C1A` — app-achtergrond (buitenrand `#1a1614`)
- Smoked Umber `#2D2623` — dropdowns/tooltips; kaarten = `rgba(45,38,35,0.55)` + blur
- Parchment White `#F5F2EB` — primaire tekst (secundair `#A8998A`, gedempt `#6B5D52`)
- Warm Ochre `#D4A373` — accent/CTA (gradient-partner `#DFB88A`)
- Logo: src/assets/ovari-logo.jpg (bruine variant); PWA-iconen in public/ ervan afgeleid

---

## Typography

Use existing fonts (Fraunces + Hanken defined in index.html):
- --font-display: Page titles, headings (Fraunces)
- --font-sans: Body text, buttons, metrics (Hanken with tabular figures)

No new fonts. No emojis. Use react-feather icons for visual markers.

---

## Wearable integration (current)

Synthetic data generation (no real Oura device needed):
- synthDataGenerator.js: Generates realistic correlated sleep data (HRV, RHR, deep sleep)
- Scenarios: stable, declining, recovering, dip
- Stored in femflow_biometric_readings table

Real Oura integration (OAuth):
- endpoint: POST /api/v1/wearable/request-connect
- callback: GET /api/v1/wearable/callback
- Tokens stored in femflow_wearable_connections
- Consent modal required before connection

---

## Deployment checklist

Before pushing to production:
1. Test locally: npm run dev (frontend), npm start (backend)
2. Environment variables set on Render + Vercel
3. Database migrations applied on Neon
4. API endpoints tested via client.js
5. Consent modals triggering correctly
6. Error boundaries catching crashes
7. No console.error in production logs
8. JWT token refresh working on 401

---

## Common patterns

### Protected route
```javascript
useEffect(() => {
  if (!getToken()) {
    navigate('/login')
    return
  }
  setIsLoggedIn(true)
}, [])
```

### API call with error handling
```javascript
try {
  const result = await apiFunction()
  setState(result)
} catch (err) {
  console.error('Task failed:', err)
  setError(err.message || 'Failed to complete task')
}
```

### Encrypted data storage
```javascript
import { saveSecure, getSecure } from '../utils/secureStorage'
saveSecure('menstruation_data', data)  // stored encrypted
const data = getSecure('menstruation_data')  // retrieved decrypted
```

---

## Git workflow

Commits: Clear, specific commit messages (no emojis).
Format: "verb change — reason if non-obvious"
Example: "Add wearable consent flow — GDPR requirement for data collection"

Branch: Always single feature branch from main.
No force pushes unless explicitly authorized.

---

## Memory & context

Store non-code decisions in memory system:
- project_femflow.md: Scope, priorities, blockers
- feedback_*.md: User preferences, approach validations
- ref_*.md: External resource pointers

Check memory before starting new work.
