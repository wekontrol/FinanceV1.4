# Gestor Financeiro Familiar - Production Ready Setup

## Overview
A comprehensive family financial management platform built with React, TypeScript, and Express.js. This application provides intelligent financial tracking, AI-powered insights using Google's Gemini AI, and family-friendly features for household budget management. It offers multi-user support with role hierarchy, real-time financial data, and robust administrative controls.

## User Preferences
- Application uses Portuguese (PT) as primary language
- Default login: `admin` / `admin`
- Deployment target: Ubuntu 20.04+ on Proxmox VMs (or Render/Production)
- Theme: Supports dark mode preference

## Recent Implementation (November 27, 2025)
✅ **PostgreSQL Session Storage** - Removed memory leak warning
- Sessions now persist in PostgreSQL database
- Auto-creates `session` table in production
- Scales horizontally (multi-server ready)
- Fixed: "Warning: connect.session() MemoryStore is not designed for production"

✅ **Dynamic Exchange Rates** - Real-time daily updates
- Fetches live rates from ExchangeRate-API (exchangerate-api.com)
- Caches rates for 24 hours in `exchange_rates` table
- Smart fallback if API unavailable

✅ **Terms & Conditions**
- Mandatory checkbox during registration
- Super Admin can edit terms in Settings
- Stored in database, not hardcoded

✅ **Family Management System**
- Multi-family support with family deletion
- Family-based user hierarchy
- Protected admin family (fam_admin)

## Tech Stack
- **Frontend**: React 18.2.0 + Vite 5.0.0 + Tailwind CSS
- **Backend**: Express.js 5.x with TypeScript
- **Sessions**: PostgreSQL (production) / Memory (development)
- **Databases**: 
  - SQLite: `data.db` (local app data)
  - PostgreSQL: `session` table (session storage only in production)
- **AI**: Google Gemini AI
- **Exchange Rates**: ExchangeRate-API (1500 requests/month free)

## Database Schema
- **families**: Multi-family support
- **users**: User profiles with role hierarchy
- **transactions**: Income/expense records
- **savings_goals** / **goal_transactions**: Savings tracking
- **app_settings**: Global configuration (gemini_api_key, terms_of_service)
- **exchange_rates**: 24-hour cached currency rates
- **session**: PostgreSQL-backed sessions (production only)

## API Endpoints
- **Auth**: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/me`
- **Families**: `GET/DELETE /api/families` (Super Admin only)
- **Exchange Rates**: `GET /api/settings/rates/:provider` (BNA/FOREX/PARALLEL)
- **Settings**: `GET/POST /api/settings/:key` (Super Admin only)
- **Transactions/Goals/Users**: Full CRUD endpoints

## Deployment
**For Ubuntu Proxmox - FULLY AUTOMATED:**
```bash
sudo ./deploy.sh
```
That's it! The script will:
1. ✅ Install Node.js automatically
2. ✅ Build the application
3. ✅ **Ask for PostgreSQL string** (paste your connection string)
4. ✅ Configure systemd with `TheFinance` variable
5. ✅ Start the service automatically

**For Render/Cloud:**
1. Connect GitHub repository
2. Set `TheFinance` environment variable (PostgreSQL connection string)
3. Deploy - sessions automatically use PostgreSQL

**Production Environment Variables:**
- `NODE_ENV=production` (set by deploy script)
- `TheFinance=postgresql://user:pass@host:5432/dbname` (sessions storage - **set during deploy.sh**)
- `PORT=5000` (set by deploy script)

## Session Storage - How It Works
1. **Development**: Uses memory store (in-process)
2. **Production with TheFinance**: Uses PostgreSQL
3. **Production without TheFinance**: Falls back to memory (with warning)

Ideal setup: Always provide `TheFinance` in production for persistent sessions.

## External APIs
- **ExchangeRate-API**: Real-time currency rates (https://exchangerate-api.com/)
- **Google Gemini**: AI-powered financial insights
- **DiceBear**: Avatar generation

## Testing Checklist
- ✅ Backend data synchronization
- ✅ Multi-device session persistence
- ✅ Exchange rates auto-refresh (24h)
- ✅ Terms & Conditions mandatory acceptance
- ✅ Family creation and deletion
- ✅ PostgreSQL sessions (production ready)

## Next Steps
1. 🔄 Deploy to production (Ubuntu/Render/Cloud)
2. 🔄 Set TheFinance environment variable
3. 🔄 Change default admin password
4. 🔄 Configure Gemini API key in Settings
5. 🔄 Add production SSL certificates
6. 🔄 Set up automated backups

## Credentials (Change Immediately in Production!)
- Username: `admin`
- Password: `admin`
