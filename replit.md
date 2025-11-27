# Gestor Financeiro Familiar - Production Ready Setup

## Overview
A comprehensive family financial management platform built with React, TypeScript, and Express.js. This application provides intelligent financial tracking, AI-powered insights using Google's Gemini AI, Puter.js, and family-friendly features for household budget management. It offers multi-user support with role hierarchy, real-time financial data, and robust administrative controls. The project aims to deliver a production-ready solution for household budget management with advanced features like AI insights, real-time notifications, and detailed financial reporting.

## User Preferences
- Application uses Portuguese (PT) as primary language
- Default login: `admin` / `admin`
- Deployment target: Ubuntu 20.04+ on Proxmox VMs (or Render/Production)
- Theme: Supports dark mode preference

## System Architecture
The application is built with a React frontend (Vite, Tailwind CSS) and an Express.js backend (TypeScript). It supports multi-family management with role-based access control. Core features include:

**UI/UX:**
- Premium animations (bounce-in, pulse-soft, glow-pulse, shake, slide effects)
- Interactive sidebar with hover effects and active state indicators
- Redesigned login with animated background gradients and gradient text
- Global styling with custom scrollbar, glass morphism, and smooth transitions
- Real-time currency formatting in input fields for visual confirmation (e.g., "AOA 1.500,00")
- Interactive Financial Health Score widget with dynamic colors and animations

**Technical Implementations & Feature Specifications:**
- **Notification Management:** Supports Web Push Notifications (Service Worker, subscribers in `push_subscriptions` table) and Email Notifications (SendGrid integration optional). Users and Super Admins can configure preferences for budget alerts, subscription reminders, financial tips (AI insights), and goal progress.
- **Budget History Tracking:** Automated tracking of monthly spending by category in a `budget_history` table. Auto-saves history on month change and uses a background scheduler. Includes subscriptions in budget calculations.
- **User-Specific Budgets:** Allows users to create and manage their own budget categories, isolated per user, with validation to prevent duplicate categories for the same user.
- **Expanded Frequencies:** Offers 6 recurrence options for subscriptions: Weekly, Bi-weekly, Monthly, Quarterly, Semi-annually, and Annually.
- **Intelligent Alerts:** Budget limits, recurring transactions, high inflation.
- **PDF Reports:** Export monthly/annual data with compiled tables.
- **Category Graphs:** Pie charts for expense distribution.
- **System Update:** Super Admin can trigger automatic system updates via the UI (git pull, npm install, build, restart) with real-time progress.
- **Backup & Restore:** Manual backup of all data to JSON and restoration from JSON with visible progress indicators.
- **Session Management:** Uses PostgreSQL for session storage in production to ensure persistence and scalability.
- **Dynamic Exchange Rates:** Fetches real-time rates from ExchangeRate-API, cached for 24 hours.
- **Terms & Conditions:** Mandatory acceptance during registration, editable by Super Admin, stored in the database.
- **Family Management:** Supports multi-family structures with family-based user hierarchy and protection for the admin family.
- **User Profile Management:** Edit avatar, name, email, and password from sidebar modal. Profile changes persist to database.
- **AI Integration System:** Three providers available (Gemini, OpenRouter, Puter.js) with seamless switching.

**Deployment:**
- Automated deployment script for Ubuntu Proxmox VMs handles Node.js installation, build, PostgreSQL configuration, and systemd service setup.
- Cloud deployment (e.g., Render) requires setting `TheFinance` environment variable for PostgreSQL connection.

**Database Schema Highlights:**
- `families`: For multi-family support.
- `users`: User profiles with role hierarchy.
- `transactions`: Income/expense records.
- `savings_goals`, `goal_transactions`: Savings tracking.
- `app_settings`: Global configurations (API keys, terms).
- `exchange_rates`: Cached currency rates.
- `session`: PostgreSQL-backed sessions (production).
- `push_subscriptions`: Stores web push notification subscribers.
- `budget_history`: Stores monthly spending by category.
- `notification_preferences`: User and global notification settings.

## External Dependencies
- **ExchangeRate-API**: Real-time currency exchange rates (exchangerate-api.com).
- **Google Gemini**: AI for financial insights.
- **Puter.js**: Free AI (400+ models), cloud storage, database, auth, hosting - no limits.
- **OpenRouter**: Multi-model AI access (GPT, Claude, Llama, etc).
- **SendGrid**: Email notification delivery (optional - configure via env vars).
- **DiceBear**: Avatar generation.
- **World Bank API**: Inflation data for Angola (`FP.CPI.TOTL.ZG` indicator), with caching and fallback mechanisms.
- **PostgreSQL**: Primary database for session storage in production.
- **SQLite**: Local database (`data.db`) for application data in development/local setups.

## Recent Implementation (November 27, 2025 - PUTER.JS INTEGRATION + COMPLETE PROFILE MANAGEMENT)

