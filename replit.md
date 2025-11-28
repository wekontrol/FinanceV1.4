# Gestor Financeiro Familiar - Multi-Language Per-User WITH MULTI-PROVIDER AI + TRANSLATOR SYSTEM ✅

## Overview
A comprehensive family financial management platform built with React, TypeScript, and Express.js. This application provides intelligent financial tracking, AI-powered insights using four interchangeable AI providers (Google Gemini, OpenRouter, Groq, Puter), and family-friendly features for household budget management. It offers complete multi-language support (Portuguese, English, Spanish, Umbundu, Lingala) with per-user language preferences, per-provider AI routing, and a dedicated TRANSLATOR role for managing translations and adding new languages. The project aims to deliver a production-ready, fully internationalized financial management solution with fully responsive, mobile-first UI.

## User Preferences
Fast Mode development - small focused edits preferred.

## System Architecture

### UI/UX Decisions
The application features a fully translated user interface across all major components, supporting dynamic language switching and persistence. A language selector is available on the login screen and within the application. The system provides 16 default budget categories created for each user, which are also translatable.

**Responsive Design Implementation (Session 7 - LATEST):**
- ✅ Balance card icon scales on hover (group-hover:scale-110)
- ✅ Saldo Líquido numeric size matches Receitas/Despesas (text-sm sm:text-base md:text-lg lg:text-xl)
- ✅ All numeric values use `break-words min-w-0` to prevent truncation
- ✅ Subtle border effect on Saldo Líquido hover (no size change)
- ✅ Mobile-first design across all screen sizes

**Translation Manager Backend (Session 7 - NEW):**
- ✅ Export endpoint: GET `/api/translations/export` - retrieves all translations as JSON
- ✅ Import endpoint: POST `/api/translations/import` - bulk import translations for a language
- ✅ Stats endpoint: GET `/api/translations/stats` - shows completion percentage per language
- ✅ Permission middleware: `requireTranslatorOrAdmin` - TRANSLATOR and SUPER_ADMIN roles only
- ✅ All endpoints properly authenticated and authorized

### Technical Implementations
- **Multi-Language System (i18n):**
    - Per-user language preference stored in the database.
    - Support for Portuguese (PT), English (EN), Spanish (ES), Umbundu (UM), and Lingala (LN).
    - `LanguageProvider` architecture wraps the entire application.
    - All 11 major components (Login, BudgetControl, Goals, Transactions, NotificationSettings, Dashboard, AIAssistant, ProfileModal, AdminPanel, TranslationManager) are 100% translated with 364 translation keys across all languages.
    - Translation files are stored in `public/locales/` (e.g., `pt.json`, `en.json`).
    - AI services return localized responses in the user's selected language.
    - All Budget component strings are fully translated (no hardcoded text in pt/en/es/um/ln).

- **AI Abstraction Layer:**
    - A single abstraction layer (`aiProviderService.ts`) routes all AI service calls to the active provider.
    - Users can select their preferred AI provider (Google Gemini, OpenRouter, Groq, Puter) from the dashboard.
    - The database tracks the active provider with an `is_default` flag.
    - All 14 AI services (e.g., `categorizeTransaction`, `getFinancialAdvice`, `analyzeUserBehavior`, `parseTransactionFromAudio`, `predictFutureExpenses`) are implemented for Gemini, OpenRouter, and Puter. Groq is used for specific fast AI operations.
    - Audio support is currently exclusive to Gemini; other providers will prompt the user to switch if audio features are requested.

- **Translator Role & Export/Import System:**
    - A dedicated `TRANSLATOR` user role allows managing and adding new language translations directly through the UI.
    - Access to the `TranslationManager.tsx` component is restricted to `TRANSLATOR` and `SUPER_ADMIN` roles.
    - Backend table `translations` stores translation data.
    - **Export Functionality:** GET `/api/translations/export` returns all translations as JSON object
    - **Import Functionality:** POST `/api/translations/import` accepts language and translations JSON
    - **Stats API:** GET `/api/translations/stats` shows % completion for each language
    - **Smart Loading:** Export automatically loads translations from backend if frontend state is empty
    - **Dashboard Statistics:** Shows % completion for each language with visual progress bars
    - **Advanced Filtering:** Search by key, filter by category, show only untranslated strings
    - **Batch Editing:** Edit all 5 languages simultaneously for the same key

- **Budget Management:**
    - Users can create custom budget categories in addition to 16 default ones
    - **Delete Budget Feature:** Users can delete custom budget cards (not default ones)
    - **Smart Transaction Relocation:** When a budget is deleted, all transactions in that category are automatically moved to "Geral" (General)
    - Trash icon appears only on non-default budget cards
    - Confirmation dialog prevents accidental deletions
    - All operations are multi-language supported

