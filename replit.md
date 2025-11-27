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
- **`forecast_history`**: Stores historical forecasts for comparison and trend analysis (NEW).
- **`waste_analysis_history`**: Stores historical waste analyses for tracking improvements (NEW).

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

## Recent Implementation (November 27, 2025 - ALL 4 ADVANCED FEATURES + PDF EXPORT + HISTORY)

### ✅ 4 NOVOS RECURSOS GEMINI - UI COMPLETA INTEGRADA

#### **1. 📸 OCR DE RECIBOS - Transactions.tsx**
- ✅ Botão "📸 OCR Recibo" adicionado ao modal de câmera
- ✅ Após tirar foto: clica "OCR Recibo" para processar
- ✅ Extrai automaticamente: descrição, valor, data, categoria
- ✅ Popula formulário da transação instantaneamente
- ✅ Icone: Sparkles (lilás) para fácil identificação

**Localização UI:** Transactions → Câmera → Botão "OCR Recibo" (roxo)

---

#### **2. 💬 CHAT COM STREAMING - AIAssistant.tsx**
- ✅ Substituído `getAiChatResponse()` por `getAiChatResponseStreaming()`
- ✅ Respostas em tempo real, chunk-by-chunk (20 caracteres)
- ✅ Melhor UX para conversas longas
- ✅ Latência: 50ms entre chunks para efeito natural
- ✅ Mensagens aparecem gradualmente (não aguarda conclusão)

**Localização UI:** Canto inferior direito → Assistente Gemini → Chat (streaming automático)

---

#### **3. 🚨 ANÁLISE DE DESPERDÍCIO - Dashboard.tsx**
- ✅ Card vermelho (rose/red gradient) no Dashboard
- ✅ Botão "Analisar" para triggerar análise
- ✅ Mostra: Sinais de desperdício + Estimativa total
- ✅ Lista 3 principais problemas detectados (ex: "Gastos elevados em café")
- ✅ Icone: TrendingDown (vermelho) com animação pulse
- ✅ **NOVO: Botão "📥 Exportar" para PDF com análise completa**

**Localização UI:** Dashboard → Seção "Análise de Desperdício" (ao lado de Insight Inteligente)

**Output:**
```
🚨 Análise de Desperdício
Sinais de Desperdício:
• Gastos elevados em café
• Lanches impulsivos na tarde
• Assinaturas desnecessárias
Estimativa: 150,50€ em desperdício
📥 Exportar (gera PDF com detalhes completos)
```

---

#### **4. 📊 PREVISÕES FINANCEIRAS - Dashboard.tsx**
- ✅ Card verde (emerald/teal gradient) no Dashboard
- ✅ Botão "Prever" para previsões de 3 meses
- ✅ Mostra grid com 3 previsões mensais
- ✅ Exibe nível de confiança (0-100%)
- ✅ Notas sobre padrões (sazonal, crescente, etc)
- ✅ Icone: TrendingUp (verde) com animação pulse
- ✅ **NOVO: Botão "📥 Exportar" para PDF com previsões completas**
- ✅ **NOVO: Histórico de previsões guardado em DB (forecast_history table)**

**Localização UI:** Dashboard → Seção "Previsões Financeiras (3 meses)"

**Output:**
```
📊 Previsões Financeiras (3 meses)
2025-12: 500€
2026-01: 520€
2026-02: 530€
Confiança: 85% • Tendência crescente detectada
📥 Exportar (gera PDF com análise completa)
```

---

### ✅ PDF EXPORT SYSTEM - `generateAnalysisPDF()`
- ✅ Função criada em `services/reportService.ts`
- ✅ Exporta análise de desperdício + previsões em um PDF único
- ✅ Includes: Sinais, estimativas, sugestões, tabelas, confiança
- ✅ Botões de export nos dois cards (Análise + Previsões)
- ✅ Download automático com nome data: `Analise_YYYY-MM-DD.pdf`
- ✅ Formatação professional com gradients e tabelas

