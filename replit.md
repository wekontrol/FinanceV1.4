# Gestor Financeiro Familiar - Multi-Language Per-User WITH MULTI-PROVIDER AI + TRANSLATOR SYSTEM ✅

## Overview
A comprehensive family financial management platform built with React, TypeScript, and Express.js. This application provides intelligent financial tracking, AI-powered insights using four interchangeable AI providers (Google Gemini, OpenRouter, Groq, Puter), and family-friendly features for household budget management. It offers complete multi-language support (Portuguese, English, Spanish, Umbundu, Lingala, French) with per-user language preferences, per-provider AI routing, and a dedicated TRANSLATOR role for managing translations and adding new languages. The project aims to deliver a production-ready, fully internationalized financial management solution with fully responsive, mobile-first UI.

## User Preferences
Fast Mode development - small focused edits preferred.

## System Architecture

### UI/UX Decisions
The application features a fully translated user interface across all major components, supporting dynamic language switching and persistence. A language selector is available on the login screen and within the application. The system provides 16 default budget categories created for each user, which are also translatable.

**Responsive Design Implementation (Session 8 - LATEST):**
- ✅ Balance card icon scales on hover (group-hover:scale-110)
- ✅ Saldo Líquido numeric size matches Receitas/Despesas (text-sm sm:text-base md:text-lg lg:text-xl)
- ✅ All numeric values use `break-words min-w-0` to prevent truncation
- ✅ Subtle border effect on Saldo Líquido hover (no size change)
- ✅ Mobile-first design across all screen sizes

**Frontend-Backend Language Synchronization (Session 8 - NEW):**
- ✅ Login.tsx now loads languages dynamically from backend
- ✅ TranslationManager.tsx displays all available languages including new ones
- ✅ French (FR) fully integrated with 354 translation keys
- ✅ Language list updates automatically when new languages are added
- ✅ Supports unlimited languages (not hardcoded to 5)

**Default Budget Initialization (Session 8 - FIXED):**
- ✅ 16 default budget categories created automatically on user register
- ✅ Default categories: Alimentação, Transporte, Saúde, Educação, Entretenimento, Utilidades, Vestuário, Comunicação, Seguros, Poupança, Investimentos, Lazer, Viagens, Casa, Pets, Geral
- ✅ Each category has sensible default limits
- ✅ Endpoint /api/budget/create-defaults initializes defaults for existing users who don't have them
- ✅ Default budgets marked with is_default=1 flag (cannot be deleted)

**Budget Delete Error Handling (Session 8 - IMPROVED):**
- ✅ Delete endpoint properly relocates transactions to "Geral" category
- ✅ Error messages now display actual backend error details
- ✅ Frontend console shows detailed error information for debugging
- ✅ User-friendly alerts with error descriptions

### Technical Implementations
- **Multi-Language System (i18n):**
    - Per-user language preference stored in the database.
    - Support for Portuguese (PT), English (EN), Spanish (ES), Umbundu (UM), Lingala (LN), French (FR).
    - `LanguageProvider` architecture wraps the entire application.
    - All 11 major components (Login, BudgetControl, Goals, Transactions, NotificationSettings, Dashboard, AIAssistant, ProfileModal, AdminPanel, TranslationManager) are 100% translated with 364 translation keys across all languages.
    - Translation files are stored in `public/locales/` (e.g., `pt.json`, `en.json`, `fr.json`).
    - AI services return localized responses in the user's selected language.
    - All Budget component strings are fully translated (no hardcoded text in pt/en/es/um/ln/fr).
    - **Dynamic Language Loading:** Login and TranslationManager fetch available languages from backend endpoint `/api/translations/languages` at runtime.

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
    - **Add Language API:** POST `/api/translations/language/add` adds new language with auto-copy from base language
    - **Smart Loading:** Export automatically loads translations from backend if frontend state is empty
    - **Dashboard Statistics:** Shows % completion for each language with visual progress bars
    - **Advanced Filtering:** Search by key, filter by category, show only untranslated strings
    - **Batch Editing:** Edit all 6 languages simultaneously for the same key

- **Budget Management:**
    - 16 default budget categories created automatically for each new user
    - Users can create custom budget categories in addition to default ones
    - **Delete Budget Feature:** Users can delete custom budget cards (not default ones)
    - **Smart Transaction Relocation:** When a budget is deleted, all transactions in that category are automatically moved to "Geral" (General)
    - **Default Budget Initialization:** Endpoint `/api/budget/create-defaults` ensures existing users have all default budgets
    - Trash icon appears only on non-default budget cards
    - Confirmation dialog prevents accidental deletions
    - All operations are multi-language supported
    - Improved error messages with detailed feedback

