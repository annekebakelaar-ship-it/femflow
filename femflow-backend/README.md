# FemFlow Backend API

Production-ready menstruation tracker API built with Node.js/Express and PostgreSQL.

## Features

- **OTP Authentication**: 6-digit email codes (10 min expiry)
- **JWT Tokens**: 30-day session tokens
- **User Management**: Profile CRUD operations
- **Menstruation Data**: Cycle tracking and analytics
- **GDPR Compliance**: Account deletion with cascading data cleanup
- **Email Delivery**: Nodemailer integration

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

### Setup

```bash
npm install
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/femflow
JWT_SECRET=your-secret-here
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
```

### Database Setup

```bash
psql -U postgres -d femflow -f schema.sql
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/request-code` - Request OTP code
- `POST /api/v1/auth/verify-code` - Verify code & get JWT
- `POST /api/v1/auth/google-signin` - Google OAuth (WIP)
- `POST /api/v1/auth/apple-signin` - Apple OAuth (WIP)

### Users

- `GET /api/v1/users/me` - Get profile (protected)
- `PUT /api/v1/users/me` - Update profile (protected)
- `DELETE /api/v1/users/me` - Delete account (protected)

### Menstruation Data

- `GET /api/v1/menstruation` - Get data (protected)
- `POST /api/v1/menstruation` - Create/update data (protected)

### Health Check

- `GET /api/v1/health` - API status

## Deployment to Render

FemFlow backend shares the same PostgreSQL database as WAB (with `femflow_` prefix tables).

1. **Run Database Migration on Shared DB**
   ```bash
   psql $EXISTING_DATABASE_URL -f schema.sql
   ```
   This adds FemFlow tables (`femflow_users`, `femflow_otp_codes`, `femflow_menstruation_data`) to your WAB database.

2. **Deploy Web Service**
   - Connect GitHub repo
   - Select `femflow-backend` directory
   - Build command: `npm install`
   - Start command: `npm start`
   - Set environment variables:
     - `DATABASE_URL` (same as WAB - from your Render PostgreSQL service)
     - `JWT_SECRET` (generate: `openssl rand -base64 32`)
     - `EMAIL_USER` & `EMAIL_PASSWORD` (Gmail app password)
     - `NODE_ENV=production`
     - `FRONTEND_URL=https://femflow-two.vercel.app`

3. **Verify Deployment**
   ```bash
   curl https://femflow-api.onrender.com/api/v1/health
   ```

## Email Configuration

Using Gmail + App Password:

1. Enable 2FA in Google Account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use app password in `EMAIL_PASSWORD` env var

## Security Notes

- All user routes require JWT authentication
- Passwords not stored (OAuth only)
- OTP codes expire after 10 minutes
- Delete operations are cascading (all user data removed)
- CORS configured for FemFlow frontend only

## Development Scripts

```bash
npm start      # Production server
npm run dev    # Dev server with hot reload
```
