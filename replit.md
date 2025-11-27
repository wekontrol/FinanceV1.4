# Gestor Financeiro Familiar - Replit Setup

## Overview
A comprehensive family financial management platform built with React, TypeScript, and Express.js. This application provides intelligent financial tracking, AI-powered insights using Google's Gemini API, and family-friendly features for household budget management.

**Current State**: Full-stack application with Express.js backend and React frontend, running on Replit.

## Recent Changes (November 27, 2025)
- Converted from client-side to full-stack server-side application
- Added Express.js backend with REST API endpoints
- Implemented SQLite database for persistent data storage
- Added session-based authentication with bcrypt password hashing
- Created API endpoints for:
  - Authentication (login, register, logout, password recovery)
  - Transactions (CRUD operations)
  - Savings Goals (with contributions)
  - Budget Limits
  - Family Tasks and Events
  - User Management
- Configured Vite proxy for API requests during development
- Updated deployment configuration for server-side hosting

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
- **Session Management**: express-session

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
├── server/              # Backend Express.js server
│   ├── index.ts         # Server entry point
│   ├── db/
│   │   └── schema.ts    # Database schema and initialization
│   └── routes/          # API route handlers
│       ├── auth.ts      # Authentication endpoints
│       ├── transactions.ts
│       ├── goals.ts
│       ├── users.ts
│       ├── family.ts
│       └── budget.ts
├── components/          # React components
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   ├── Goals.tsx
│   ├── FamilyMode.tsx
│   ├── AdminPanel.tsx
│   ├── AIAssistant.tsx
│   ├── Login.tsx
│   └── ...
├── services/           # Frontend services
│   ├── api.ts          # API client for backend
│   ├── geminiService.ts
│   └── marketData.ts
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
├── types.ts            # TypeScript type definitions
├── vite.config.ts      # Vite configuration with API proxy
└── package.json        # Dependencies and scripts
```

### Data Storage
- **SQLite Database**: All data persisted in `data.db` file
- **Session Management**: Server-side sessions for authentication
- **Local Storage**: App preferences and saved simulations (frontend)
- **AI API Key**: Gemini API key stored in localStorage (user-provided)

### API Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - Create new family account
- `POST /api/auth/logout` - End session
- `GET /api/auth/me` - Get current user
- `GET/POST/PUT/DELETE /api/transactions` - Manage transactions
- `GET/POST/PUT/DELETE /api/goals` - Manage savings goals
- `POST /api/goals/:id/contribute` - Add goal contribution
- `GET/POST/PUT/DELETE /api/users` - User management
- `GET/POST/PUT/DELETE /api/family/tasks` - Family tasks
- `GET/POST/PUT/DELETE /api/family/events` - Family events
- `GET/POST/DELETE /api/budget/limits` - Budget limits

### Environment Variables
- `SESSION_SECRET`: Session encryption key (auto-generated)
- `PORT`: Server port (default: 3001 for backend)

## User Preferences
- Application uses Portuguese (PT) as primary language
- Default login: `admin` / `admin`

## Development Notes
- Frontend dev server runs on port 5000 (with Vite proxy to backend)
- Backend server runs on port 3001
- Run `npm run dev` to start both servers concurrently
- Run `npm run build` to build for production
- Run `npm run start` to start production server
- SQLite database file is auto-created on first run
- Database includes initial sample data for testing

## Deployment
- Deployment target: Autoscale
- Build command: `npm run build`
- Start command: `npm run start`
- The production server serves static files from `dist/` directory
