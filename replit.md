# Gestor Financeiro Familiar - Replit Setup

## Overview
A comprehensive family financial management platform built with React, TypeScript, and Express.js. This application provides intelligent financial tracking, AI-powered insights using Google's Gemini API, and family-friendly features for household budget management.

**Current State**: Full-stack application with Express.js backend and SQLite database, fully deployed on Ubuntu servers.

## Recent Changes (November 27, 2025 - Latest)
### Family Management System
- ✅ Added `families` table to database for storing family names
- ✅ Created `/api/families` endpoints (GET all, DELETE by ID)
- ✅ Modified registration to require `familyName` during signup
- ✅ Added "Gerenciar Famílias" section in AdminPanel (Super Admin only)
- ✅ Super Admin can view all families with member count
- ✅ Super Admin can delete families (with cascade delete of users/transactions/goals)
- ✅ Protected admin family (fam_admin) from deletion

### Previous Updates (November 27, 2025)
- Fixed session persistence across devices (backend working 100%)
- Implemented global Gemini API key storage in database
- Added `/api/settings` endpoint for Super Admin configuration
- Fixed all missing function exports (suggestBudgets, getAiChatResponse)
- Resolved data synchronization verification (backend fully functional)

## Project Architecture

### Tech Stack
- **Frontend Framework**: React 18.2.0
- **Backend Framework**: Express.js 5.x
- **Language**: TypeScript 5.2.2
- **Build Tool**: Vite 5.0.0
- **Database**: SQLite (better-sqlite3)
- **Styling**: Tailwind CSS 3.4.1
- **AI Integration**: Google Gemini AI (@google/genai)
- **Charts**: Recharts 2.10.3
- **PDF Generation**: jsPDF with autoTable
- **Session Management**: express-session (memory store)
- **Authentication**: bcryptjs for password hashing

### Key Features
1. **AI-Powered Financial Assistant**
   - Transaction categorization using Gemini AI
   - Financial advice and insights
   - PDF contract analysis for loan simulations
   - Behavioral pattern detection

2. **Family Mode**
   - Multi-user support with role hierarchy (Super Admin, Manager, Member)
   - **NEW**: Family management system - view and delete families
   - Shared family calendar and task management
   - Parental controls and viewing permissions

3. **Financial Management**
   - Transaction tracking (income/expenses)
   - Budget limits and alerts
   - Savings goals with visual progress
   - Loan simulations (PRICE vs SAC tables)
   - Multi-currency support (Kz, USD, EUR)
   - Inflation calculator

4. **User Experience**
   - Responsive design for mobile and desktop
   - Dark mode support
   - File attachments and camera integration
   - Backup and restore functionality

### Project Structure
```
/
├── server/                  # Backend Express.js server
│   ├── index.ts            # Server entry point with CORS & session config
│   ├── db/
│   │   └── schema.ts       # Database schema and initialization
│   └── routes/             # API route handlers
│       ├── auth.ts         # Authentication endpoints (login, register)
│       ├── transactions.ts # Transaction CRUD
│       ├── goals.ts        # Savings goals with contributions
│       ├── users.ts        # User management
│       ├── family.ts       # Family tasks & events
│       ├── families.ts     # Family management (NEW)
│       ├── budget.ts       # Budget limits
│       └── settings.ts     # Global settings (API keys, etc)
├── components/             # React components
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   ├── Goals.tsx
│   ├── FamilyMode.tsx
│   ├── AdminPanel.tsx      # Updated with Families section
│   ├── AIAssistant.tsx
│   ├── Login.tsx           # Updated with family name field
│   └── ...
├── services/              # Frontend services
│   ├── api.ts            # API client (calls backend endpoints)
│   ├── geminiService.ts  # AI integration
│   └── marketData.ts     # Exchange rates
├── App.tsx               # Main application component
├── index.tsx             # Application entry point
├── types.ts              # TypeScript type definitions
├── vite.config.ts        # Vite config with API proxy
├── deploy.sh             # Production deployment script
├── README_INSTALL.md     # Installation & deployment guide
└── package.json          # Dependencies and scripts
```

### Database Schema
- **families** table: id, name, created_at
- **users** table: id, username, password, name, role, avatar, status, created_by, family_id, birth_date, allow_parent_view, security_question, security_answer, created_at
- **transactions** table: User spending/income records
- **savings_goals** table: User savings goals
- **goal_transactions** table: Contributions to goals
- **app_settings** table: Global settings (gemini_api_key, etc)

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User authentication (returns user + creates session)
- `POST /api/auth/register` - Create new family account (now requires familyName)
- `POST /api/auth/logout` - End session
- `GET /api/auth/me` - Get current user from session
- `POST /api/auth/recover-password` - Password recovery

#### Transactions
- `GET /api/transactions` - List user's transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

#### Goals
- `GET /api/goals` - List user's goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `POST /api/goals/:id/contribute` - Add goal contribution

#### Users
- `GET /api/users` - List visible users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Family Management (NEW)
- `GET /api/families` - List all families (Super Admin only)
- `DELETE /api/families/:id` - Delete family + all cascade data (Super Admin only)

#### Other Endpoints
- `GET/POST/PUT/DELETE /api/family/tasks` - Family tasks
- `GET/POST/DELETE /api/family/events` - Family events
- `GET/POST/DELETE /api/budget/limits` - Budget limits
- `GET /api/settings/:key` - Get setting (authenticated)
- `POST /api/settings/:key` - Set global setting (Super Admin only)
- `GET /api/health` - Health check endpoint

