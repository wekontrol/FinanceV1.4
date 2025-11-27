# Gestor Financeiro Familiar - Production Ready Setup

## Overview
A comprehensive family financial management platform built with React, TypeScript, and Express.js. This application provides intelligent financial tracking, AI-powered insights using Google's Gemini AI, and family-friendly features for household budget management. It offers multi-user support with role hierarchy, real-time financial data, and robust administrative controls.

## User Preferences
- Application uses Portuguese (PT) as primary language
- Default login: `admin` / `admin`
- Deployment target: Ubuntu 20.04+ on Proxmox VMs (or Render/Production)
- Theme: Supports dark mode preference

## Recent Implementation (November 27, 2025 - Final: Notifications + User-Specific Budgets + Frequencies)

✅ **GESTÃO DE NOTIFICAÇÕES - Notification Management System** (PRODUCTION READY)
1. **Super Admin (Global)** - Configurar preferências de notificações para toda plataforma
2. **Utilizadores (Pessoal)** - Cada utilizador controla suas próprias notificações
3. **Tipos de Notificação**:
   - 🎯 Alertas de Orçamento (limite próximo/excedido)
   - 📅 Alertas de Assinatura (vencimentos)
   - 💡 Dicas Financeiras (IA insights)
   - 🏆 Progresso de Metas (atualizações)
4. **Canais de Entrega**:
   - 📧 Email (alertas críticos)
   - 🔔 Web Push/App (notificações em tempo real)
5. **Tabela `notification_preferences`** - Isolamento por utilizador + global para super admin
6. **API Endpoints** - GET/POST `/api/notifications/preferences` (Type-safe, auth-protected)
7. **Componente React** - NotificationSettings.tsx para UI de gestão
8. **Fixes Applied Nov 27**:
   - ✅ Fixed: Session type safety in notifications route (req.session checks)
   - ✅ Fixed: "Not authenticated" error with proper null checks
   - ✅ Fixed: BudgetControl.tsx build error (clean rebuild)
   - ✅ Verified: All endpoints working without console errors

✅ **HISTÓRICO DE ORÇAMENTOS - Budget History Tracking (100% Automático)**
1. **Nova Tabela** - `budget_history` armazena gastos mensais por categoria
2. **Endpoints Backend** - GET `/api/budget/history`, POST `/api/budget/history/save`
3. **Auto-Save ao Login** - Verifica se mudou de mês → salva automaticamente histórico anterior
4. **Background Scheduler** - Executa a cada 30 minutos (independente de login)
5. **Rastreamento** - `app_settings` guarda última data de salvamento por usuário
6. **UI Visualizador** - Mostra últimos 12 meses de gastos vs limites com seletor de mês
7. **Botão Manual** - Ainda permite salvar manualmente se desejado (opcional)
8. **Inclui Assinaturas** - Orçamento soma despesas simples + assinaturas/recorrências atividades

✅ **SINCRONIZAÇÃO COM ASSINATURAS - Subscriptions in Budget**
1. **Cálculo Unificado** - Orçamento = Despesas Simples + Assinaturas Ativas
2. **Backend Atualizado** - `GET /api/budget/summary` inclui transações recorrentes
3. **Histórico Completo** - `POST /api/budget/history/save` salva gastos totais (simples + recorrentes)
4. **Rastreamento Real** - Mostra o consumo real mensal de cada categoria

✅ **GITHUB REPOSITORY CONFIGURAÇÃO - Super Admin Config**
1. **GitHub Repo URL Input** - Super Admin pode configurar URL do repositório
2. **Sistema de Update Corrigido** - Agora usa `/bin/bash` explicitamente (fix para "spawn /bin/sh ENOENT")
3. **Settings Persistência** - GitHub repo URL salvo em banco de dados
4. **Validação** - Verifica se URL contém "github.com"
5. **Integrado com Update System** - Sistema de atualização lê URL configurada

✅ **ADICIONAR ORÇAMENTOS - Budget Management (User-Specific)**
1. **Botão Flutuante** - Card com ícone `+` para adicionar novos orçamentos
2. **Formulário com Input de Texto** - Usuário digita nome da categoria (não dropdown)
3. **Isolamento por Usuário** - Cada usuário tem seus próprios orçamentos
4. **Validações Rigorosas** - Avisa se categoria já existe para o usuário
5. **Flexibilidade** - Dois usuários podem criar "Alimentação" diferentes
6. **Backend Validação** - UNIQUE(user_id, category) previne duplicatas por usuário
7. **Testado & Funcionando** - Adiciona novos orçamentos corretamente

✅ **PREVISUALIZAÇÕES DE MOEDA - Confirmação Visual de Valores**
1. **Campos com Prévia** - Transações, Orçamentos, Metas, Empréstimos
2. **Formatação Em Tempo Real** - Mostra "AOA 1.500,00" enquanto digita
3. **Validação Visual** - Usuário confirma valor antes de enviar
4. **Todos os Componentes Atualizados**:
   - Transactions.tsx: Campo de valor em nova transação
   - BudgetControl.tsx: Limite mensal (novo + edição)
   - Goals.tsx: Alvo + Saldo Inicial (já implementado)
   - Simulations.tsx: Valor do empréstimo (já implementado)

