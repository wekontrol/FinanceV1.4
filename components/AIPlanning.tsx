import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, TrendingUp, Target, AlertCircle, Lightbulb, Calendar, CheckCircle, Loader2, AlertTriangle, TrendingDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Transaction, BudgetLimit, SavingsGoal } from '../types';
import { aiPlanningApi } from '../services/api';

interface AIPlanningProps {
  transactions: Transaction[];
  budgets: BudgetLimit[];
  goals: SavingsGoal[];
  currencyFormatter: (value: number) => string;
}

interface AnalysisData {
  health_score: number;
  health_grade: string;
  spending_trends: {
    month_avg: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    change_percent: number;
  };
  savings_potential: number;
  at_risk_categories: Array<{
    category: string;
    limit: number;
    spent: number;
    percentage: number;
  }>;
  suggestions: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    potential_savings: number;
    category: string;
  }>;
  goals_progress: Array<{
    name: string;
    progress_percent: number;
    months_to_target: number;
    on_track: boolean;
  }>;
}

const AIPlanning: React.FC<AIPlanningProps> = ({ 
  transactions, 
  budgets, 
  goals, 
  currencyFormatter 
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'suggestions' | 'goals'>('overview');
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        setLoading(true);
        const data = await aiPlanningApi.analyze();
        setAnalysis(data);
      } catch (error) {
        console.error('Erro ao carregar análise IA:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [transactions, budgets, goals]);

  const getHealthColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (score: number): string => {
    if (score >= 90) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 70) return 'bg-blue-100 dark:bg-blue-900/30';
    if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return <TrendingUp className="text-red-500" size={20} />;
    if (trend === 'decreasing') return <TrendingDown className="text-green-500" size={20} />;
    return <TrendingUp className="text-blue-500" size={20} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Sparkles size={24} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              {t('ai_planning.title')}
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
            {t('ai_planning.subtitle')}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: t('ai_planning.overview'), icon: Brain },
            { id: 'suggestions', label: t('ai_planning.suggestions'), icon: Lightbulb },
            { id: 'goals', label: t('ai_planning.goals'), icon: Target }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  px-4 py-2.5 rounded-lg font-semibold text-sm md:text-base flex items-center gap-2 whitespace-nowrap
                  transition-all duration-300 flex-shrink-0
                  ${isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500'
                  }
                `}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-purple-600" size={32} />
          </div>
        ) : analysis ? (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Card 1: Financial Health */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 dark:text-white">{t('ai_planning.financial_health')}</h3>
                      <CheckCircle className={getHealthColor(analysis.health_score)} size={24} />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {t('ai_planning.health_description')}
                    </p>
                    <div className={`${getHealthBgColor(analysis.health_score)} rounded-lg p-3 flex items-center justify-between`}>
                      <span className={`text-3xl font-bold ${getHealthColor(analysis.health_score)}`}>
                        {analysis.health_grade}
                      </span>
                      <span className={`text-sm font-semibold ${getHealthColor(analysis.health_score)}`}>
                        {analysis.health_score}/100
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Spending Trends */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 dark:text-white">{t('ai_planning.spending_trends')}</h3>
                      {getTrendIcon(analysis.spending_trends.trend)}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {t('ai_planning.trends_description')}
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-600 dark:text-slate-400">{t('ai_planning.month_avg')}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{currencyFormatter(analysis.spending_trends.month_avg)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600 dark:text-slate-400">Mudança</span>
                        <span className={`font-bold ${analysis.spending_trends.change_percent > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {analysis.spending_trends.change_percent > 0 ? '+' : ''}{Math.round(analysis.spending_trends.change_percent)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Savings Potential */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 dark:text-white">{t('ai_planning.savings_potential')}</h3>
                      <AlertCircle className="text-amber-500" size={24} />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {t('ai_planning.savings_description')}
                    </p>
                    <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                      <span className="text-2xl font-bold text-amber-600">{currencyFormatter(analysis.savings_potential)}</span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('ai_planning.possible')}</span>
                    </div>
                  </div>
                </div>

                {/* At-Risk Categories */}
                {analysis.at_risk_categories.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <AlertTriangle size={20} className="text-red-500" />
                      Categorias em Risco
                    </h3>
                    <div className="space-y-3">
                      {analysis.at_risk_categories.map((cat) => (
                        <div key={cat.category} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{cat.category}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{currencyFormatter(cat.spent)} / {currencyFormatter(cat.limit)}</p>
                          </div>
                          <span className="font-bold text-red-600">{cat.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && (
              <div className="space-y-4">
                {analysis.suggestions.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                      </div>
                      <span className={`
                        px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ml-3 flex-shrink-0
                        ${item.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : ''}
                        ${item.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : ''}
                        ${item.priority === 'low' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : ''}
                      `}>
                        {item.priority === 'high' ? t('ai_planning.high') : item.priority === 'medium' ? t('ai_planning.medium') : t('ai_planning.low')}
                      </span>
                    </div>
                    <div className="flex justify-between items-end pt-3 border-t border-slate-100 dark:border-slate-700">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{t('ai_planning.potential_savings')}</span>
                      <span className="text-lg font-bold text-green-600">{currencyFormatter(item.potential_savings)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Goals Tab */}
            {activeTab === 'goals' && (
              <div className="space-y-4">
                {analysis.goals_progress.map((item, idx) => {
                  const progress = item.progress_percent;
                  return (
                    <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Calendar size={16} className="text-purple-600" />
                            {item.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {item.months_to_target} {item.months_to_target === 1 ? 'mês' : 'meses'} para atingir
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-600 dark:text-slate-400">{Math.round(progress)}%</div>
                          {item.on_track && (
                            <div className="text-xs font-bold text-green-600 flex items-center gap-1 justify-end">
                              <CheckCircle size={12} />
                              No caminho
                            </div>
                          )}
                          {!item.on_track && (
                            <div className="text-xs font-bold text-red-600 flex items-center gap-1 justify-end">
                              <AlertTriangle size={12} />
                              Em risco
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            item.on_track 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : 'bg-gradient-to-r from-red-500 to-orange-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                {analysis.goals_progress.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-slate-500 dark:text-slate-400">{t('ai_planning.no_goals')}</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AIPlanning;
