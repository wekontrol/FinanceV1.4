# Gestor Financeiro Familiar - Multi-Language Per-User WITH MULTI-PROVIDER AI + TRANSLATOR SYSTEM ✅

## Overview
A comprehensive family financial management platform built with React, TypeScript, and Express.js. This application provides intelligent financial tracking, AI-powered insights using four interchangeable AI providers (Google Gemini, OpenRouter, Groq, Puter), and family-friendly features for household budget management. It offers complete multi-language support (Portuguese, English, Spanish, Umbundu, Lingala) with per-user language preferences, per-provider AI routing, and a dedicated TRANSLATOR role for managing translations and adding new languages. The project aims to deliver a production-ready, fully internationalized financial management solution with fully responsive, mobile-first UI.

## User Preferences
Fast Mode development - small focused edits preferred.

## System Architecture

### UI/UX Decisions
The application features a fully translated user interface across all major components, supporting dynamic language switching and persistence. A language selector is available on the login screen and within the application. The system provides 16 default budget categories created for each user, which are also translatable.

**Responsive Design Implementation:**
- ✅ All text is fully responsive with Tailwind breakpoints (text-xs → text-sm → text-base → text-lg → text-xl → text-2xl → text-3xl)
- ✅ All text fits within cards using `line-clamp-*`, `truncate`, and `break-words`
- ✅ Mobile-first design: smaller screens use smaller fonts that scale up smoothly
- ✅ Applied across ALL major components: BudgetControl, Dashboard, Goals, Transactions, AIAssistant, AdminPanel
- ✅ Icons use `flex-shrink-0` to prevent crushing
- ✅ Containers use `min-w-0` to enable overflow handling
- ✅ Text uses `gap-2` between elements for breathing room

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
    - **Export Functionality:** Translators can export all 364 translation keys across 5 languages as ZIP containing JSON files
    - **Import Functionality:** Translators can import improved translations from external AI tools (ChatGPT, Claude, etc.) in bulk
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

### System Design Choices
- **File Structure:**
    - `services/`: Contains `aiProviderService.ts` for abstraction, and individual service files for `geminiService.ts`, `openrouterService.ts`, and `puterService.ts`.
    - `components/`: Houses all UI components, with comprehensive translation coverage (11 components, 364 keys) and responsive design patterns.
    - `public/locales/`: Stores all JSON translation files.
    - `server/`: Includes `db/schema.ts` for database definitions (e.g., `api_configurations`, `budget_limits`) and route handlers (e.g., `settings.ts`, `budget.ts`, `users.ts`).

- **Responsive Design Patterns:**
    - Text scaling: `text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl` across all components
    - Line clamping: `line-clamp-1`, `line-clamp-2` to limit text overflow
    - Flex utilities: `min-w-0`, `flex-shrink-0`, `gap-2` for proper spacing
    - Truncation: `truncate` for single-line overflow, `break-words` for multi-line
    - Applied systematically across BudgetControl, Dashboard, Goals, Transactions, and other major components

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

## Recent Changes (Latest Session - Session 6)

### Responsive Text Sizing Implementation (NEW)
1. ✅ **Budget Component** - All text is fully responsive with breakpoint scaling
2. ✅ **Dashboard Component** - All titles, values, and descriptions now scale smoothly
3. ✅ **Goals Component** - Goal names and amounts resize for all screen sizes
4. ✅ **Transactions Component** - All transaction UI elements are responsive
5. ✅ **AIAssistant Component** - Chat interface scales properly on mobile
6. ✅ **AdminPanel Component** - Admin UI fully responsive
7. ✅ **Systematic Approach:**
   - `text-xs sm:text-sm md:text-base lg:text-lg` for regular text
   - `line-clamp-1` / `line-clamp-2` to prevent overflow
   - `truncate` / `break-words` for long strings
   - `min-w-0` and `flex-shrink-0` for proper flex behavior
   - Icons remain fixed with `flex-shrink-0`

### Previous Session - Budget Delete Feature
1. ✅ **Delete Button** - Red trash icon on every non-default budget card
2. ✅ **Smart Relocation** - All transactions moved to "Geral" automatically
3. ✅ **Protection** - Default budget categories cannot be deleted
4. ✅ **Confirmation** - User confirms deletion with warning message
5. ✅ **Multi-Language** - 5 new translation keys in all 5 languages

### Final Statistics
- ✅ 364 translation keys across 5 languages (PT, EN, ES, UM, LN)
- ✅ 11 components fully internationalized
- ✅ 5 complete language translations
- ✅ Multi-provider AI support (Gemini, OpenRouter, Puter, Groq)
- ✅ 16 default budget categories (translatable + deletable custom ones)
- ✅ TRANSLATOR role with professional management interface
- ✅ Export/Import system for AI-powered translation improvements
- ✅ Budget deletion with smart transaction relocation
- ✅ **Fully responsive UI with mobile-first design**
- ✅ Production build: 653.29KB | gzip: 148.31 KB, 0 errors

🚀 **PRODUCTION READY!** Complete multi-language family finance app with professional translator interface, AI-powered translation workflow, smart budget management, AND fully responsive mobile-first UI!

## Testing Workflow for Delete Budget Feature
1. Login: admin/admin
2. Go to "Orçamentos" (Budget) tab
3. Create a new custom budget category (not default)
4. Add some transactions to it
5. Click the red trash icon on the card
6. Confirm deletion - all transactions move to "Geral"
7. Verify transactions appear in "Geral" category

## Testing Workflow for Responsive Design
1. Open the app on desktop (fullscreen)
2. Resize browser window to mobile size (375px wide)
3. Verify all text remains visible in cards
4. Text should scale down smoothly
5. No text should overflow card boundaries
6. Test on all major sections: Budget, Dashboard, Goals, Transactions

## Testing Workflow for Export/Import
1. Login: admin/admin
2. Click "Configurações" → "🌐 Traduções"
3. Wait for dashboard to load (shows % completion per language)
4. Click "📥 Exportar JSONs" → Downloads ZIP with pt.json, en.json, etc.
5. Edit JSONs externally (use ChatGPT/Claude to improve translations)
6. Click "📤 Importar JSONs" → Select edited ZIP
7. Translations updated in real-time across all 5 languages
