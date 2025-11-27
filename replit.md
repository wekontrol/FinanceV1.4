# Gestor Financeiro Familiar - Production Ready Setup

## Overview
A comprehensive family financial management platform built with React, TypeScript, and Express.js. This application provides intelligent financial tracking, AI-powered insights using Google's Gemini AI, Puter.js, and family-friendly features for household budget management. It offers multi-user support with role hierarchy, real-time financial data, and robust administrative controls. The project aims to deliver a production-ready solution for household budget management with advanced features like AI insights, real-time notifications, and detailed financial reporting.

## User Preferences
- Application uses **Portuguese (PT)** as primary language
- **NEW: Multi-language support - Português, English, Español, Umbundu** (optional selector on login)
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
- **NEW: Language selector on login screen (top-right corner, optional)**

**Technical Implementations & Feature Specifications:**
- **Notification Management:** Supports Web Push Notifications (Service Worker, subscribers in `push_subscriptions` table) and Email Notifications (SendGrid integration optional). Users and Super Admins can configure preferences for budget alerts, subscription reminders, financial tips (AI insights), and goal progress.
- **Budget History Tracking:** Automated tracking of monthly spending by category in a `budget_history` table. Auto-saves history on month change and uses a background scheduler. Includes subscriptions in budget calculations.
- **User-Specific Budgets:** Allows users to create and manage their own budget categories, isolated per user, with validation to prevent duplicate categories for the same user.
- **Expanded Frequencies:** Offers 6 recurrence options for subscriptions: Weekly, Bi-weekly, Monthly, Quarterly, Semi-annually, and Annually.
- **Intelligent Alerts:** Budget limits, recurring transactions, high inflation.
- **PDF Reports:** Export monthly/annual data with compiled tables + Advanced Analysis PDFs (waste analysis + forecasts).
- **Category Graphs:** Pie charts for expense distribution.
- **System Update:** Super Admin can trigger automatic system updates via the UI (git pull, npm install, build, restart) with real-time progress.
- **Backup & Restore:** Manual backup of all data to JSON and restoration from JSON with visible progress indicators.
- **Session Management:** Uses PostgreSQL for session storage in production to ensure persistence and scalability.
- **Dynamic Exchange Rates:** Fetches real-time rates from ExchangeRate-API, cached for 24 hours.
- **Terms & Conditions:** Mandatory acceptance during registration, editable by Super Admin, stored in the database.
- **Family Management:** Supports multi-family structures with family-based user hierarchy and protection for the admin family.
- **User Profile Management:** Edit avatar, name, email, and password from sidebar modal. Profile changes persist to database.
- **AI Integration System:** Three providers available (Gemini, OpenRouter, Puter.js) with seamless switching.

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
- **`forecast_history`**: Stores historical forecasts for comparison and trend analysis.
- **`waste_analysis_history`**: Stores historical waste analyses for tracking improvements.

**Deployment:**
- Automated deployment script for Ubuntu Proxmox VMs handles Node.js installation, build, PostgreSQL configuration, and systemd service setup.
- Cloud deployment (e.g., Render) requires setting `TheFinance` environment variable for PostgreSQL connection.

## External Dependencies
- **ExchangeRate-API**: Real-time currency exchange rates (exchangerate-api.com).
- **Google Gemini**: AI for financial insights with 12+ advanced features.
- **Puter.js**: Free AI (400+ models), cloud storage, database, auth, hosting - no limits.
- **OpenRouter**: Multi-model AI access (GPT, Claude, Llama, etc).
- **SendGrid**: Email notification delivery (optional - configure via env vars).
- **DiceBear**: Avatar generation.
- **World Bank API**: Inflation data for Angola (`FP.CPI.TOTL.ZG` indicator), with caching and fallback mechanisms.
- **PostgreSQL**: Primary database for session storage in production.
- **SQLite**: Local database (`data.db`) for application data in development/local setups.

## Recent Implementation (November 27, 2025)

### ✅ LANGUAGE SELECTOR - Multi-language Support (NEW)
- ✅ Created `contexts/LanguageContext.tsx` for language state management
- ✅ Language selector dropdown on login screen (top-right corner)
- ✅ 4 languages available:
  - 🇵🇹 **Português** (default)
  - 🇬🇧 **English**
  - 🇪🇸 **Español**
  - 🇦🇴 **Umbundu** (Native Angolan language)
