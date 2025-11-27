# Gestor Financeiro Familiar - Compressed Replit Setup

## Overview
A comprehensive family financial management platform built with React, TypeScript, and Express.js. This application provides intelligent financial tracking, AI-powered insights using Google's Gemini API, and family-friendly features for household budget management. It offers multi-user support with role hierarchy, real-time financial data, and robust administrative controls. The project aims to empower families with tools for effective financial planning, budgeting, and informed decision-making.

## User Preferences
- Application uses Portuguese (PT) as primary language
- Default login: `admin` / `admin`
- Deployment target: Ubuntu 20.04+ on Proxmox VMs
- Theme: Supports dark mode preference

## System Architecture

### Tech Stack
- **Frontend**: React 18.2.0, Vite 5.0.0, Tailwind CSS 3.4.1, Recharts 2.10.3
- **Backend**: Express.js 5.x, TypeScript 5.2.2
- **Database**: SQLite (better-sqlite3)
- **AI Integration**: Google Gemini AI (@google/genai)
- **Authentication**: bcryptjs, express-session

### Key Features
1.  **AI-Powered Financial Assistant**: Transaction categorization, financial advice, PDF contract analysis, behavioral pattern detection using Gemini AI.
2.  **Family Management System**: Multi-user support with Super Admin, Manager, and Member roles; shared family calendar and task management; parental controls; family creation and deletion.
3.  **Financial Management**: Transaction tracking (income/expenses), budget limits and alerts, savings goals, loan simulations (PRICE vs SAC), multi-currency support (Kz, USD, EUR), inflation calculator.
4.  **Dynamic Exchange Rates**: Real-time daily updates from ExchangeRate-API, cached in the database for 24 hours, with fallback mechanisms.
5.  **Terms & Conditions**: Mandatory acceptance during registration, Super Admin editable, stored in `app_settings`.
6.  **User Experience**: Responsive design, dark mode, file attachments, camera integration, backup/restore.

### Project Structure
-   `/server`: Express.js backend with database schema, routes for authentication, transactions, goals, users, families, budget, and settings.
-   `/components`: React components for UI (Dashboard, Transactions, Goals, FamilyMode, AdminPanel, AIAssistant, Login).
-   `/services`: Frontend services for API interaction, Gemini integration, and market data.
-   `App.tsx`, `index.tsx`: Main application entry points.
-   `vite.config.ts`: Vite configuration including API proxy.
-   `deploy.sh`: Production deployment script.

### Database Schema
-   `families`: Stores family names.
-   `users`: User profiles with roles, family association, and security info.
-   `transactions`: Records of income and expenses.
-   `savings_goals`, `goal_transactions`: Manages savings targets and contributions.
-   `app_settings`: Global application settings, including `gemini_api_key` and `terms_of_service`.
-   `exchange_rates`: Caches dynamic currency exchange rates.

### API Endpoints
-   **Authentication**: `/api/auth/login`, `/api/auth/register` (requires `familyName`), `/api/auth/logout`, `/api/auth/me`, `/api/auth/recover-password`.
-   **CRUD Operations**: For transactions, goals, and users.
-   **Family Management**: `/api/families` (GET all, DELETE by ID - Super Admin only).
-   **Exchange Rates**: `/api/settings/rates/:provider` (BNA, FOREX, PARALLEL) for cached or live rates.
-   **Settings**: `/api/settings/:key` for global configuration (Super Admin specific).

### Deployment
The application is deployed using a `deploy.sh` script for Ubuntu servers, automating Node.js installation, Git configuration, database initialization, dependency installation, production build, and Systemd service creation for auto-restart and port configuration.

## External Dependencies
-   **Google Gemini API**: Used for AI-powered financial insights and transaction analysis.
-   **ExchangeRate-API (exchangerate-api.com)**: Provides real-time currency exchange rates.
-   **jsPDF with autoTable**: For PDF generation within the application.
-   **Tailwind CSS**: Utility-first CSS framework for styling.
-   **Recharts**: JavaScript charting library for data visualization.
-   **bcryptjs**: For secure password hashing.
-   **express-session**: For managing user sessions.