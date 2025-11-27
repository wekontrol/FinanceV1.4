import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'pt' | 'en' | 'es' | 'um' | 'ln';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  pt: {
    // Login
    'login.title': 'Gestão Financeira',
    'login.subtitle': 'Gestão Financeira Familiar',
    'login.username': 'Usuário',
    'login.password': 'Senha',
    'login.enter': 'Entrar',
    'login.forgotPassword': 'Esqueci minha senha',
    'login.createFamily': 'Criar Família',
    'login.language': 'Idioma',
    'login.select_language': 'Selecionar idioma...',
    'login.portuguese': 'Português',
    'login.english': 'English',
    'login.spanish': 'Español',
    'login.umbundu': 'Umbundu',

    // General
    'app.dashboard': 'Dashboard',
    'app.transactions': 'Transações',
    'app.goals': 'Metas',
    'app.family': 'Família',
    'app.admin': 'Administrador',
    'app.budget': 'Orçamento',
    'app.inflation': 'Inflação',
    'app.simulations': 'Simulações',
    'app.logout': 'Sair',
    'app.settings': 'Configurações',
  },
  en: {
    // Login
    'login.title': 'Financial Management',
    'login.subtitle': 'Family Financial Management',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.enter': 'Login',
    'login.forgotPassword': 'Forgot password',
    'login.createFamily': 'Create Family',
    'login.language': 'Language',
    'login.select_language': 'Select language...',
    'login.portuguese': 'Português',
    'login.english': 'English',
    'login.spanish': 'Español',
    'login.umbundu': 'Umbundu',

    // General
    'app.dashboard': 'Dashboard',
    'app.transactions': 'Transactions',
    'app.goals': 'Goals',
    'app.family': 'Family',
    'app.admin': 'Admin',
    'app.budget': 'Budget',
    'app.inflation': 'Inflation',
    'app.simulations': 'Simulations',
    'app.logout': 'Logout',
    'app.settings': 'Settings',
  },
  es: {
    // Login
    'login.title': 'Gestión Financiera',
    'login.subtitle': 'Gestión Financiera Familiar',
    'login.username': 'Usuario',
    'login.password': 'Contraseña',
    'login.enter': 'Entrar',
    'login.forgotPassword': 'Olvidé mi contraseña',
    'login.createFamily': 'Crear Familia',
    'login.language': 'Idioma',
    'login.select_language': 'Seleccionar idioma...',
    'login.portuguese': 'Português',
    'login.english': 'English',
    'login.spanish': 'Español',
    'login.umbundu': 'Umbundu',

    // General
    'app.dashboard': 'Panel de Control',
    'app.transactions': 'Transacciones',
    'app.goals': 'Objetivos',
    'app.family': 'Familia',
    'app.admin': 'Administrador',
    'app.budget': 'Presupuesto',
    'app.inflation': 'Inflación',
    'app.simulations': 'Simulaciones',
    'app.logout': 'Cerrar Sesión',
    'app.settings': 'Configuración',
  },
  um: {
    // Login (Umbundu)
    'login.title': 'Okusundila Ovimali',
    'login.subtitle': 'Okusundila Ovimali wa Elamba',
    'login.username': 'Olusungu',
    'login.password': 'Okusipi',
    'login.enter': 'Okuyingila',
    'login.forgotPassword': 'Nayiseka okusipi',
    'login.createFamily': 'Okwambula Elamba',
    'login.language': 'Oluvali',
    'login.select_language': 'Okuketa oluvali...',
    'login.portuguese': 'Português',
    'login.english': 'English',
    'login.spanish': 'Español',
    'login.umbundu': 'Umbundu',

    // General
    'app.dashboard': 'Oyilo',
    'app.transactions': 'Otegulelo',
    'app.goals': 'Ondanda',
    'app.family': 'Elamba',
    'app.admin': 'Omusundila',
    'app.budget': 'Omanyumba',
    'app.inflation': 'Okuwanduka kwa Ovimali',
    'app.simulations': 'Okuweza',
    'app.logout': 'Okupumbula',
    'app.settings': 'Okunozela',
  },
  ln: {
    // Login (Lingala)
    'login.title': 'Boyambisi ya Mbongo',
    'login.subtitle': 'Boyambisi ya Mbongo ya Libota',
    'login.username': 'Nkombo ya Mosepe',
    'login.password': 'Motele',
    'login.enter': 'Kota',
    'login.forgotPassword': 'Nabosani motele na ngai',
    'login.createFamily': 'Wumela Libota',
    'login.language': 'Lokota',
    'login.select_language': 'Pona lokota...',
    'login.portuguese': 'Português',
    'login.english': 'English',
    'login.spanish': 'Español',
    'login.umbundu': 'Umbundu',

    // General
    'app.dashboard': 'Plateau ya Malamu',
    'app.transactions': 'Bandumba ya Mbongo',
    'app.goals': 'Makanisi',
    'app.family': 'Libota',
    'app.admin': 'Mosepe Monene',
    'app.budget': 'Mpakatano ya Mbongo',
    'app.inflation': 'Mbalela ya Mbongo',
    'app.simulations': 'Libande',
    'app.logout': 'Kamatá',
    'app.settings': 'Zinsangá',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved as Language) || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
    document.documentElement.lang = language === 'um' ? 'pt' : language;
  }, [language]);

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
