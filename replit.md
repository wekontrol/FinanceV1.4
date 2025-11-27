# Gestor Financeiro Familiar - Replit Setup

## Overview
A comprehensive family financial management platform built with React, TypeScript, and Express.js. This application provides intelligent financial tracking, AI-powered insights using Google's Gemini API, and family-friendly features for household budget management.

**Current State**: Full-stack application with Express.js backend and SQLite database, fully deployed on Ubuntu servers.

## Recent Changes (November 27, 2025)
### Session & Authentication Fixes
- Fixed Express.js session persistence issues for adding transactions/goals
- Improved CORS configuration with proper credentials handling
- Enhanced session middleware ordering (CORS → Session → Routes)
- Added `proxy: true` for session cookies with proxies
- Fixed PORT environment variable parsing (parseInt)
- Ensured `sameSite: 'lax'` and `path: '/'` for cookie availability

### Previous Updates
- Converted from client-side to full-stack server-side application
- Added Express.js backend with REST API endpoints
- Implemented SQLite database for persistent data storage
- Added session-based authentication with bcrypt password hashing
- Configured Vite proxy for API requests during development
- Updated deployment configuration for server-side hosting
- Fixed Express 5.x routing issue (SPA fallback)
- Configured systemd service for automatic startup on Ubuntu

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
│       └── budget.ts       # Budget limits
├── components/             # React components
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   ├── Goals.tsx
│   ├── FamilyMode.tsx
│   ├── AdminPanel.tsx
│   ├── AIAssistant.tsx
│   ├── Login.tsx
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

### Data Storage
- **SQLite Database**: `data.db` - All persistent data
- **Session Management**: In-memory with express-session (server-side)
- **Local Storage**: App preferences and saved simulations (frontend)
- **Environment Variables**: API keys and secrets

### API Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - Create new family account
- `POST /api/auth/logout` - End session
- `GET /api/auth/me` - Get current user from session
- `GET/POST/PUT/DELETE /api/transactions` - Manage transactions
- `GET/POST/PUT/DELETE /api/goals` - Manage savings goals
- `POST /api/goals/:id/contribute` - Add goal contribution
- `GET/POST/PUT/DELETE /api/users` - User management
- `GET/POST/PUT/DELETE /api/family/tasks` - Family tasks
- `GET/POST/PUT/DELETE /api/family/events` - Family events
- `GET/POST/DELETE /api/budget/limits` - Budget limits
- `GET /api/health` - Health check endpoint

### Environment Variables
- `NODE_ENV`: Set to "production" for server mode, "development" for dev
- `PORT`: Server port (default: 3001 for dev, 5000 for production)
- `SESSION_SECRET`: Session encryption key (auto-generated if not provided)
- `SECURE_COOKIES`: Set to 'false' to disable secure cookie flag in development

## User Preferences
- Application uses Portuguese (PT) as primary language
- Default login: `admin` / `admin`
- Deployment target: Ubuntu 20.04+ on Proxmox VMs

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

## Troubleshooting

### Sessions Not Persisting (Transactions/Goals Not Saving)
**Symptoms**: "Not authenticated" error when adding transactions/goals

**Solutions**:
1. Ensure cookies are being sent: Check browser DevTools → Network → see Set-Cookie headers
2. Check Express.js middleware order: CORS must be before Session middleware ✅
3. Verify CORS configuration: credentials: true ✅
4. Test with curl: `curl -c cookies.txt -X POST http://localhost:5000/api/auth/login ...` then use `-b cookies.txt` for subsequent requests

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

### Git "Dubious Ownership" on Production
Already fixed in deploy.sh with: `git config --global --add safe.directory /var/www/gestor-financeiro`

## Performance Notes
- Bundle size warning for chunks > 500kB (consider code splitting)
- MemoryStore for sessions is suitable for single-process deployments
- SQLite is ideal for embedded/single-server deployments
- Consider PostgreSQL + proper session store (connect-pg-simple) for multi-process/clustered setups

## Next Steps
1. ✅ Test login and transaction adding on deployed instance
2. 🔐 Change default admin password on production
3. 📱 Add more users/family members
4. 🔑 Configure Google Gemini API key in app settings
5. 📊 Start tracking transactions
6. 💾 Set up automated backups

## Credenciais Padrão (Altere em Produção!)
- Username: `admin`
- Password: `admin`

⚠️ **IMPORTANTE**: Altere imediatamente após primeiro login em produção!

