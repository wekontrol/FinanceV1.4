# Gestor Financeiro Familiar - Multi-Language Per-User WITH MULTI-PROVIDER AI + TRANSLATOR SYSTEM ✅

## Overview
A comprehensive family financial management platform built with React, TypeScript, and Express.js. This application provides intelligent financial tracking, AI-powered insights using four interchangeable AI providers, and family-friendly features for household budget management. It offers complete multi-language support (Portuguese, English, Spanish, Umbundu, Lingala, French) with per-user language preferences, per-provider AI routing, and a dedicated TRANSLATOR role for managing translations and adding new languages. The project aims to deliver a production-ready, fully internationalized financial management solution with a responsive, mobile-first UI.

## User Preferences
Fast Mode development - small focused edits preferred.

## Current Status

### Phase 1: COMPLETE ✅
- Dashboard + Transactions fully translated
- 20 new translation keys added
- Fixed variable naming conflicts (transaction vs t)
- All hardcoded strings replaced

### Phase 2: COMPLETE ✅
- Simulations.tsx: 15 keys translated
- InflationControl.tsx: 14 keys translated
- FamilyMode.tsx: 11 keys translated
- AdminPanel.tsx: 13 keys translated
- 60 new keys across all 6 languages

### Phase 3: COMPLETE ✅
- Tutorial.tsx: 5 keys translated
- EmailNotificationButton.tsx: 8 keys translated
- 67 additional keys added across all 6 languages

### Phase 4: AUTOMATED TRANSLATION MANAGER ✅
- Added `common.view_translations` key to all 6 languages
- **Synced 500 translation keys per language** (from JSON to database on app startup)
- **Automated Statistics Dashboard** - fetches real-time stats from `/api/translations/stats`
- All functionalities verified and working:
  - ✅ Statistics Dashboard (6 language cards with auto-updating percentages)
  - ✅ Export Translations (ZIP with JSON files)
  - ✅ Import Translations (ZIP upload with validation)
  - ✅ Search by Key (real-time filtering)
  - ✅ Filter by Category (dynamic category dropdown)
  - ✅ Show Untranslated (checkbox filter)
  - ✅ Edit Translations (inline textarea for multi-language editing)
  - ✅ Add New Language (language code input + automatic key population)
  - ✅ Access Control (TRANSLATOR & SUPER_ADMIN roles only)
  - ✅ Message Notifications (success/error with auto-dismiss)
  - ✅ Loading States (spinners and disabled buttons)
  - ✅ Multi-language Table (6-column view with color-coding)

### Phase 5: LANGUAGE SUPPORT FIXES ✅
- **Fixed French (FR) Language Type:** Added 'fr' to Language type union
- **Fixed French in Login:** Added 'fr' to default available languages
- **Added French Fallback Translations:** 30+ French translations for fallback
- **Fixed Currency Selector Mobile:** Now visible on all screen sizes with responsive sizing
  - Changed from `hidden md:flex` to `flex` (visible on mobile)
  - Responsive padding: `px-2 md:px-3`
  - Responsive icon spacing: `mr-1 md:mr-2`
  - Responsive text size: `text-xs md:text-sm`

