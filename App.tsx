import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, UserRole, Transaction, SavingsGoal, TransactionType, BackupConfig, BudgetLimit, GoalTransaction, ExchangeRates, FamilyTask, FamilyEvent, RateProvider, UserStatus, SavedSimulation, LoanSimulation, Notification as AppNotification } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Goals from './components/Goals';
import FamilyMode from './components/FamilyMode';
import AdminPanel from './components/AdminPanel';
import BudgetControl from './components/BudgetControl';
import InflationControl from './components/InflationControl';
import Simulations from './components/Simulations';
import Login from './components/Login';
import AIAssistant from './components/AIAssistant';
import TranslationManager from './components/TranslationManager'; 
import NotificationsMenu from './components/NotificationsMenu';
import { Menu, Moon, Sun, Globe, Sparkles, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getExchangeRates } from './services/marketData';
import { authApi, transactionsApi, goalsApi, usersApi, familyApi, budgetApi } from './services/api';
import { LanguageProvider } from './contexts/LanguageContext';

// Dados Iniciais Atualizados com Hierarquia Familiar
const INITIAL_USERS: User[] = [
  {
    id: 'u0',
    username: 'admin',
    password: 'admin',
    name: 'Super Admin',
    role: UserRole.SUPER_ADMIN,
    avatar: '/default-avatar.svg',
    status: UserStatus.APPROVED,
    securityQuestion: { question: 'Nome do primeiro animal', answer: 'rex' }
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [];

const INITIAL_GOALS: SavingsGoal[] = [];

// Helper para carregar dados com segurança
const safeLoad = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    console.warn(`Dados corrompidos em ${key}. Resetando para padrão.`);
    return fallback;
  }
};

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [appName, setAppName] = useState(() => {
    return localStorage.getItem('appName') || 'Gestão Financeira';
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [userLanguage, setUserLanguage] = useState<any>('pt');
  const [currency, setCurrency] = useState('AOA'); 
  const [rateProvider, setRateProvider] = useState<RateProvider>('BNA');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'PDF' | 'CSV' | null>(null);
  const [exportStartDate, setExportStartDate] = useState(new Date().toISOString().split('T')[0].substring(0, 8) + '01');
  const [exportEndDate, setExportEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [budgets, setBudgets] = useState<BudgetLimit[]>([]);
  
  const [backupConfig, setBackupConfig] = useState<BackupConfig>({
    networkPath: '',
    rootDataFolder: '',
    frequency: 'manual',
    lastBackup: null
  });

  const [familyTasks, setFamilyTasks] = useState<FamilyTask[]>([]);
  const [familyEvents, setFamilyEvents] = useState<FamilyEvent[]>([]);
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>(() => safeLoad('savedSimulations', []));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => safeLoad('notifications', []));

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await authApi.me();
        setCurrentUser(response.user);
        setUserLanguage(response.user.languagePreference || 'pt');
        setIsLoggedIn(true);
        await loadAllData();
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const loadAllData = async () => {
    try {
      const [transactionsData, goalsData, usersData, tasksData, eventsData, budgetsData] = await Promise.all([
        transactionsApi.getAll(),
        goalsApi.getAll(),
        usersApi.getAll(),
        familyApi.getTasks(),
        familyApi.getEvents(),
        budgetApi.getLimits()
      ]);
      setTransactions(transactionsData);
      setGoals(goalsData);
      setAllUsers(usersData);
      setFamilyTasks(tasksData);
      setFamilyEvents(eventsData);
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    const loadRates = async () => {
      try {
        const rates = await getExchangeRates(rateProvider);
        setExchangeRates(rates);
      } catch (error) {
        console.error("Erro ao carregar taxas", error);
      }
    };
    loadRates();
    const interval = setInterval(loadRates, 300000); 
    return () => clearInterval(interval);
  }, [rateProvider]); 

  // Audio Context Logic (Same as before)
  const audioContextRef = useRef<AudioContext | null>(null);
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const playClickSound = () => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  };

  const playSuccessSound = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.value = 523.25; 
      gain1.gain.setValueAtTime(0.05, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1).connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);
    } catch (e) {}
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button');
      if (button) {
        const text = (button.innerText || '').toLowerCase();
        const successKeywords = ['confirmar', 'salvar', 'criar', 'atualizar', 'adicionar', 'concluir', 'calcular', 'exportar', 'aprovar', 'entrar', 'redefinir', 'instalar'];
        if (successKeywords.some(keyword => text.includes(keyword))) {
          playSuccessSound();
        } else {
          playClickSound();
        }
        return;
      }
      if (target.closest('a') || target.closest('input[type="checkbox"]')) {
        playClickSound();
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // Aplica a classe dark ao documento
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Listener para mudanças no tema do sistema (se o usuário não tiver override manual)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Só muda automaticamente se não houver preferência salva
      if (!localStorage.getItem('theme')) {
        setDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleThemeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    // Salva preferência explícita do usuário
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  useEffect(() => { localStorage.setItem('appName', appName); }, [appName]);
  useEffect(() => { localStorage.setItem('savedSimulations', JSON.stringify(savedSimulations)); }, [savedSimulations]);
  useEffect(() => { localStorage.setItem('notifications', JSON.stringify(notifications)); }, [notifications]);

  // --- Notification Logic (Same as before) ---
  const addNotification = useCallback((title: string, message: string, idPrefix: string) => {
    setNotifications(prev => {
      if (prev.some(n => n.id.startsWith(idPrefix) && !n.read)) return prev;
      const newNotif: AppNotification = {
        id: `${idPrefix}-${Date.now()}`,
        title,
        message,
        read: false,
        date: new Date().toISOString()
      };
      return [newNotif, ...prev].slice(0, 20);
    });
  }, []);

  const checkAutomaticNotifications = useCallback(() => {
    if (!isLoggedIn || !currentUser) return;
    const now = new Date();
    const currentMonth = now.getMonth();
    
    budgets.forEach(budget => {
      const spent = transactions
        .filter(t => t.type === TransactionType.EXPENSE && t.category === budget.category)
        .filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === currentMonth && d.getFullYear() === now.getFullYear();
        })
        .reduce((acc, t) => acc + t.amount, 0);
      
      if (spent > budget.limit) {
        addNotification('Orçamento Excedido', `Atenção! Você ultrapassou o limite de gastos em ${budget.category}.`, `budget-${budget.category}-${currentMonth}`);
      } else if (spent > budget.limit * 0.9) {
        addNotification('Alerta de Orçamento', `Você já consumiu 90% do orçamento de ${budget.category}.`, `budget-warn-${budget.category}-${currentMonth}`);
      }
    });

    goals.forEach(goal => {
      if (goal.targetAmount > 0 && goal.currentAmount >= goal.targetAmount) {
        addNotification('Meta Atingida! 🎉', `Parabéns! Você atingiu o objetivo: ${goal.name}.`, `goal-${goal.id}`);
      }
    });

    if (currentUser) {
      const myTasks = familyTasks.filter(t => t.assignedTo === currentUser.id && !t.isCompleted);
      if (myTasks.length > 0) {
        addNotification('Tarefas Pendentes', `Você tem ${myTasks.length} tarefas familiares pendentes.`, `tasks-${currentUser.id}-${myTasks.length}`);
      }
    }
  }, [isLoggedIn, transactions, budgets, goals, familyTasks, currentUser, addNotification]);

  useEffect(() => { checkAutomaticNotifications(); }, [transactions, checkAutomaticNotifications]);

  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleNotificationClick = (notification: AppNotification) => {
    markNotificationRead(notification.id);
    const id = notification.id;
    if (id.startsWith('budget')) setCurrentView('budget');
    else if (id.startsWith('goal')) setCurrentView('goals');
    else if (id.startsWith('tasks')) setCurrentView('family');
  };

  const clearNotifications = () => setNotifications([]);

  const formatCurrency = (valueInAOA: number) => {
    if (!exchangeRates) return `${valueInAOA.toFixed(2)} Kz`;
    if (currency === 'AOA') {
      return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(valueInAOA);
    }
    const rate = exchangeRates[currency];
    if (typeof rate === 'number') {
      const convertedValue = valueInAOA / rate;
      let locale = 'pt-AO';
      switch (currency) {
        case 'BRL': locale = 'pt-BR'; break;
        case 'USD': locale = 'en-US'; break;
        case 'EUR': locale = 'de-DE'; break;
        case 'GBP': locale = 'en-GB'; break;
        case 'CNY': locale = 'zh-CN'; break;
        case 'ZAR': locale = 'en-ZA'; break;
        case 'JPY': locale = 'ja-JP'; break;
        default: locale = 'en-US';
      }
      return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(convertedValue);
    }
    return `${valueInAOA.toFixed(2)} Kz`;
  };

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    setUserLanguage(user.languagePreference || 'pt');
    setIsLoggedIn(true);
    await loadAllData();
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsLoggedIn(false);
    setCurrentView('dashboard');
    setCurrentUser(null);
    setTransactions([]);
    setGoals([]);
    setAllUsers([]);
  };

  const handleAddUser = async (userData: Omit<User, 'id'>) => {
    try {
      const response = await usersApi.create(userData);
      setAllUsers([...allUsers, response]);
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Erro ao adicionar usuário');
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const response = await usersApi.update(updatedUser.id, updatedUser);
      setAllUsers(allUsers.map(u => u.id === updatedUser.id ? response : u));
      if (currentUser?.id === updatedUser.id) setCurrentUser(response);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Erro ao atualizar usuário');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      alert("Não é possível remover a si mesmo.");
      return;
    }
    try {
      await usersApi.delete(userId);
      setAllUsers(allUsers.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Erro ao remover usuário');
    }
  };
  const handleRestoreBackup = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) throw new Error("Arquivo vazio");
        const json = JSON.parse(content);
        if (!json || typeof json !== 'object') throw new Error("Arquivo inválido.");
        setAppName(json.appName || 'Gestão Financeira');
        setAllUsers(json.users || []);
        setTransactions(json.transactions || []);
        setGoals(json.goals || []);
        setBudgets(json.budgets || []);
        setBackupConfig(json.config || backupConfig);
        setFamilyTasks(json.tasks || []);
        setFamilyEvents(json.events || []);
        setSavedSimulations(json.savedSimulations || []);
        alert("Backup restaurado com sucesso! Por segurança, faça login novamente.");
        setIsLoggedIn(false);
      } catch (error) {
        alert("Erro ao restaurar backup: " + error);
      }
    };
    reader.readAsText(file);
  };

  const canViewData = (viewer: User, targetUser: User) => {
    if (viewer.id === targetUser.id) return true;
    if (viewer.role === UserRole.SUPER_ADMIN) return true;
    if (viewer.role === UserRole.ADMIN && targetUser.role !== UserRole.SUPER_ADMIN) return true;
    if (targetUser.createdBy === viewer.id) {
       if (!targetUser.birthDate) return true; 
       const diff = Date.now() - new Date(targetUser.birthDate).getTime();
       const age = diff / (1000 * 60 * 60 * 24 * 365.25);
       if (age < 18) return true; 
       return !!targetUser.allowParentView; 
    }
    return false;
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    try {
      const response = await transactionsApi.create(t);
      setTransactions([response, ...transactions]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Erro ao adicionar transação');
    }
  };
  
  const updateTransaction = async (u: Transaction) => {
    try {
      const response = await transactionsApi.update(u.id, u);
      setTransactions(transactions.map(t => t.id === u.id ? response : t));
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Erro ao atualizar transação');
    }
  };
  
  const deleteTransaction = async (id: string) => {
    try {
      await transactionsApi.delete(id);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Erro ao remover transação');
    }
  };
  
  const addGoal = async (g: Omit<SavingsGoal, 'id'>) => {
    try {
      const response = await goalsApi.create(g);
      setGoals([...goals, response]);
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Erro ao adicionar meta');
    }
  };
  
  const deleteGoal = async (id: string) => {
    try {
      await goalsApi.delete(id);
      setGoals(goals.filter(g => g.id !== id));
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Erro ao remover meta');
    }
  };
  
  const addGoalContribution = async (id: string, amount: number, note: string) => {
    try {
      const response = await goalsApi.contribute(id, amount, note);
      setGoals(goals.map(g => g.id === id ? response : g));
    } catch (error) {
      console.error('Error adding contribution:', error);
      alert('Erro ao adicionar contribuição');
    }
  };
  
  const editGoalContribution = (gid: string, c: GoalTransaction) => {
    setGoals(goals.map(g => g.id === gid ? { ...g, history: g.history.map(h => h.id === c.id ? c : h), currentAmount: g.history.map(h => h.id === c.id ? c : h).reduce((a,b)=>a+b.amount,0) } : g));
  };
  
  const deleteGoalContribution = (gid: string, cid: string) => {
    setGoals(goals.map(g => g.id === gid ? { ...g, history: g.history.filter(h => h.id !== cid), currentAmount: g.history.filter(h => h.id !== cid).reduce((a,b)=>a+b.amount,0) } : g));
  };
  
  const saveBudget = async (b: BudgetLimit) => {
    try {
      await budgetApi.setLimit(b.category, b.limit);
      setBudgets(p => { 
        const i = p.findIndex(x => x.category === b.category); 
        return i >= 0 ? p.map((x, idx) => idx === i ? b : x) : [...p, b];
      });
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Erro ao salvar orçamento');
    }
  };
  
  const addFamilyTask = async (t: Omit<FamilyTask, 'id'>) => {
    try {
      const response = await familyApi.createTask(t);
      setFamilyTasks([...familyTasks, response]);
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Erro ao adicionar tarefa');
    }
  };
  
  const toggleFamilyTask = async (id: string) => {
    const task = familyTasks.find(t => t.id === id);
    if (!task) return;
    try {
      const response = await familyApi.updateTask(id, { ...task, isCompleted: !task.isCompleted });
      setFamilyTasks(familyTasks.map(t => t.id === id ? response : t));
    } catch (error) {
      console.error('Error toggling task:', error);
      alert('Erro ao atualizar tarefa');
    }
  };
  
  const deleteFamilyTask = async (id: string) => {
    try {
      await familyApi.deleteTask(id);
      setFamilyTasks(familyTasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Erro ao remover tarefa');
    }
  };
  
  const addFamilyEvent = async (e: Omit<FamilyEvent, 'id'>) => {
    try {
      const response = await familyApi.createEvent(e);
      setFamilyEvents([...familyEvents, response]);
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Erro ao adicionar evento');
    }
  };
  
  const deleteFamilyEvent = async (id: string) => {
    try {
      await familyApi.deleteEvent(id);
      setFamilyEvents(familyEvents.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Erro ao remover evento');
    }
  };
  
  const saveSimulation = (s: LoanSimulation, n: string) => setSavedSimulations([...savedSimulations, { ...s, id: Date.now().toString(), name: n, createdAt: new Date().toISOString() }]);
  const deleteSimulation = (id: string) => setSavedSimulations(savedSimulations.filter(s => s.id !== id));

  const openExportModal = (type: 'PDF' | 'CSV') => { setExportType(type); setShowExportModal(true); };
  const handleExportConfirm = () => {
    const filtered = transactions.filter(t => t.date >= exportStartDate && t.date <= exportEndDate);
    if (exportType === 'PDF') {
      const doc = new jsPDF();
      doc.text(appName, 10, 10);
      autoTable(doc, { head: [['Data', 'Desc', 'Valor']], body: filtered.map(t => [t.date, t.description, t.amount]) });
      doc.save("relatorio.pdf");
    } else {
      const csv = "Data,Descricao,Valor\n" + filtered.map(t => `${t.date},${t.description},${t.amount}`).join("\n");
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = "export.csv"; a.click();
    }
    setShowExportModal(false);
  };
  
  const updateBackupConfig = (c: BackupConfig) => setBackupConfig(c);
  const triggerManualBackup = () => {
    const data = { appName, users: allUsers, transactions, goals, budgets, config: backupConfig, tasks: familyTasks, events: familyEvents, savedSimulations };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = "backup.json"; a.click();
    setBackupConfig({...backupConfig, lastBackup: new Date().toISOString()});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !currentUser) {
    return (
      <LanguageProvider initialLanguage="pt">
        <Login appName={appName} onLogin={handleLogin} />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider initialLanguage={userLanguage as any}>
      <div className="flex h-screen bg-slate-50 dark:bg-[#09090b] overflow-hidden font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Sidebar 
        appName={appName}
        currentUser={currentUser}
        currentView={currentView}
        setCurrentView={setCurrentView}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        logout={handleLogout}
        onUpdateUser={handleUpdateUser}
      />

      {/* Controlled AI Assistant Component */}
      <AIAssistant 
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        transactions={transactions} 
        goals={goals} 
        currencyFormatter={formatCurrency} 
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        <header className="flex items-center justify-between px-4 md:px-6 py-4 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 border-b border-slate-200 dark:border-slate-700/50 shadow-sm transition-colors duration-300">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="mr-3 text-slate-500 md:hidden hover:text-primary-500 transition active:scale-95"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-white capitalize truncate max-w-[150px] md:max-w-none">
              {currentView === 'dashboard' ? 'Painel Geral' : currentView === 'simulations' ? 'Simulação' : currentView === 'transactions' ? 'Transações' : currentView === 'budget' ? 'Orçamentos' : currentView === 'goals' ? 'Metas' : currentView === 'inflation' ? 'Inflação' : currentView === 'admin' ? 'Administração' : 'Modo Família'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-3">
             <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700">
              <Globe size={16} className="text-primary-500 mr-2" />
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer">
                <option value="AOA">AOA (Kz)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="BRL">BRL (R$)</option>
              </select>
            </div>
            
            {/* AI Trigger Button in Header */}
            <button
              onClick={() => setIsAiOpen(!isAiOpen)}
              className={`p-2.5 rounded-full transition group active:scale-95 ${isAiOpen ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              title="Assistente Gemini"
            >
              <Sparkles size={20} className={isAiOpen ? 'fill-current' : ''} />
            </button>

            <NotificationsMenu 
              notifications={notifications} 
              onNotificationClick={handleNotificationClick} 
              onClearAll={clearNotifications} 
            />

            <button 
              data-tour="theme-toggle" 
              onClick={handleThemeToggle} 
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition active:scale-95"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 scroll-smooth pb-32">
          <div className="max-w-7xl mx-auto h-full">
            {currentView === 'dashboard' && <Dashboard transactions={transactions} savingsGoals={goals} budgets={budgets} currencyFormatter={formatCurrency} />}
            {currentView === 'transactions' && <Transactions transactions={transactions} addTransaction={addTransaction} updateTransaction={updateTransaction} deleteTransaction={deleteTransaction} currentUserId={currentUser.id} currencyFormatter={formatCurrency} onExport={openExportModal} />}
            {currentView === 'budget' && <BudgetControl transactions={transactions} budgets={budgets} saveBudget={saveBudget} currencyFormatter={formatCurrency} />}
            {currentView === 'goals' && <Goals goals={goals} addGoal={addGoal} deleteGoal={deleteGoal} addContribution={addGoalContribution} editContribution={editGoalContribution} deleteContribution={deleteGoalContribution} currencyFormatter={formatCurrency} currentUser={currentUser} />}
            {currentView === 'inflation' && <InflationControl rateProvider={rateProvider} setRateProvider={setRateProvider} currencyFormatter={formatCurrency} />}
            {currentView === 'simulations' && <Simulations currencyFormatter={formatCurrency} savedSimulations={savedSimulations} onSaveSimulation={saveSimulation} onDeleteSimulation={deleteSimulation} />}
            {currentView === 'family' && <FamilyMode transactions={transactions} currencyFormatter={formatCurrency} currentUser={currentUser} allUsers={allUsers} tasks={familyTasks} events={familyEvents} addTask={addFamilyTask} toggleTask={toggleFamilyTask} deleteTask={deleteFamilyTask} addEvent={addFamilyEvent} deleteEvent={deleteFamilyEvent} canViewData={canViewData} />}
            {currentView === 'admin' && <AdminPanel appName={appName} setAppName={setAppName} backupConfig={backupConfig} updateBackupConfig={updateBackupConfig} triggerManualBackup={triggerManualBackup} users={allUsers} currentUser={currentUser} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} onRestoreBackup={handleRestoreBackup} />}
            {currentView === 'translations' && <TranslationManager />}
          </div>
        </main>
      </div>

      {showExportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700 animate-scale-in">
             <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Exportar {exportType}</h3>
             <div className="space-y-4">
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase">Data Inicial</label>
                 <input type="date" value={exportStartDate} onChange={e => setExportStartDate(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" />
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase">Data Final</label>
                 <input type="date" value={exportEndDate} onChange={e => setExportEndDate(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" />
               </div>
               <div className="flex gap-3 pt-2">
                 <button onClick={() => setShowExportModal(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition active:scale-95">Cancelar</button>
                 <button onClick={handleExportConfirm} className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition active:scale-95">Confirmar</button>
               </div>
             </div>
           </div>
        </div>
      )}
      </div>
    </LanguageProvider>
  );
};

export default App;