- ✅ Language preference saved to localStorage
- ✅ Optional selector - doesn't interfere with login flow
- ✅ Fully styled with flags and dark mode support
- ✅ Applied to login form labels and buttons
- ✅ Ready for full app translation (Phase 2)

**Implementation Details:**
- Location: `contexts/LanguageContext.tsx` (22KB, translations for 4 languages)
- Login translations: username, password, buttons, messages
- Integrated with `Login.tsx`, `index.tsx`, and `App.tsx`
- `useLanguage()` hook for components to access translations
- localStorage key: `app_language` (default: 'pt')

**How to Use:**
1. Open login page
2. Click language dropdown (top-right corner)
3. Select desired language (🇵🇹 🇬🇧 🇪🇸 🇦🇴)
4. Login labels and buttons update instantly
5. Language preference persists across sessions

---

### ✅ 4 ADVANCED GEMINI FEATURES - UI COMPLETA INTEGRADA

#### **1. 📸 OCR DE RECIBOS - Transactions.tsx**
- ✅ Botão "📸 OCR Recibo" adicionado ao modal de câmera
- ✅ Após tirar foto: clica "OCR Recibo" para processar
- ✅ Extrai automaticamente: descrição, valor, data, categoria
- ✅ Popula formulário da transação instantaneamente

#### **2. 💬 CHAT COM STREAMING - AIAssistant.tsx**
- ✅ Respostas em tempo real, chunk-by-chunk (20 caracteres)
- ✅ Melhor UX para conversas longas
- ✅ Latência: 50ms entre chunks para efeito natural

#### **3. 🚨 ANÁLISE DE DESPERDÍCIO - Dashboard.tsx**
- ✅ Card vermelho (rose/red gradient) no Dashboard
- ✅ Botão "Analisar" para triggerar análise
- ✅ Botão "📥 Exportar" para PDF com análise completa

#### **4. 📊 PREVISÕES FINANCEIRAS - Dashboard.tsx**
- ✅ Card verde (emerald/teal gradient) no Dashboard
- ✅ Botão "Prever" para previsões de 3 meses
- ✅ Botão "📥 Exportar" para PDF com previsões completas

---

### ✅ PDF EXPORT + HISTORY TRACKING
- ✅ `generateAnalysisPDF()` function em `services/reportService.ts`
- ✅ Tabelas `forecast_history` e `waste_analysis_history` criadas
- ✅ Download automático com data: `Analise_YYYY-MM-DD.pdf`

---

## Funcionalidades Implementadas (Resumo Completo)

| Feature | Status | Localização UI |
|---------|--------|---------------|
| 🌐 **Seletor de Idioma** | ✅ **NOVO** | Login → Canto superior direito |
| 🔔 Web Push Notifications | ✅ | Dashboard → 🔔 ícone |
| 📧 Email Notifications | ✅ | Dashboard → 🔔 ícone |
| 💰 Orçamentos User-Specific | ✅ | BudgetControl |
| 📅 Frequências (6 opções) | ✅ | Transactions form |
| 💵 Currency Previews | ✅ | Transactions inputs |
| 📈 Budget History | ✅ | Dashboard |
| ✏️ Edit Profile | ✅ | Sidebar → Avatar |
| 🤖 AI Providers (Gemini, OpenRouter, Puter.js) | ✅ | AdminPanel |
| 📸 OCR de Recibos | ✅ | Transactions → Câmera |
| 💬 Chat Streaming | ✅ | AIAssistant |
| 🚨 Análise de Desperdício | ✅ | Dashboard → Card vermelho |
| 📊 Previsões Financeiras | ✅ | Dashboard → Card verde |
| 📥 PDF Export | ✅ | Botão nos dois cards |
| 🏗️ Build | ✅ | 95.42KB gzip |
| 🚀 Servidor | ✅ | Rodando |

---

## Próximos Passos (Fase 2 - Opcional)
- Completar tradução de toda a UI para 4 idiomas
- Dashboard translations
- Transactions translations
- Admin panel translations
- All component labels and messages
- API endpoints para recuperar histórico
- Exportar histórico completo para análise de tendências
- Comparar histórico de previsões com gráficos

**Aplicação PRODUCTION-READY com IA AVANÇADA + MULTI-IDIOMA! 🎉**