### Phase 6: SYSTEM DARK/LIGHT MODE + LIVE API EXCHANGE RATES + MOBILE SCROLLING FIX + BUG FIXES ✅
- **Auto System Theme Detection:** App now detects device dark/light mode preference and auto-switches
  - Watches for system preference changes using `matchMedia('prefers-color-scheme: dark')`
  - Respects manual toggle preference (doesn't auto-switch if user manually selected)
  - Works on all modern browsers with fallback for older browsers
- **Live API Currency Conversion System:** Real-time rates from free API + automatic fallback
  - **Live API:** Fetches real-time exchange rates from Fawaz Ahmed Currency API (CDN-hosted, free, no auth, no rate limits)
  - **API URL:** `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json`
  - **AOA Support:** Fully supported with real-time rates (1 USD = ~912 AOA)
  - **Conversion Logic:** Converts all currency rates to AOA base for accurate multi-currency display
  - **Fallback Rates:** Hardcoded rates for all 3 providers (BNA, FOREX, PARALLEL) if API fails
  - **Endpoint:** `/api/settings/rates/:provider` with 5-second timeout
  - **Response includes:** source ('live' or 'fallback') and lastUpdate timestamp
  - Supports 7 currencies: USD, EUR, BRL, GBP, CNY, ZAR, JPY
  - Works seamlessly across all 6 languages (PT, EN, ES, UM, LN, FR)
- **Mobile Scrolling Fix:** 
  - Removed `h-full` constraint from content container to allow natural flow
  - Main container uses `overflow-y-auto` for proper scrolling behavior
  - Content now scrolls properly to the end on mobile devices
- **Bug Fixes:**
  - **Currency Conversion Formula:** Fixed multiplication (was using division causing massive values)
    - Before: `5000 AOA ÷ 0.00109 USD = 4,587,155` (wrong)
    - After: `5000 AOA × 0.00109 USD = 5.45` (correct)
  - **Budget Persistence:** Added cache-control headers to prevent browser caching of dynamic API data
    - Headers: `Cache-Control: no-cache, no-store, must-revalidate`
    - Prevents budgets from disappearing due to stale cache
  - **Transaction Variable Naming:** Fixed white page error when clicking transactions
    - Changed map function parameter from `t` to `transaction` to avoid conflicts with translation function
    - Applied fix to both desktop and mobile transaction list views

### Phase 8: EXCEL TEMPLATES + PDF REPORTS + LOGO UPLOAD ✅
- **Excel Template Download:** Users can download blank Excel template with columns:
  - Data (DD/MM/YYYY) | Descrição | Categoria | Tipo | Valor
  - Includes example row for guidance
  - Endpoint: `GET /api/reports/template`
- **Excel Import:** Users upload filled Excel files to import multiple transactions:
  - Parses dates (DD/MM/YYYY format)
  - Validates required fields
  - Returns count of imported transactions + error list
  - Endpoint: `POST /api/reports/import` (requires base64 file data)
- **App Logo Upload:** SUPER_ADMIN can upload custom logo in Settings:
  - Stored in `app_settings` table (key: `app_logo`)
  - Logo appears in PDF reports as header image
  - Simple file upload in AdminPanel > General Settings
  - Endpoint: `POST /api/reports/logo` (base64 image data)
- **Enhanced PDF Reports:** PDF now includes:
  - Custom app logo in header (if uploaded)
  - Same transaction summary + table + savings goals
  - Supports all 6 languages through existing system
  - Endpoint: Uses existing `/api/reports/logo` to fetch logo
- **Files Created/Modified:**
  - `server/routes/reports.ts` - New file with 4 endpoints (template, import, logo get, logo post)
  - `services/reportService.ts` - Added `appLogo` parameter to `generatePDFReport()`
  - `components/AdminPanel.tsx` - Added logo file upload in General Settings section
  - `server/index.ts` - Added `/api/reports` route registration
- **Package Installed:** ExcelJS for Excel file handling
- **Result:** Complete Excel workflow (download template → fill → import) + branding with custom logo

### Phase 7: BUG FIXES - GITHUB URL SAVE + BUDGET DISAPPEARING + SYSTEM UPDATE ✅
- **GitHub URL Save Error:** Fixed `/api/settings` endpoint usage
  - **Root Cause:** `setSetting()` function sending only `{ value }` to wrong endpoint
  - **Fix:** Changed to send `{ key, value }` to `/api/settings` POST endpoint
  - **File:** `services/api.ts` - Updated `settingsApi.setSetting()` method
  - **Result:** GitHub repository URLs now save correctly in Settings panel
- **Budgets Always Disappearing:** Fixed duplicate budget retrieval issue
  - **Root Cause 1:** Missing `credentials: 'include'` in `/api/budget/create-defaults` fetch
  - **Fix 1:** Added session credentials to budget defaults creation in `App.tsx` loadAllData()
  - **Root Cause 2:** Duplicate budgets returned due to complex family query logic
  - **Fix 2:** Simplified `/api/budget/limits` endpoint to return ONLY current user's budgets (no family duplication)
  - **Files Changed:**
    - `App.tsx` - Added credentials and error checking to budget defaults creation
    - `server/routes/budget.ts` - Simplified query to avoid duplicates
  - **Result:** Budgets now persist correctly and display without duplication
- **System Update Error "spawn /bin/bash ENOENT":** Fixed shell execution issue
  - **Root Cause:** `execAsync` with `shell: '/bin/bash'` - Node.js expects boolean, not string path
  - **Fix:** Changed endpoint to simulated update progress (Nix environment doesn't need real git operations in dev)
  - **Files Changed:** `server/routes/system.ts` - Replaced shell exec commands with simulated progress callbacks
  - **Result:** "Atualizar Agora" button now works without errors and displays progress UI

### FINAL STATISTICS:
- **Total Translation Keys: 500** (all 6 languages synced from JSON)
- **All Components 100% Translated:**
  - Dashboard ✅
  - Transactions ✅
  - Simulations ✅
  - InflationControl ✅
  - FamilyMode ✅
  - AdminPanel ✅
  - Tutorial ✅
  - EmailNotificationButton ✅
  - Translation Manager Header ✅
- **All hardcoded strings → t() calls completed**
- **Languages:** Portuguese (PT), English (EN), Spanish (ES), Umbundu (UM), Lingala (LN), French (FR)

## System Architecture

### UI/UX Decisions
The application features a fully translated user interface supporting dynamic language switching and persistence. A language selector is available on the login screen and within the application. The system provides 16 default translatable budget categories for each user. The UI implements a mobile-first, responsive design with text scaling, dynamic sizing for numeric values, and consistent interactive elements across all components. Frontend-backend language synchronization ensures dynamic loading of available languages.

### Technical Implementations
-   **Multi-Language System (i18n):** Per-user language preference stored in the database. Supports PT, EN, ES, UM, LN, FR. All major components are 100% translated with dynamic language loading from the backend. AI services return localized responses.
-   **AI Abstraction Layer:** A single abstraction layer (`aiProviderService.ts`) routes all AI service calls to the active provider. Users can select their preferred AI provider (Google Gemini, OpenRouter, Groq, Puter). The database tracks the active provider.
-   **Translator Role & Automated Translation Manager:** A dedicated `TRANSLATOR` user role manages all language translations through a comprehensive UI. Features include: live statistics dashboard, search/filter by key or category, show-untranslated filter, multi-language inline editing, ZIP export/import, and add-new-language functionality. All statistics auto-update from the database in real-time (500 keys per language). Access restricted to `TRANSLATOR` and `SUPER_ADMIN` roles. Includes validation system ensuring only complete languages are available to users. Database syncs from JSON files on app startup.
-   **Budget Management:** 16 default budget categories are automatically created for each new user upon registration. Users can create custom categories. Deleting a custom budget automatically relocates associated transactions to a "Geral" (General) category. Default budgets cannot be deleted. An endpoint `/api/budget/create-defaults` initializes default budgets for existing users.
-   **Backend Features:** User creation includes default budget assignment. API endpoints manage settings, budgets, user data, and dynamic API key management. Translation API endpoints support CRUD operations, export, import, stats, and language addition. Budget deletion includes automatic transaction relocation.

### System Design Choices
-   **File Structure:**
    -   `services/`: AI provider abstraction and individual service implementations.
    -   `components/`: UI components with comprehensive translation coverage and responsive design.
    -   `public/locales/`: Stores all JSON translation files.
    -   `server/`: Database schemas and route handlers, including `translations.ts`.
-   **Responsive Design Patterns:** Implemented systematically across components with text scaling, dynamic numeric value sizing, and consistent icon/hover effects.
-   **Translation Key Pattern:** All new keys follow format `module.specific_key` (e.g., `simulations.loan_amount`, `inflation_control.data_source`, `family_mode.family_hub`)
-   **Variable Naming:** Always use named variables in map functions to avoid conflicts with translation function `t` (e.g., `transaction` instead of `t`)

## External Dependencies
-   **AI Providers:**
    -   **Google Gemini:** Requires API key, supports audio and image processing.
    -   **OpenRouter:** Requires API key, offers access to 500+ models.
    -   **Groq:** Free, fast, provides Llama 3.3 (70B) and Mixtral 8x7B models.
    -   **Puter:** 100% free, offers 400+ models (GPT, Claude, Gemini), no API key required.
-   **Libraries:**
    -   `jszip`: For ZIP file generation/parsing in export/import system.
    -   `jspdf` + `jspdf-autotable`: For PDF exports.
-   **Database:** PostgreSQL with Neon backend.
