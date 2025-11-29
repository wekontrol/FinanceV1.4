# Gestor Financeiro Familiar - Multi-Language Per-User WITH MULTI-PROVIDER AI + TRANSLATOR SYSTEM ✅

## Overview
A comprehensive family financial management platform built with React, TypeScript, and Express.js. This application provides intelligent financial tracking, AI-powered insights using four interchangeable AI providers, and family-friendly features for household budget management. It offers complete multi-language support with per-user language preferences, per-provider AI routing, and a dedicated TRANSLATOR role for managing translations and adding new languages. The project aims to deliver a production-ready, fully internationalized financial management solution with a responsive, mobile-first UI. Key capabilities include multi-language support (Portuguese, English, Spanish, Umbundu, Lingala, French), AI integration with multiple providers, an automated translation manager, real-time currency exchange rates, Excel import/export for transactions, PDF report generation, and system dark/light mode detection.

## User Preferences
Fast Mode development - small focused edits preferred.

## Recent Changes (Phase 8)

### Phase 8: EXCEL TEMPLATES + MULTI-SELECT DELETE ✅
- **Excel Template Download + Import:**
  - Added "Template" button in Transactions tab (blue) → downloads blank Excel template
  - Added "Importar" button in Transactions tab (purple) → imports multiple transactions from Excel
  - Template columns: Data (DD/MM/YYYY) | Descrição | Categoria | Tipo | Valor
  - Validation: Strict type checking (only INCOME/EXPENSE), date parsing, positive amounts
  - Error messages in Portuguese per line
  
- **Multi-Select Delete:**
  - Checkboxes on each transaction row (desktop table view)
  - "Select All" checkbox in table header
  - Selected rows highlighted with blue background
  - Delete bar appears when items selected (shows count + red delete button)
  - Confirmation dialog shows count before deleting
  - State: `selectedIds` (Set<string>)
  
- **Dashboard Type Compatibility:**
  - Fixed to accept both INCOME/EXPENSE and RECEITA/DESPESA formats
  - Dashboard now properly filters imported transactions
  
- **Files Modified:**
  - `components/Transactions.tsx` - Added 3 handlers (toggleSelect, toggleSelectAll, deleteSelected) + UI for checkboxes and delete bar
  - `server/routes/reports.ts` - Added Excel import endpoint with validation
  - `components/Dashboard.tsx` - Fixed type filtering to support both formats
  - `server/index.ts` - Registered /api/reports route

## System Architecture

### UI/UX Decisions
The application features a fully translated user interface supporting dynamic language switching and persistence, with a language selector on the login screen and within the application. It provides 16 default translatable budget categories per user. The UI implements a mobile-first, responsive design with text scaling, dynamic sizing, and consistent interactive elements. Frontend-backend language synchronization ensures dynamic loading of available languages. Auto system theme detection (dark/light mode) is implemented, respecting manual user overrides.

### Technical Implementations
-   **Multi-Language System (i18n):** Per-user language preference is stored in the database. Supports PT, EN, ES, UM, LN, FR. All major components are 100% translated with dynamic language loading. AI services return localized responses.
-   **AI Abstraction Layer:** A single abstraction layer (`aiProviderService.ts`) routes all AI service calls to the active provider selected by the user (Google Gemini, OpenRouter, Groq, Puter).
-   **Translator Role & Automated Translation Manager:** A dedicated `TRANSLATOR` user role provides a comprehensive UI for managing translations. Features include a live statistics dashboard, search/filter by key/category, show-untranslated filter, multi-language inline editing, ZIP export/import, and add-new-language functionality. All statistics auto-update in real-time (500 keys per language). Access is restricted to `TRANSLATOR` and `SUPER_ADMIN` roles. The system includes validation to ensure only complete languages are available to users. The database syncs from JSON files on app startup.
-   **Budget Management:** New users are automatically assigned 16 default budget categories, with an option to create custom categories. Deleting a custom budget relocates associated transactions to a "Geral" category. Default budgets are undeletable. An endpoint `/api/budget/create-defaults` initializes default budgets for existing users.
-   **Real-time Currency Conversion:** Fetches live exchange rates from a free public API with an automatic fallback to hardcoded rates if the API fails. Converts all currency rates to AOA base for accurate multi-currency display. Supports 7 currencies (USD, EUR, BRL, GBP, CNY, ZAR, JPY) across all 6 languages.
-   **Excel Integration:** Users can download a blank Excel template for transactions, upload filled Excel files to import multiple transactions, with validation for required fields and detailed error messages.
-   **PDF Reports:** Enhanced PDF reports include a custom app logo (uploadable by SUPER_ADMIN), transaction summary, detailed table, and savings goals, supporting all 6 languages.
-   **App Logo Upload:** SUPER_ADMINs can upload a custom application logo via the AdminPanel, which is stored in the `app_settings` table and used in PDF reports.

### System Design Choices
-   **File Structure:** `services/` for AI abstraction, `components/` for UI, `public/locales/` for JSON translation files, `server/` for database schemas and route handlers.
-   **Responsive Design Patterns:** Systematically applied across components, including text scaling and dynamic numeric value sizing.
-   **Translation Key Pattern:** All keys follow `module.specific_key` format.
-   **Variable Naming:** Named variables are consistently used in map functions to avoid conflicts with the translation function `t`.

## External Dependencies
-   **AI Providers:**
    -   **Google Gemini:** Requires API key.
    -   **OpenRouter:** Requires API key.
    -   **Groq:** Free, provides Llama 3.3 (70B) and Mixtral 8x7B models.
    -   **Puter:** Free, offers 400+ models (GPT, Claude, Gemini).
-   **Libraries:**
    -   `jszip`: For ZIP file generation/parsing.
    -   `jspdf` + `jspdf-autotable`: For PDF exports.
    -   `ExcelJS`: For backend Excel parsing.
-   **Database:** PostgreSQL with Neon backend.
-   **Currency API:** Fawaz Ahmed Currency API (`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json`).