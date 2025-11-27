import React, { useRef } from 'react';
import { LayoutDashboard, Wallet, PiggyBank, Users, Settings, LogOut, X, Activity, Camera, TrendingUp, Calculator, PieChart } from 'lucide-react';
import { User, UserRole } from '../types';

interface SidebarProps {
  appName: string;
  currentUser: User;
  currentView: string;
  setCurrentView: (view: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  logout: () => void;
  onUpdateUser?: (user: User) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  appName,
  currentUser, 
  currentView, 
  setCurrentView, 
  isMobileOpen, 
  setIsMobileOpen,
  logout,
  onUpdateUser
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transações', icon: Wallet },
    { id: 'budget', label: 'Orçamentos', icon: PieChart },
    { id: 'goals', label: 'Metas', icon: PiggyBank },
    { id: 'inflation', label: 'Inflação', icon: TrendingUp },
    { id: 'simulations', label: 'Simulações', icon: Calculator },
    { id: 'family', label: 'Família', icon: Users },
  ];

  if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.MANAGER) {
    menuItems.push({ id: 'admin', label: 'Configurações', icon: Settings });
  }

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    setIsMobileOpen(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUpdateUser) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ ...currentUser, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getRoleLabel = () => {
    if (currentUser.role === UserRole.SUPER_ADMIN) return 'Super Admin';
    if (currentUser.role === UserRole.ADMIN) return 'Administrador';
    if (currentUser.role === UserRole.MANAGER) return 'Gestor Familiar';
    return 'Membro';
  };

  return (
    <>
      <div 
        className={`
          fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity duration-300
          ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsMobileOpen(false)}
      ></div>

      <aside className={`
        fixed inset-y-0 left-0 z-[101] w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        md:translate-x-0 md:static md:inset-0 flex flex-col md:shadow-none
      `}>
        <div className="h-20 flex items-center px-6 border-b border-slate-50 dark:border-slate-800">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white shadow-glow mr-3 shrink-0">
            <Activity size={24} />
          </div>
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 truncate tracking-tight min-w-0">
            {appName}
          </h1>
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden ml-auto text-slate-400 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg shrink-0 active:scale-95 transition-transform">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto scrollbar-thin">
          <div className="mb-8" data-tour="sidebar-menu">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Menu Principal</p>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`
                      w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 group active:scale-95 hover:scale-[1.02]
                      ${isActive 
                        ? 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-900/10 text-primary-700 dark:text-primary-300 shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-primary-600 dark:hover:text-primary-400'}
                    `}
                  >
                    <Icon size={18} className={`mr-3 shrink-0 transition-all duration-300 ${isActive ? 'text-primary-600 dark:text-primary-400 scale-110' : 'text-slate-400 group-hover:text-primary-500 group-hover:scale-125'}`} />
                    <span className="truncate">{item.label}</span>
                    {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400 animate-pulse-soft"></div>}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-50 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center mb-2 border border-slate-100 dark:border-slate-700 group transition-colors hover:border-slate-200 dark:hover:border-slate-600 active:scale-95 cursor-pointer" onClick={handleAvatarClick}>
            <div className="relative shrink-0" title="Alterar foto">
              <img src={currentUser.avatar} alt="Avatar" className="w-9 h-9 rounded-full border border-white dark:border-slate-600 shadow-sm object-cover group-hover:opacity-80 transition" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition">
                <Camera size={12} className="text-white" />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            <div className="ml-3 overflow-hidden min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition" title={currentUser.name}>
                {currentUser.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                {getRoleLabel()}
              </p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center justify-center w-full px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-all active:scale-95"
          >
            <LogOut size={16} className="mr-2 shrink-0" />
            Encerrar Sessão
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;