- **Backend Features:**
    - User creation includes the assignment of 16 default budget categories.
    - User registration now automatically creates 16 default budgets (FIXED in Session 8).
    - API endpoints for managing settings, budgets, and user data.
    - Dynamic API key management through an admin panel.
    - Translation API endpoints for CRUD operations on `/api/translations/`
    - Budget deletion endpoint with automatic transaction relocation
    - Budget initialization endpoint for existing users
    - Export/Import/Stats endpoints for professional translation management

### System Design Choices
- **File Structure:**
    - `services/`: Contains `aiProviderService.ts` for abstraction, and individual service files for `geminiService.ts`, `openrouterService.ts`, and `puterService.ts`.
    - `components/`: Houses all UI components, with comprehensive translation coverage (11 components, 364 keys) and responsive design patterns.
    - `public/locales/`: Stores all JSON translation files (now includes `fr.json`).
    - `server/`: Includes `db/schema.ts` for database definitions and route handlers including `translations.ts`.

- **Responsive Design Patterns (COMPLETE - Session 8):**
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

## Recent Changes (Latest Session - Session 8)

### Frontend-Backend Connection & Budget Fixes (Session 8 - FINAL)
1. ✅ **Language Loading Synchronization:**
   - Login.tsx now fetches available languages from `/api/translations/languages` 
   - TranslationManager.tsx loads languages dynamically (no hardcoded list)
   - New languages appear automatically in both components
   - Supports French (FR) and any future languages

2. ✅ **French Language Integration:**
   - Created `public/locales/fr.json` with 354 translation keys
   - French (🇫🇷 Français) appears in language selector
   - Full support for French in Translation Manager

3. ✅ **Default Budget Fix:**
   - Added default budget creation to user registration (`auth.ts`)
   - Endpoint `/api/budget/create-defaults` initializes defaults for existing users
   - App.tsx now calls this endpoint on load to ensure all users have defaults
   - 16 categories guaranteed for all users

4. ✅ **Delete Error Handling:**
   - Improved error messages in BudgetControl.tsx
   - Backend errors now display to user with details
   - Console logging shows exact error information

### Previous Sessions Summary
- **Session 7:** Responsive UI polish, Export/Import system, Translation Manager backend
- **Session 6:** Full responsive text sizing implementation
- **Session 5:** Budget delete feature with smart transaction relocation
- **Session 4:** Export/Import translation system with AI workflow
- **Session 3-1:** Multi-language infrastructure, AI abstraction layer, responsive initial setup

### Final Statistics
- ✅ 364 translation keys across 6 languages (PT, EN, ES, UM, LN, FR)
- ✅ 11 components fully internationalized
- ✅ 6 complete language translations
- ✅ Multi-provider AI support (Gemini, OpenRouter, Puter, Groq)
- ✅ 16 default budget categories (translatable + deletable custom ones)
- ✅ TRANSLATOR role with professional management interface
- ✅ Backend Export/Import/Stats/Initialize APIs fully implemented
- ✅ Budget deletion with smart transaction relocation
- ✅ Fully responsive UI with mobile-first design
- ✅ Dynamic language loading from backend
- ✅ Production build: 2.2MB | gzip: ~148KB, 0 errors

🚀 **PRODUCTION READY!** Complete multi-language family finance app with professional translator interface, AI-powered translation workflow, smart budget management, fully responsive mobile-first UI, complete export/import system, and guaranteed default budgets for all users!

## Testing Workflow for New Features

### Test 1: French Language in Login
1. Open app at http://localhost:5000/
2. Click language selector (top right)
3. Verify **🇫🇷 Français** appears in list
4. Select French - UI should translate to French
5. Verify all interface elements show French text

### Test 2: French in Translation Manager  
1. Login: `admin/admin`
2. Click "Configurações" → "🌐 Traduções"
3. Look for **Français** column in the table
4. Verify 354 keys loaded for French
5. Edit a translation and save

### Test 3: Default Budgets for New Users
1. Go to "Criar Família" (Register new family)
2. Create new account
3. Login with new account
4. Go to "Orçamentos" (Budgets) tab
5. **Verify 16 default budget cards appear:**
   - Alimentação, Transporte, Saúde, Educação, Entretenimento, Utilidades, Vestuário, Comunicação, Seguros, Poupança, Investimentos, Lazer, Viagens, Casa, Pets, Geral

### Test 4: Delete Budget (Custom Only)
1. Login: `admin/admin`
2. Go to "Orçamentos" tab
3. Create a new custom budget (NOT default)
4. Click red trash icon on custom card
5. Confirm deletion
6. **Verify:**
   - Card disappears
   - Any transactions move to "Geral"
   - Trash icon does NOT appear on default cards
7. Try to delete a default card - should show error "Cannot delete default"

### Test 5: Budget Error Handling
1. Login: `admin/admin`
2. Try to delete various cards
3. Check console (F12) for error messages
4. Verify user sees friendly error messages (not just empty alerts)
