# Gestor Financeiro Familiar - Multi-Language Per-User WITH MULTI-PROVIDER AI + TRANSLATOR SYSTEM ✅

## Overview
A comprehensive family financial management platform built with React, TypeScript, and Express.js. This application provides intelligent financial tracking, AI-powered insights using four interchangeable AI providers (Google Gemini, OpenRouter, Groq, Puter), and family-friendly features for household budget management. It offers complete multi-language support (Portuguese, English, Spanish, Umbundu, Lingala) with per-user language preferences, per-provider AI routing, and a dedicated TRANSLATOR role for managing translations and adding new languages. The project aims to deliver a production-ready, fully internationalized financial management solution.

## User Preferences
Not specified.

## System Architecture

### UI/UX Decisions
The application features a fully translated user interface across all major components, supporting dynamic language switching and persistence. A language selector is available on the login screen and within the application. The system provides 16 default budget categories created for each user, which are also translatable.

### Technical Implementations
- **Multi-Language System (i18n):**
    - Per-user language preference stored in the database.
    - Support for Portuguese (PT), English (EN), Spanish (ES), Umbundu (UM), and Lingala (LN).
    - `LanguageProvider` architecture wraps the entire application.
    - All 10 major components (Login, BudgetControl, Goals, Transactions, NotificationSettings, Dashboard, AIAssistant, ProfileModal, AdminPanel, TranslationManager) are 100% translated with 315 translation keys across all languages.
    - Translation files are stored in `public/locales/` (e.g., `pt.json`, `en.json`).
    - AI services return localized responses in the user's selected language.
- **AI Abstraction Layer:**
    - A single abstraction layer (`aiProviderService.ts`) routes all AI service calls to the active provider.
    - Users can select their preferred AI provider (Google Gemini, OpenRouter, Groq, Puter) from the dashboard.
    - The database tracks the active provider with an `is_default` flag.
    - All 14 AI services (e.g., `categorizeTransaction`, `getFinancialAdvice`, `analyzeUserBehavior`, `parseTransactionFromAudio`, `predictFutureExpenses`) are implemented for Gemini, OpenRouter, and Puter. Groq is used for specific fast AI operations.
    - Audio support is currently exclusive to Gemini; other providers will prompt the user to switch if audio features are requested.
- **Translator Role:**
    - A dedicated `TRANSLATOR` user role allows managing and adding new language translations directly through the UI.
    - Access to the `TranslationManager.tsx` component is restricted to `TRANSLATOR` and `SUPER_ADMIN` roles.
    - Backend table `translations` stores translation data.
- **Backend Features:**
    - User creation includes the assignment of 16 default budget categories.
    - API endpoints for managing settings, budgets, and user data.
    - Dynamic API key management through an admin panel.

### System Design Choices
- **File Structure:**
    - `services/`: Contains `aiProviderService.ts` for abstraction, and individual service files for `geminiService.ts`, `openrouterService.ts`, and `puterService.ts`.
    - `components/`: Houses all UI components, with comprehensive translation coverage.
    - `public/locales/`: Stores all JSON translation files.
    - `server/`: Includes `db/schema.ts` for database definitions (e.g., `api_configurations`, `budget_limits`) and route handlers (e.g., `settings.ts`, `budget.ts`, `users.ts`).

## External Dependencies
- **AI Providers:**
    - **Google Gemini:** Requires API key, supports audio and image processing.
    - **OpenRouter:** Requires API key, offers access to 500+ models.
    - **Groq:** Free, fast (10x faster), provides Llama 3.3 (70B) and Mixtral 8x7B models.
    - **Puter:** 100% free, offers 400+ models (GPT, Claude, Gemini), no API key required.
- **Database:** Not explicitly named, but schema files indicate a relational database for managing user data, budgets, API configurations, and translations.