- **Backend Features:**
    - User creation includes the assignment of 16 default budget categories.
    - API endpoints for managing settings, budgets, and user data.
    - Dynamic API key management through an admin panel.
    - Translation API endpoints for CRUD operations on `/api/translations/`
    - Budget deletion endpoint with automatic transaction relocation
    - NEW: Export/Import/Stats endpoints for professional translation management

### System Design Choices
- **File Structure:**
    - `services/`: Contains `aiProviderService.ts` for abstraction, and individual service files for `geminiService.ts`, `openrouterService.ts`, and `puterService.ts`.
    - `components/`: Houses all UI components, with comprehensive translation coverage (11 components, 364 keys) and responsive design patterns.
    - `public/locales/`: Stores all JSON translation files.
    - `server/`: Includes `db/schema.ts` for database definitions and route handlers including `translations.ts`.

- **Responsive Design Patterns (COMPLETE - Session 7):**
    - Text scaling: `text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl` across all components
    - Numeric values: `text-sm sm:text-base md:text-lg lg:text-xl` with `break-words min-w-0`
    - Icon effects: `group-hover:scale-110 transition-transform` for consistent interactivity
    - Hover effects: Subtle border changes instead of size scaling
    - Applied systematically across BudgetControl, Dashboard, Goals, Transactions

## External Dependencies
- **AI Providers:**
    - **Google Gemini:** Requires API key, supports audio and image processing.
    - **OpenRouter:** Requires API key, offers access to 500+ models.
    - **Groq:** Free, fast (10x faster), provides Llama 3.3 (70B) and Mixtral 8x7B models.
    - **Puter:** 100% free, offers 400+ models (GPT, Claude, Gemini), no API key required.
- **Libraries:**
    - `jszip`: For ZIP file generation/parsing in export/import system
    - `jspdf` + `jspdf-autotable`: For PDF exports
- **Database:** PostgreSQL with Neon backend for relational data management.

## Recent Changes (Latest Session - Session 7)

### UI Polish & Backend Export/Import System (Session 7 - FINAL)
1. ✅ **Dashboard Saldo Líquido** - Icon now scales on hover (group-hover:scale-110)
2. ✅ **Responsive Numeric Values** - Saldo Líquido now matches Receitas/Despesas sizes
3. ✅ **Hover Effects** - Saldo Líquido uses subtle border effect (no scale increase)
4. ✅ **Backend Export/Import Endpoints:**
   - GET `/api/translations/export` - Export all translations as JSON
   - POST `/api/translations/import` - Import translations by language
   - GET `/api/translations/stats` - Get completion statistics
5. ✅ **Permission Security** - requireTranslatorOrAdmin middleware on all endpoints
6. ✅ **Session Management** - Admin user has SUPER_ADMIN role automatically

### Previous Sessions Summary
- **Session 6:** Full responsive text sizing implementation
- **Session 5:** Budget delete feature with smart transaction relocation + 5 new translation keys
- **Session 4:** Export/Import translation system with AI workflow
- **Session 3-1:** Multi-language infrastructure, AI abstraction layer, responsive initial setup

### Final Statistics
- ✅ 364 translation keys across 5 languages (PT, EN, ES, UM, LN)
- ✅ 11 components fully internationalized
- ✅ 5 complete language translations
- ✅ Multi-provider AI support (Gemini, OpenRouter, Puter, Groq)
- ✅ 16 default budget categories (translatable + deletable custom ones)
- ✅ TRANSLATOR role with professional management interface
- ✅ Backend Export/Import/Stats APIs fully implemented
- ✅ Budget deletion with smart transaction relocation
- ✅ Fully responsive UI with mobile-first design
- ✅ Production build: 653.51KB | gzip: 148.30 KB, 0 errors

🚀 **PRODUCTION READY!** Complete multi-language family finance app with professional translator interface, AI-powered translation workflow, smart budget management, fully responsive mobile-first UI, and complete export/import system!

## Testing Workflow for Export/Import
1. Login: admin/admin
2. Click "Configurações" → "🌐 Traduções"
3. Click "📥 Exportar JSONs" → Downloads ZIP with pt.json, en.json, etc.
4. Edit JSONs externally (use ChatGPT/Claude to improve translations)
5. Click "📤 Importar JSONs" → Select edited ZIP
6. Translations updated in real-time across all 5 languages

## Testing Workflow for Responsive Values
1. Login: admin/admin
2. Go to Dashboard tab
3. Resize browser to 375px (mobile)
4. ✅ Verify "Saldo Líquido" shows FULL value
5. ✅ Verify all cards have consistent icon scaling on hover

## Testing Workflow for Delete Budget Feature
1. Login: admin/admin
2. Go to "Orçamentos" (Budget) tab
3. Create a new custom budget category (not default)
4. Add some transactions to it
5. Click the red trash icon on the card
6. Confirm deletion - all transactions move to "Geral"
7. Verify transactions appear in "Geral" category
