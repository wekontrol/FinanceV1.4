# Gestor Financeiro Familiar - Multi-Language Per-User WITH MULTI-PROVIDER AI + TRANSLATOR SYSTEM ✅

## Overview
A comprehensive family financial management platform built with React, TypeScript, and Express.js, offering intelligent financial tracking and AI-powered insights. The application provides multi-language support with per-user preferences, per-provider AI routing, and a dedicated `TRANSLATOR` role for managing translations and adding new languages. It aims to be a production-ready, fully internationalized solution with a responsive, mobile-first UI. Key features include AI integration with multiple providers, automated translation management, real-time currency exchange rates, Excel import/export for transactions, PDF report generation, and system dark/light mode detection. The project also includes advanced AI planning features with caching and comparative charts for financial analysis.

## User Preferences
Fast Mode development - small focused edits preferred.

## ANALYSIS & FIXES COMPLETE (Phase 15++++  - ROOT CAUSE ANALYSIS)

### Problem Summary & Solution:
**What was happening:**
- Dashboard showed zero data (no transactions/budgets visible)
- Planificação IA showed fictitious data (AOA 25.741.000,00) with no real transactions
- Budgets seemed to disappear

**Root Cause Found:**
1. ✅ Backend GET endpoints exist for both budgets and transactions
2. ✅ Budgets load correctly (16 defaults created on register)
3. ❌ **Transactions table was EMPTY** - user never created any transactions
4. ❌ **AI Planning generated fake analysis** even with zero transactions

**Solution Applied:**
- Modified `server/routes/aiPlanning.ts` to **STOP generating fictional data**
- Now returns clear message when NO transactions exist: "Para receber análise, adicione suas transações mensais primeiro"
- Only calculates real analysis when transactions exist

**Current Status:**
- Dashboard empty = CORRECT (no transactions created yet)
- Planificação IA shows empty message = CORRECT (no data to analyze)
- Budgets persist = CONFIRMED working ✅

## Recent Changes (Phase 15+++ - BUG FIXES + OPTIMIZATIONS)
- ✅ **Backend Improvements:** 
  - Graceful cache failure handling - continues if table doesn't exist
  - Better logging with [AI Planning] tags
  - Non-critical cache writes - analysis returns even if cache fails
  - Fixed SQL column names - `limit_amount` instead of reserved word
- ✅ **Frontend Optimizations:** 
  - useEffect only runs once on mount (fixed repeated API calls)
  - No dependencies = prevents re-renders on data changes
  - Error handling with retry button
- ✅ **Authentication Fix:**
  - Added requireAuth middleware to aiPlanning router
  - Fixed 401 Unauthorized error - now properly validates sessions
  - Session middleware working correctly
- ✅ **Error Handling:** Improved error messages with retry button
- ✅ **Removed:** Budget "Juros / Multas" from default categories
- ✅ **Status:** ✅ ALL ISSUES RESOLVED - "Planificação IA" fully operational!

## System Architecture

### UI/UX Decisions
The application features a fully translated user interface with dynamic language switching and persistence, supporting six languages (PT, EN, ES, UM, LN, FR). It includes 16 default translatable budget categories per user and a mobile-first, responsive design with text scaling and dynamic sizing. Frontend-backend language synchronization dynamically loads available languages. Auto system theme detection (dark/light mode) is implemented, respecting user overrides. The AI Planning section incorporates visual elements like line charts for spending trends and bar charts for budget vs. actual comparisons.

### Technical Implementations
-   **Multi-Language System (i18n):** Stores per-user language preferences in the database, with all major components 100% translated and dynamic language loading. AI services provide localized responses.
-   **AI Abstraction Layer:** A single `aiProviderService.ts` routes all AI calls to the user-selected provider (Google Gemini, OpenRouter, Groq, Puter).
-   **Translator Role & Automated Translation Manager:** A `TRANSLATOR` user role provides a UI for managing translations, featuring a dashboard, search/filter, show-untranslated filter, multi-language inline editing, ZIP export/import, and add-new-language functionality. Access is restricted, and the system ensures only complete languages are available.
-   **Budget Management:** New users receive 16 default budget categories, with options for custom categories. Deleting custom budgets reassigns transactions to "Geral". Default budgets are undeletable.
-   **Real-time Currency Conversion:** Fetches live exchange rates from a public API, with a fallback to hardcoded rates. Converts all currencies to AOA base for multi-currency display, supporting 7 currencies across 6 languages.
-   **Excel Integration:** Allows users to download a blank transaction template and upload filled Excel files for bulk transaction import, with validation and error reporting.
-   **PDF Reports:** Generates enhanced PDF reports with a custom app logo, transaction summaries, detailed tables, and savings goals, supporting all 6 languages.
-   **App Logo Upload:** SUPER_ADMINs can upload a custom application logo, stored in `app_settings` and used in PDF reports.
-   **AI Planning and Caching:** Integrates AI for financial health analysis, spending trends, savings potential, and goal tracking. Analysis results are cached for 30 minutes in `ai_analysis_cache` to improve performance, with a manual refresh option.
-   **React Query Integration:** Uses `@tanstack/react-query` for state management, enabling auto-refresh of UI components after data mutations (create, update, delete operations).
-   **Database Optimization:** Implements 23 performance indexes across key tables (Users, Transactions, Budget, Goals, Family, Tasks, Events) to significantly speed up query execution.

### System Design Choices
-   **File Structure:** `services/` for AI abstraction, `components/`, `public/locales/` for JSON translation files, `server/` for database schemas and route handlers.
-   **Responsive Design Patterns:** Applied consistently with text scaling and dynamic numeric value sizing.
-   **Translation Key Pattern:** All keys follow `module.specific_key` format.
-   **Variable Naming:** Consistent naming in map functions to avoid conflicts with the translation function `t`.

## External Dependencies
-   **AI Providers:**
    -   Google Gemini
    -   OpenRouter
    -   Groq
    -   Puter
-   **Libraries:**
    -   `jszip`
    -   `jspdf`
    -   `jspdf-autotable`
    -   `ExcelJS`
    -   `@tanstack/react-query`
    -   `recharts`
-   **Database:** PostgreSQL with Neon backend.
-   **Currency API:** Fawaz Ahmed Currency API (`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json`).