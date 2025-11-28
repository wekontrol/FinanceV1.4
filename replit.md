# Gestor Financeiro Familiar - Multi-Language Per-User WITH MULTI-PROVIDER AI + TRANSLATOR SYSTEM ✅

## Overview
A comprehensive family financial management platform built with React, TypeScript, and Express.js. This application provides intelligent financial tracking, AI-powered insights using four interchangeable AI providers, and family-friendly features for household budget management. It offers complete multi-language support (Portuguese, English, Spanish, Umbundu, Lingala, French) with per-user language preferences, per-provider AI routing, and a dedicated TRANSLATOR role for managing translations and adding new languages. The project aims to deliver a production-ready, fully internationalized financial management solution with a responsive, mobile-first UI.

## User Preferences
Fast Mode development - small focused edits preferred.

## System Architecture

### UI/UX Decisions
The application features a fully translated user interface supporting dynamic language switching and persistence. A language selector is available on the login screen and within the application. The system provides 16 default translatable budget categories for each user. The UI implements a mobile-first, responsive design with text scaling, dynamic sizing for numeric values, and consistent interactive elements across all components. Frontend-backend language synchronization ensures dynamic loading of available languages.

### Technical Implementations
-   **Multi-Language System (i18n):** Per-user language preference stored in the database. Supports PT, EN, ES, UM, LN, FR. All major components are 100% translated with dynamic language loading from the backend. AI services return localized responses.
-   **AI Abstraction Layer:** A single abstraction layer (`aiProviderService.ts`) routes all AI service calls to the active provider. Users can select their preferred AI provider (Google Gemini, OpenRouter, Groq, Puter). The database tracks the active provider.
-   **Translator Role & Export/Import System:** A dedicated `TRANSLATOR` user role allows managing and adding new language translations directly through the UI. Access is restricted to `TRANSLATOR` and `SUPER_ADMIN` roles. Backend endpoints support exporting, importing, and managing translation statistics. It includes a robust validation system (`validateLanguage.ts`) to ensure only complete languages (all 354 keys translated) are available to users, preventing application crashes due to incomplete translations.
-   **Budget Management:** 16 default budget categories are automatically created for each new user upon registration. Users can create custom categories. Deleting a custom budget automatically relocates associated transactions to a "Geral" (General) category. Default budgets cannot be deleted. An endpoint `/api/budget/create-defaults` initializes default budgets for existing users.
-   **Backend Features:** User creation includes default budget assignment. API endpoints manage settings, budgets, user data, and dynamic API key management. Translation API endpoints support CRUD operations, export, import, stats, and language addition. Budget deletion includes automatic transaction relocation.

### System Design Choices
-   **File Structure:**
    -   `services/`: AI provider abstraction and individual service implementations.
    -   `components/`: UI components with comprehensive translation coverage and responsive design.
    -   `public/locales/`: Stores all JSON translation files.
    -   `server/`: Database schemas and route handlers, including `translations.ts`.
-   **Responsive Design Patterns:** Implemented systematically across components with text scaling, dynamic numeric value sizing, and consistent icon/hover effects.

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