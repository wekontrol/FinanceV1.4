
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, BudgetLimit } from '../types';
import { PieChart, Save, AlertTriangle, CheckCircle, Edit3, Sparkles, Loader2, Plus, X, History, Calendar } from 'lucide-react';
import Hint from './Hint';
import { suggestBudgets } from '../services/geminiService';
import { budgetApi } from '../services/api';

interface BudgetControlProps {
  transactions: Transaction[];
  budgets: BudgetLimit[];
  saveBudget: (budget: BudgetLimit) => void;
  currencyFormatter: (value: number) => string;
}

interface HistoryEntry {
  category: string;
  limit: number;
  spent: number;
}

const BudgetControl: React.FC<BudgetControlProps> = ({ 
  transactions, 
  budgets, 
  saveBudget,
  currencyFormatter 
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategory, setNewCategory] = useState<string>('');
  const [newAmount, setNewAmount] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  const [budgetHistory, setBudgetHistory] = useState<Record<string, HistoryEntry[]>>({});
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const defaultCategories = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros'];

  const validCategories = useMemo(() => {
    const transactionCategories = new Set(transactions.map(t => t.category));
    const budgetCategories = new Set(budgets.map(b => b.category));
    const all = new Set([...transactionCategories, ...budgetCategories, ...defaultCategories]);
    return all;
  }, [transactions, budgets]);

  const categories = useMemo(() => {
    return Array.from(validCategories).sort();
  }, [validCategories]);

  const isValidCategory = (category: string): boolean => {
    return validCategories.has(category.trim());
  };

  const categorySpending = useMemo(() => {
    const now = new Date();
    const spending: Record<string, number> = {};
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (t.type === TransactionType.EXPENSE && tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear()) {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      }
    });
    return spending;
  }, [transactions]);

  const handleEdit = (category: string, currentLimit: number) => {
    setEditingCategory(category);
    setEditAmount(currentLimit.toString());
  };

  const handleSave = (category: string) => {
    saveBudget({ category, limit: Number(editAmount) });
    setEditingCategory(null);
  };

  const handleAiSuggestion = async () => {
    setIsSuggesting(true);
    try {
      const suggestions = await suggestBudgets(transactions);
      if (suggestions.length === 0) {
        alert("Sem dados suficientes para sugestões.");
        return;
      }

      const confirm = window.confirm(
        `A IA sugeriu ${suggestions.length} orçamentos baseados no seu histórico. Deseja aplicar?\n\n` + 
        suggestions.map(s => `${s.category}: ${currencyFormatter(s.limit)}`).join('\n')
      );

      if (confirm) {
        suggestions.forEach(s => saveBudget(s));
      }
    } catch (e) {
      alert("Erro ao gerar sugestões.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAddNewBudget = () => {
    if (!newCategory.trim() || !newAmount.trim()) {
      alert("Selecione uma categoria e defina um valor.");
      return;
    }

    if (!isValidCategory(newCategory)) {
      alert(`❌ Categoria inválida: "${newCategory}"\n\nCategories válidas são:\n${Array.from(validCategories).sort().join(', ')}`);
      return;
    }
    
    const amount = Number(newAmount);
    if (amount <= 0) {
      alert("O valor deve ser maior que zero.");
      return;
    }

    saveBudget({ category: newCategory, limit: amount });
    setNewCategory('');
    setNewAmount('');
    setIsAddingNew(false);
  };

  const categoriesNotInBudget = categories.filter(cat => !budgets.find(b => b.category === cat));

  const loadHistory = async () => {
    try {
      const data = await budgetApi.getHistory();
      setBudgetHistory(data);
      const months = Object.keys(data).sort().reverse();
      if (months.length > 0) {
        setSelectedMonth(months[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const handleSaveHistory = async () => {
    try {
      const result = await budgetApi.saveHistory();
      alert(result.message);
      loadHistory();
    } catch (error: any) {
      alert('Erro ao salvar histórico: ' + error.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-3xl text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
         <div className="absolute -right-10 -top-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
         <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center mb-2">
                <PieChart className="mr-3" /> Orçamento Mensal
                <Hint text="Defina um teto máximo de gastos para cada categoria. O app te avisa quando você estiver perto de estourar o limite." className="text-white ml-3" />
              </h2>
              <p className="text-blue-100 font-medium max-w-xl text-sm md:text-base">Defina tetos de gastos para cada categoria. Manter-se dentro do orçamento é o primeiro passo para a liberdade financeira.</p>
            </div>
            <div className="flex gap-2 flex-wrap md:flex-nowrap">
              <button 
                onClick={() => {
                  setShowHistory(true);
                  loadHistory();
                }}
                className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 md:px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-white/30 transition text-sm md:text-base"
              >
                <History size={18} />
                Histórico
              </button>
              <button 
                data-tour="ai-budget-suggest"
                onClick={handleAiSuggestion}
                disabled={isSuggesting}
                className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 md:px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-white/30 transition disabled:opacity-70 text-sm md:text-base"
              >
                {isSuggesting ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} className="text-yellow-300" />}
                Sugerir com IA
              </button>
            </div>
         </div>
      </div>

      {/* Visualizar Histórico */}
      {showHistory && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 p-6 animate-slide-in-left">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
              <History size={20} className="text-primary-600" />
              Histórico de Orçamentos
            </h3>
            <button 
              onClick={() => setShowHistory(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Seletor de Mês */}
            <div>
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-2">Selecione um mês:</label>
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              >
                <option value="">Escolha um mês...</option>
                {Object.keys(budgetHistory).sort().reverse().map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            {/* Dados do Mês Selecionado */}
            {selectedMonth && budgetHistory[selectedMonth] && (
              <div className="space-y-3">
                {budgetHistory[selectedMonth].map((item) => {
                  const percentage = item.limit > 0 ? (item.spent / item.limit) * 100 : 0;
                  const isOverBudget = item.limit > 0 && item.spent > item.limit;
                  
                  return (
                    <div key={item.category} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-800 dark:text-white">{item.category}</h4>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isOverBudget ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600 dark:text-slate-400">Limite: <span className="font-bold">{item.limit.toFixed(2)} Kz</span></span>
                        <span className={`font-bold ${isOverBudget ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>
                          Gasto: {item.spent.toFixed(2)} Kz
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 transition-all duration-300 ${isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {Object.keys(budgetHistory).length === 0 && (
              <p className="text-center text-slate-400 py-8">Nenhum histórico disponível. Clique em "Salvar Histórico" para começar.</p>
            )}

            <button 
              onClick={handleSaveHistory}
              className="w-full p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold transition flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Salvar Histórico Atual
            </button>
          </div>
        </div>
      )}

      {/* Adicionar Novo Orçamento */}
      {isAddingNew && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 p-6 animate-slide-in-left">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
            <Plus size={20} className="text-primary-600" />
            Novo Orçamento
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-2">Categoria</label>
              <select 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              >
                <option value="">Selecione uma categoria...</option>
                {categoriesNotInBudget.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-2">Limite Mensal</label>
              <input 
                type="number" 
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {newAmount && (
                <p className="text-right text-xs font-bold text-primary-600 dark:text-primary-400 mt-1">
                  {currencyFormatter(Number(newAmount))}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={handleAddNewBudget}
                className="flex-1 p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold transition flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Criar Orçamento
              </button>
              <button 
                onClick={() => {
                  setIsAddingNew(false);
                  setNewCategory('');
                  setNewAmount('');
                }}
                className="flex-1 p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 font-bold transition flex items-center justify-center gap-2"
              >
                <X size={18} />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-tour="budget-cards">
        {/* Botão Flutuante para Adicionar */}
        {!isAddingNew && (
          <button 
            onClick={() => setIsAddingNew(true)}
            className="h-full min-h-[280px] bg-gradient-to-br from-primary-50 dark:from-primary-900/20 to-primary-100/50 dark:to-primary-900/10 border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-3xl flex flex-col items-center justify-center hover:border-primary-500 dark:hover:border-primary-500 transition hover:shadow-md dark:hover:shadow-primary-500/20"
          >
            <Plus size={40} className="text-primary-500 mb-2" />
            <span className="font-bold text-primary-600 dark:text-primary-400">Adicionar Orçamento</span>
          </button>
        )}

        {categories.map(cat => {
          const limit = budgets.find(b => b.category === cat)?.limit || 0;
          const spent = categorySpending[cat] || 0;
          const percentage = limit > 0 ? (spent / limit) * 100 : 0;
          const isOverBudget = limit > 0 && spent > limit;
          const isNearLimit = limit > 0 && spent > limit * 0.9 && !isOverBudget;

          return (
            <div key={cat} className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 p-6 flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">{cat}</h3>
                  {isOverBudget && <AlertTriangle className="text-rose-500 animate-pulse" size={22} />}
                  {!isOverBudget && limit > 0 && <CheckCircle className="text-emerald-500" size={22} />}
                </div>

                <div className="flex justify-between items-end mb-2 text-sm">
                  <span className={`text-xl md:text-2xl font-bold ${isOverBudget ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>
                    {currencyFormatter(spent)}
                  </span>
                  <span className="text-slate-400 font-medium text-xs uppercase">
                    Meta: {currencyFormatter(limit)}
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-4 mb-6 overflow-hidden">
                  <div 
                    className={`h-4 rounded-full transition-all duration-700 ease-out ${
                      isOverBudget ? 'bg-rose-500' : isNearLimit ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="border-t border-slate-50 dark:border-slate-700 pt-4">
                {editingCategory === cat ? (
                  <div className="flex items-center space-x-2 animate-fade-in">
                    <div className="flex-1 flex flex-col">
                      <input 
                        type="number" 
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        autoFocus
                        placeholder="Novo Limite"
                      />
                      {editAmount && (
                        <p className="text-right text-xs font-bold text-primary-600 dark:text-primary-400 mt-1">
                          {currencyFormatter(Number(editAmount))}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => handleSave(cat)}
                      className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow"
                    >
                      <Save size={18} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleEdit(cat, limit)}
                    className="flex items-center text-sm font-bold text-slate-400 hover:text-primary-600 transition"
                  >
                    <Edit3 size={16} className="mr-2" />
                    {limit === 0 ? 'Definir Limite' : 'Ajustar Meta'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetControl;
