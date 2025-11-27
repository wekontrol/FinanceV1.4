import React, { useState } from 'react';
import { User, UserStatus, UserRole } from '../types';
import { Lock, User as UserIcon, LogIn, HelpCircle, ArrowLeft, CheckCircle, ShieldAlert, UserPlus } from 'lucide-react';
import { authApi } from '../services/api';

interface LoginProps {
  appName: string;
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ appName, onLogin }) => {
  const [view, setView] = useState<'login' | 'recovery' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [registerName, setRegisterName] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  
  const [recoveryUsername, setRecoveryUsername] = useState('');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await authApi.login(username, password);
      onLogin(response.user);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await authApi.register({
        username: registerUsername,
        password: registerPassword,
        name: registerName,
        familyName,
        securityQuestion,
        securityAnswer
      });
      alert('Família registrada com sucesso! Faça login.');
      setView('login');
      setRegisterName('');
      setRegisterUsername('');
      setRegisterPassword('');
      setFamilyName('');
      setSecurityQuestion('');
      setSecurityAnswer('');
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverPassword = async () => {
    setError('');
    setLoading(true);
    
    try {
      await authApi.recoverPassword(recoveryUsername, recoveryAnswer, newPassword);
      alert('Senha redefinida com sucesso!');
      setView('login');
      setRecoveryStep(1);
      setRecoveryUsername('');
      setRecoveryAnswer('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Erro ao recuperar senha');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'register') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-200 dark:border-slate-700">
          <div className="flex items-center mb-6">
            <button onClick={() => setView('login')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
              <ArrowLeft size={20} />
            </button>
            <h3 className="font-bold text-slate-800 dark:text-white ml-2">Criar Nova Família</h3>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl text-sm flex items-center">
              <ShieldAlert size={18} className="mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
              <input 
                type="text" 
                value={registerName}
                onChange={e => setRegisterName(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                placeholder="Seu nome"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Usuário</label>
              <input 
                type="text" 
                value={registerUsername}
                onChange={e => setRegisterUsername(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                placeholder="Nome de usuário"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha</label>
              <input 
                type="password" 
                value={registerPassword}
                onChange={e => setRegisterPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                placeholder="••••••"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Família</label>
              <input 
                type="text" 
                value={familyName}
                onChange={e => setFamilyName(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                placeholder="Ex: Família Silva"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pergunta de Segurança (Opcional)</label>
              <input 
                type="text" 
                value={securityQuestion}
                onChange={e => setSecurityQuestion(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                placeholder="Ex: Nome do primeiro animal"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Resposta de Segurança</label>
              <input 
                type="text" 
                value={securityAnswer}
                onChange={e => setSecurityAnswer(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                placeholder="Sua resposta"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Criar Família'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'recovery') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-200 dark:border-slate-700">
          <div className="flex items-center mb-6">
            <button onClick={() => { setView('login'); setRecoveryStep(1); }} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
              <ArrowLeft size={20} />
            </button>
            <h3 className="font-bold text-slate-800 dark:text-white ml-2">Recuperar Senha</h3>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl text-sm flex items-center">
              <ShieldAlert size={18} className="mr-2" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Usuário</label>
              <input 
                type="text" 
                value={recoveryUsername}
                onChange={e => setRecoveryUsername(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                placeholder="Seu usuário"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Resposta de Segurança</label>
              <input 
                type="text" 
                value={recoveryAnswer}
                onChange={e => setRecoveryAnswer(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                placeholder="Sua resposta"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nova Senha</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                placeholder="••••••"
              />
            </div>
            <button 
              onClick={handleRecoverPassword}
              disabled={loading}
              className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 disabled:opacity-50"
            >
              {loading ? 'Recuperando...' : 'Redefinir Senha'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-200 dark:border-slate-700 animate-scale-in">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-primary-500/30 mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{appName}</h1>
          <p className="text-slate-500 text-sm">Gestão Financeira Familiar</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl text-sm flex items-center animate-shake">
            <ShieldAlert size={18} className="mr-2 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Usuário</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-10 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Seu usuário"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="••••••"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/30 flex justify-center items-center active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? 'Entrando...' : <><LogIn className="mr-2" size={20} /> Entrar</>}
          </button>

          <div className="flex justify-between items-center mt-4">
            <button 
              type="button" 
              onClick={() => { setView('recovery'); setError(''); }}
              className="text-sm text-slate-400 hover:text-primary-600 font-medium"
            >
              Esqueci minha senha
            </button>
            <button 
              type="button" 
              onClick={() => setView('register')}
              className="text-sm text-emerald-600 font-bold hover:text-emerald-700 flex items-center"
            >
              Criar Família <UserPlus size={14} className="ml-1"/>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