✅ **FREQUÊNCIAS EXPANDIDAS - 6 Opções de Recorrência**
1. **Semanal** - Cada semana
2. **Quinzenal** - A cada 2 semanas
3. **Mensal** - A cada mês
4. **Trimestral** - A cada 3 meses (NOVO)
5. **Semestral** - A cada 6 meses (NOVO)
6. **Anual** - Uma vez por ano
7. **Exibição Dinâmica** - Labels ajustados em cards de assinatura

✅ **SAÚDE FINANCEIRA MELHORADA - Score Widget Premium**
1. **Score Widget Interativo** - Hover reveals breakdown (40% poupança, 30% despesa, 30% metas)
2. **Cores Dinâmicas** - Muda de cor conforme score (verde→amarelo→vermelho)
3. **Animações** - Bounce-in no score, slide-up na breakdown no hover
4. **Emojis & Status** - ✨ Excelente! / ⚠️ Bom, mas atenção / 🚨 Crítico
5. **Testado & Funcionando** - Score calcula corretamente com transações

✅ **INTERFACE REDESIGN - UI/UX Melhorada**
1. **Animações Premium** - Bounce-in, pulse-soft, glow-pulse, shake, slide effects
2. **Sidebar Interativa** - Hover scale effects, icon animations, active state indicators  
3. **Login Redesign** - Background gradients com blur blobs animados, gradient text
4. **Global Styling** - Custom scrollbar, glass morphism, smooth transitions
5. **9 Novas Animações Tailwind** - Completa UI interação

## Recent Implementation (Previous - November 27, 2025)

✅ **3 Novos Recursos Implementados**
1. **Alertas Inteligentes** - Limites de orçamento, transações recorrentes, inflação alta
2. **Relatórios em PDF** - Exportar dados mensais/anuais com tabelas compiladas
3. **Gráficos por Categoria** - Pie chart mostrando distribuição de despesas

✅ **Dados de Inflação - World Bank API**
- Conectado com World Bank API para dados reais de inflação de Angola
- Endpoint: `https://api.worldbank.org/v2/country/AO/indicator/FP.CPI.TOTL.ZG`
- Cache de 12 horas para otimizar requisições
- Fallback para dados locais se API indisponível
- Distribuição realista: converte inflação anual em dados mensais
- Atualiza automaticamente a cada 12 horas

✅ **Atualização do Sistema via UI - Super Admin Only**
- Super Admin pode atualizar sistema diretamente pela interface
- Processo automático: git pull → npm install → build → restart
- Barra de progresso em tempo real (0% → 100%)
- Status detalhado de cada etapa
- Confirmação de segurança antes de atualizar
- Página recarrega automaticamente após conclusão
- Endpoints: POST `/api/system/update`, GET `/api/system/update-progress`

✅ **Backup & Restauro com Progresso Visível**
- Manual backup exporta TODOS os dados em JSON
- Barra de progresso animada durante backup/restauro
- Status em tempo real (Lendo BD... Exportando... Completo!)
- Restauro restaura TODOS os dados do arquivo JSON
- Confirmação obrigatória antes de restauro
- Endpoints: POST `/api/backup`, POST `/api/backup/restore`, GET `/api/backup/progress`

✅ **PostgreSQL Session Storage** - Removed memory leak warning
- Sessions now persist in PostgreSQL database
- Auto-creates `session` table in production
- Scales horizontally (multi-server ready)
- Fixed: "Warning: connect.session() MemoryStore is not designed for production"
- Variável de ambiente: `TheFinance` (automaticamente configurada pelo deploy.sh)

✅ **Dynamic Exchange Rates** - Real-time daily updates
- Fetches live rates from ExchangeRate-API (exchangerate-api.com)
- Caches rates for 24 hours in `exchange_rates` table
- Smart fallback if API unavailable

✅ **Terms & Conditions**
- Mandatory checkbox during registration
- Super Admin can edit terms in Settings
- Stored in database, not hardcoded

✅ **Family Management System**
- Multi-family support with family deletion
- Family-based user hierarchy
- Protected admin family (fam_admin)

## Tech Stack
- **Frontend**: React 18.2.0 + Vite 5.0.0 + Tailwind CSS
- **Backend**: Express.js 5.x with TypeScript
- **Sessions**: PostgreSQL (production) / Memory (development)
- **Databases**: 
  - SQLite: `data.db` (local app data)
  - PostgreSQL: `session` table (session storage only in production)
- **AI**: Google Gemini AI
- **Exchange Rates**: ExchangeRate-API (1500 requests/month free)