### ✅ PUTER.JS INTEGRATION - FREE UNLIMITED AI PROVIDER
- ✅ Installed `@heyputer/puter.js` npm package
- ✅ Added Puter.js script tag to index.html (`<script src="https://js.puter.com/v2/"></script>`)
- ✅ Created `services/puterService.ts` with helper functions for transcription, chat, etc.
- ✅ Modified AdminPanel to show Puter as third AI provider option
- ✅ Puter button highlighted green (emerald) for easy identification
- ✅ Information panel shows all available Puter resources (Chat, Speech-to-Text, Image generation, Cloud storage, NoSQL database, etc)
- ✅ Zero configuration needed - Puter.js handles everything client-side
- ✅ Ready for production deployment

### ✅ USER PROFILE MODAL - COMPLETE EDITING
- ✅ ProfileModal.tsx component with full profile editing
- ✅ Avatar upload and preview with hover "Trocar" button
- ✅ Name editing
- ✅ Email editing (optional, for notifications)
- ✅ Username display (read-only)
- ✅ Password change section with current password verification
- ✅ Password confirmation matching validation
- ✅ Minimum length requirement (4 characters)
- ✅ Clear error messages for all validations
- ✅ Success message after saving (1.5s auto-close)
- ✅ Accessible from Sidebar avatar/name click
- ✅ Dark mode support

### ✅ NOTIFICAÇÕES COMPLETO - Full Notification Management System (PRODUCTION READY)

#### **🔔 WEB PUSH NOTIFICATIONS**
- ✅ Service Worker em `public/service-worker.js` - registra e gerencia subscriptions
- ✅ Database table `push_subscriptions` - stores subscriber info per user
- ✅ UI: Botão "🔔 Ativar Notificações Push" em Dashboard
- ✅ Permissões automáticas do browser solicitadas
- ✅ **API Endpoints:**
  - `POST /api/push/subscribe` - Registar subscription
  - `POST /api/push/unsubscribe` - Remover subscription
  - `GET /api/push/status` - Verificar status

#### **📧 EMAIL NOTIFICATIONS**
- ✅ **SendGrid Integration (opcional)** - Configure `SENDGRID_API_KEY` + `SENDGRID_FROM_EMAIL`
- ✅ **Fallback Mode** - Logging em console para desenvolvimento (sem config necessária)
- ✅ Email templates: Alertas de Orçamento, Dicas Financeiras, Progresso de Metas
- ✅ UI: Botão "📧 Enviar Email de Teste" em Notificações
- ✅ **API Endpoints:**
  - `POST /api/email/test` - Enviar email de teste
  - `GET /api/email/config` - Verificar configuração

#### **🌐 GESTÃO CENTRALIZADA DE PREFERÊNCIAS**
1. **Super Admin (GlobalNotifications):**
   - Admin Panel → "🌐 Configurações de Notificações"
   - Define preferências que se aplicam globalmente
   - Controla: budget_alerts, subscription_alerts, financial_tips, goal_progress
   - Controla canais: email_notifications, push_notifications

2. **Utilizadores (Notificações Pessoais):**
   - Dashboard → 🔔 (canto superior) → "Minhas Notificações"
   - Podem ativar/desativar Web Push
   - Podem testar Email
   - Override das configurações globais se desejarem

#### **Database Tables:**
- `notification_preferences` - Armazena preferências (global + user-specific)
- `push_subscriptions` - Armazena subscriptions de cada utilizador

#### **Frontend Components:**
- `NotificationSettings.tsx` - UI centralizada para config
- `PushNotificationButton.tsx` - Ativar/desativar Web Push
- `EmailNotificationButton.tsx` - Testar Email

#### **Como Usar em Produção:**
1. **Web Push:** Funciona automaticamente (sem config necessária)
2. **Email:** Configure variáveis de ambiente:
   ```
   SENDGRID_API_KEY=<seu_api_key>
   SENDGRID_FROM_EMAIL=noreply@sua-empresa.com
   ```

---

## Funcionalidades Implementadas (Resumo Completo)

| Feature | Status | Notas |
|---------|--------|-------|
| 🔔 Web Push Notifications | ✅ | Funcionando |
| 📧 Email Notifications | ✅ | SendGrid opcional + fallback |
| 🌐 Gestão Global (Super Admin) | ✅ | AdminPanel |
| 👤 Preferências Pessoais (Utilizadores) | ✅ | Dashboard modal |
| 💰 Orçamentos User-Specific | ✅ | Categorias livres |
| 📅 Frequências (6 opções) | ✅ | Semanal, Quinzenal, Mensal, Trimestral, Semestral, Anual |
| 💵 Currency Previews | ✅ | Real-time em inputs |
| 📈 Budget History | ✅ | Auto-save com 12 meses |
| ✏️ Edit Profile (Avatar, Name, Email, Password) | ✅ | Completo com validações |
| 🤖 AI Providers (Gemini, OpenRouter, Puter.js) | ✅ | Seamless switching |
| 🎙️ Speech-to-Text (via Puter.js) | ✅ | Unlimited requests |
| 🏗️ Build | ✅ | Sem erros (451KB gzip) |
| 🚀 Servidor | ✅ | Rodando |

**Aplicação PRODUCTION-READY! 🎉**