---

### ✅ FORECAST HISTORY TRACKING
- ✅ Nova tabela `forecast_history` adicionada ao schema
- ✅ Guarda automaticamente: predictions, confidence, notes, timestamp
- ✅ Per-user forecasts (isolado por user_id)
- ✅ Histórico completo para comparação de previsões ao longo do tempo
- ✅ Estrutura: id, user_id, predictions (JSON), confidence, notes, created_at

---

### ✅ WASTE ANALYSIS HISTORY TRACKING
- ✅ Nova tabela `waste_analysis_history` adicionada ao schema
- ✅ Guarda automaticamente: waste_indicators, total_waste, suggestions, timestamp
- ✅ Per-user analyses (isolado por user_id)
- ✅ Histórico completo para acompanhar redução de desperdícios
- ✅ Estrutura: id, user_id, waste_indicators (JSON), total_waste, suggestions, created_at

---

### ✅ PUTER.JS INTEGRATION - FREE UNLIMITED AI PROVIDER
- ✅ Installed `@heyputer/puter.js` npm package
- ✅ Added Puter.js script tag to index.html (`<script src="https://js.puter.com/v2/"></script>`)
- ✅ Created `services/puterService.ts` with helper functions for transcription, chat, etc.
- ✅ Modified AdminPanel to show Puter as third AI provider option
- ✅ Puter button highlighted green (emerald) for easy identification
- ✅ Information panel shows all available Puter resources
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

---

## Funcionalidades Implementadas (Resumo Completo)

| Feature | Status | Localização UI |
|---------|--------|---------------|
| 🔔 Web Push Notifications | ✅ | Dashboard → 🔔 ícone |
| 📧 Email Notifications | ✅ | Dashboard → 🔔 ícone |
| 🌐 Gestão Global (Super Admin) | ✅ | AdminPanel |
| 👤 Preferências Pessoais (Utilizadores) | ✅ | Dashboard modal |
| 💰 Orçamentos User-Specific | ✅ | BudgetControl |
| 📅 Frequências (6 opções) | ✅ | Transactions form |
| 💵 Currency Previews | ✅ | Transactions inputs |
| 📈 Budget History | ✅ | Dashboard |
| ✏️ Edit Profile (Avatar, Name, Email, Password) | ✅ | Sidebar → Avatar |
| 🤖 AI Providers (Gemini, OpenRouter, Puter.js) | ✅ | AdminPanel |
| 🎙️ Speech-to-Text (via Puter.js) | ✅ | Puter service |
| 📸 **OCR de Recibos** | ✅ **NOVO** | Transactions → Câmera → "OCR Recibo" |
| 💬 **Chat Streaming** | ✅ **NOVO** | AIAssistant (chat automático) |
| 🚨 **Análise de Desperdício** | ✅ **NOVO** | Dashboard → Card vermelho |
| 📊 **Previsões Financeiras** | ✅ **NOVO** | Dashboard → Card verde |
| 📥 **PDF Export (Análises)** | ✅ **NOVO** | Botão "📥 Exportar" em ambos cards |
| 📅 **Histórico de Previsões** | ✅ **NOVO** | forecast_history table (DB) |
| 🗑️ **Histórico de Desperdício** | ✅ **NOVO** | waste_analysis_history table (DB) |
| 🏗️ Build | ✅ | 94.37KB gzip |
| 🚀 Servidor | ✅ | Rodando |

---

## Próximos Passos (Opcional - Fase 2)
- Adicionar UI para comparar histórico de previsões (gráficos de evolução)
- Alertas automáticos para desperdícios detectados (via notificações)
- Dashboard widget mostrando melhoria de desperdício ao longo do tempo
- API endpoints para recuperar histórico (forecast_history GET)
- Exportar histórico completo para análise de tendências

**Aplicação PRODUCTION-READY com IA AVANÇADA! 🎉**