## Database Schema
- **families**: Multi-family support
- **users**: User profiles with role hierarchy
- **transactions**: Income/expense records
- **savings_goals** / **goal_transactions**: Savings tracking
- **app_settings**: Global configuration (gemini_api_key, terms_of_service)
- **exchange_rates**: 24-hour cached currency rates
- **session**: PostgreSQL-backed sessions (production only)

## API Endpoints
- **Auth**: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/me`
- **Families**: `GET/DELETE /api/families` (Super Admin only)
- **Exchange Rates**: `GET /api/settings/rates/:provider` (BNA/FOREX/PARALLEL)
- **Settings**: `GET/POST /api/settings/:key` (Super Admin only)
- **Backup**: `POST /api/backup`, `POST /api/backup/restore`, `GET /api/backup/progress` (Admin+)
- **System**: `POST /api/system/update`, `GET /api/system/update-progress` (Super Admin only)
- **Transactions/Goals/Users**: Full CRUD endpoints

## Deployment
**For Ubuntu Proxmox - FULLY AUTOMATED:**
```bash
sudo ./deploy.sh
```
That's it! The script will:
1. ✅ Install Node.js automatically
2. ✅ Build the application
3. ✅ **Ask for PostgreSQL string** (paste your connection string)
4. ✅ Configure systemd with `TheFinance` variable
5. ✅ Start the service automatically

**For Render/Cloud:**
1. Connect GitHub repository
2. Set `TheFinance` environment variable (PostgreSQL connection string)
3. Deploy - sessions automatically use PostgreSQL

**Production Environment Variables:**
- `NODE_ENV=production` (set by deploy script)
- `TheFinance=postgresql://user:pass@host:5432/dbname` (sessions storage - **set during deploy.sh**)
- `PORT=5000` (set by deploy script)

## Session Storage - How It Works
1. **Development**: Uses memory store (in-process)
2. **Production with TheFinance**: Uses PostgreSQL
3. **Production without TheFinance**: Falls back to memory (with warning)

Ideal setup: Always provide `TheFinance` in production for persistent sessions.

## External APIs
- **ExchangeRate-API**: Real-time currency rates (https://exchangerate-api.com/)
- **Google Gemini**: AI-powered financial insights
- **DiceBear**: Avatar generation

## Testing Checklist
- ✅ Backend data synchronization
- ✅ Multi-device session persistence
- ✅ Exchange rates auto-refresh (24h) - Dados determinísticos com seeded random
- ✅ Terms & Conditions mandatory acceptance
- ✅ Family creation and deletion
- ✅ PostgreSQL sessions (production ready)
- ✅ Backup & Restauro com progresso visual
- ✅ System update via UI (Super Admin only)
- ✅ Gráfico de conversão de moedas (dados consistentes)
- ✅ Aba de inflação com dados realistas (24.5% inicial Angola 2024)

## Backup & Restauro - Como Usar

### **📥 Fazer Backup Manual:**
1. Login como Admin/Super Admin
2. Vá para ⚙️ **Configurações** > **Backup & Restauro**
3. Clique em **"Fazer Backup Agora"**
4. Veja a barra de progresso (0% → 100%)
5. O arquivo `backup-YYYY-MM-DD.json` será baixado automaticamente

### **📤 Restaurar de um Backup:**
1. Acesse ⚙️ **Configurações** > **Backup & Restauro**
2. Clique em **"Escolher Arquivo JSON"**
3. Selecione o arquivo `backup-*.json`
4. Confirme a operação (⚠️ Aviso: Todos os dados serão substituídos!)
5. Acompanhe o progresso na barra animada
6. Página recarrega automaticamente após conclusão

## Atualização do Sistema - Como Usar

### **🚀 Atualizar via UI (Super Admin):**
1. Login como **Super Admin**
2. Vá para ⚙️ **Admin** > **Atualização do Sistema**
3. Clique em **"🚀 Atualizar Agora"**
4. Confirme (⚠️ Sistema será reiniciado!)
5. Acompanhe a barra de progresso:
   - ✅ Puxando código do repositório...
   - ✅ Instalando dependências...
   - ✅ Compilando aplicação...
   - ✅ Reiniciando serviço...
6. Página recarrega automaticamente quando concluído

### **Dicas:**
- Todos os usuários serão desconectados durante a atualização
- Processo leva 2-5 minutos (varia com tamanho)
- Fazer backup antes é recomendado (⚠️)
- Em produção, execute fora de horário de pico

## Next Steps
1. 🔄 Deploy to production (Ubuntu/Render/Cloud)
2. 🔄 Change default admin password
3. 🔄 Configure Gemini API key in Settings
4. 🔄 Add production SSL certificates
5. 🔄 Set up automated daily backups (cron job)
6. 🔄 Monitor updates via `/api/system/update-progress` para dashboards customizados

## Credentials (Change Immediately in Production!)
- Username: `admin`
- Password: `admin`
