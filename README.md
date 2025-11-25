# 🏦 Gestor Financeiro Familiar V3

![Status](https://img.shields.io/badge/Status-Estável-emerald)
![Tech](https://img.shields.io/badge/Stack-React%20%7C%20TypeScript%20%7C%20Tailwind-blue)
![AI](https://img.shields.io/badge/AI-Powered-purple)

Uma plataforma completa para gestão financeira doméstica, projetada para famílias que desejam controle total, transparência e insights inteligentes sobre seu dinheiro.

## ✨ Funcionalidades Principais

### 🧠 Inteligência Artificial Integrada
- **Assistente Gemini**: Chatbot financeiro que conhece seus dados e tira dúvidas.
- **Categorização Automática**: A IA detecta categorias baseadas na descrição do gasto.
- **Análise de Contratos (PDF)**: Extração automática de dados de empréstimos bancários para simulação.
- **Detecção de Padrões**: Análise comportamental que identifica se você é "Poupador", "Gastador", etc.

### 📱 Experiência do Usuário (UI/UX)
- **Design Responsivo**: Funciona perfeitamente em Celulares e Desktops.
- **Modo Família**: Interface simplificada para gestão de tarefas e calendário compartilhado.
- **Dark Mode**: Tema escuro nativo para conforto visual.
- **Anexos e Câmera**: Tire fotos de recibos diretamente pelo app ou anexe múltiplos arquivos.

### 💼 Gestão Financeira
- **Controle de Orçamento**: Tetos de gastos com alertas visuais.
- **Metas de Poupança**: Projeção visual de conquistas (ex: Casa Própria).
- **Inflação & Moedas**: Calculadora de poder de compra e suporte a múltiplas moedas (Kz, USD, EUR, etc).
- **Simulador de Empréstimos**: Comparativo entre tabelas PRICE e SAC.

### 🛡️ Administração
- **Hierarquia de Usuários**: Super Admin, Gestor, Membro.
- **Atualização OTA**: Sistema de verificação de atualizações via GitHub.
- **Backup e Restauração**: Segurança total dos seus dados.

---

## 🚀 Instalação (Servidor Linux)

Para instalar em produção, utilize o script automático incluso.

```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

Consulte o arquivo `README_INSTALL.md` para mais detalhes.

## 🔒 Privacidade e Dados
Todos os dados financeiros são processados localmente ou na sessão do navegador. A comunicação com a IA é feita de forma segura utilizando sua API Key pessoal.
