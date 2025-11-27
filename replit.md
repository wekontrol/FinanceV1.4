# Gestor Financeiro Familiar - Replit Setup

## Overview
A comprehensive family financial management platform built with React, TypeScript, and Vite. This application provides intelligent financial tracking, AI-powered insights using Google's Gemini API, and family-friendly features for household budget management.

**Current State**: Configured and running on Replit with frontend on port 5000.

## Recent Changes (November 27, 2025)
- Imported from GitHub repository
- Configured Vite to work with Replit's proxy environment
  - Set server to bind to 0.0.0.0:5000
  - Enabled allowedHosts: true to allow Replit's proxy domain
  - Configured HMR for WSS protocol on port 443
- Installed all npm dependencies
- Set up development workflow for hot-reload development server

## Project Architecture

### Tech Stack
- **Frontend Framework**: React 18.2.0
- **Language**: TypeScript 5.2.2
- **Build Tool**: Vite 5.0.0
- **Styling**: Tailwind CSS 3.4.1
- **AI Integration**: Google Gemini AI (@google/genai)
- **Charts**: Recharts 2.10.3
- **PDF Generation**: jsPDF with autoTable

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
├── components/          # React components
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   ├── Goals.tsx
│   ├── FamilyMode.tsx
│   ├── AdminPanel.tsx
│   ├── AIAssistant.tsx
│   └── ...
├── services/           # API and service integrations
│   ├── geminiService.ts
│   └── marketData.ts
├── App.tsx            # Main application component
├── index.tsx          # Application entry point
├── types.ts           # TypeScript type definitions
├── vite.config.ts     # Vite configuration
└── tailwind.config.js # Tailwind CSS configuration
```

### Data Storage
- **Local Storage**: All data is stored in browser localStorage
- **Session Management**: User sessions and preferences
- **AI API Key**: Gemini API key stored in localStorage (user-provided)

### Environment Variables
- `API_KEY`: Optional Gemini API key (fallback to localStorage)

## User Preferences
- Application uses Portuguese (PT) as primary language
- Default users include demo family data for testing
- Initial login: `admin` / `admin`

## Development Notes
- The app is fully client-side with no backend server
- All financial data processing happens in the browser
- AI features require user to provide their own Gemini API key
- Vite dev server runs on port 5000 (configured for Replit)
- HMR (Hot Module Replacement) configured for Replit's proxy environment