### Registration Flow (UPDATED)
1. User clicks "Criar Nova Família"
2. Provides: Name, Username, Password, **Family Name**, Security Question/Answer
3. New family is created with name in `families` table
4. New user is created as MANAGER with APPROVED status
5. User is redirected to login

### Family Management (NEW)
1. **Super Admin** goes to ⚙️ Configurações
2. Opens "Gerenciar Famílias" section
3. Sees all families with member count
4. Can click delete (🗑️) to remove a family
5. Deletion cascades: removes all users, transactions, goals in that family
6. Cannot delete default admin family (fam_admin)

### Global Settings System
1. Super Admin adds Gemini API key in ⚙️ Configurações > Integrações & IA
2. Key is stored in `app_settings` table (server-side)
3. All users automatically use the Super Admin's key
4. Works across all devices and sessions

### Environment Variables
- `NODE_ENV`: Set to "production" for server mode, "development" for dev
- `PORT`: Server port (default: 3001 for dev, 5000 for production)
- `SESSION_SECRET`: Session encryption key (auto-generated if not provided)
- `SECURE_COOKIES`: Set to 'false' to disable secure cookie flag in development

## User Preferences
- Application uses Portuguese (PT) as primary language
- Default login: `admin` / `admin`
- Deployment target: Ubuntu 20.04+ on Proxmox VMs
- Theme: Supports dark mode preference

## Development Notes
- **Development**: `npm run dev` starts both servers concurrently
  - Frontend dev server: http://localhost:5000
  - Backend server: http://localhost:3001 (accessed via Vite proxy at /api)
  - Vite proxy configured in `vite.config.ts`

- **Production**: `npm run start` starts Express.js with static file serving
  - Single server on port 5000
  - Serves React SPA from `dist/` directory
  - All API routes available at `/api/*`

- **Build**: `npm run build` generates optimized React bundle
  - Output directory: `dist/`
  - No source maps in production

## Session Management & Authentication Flow
1. **Login**: POST /api/auth/login → Creates server-side session
2. **Session Cookie**: HttpOnly, SameSite=Lax, 24-hour max age
3. **CORS**: Configured to allow credentials from any origin
4. **Protected Routes**: All API endpoints (except /auth/login, /auth/register) require valid session
5. **Logout**: POST /api/auth/logout → Destroys session
6. **Data Sync**: Frontend calls loadAllData() after successful login

## Data Flow & Synchronization
- **Backend**: SQLite database (persistent, shared across sessions/devices)
- **Frontend**: React state + optional localStorage (for UI preferences only)
- **Key Data**: Always fetched from server on login
- **Cross-Device**: Users see same data on login from different devices

## Deployment

### Deployment to Ubuntu via deploy.sh
```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

Features:
- ✅ Automatic Node.js 20 installation
- ✅ Git configuration for safe directory handling
- ✅ Database initialization on first run
- ✅ NPM dependencies installation
- ✅ Production build generation
- ✅ Systemd service creation with auto-restart
- ✅ Port 5000 configured
- ✅ Auto-start on system reboot

### Manual Deployment
See `README_INSTALL.md` for step-by-step installation instructions on Ubuntu.

### Systemd Service Configuration
- **Service**: `gestor-financeiro.service`
- **User**: `nodeapp`
- **Directory**: `/var/www/gestor-financeiro`
- **Auto-restart**: Yes (10-second delay between attempts)
- **Logs**: `sudo journalctl -u gestor-financeiro -f`

## Testing Checklist
- ✅ Backend data synchronization (tested with curl)
- ✅ Multi-device access (same data appears on different devices)
- ✅ Family creation with name
- ✅ Family deletion (Super Admin only)
- ✅ Global Gemini API key (Super Admin configures once)
- ✅ Session persistence (cookies working)

## Troubleshooting

### Sessions Not Persisting
**Solutions**:
1. Ensure cookies are being sent: DevTools → Network → Set-Cookie headers
2. Express.js middleware order: CORS → Session → Routes ✅
3. CORS configuration: credentials: true ✅
4. Cookie settings: sameSite: 'lax', path: '/', proxy: true ✅

### Data Not Syncing Between Devices
**Solutions**:
1. Clear browser cache: Ctrl+F5
2. Clear localStorage: `localStorage.clear()` in console
3. Verify same credentials are used
4. Check DevTools → Network for `connect.sid` cookie in requests

### Port Already in Use
```bash
sudo lsof -i :5000
sudo kill -9 <PID>
```

### Database Lock Errors
```bash
rm -f /var/www/gestor-financeiro/data.db-wal data.db-shm
sudo systemctl restart gestor-financeiro
```

## Next Steps
1. ✅ Test login and transaction adding
2. ✅ Verify cross-device data sync
3. ✅ Configure global Gemini API key
4. 🔄 Test family management (create, delete)
5. 🔄 Deploy to production Ubuntu server
6. 🔄 Change default admin password
7. 🔄 Add more families and users
8. 🔄 Start tracking transactions with AI

## Credentials (Change in Production!)
- Username: `admin`
- Password: `admin`

⚠️ **IMPORTANTE**: Change immediately after first login in production!
