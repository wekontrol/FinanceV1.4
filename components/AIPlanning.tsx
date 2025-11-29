import React, { useState } from 'react';
import { Sparkles, Brain, TrendingUp, Target, AlertCircle, Lightbulb, Calendar, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AIPlanningProps {
  currencyFormatter: (value: number) => string;
}

const AIPlanning: React.FC<AIPlanningProps> = ({ currencyFormatter }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'suggestions' | 'goals'>('overview');

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

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Financial Health */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white">{t('ai_planning.financial_health')}</h3>
                <CheckCircle className="text-green-500" size={24} />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {t('ai_planning.health_description')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">A+</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('ai_planning.excellent')}</span>
              </div>
            </div>

            {/* Card 2: Spending Trends */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white">{t('ai_planning.spending_trends')}</h3>
                <TrendingUp className="text-blue-500" size={24} />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {t('ai_planning.trends_description')}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">{t('ai_planning.month_avg')}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currencyFormatter(5000)}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>

            {/* Card 3: Savings Potential */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white">{t('ai_planning.savings_potential')}</h3>
                <AlertCircle className="text-amber-500" size={24} />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {t('ai_planning.savings_description')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-amber-600">{currencyFormatter(1200)}</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">-24% {t('ai_planning.possible')}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            {[
              {
                title: t('ai_planning.suggestion_1'),
                description: t('ai_planning.suggestion_1_desc'),
                priority: 'high',
                savings: 500
              },
              {
                title: t('ai_planning.suggestion_2'),
                description: t('ai_planning.suggestion_2_desc'),
                priority: 'medium',
                savings: 300
              },
              {
                title: t('ai_planning.suggestion_3'),
                description: t('ai_planning.suggestion_3_desc'),
                priority: 'low',
                savings: 150
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                  </div>
                  <span className={`
                    px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ml-3
                    ${item.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : ''}
                    ${item.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : ''}
                    ${item.priority === 'low' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : ''}
                  `}>
                    {item.priority === 'high' ? t('ai_planning.high') : item.priority === 'medium' ? t('ai_planning.medium') : t('ai_planning.low')}
                  </span>
                </div>
                <div className="flex justify-between items-end pt-3 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{t('ai_planning.potential_savings')}</span>
                  <span className="text-lg font-bold text-green-600">{currencyFormatter(item.savings)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-4">
            {[
              {
                goal: t('ai_planning.goal_emergency'),
                target: 50000,
                current: 35000,
                timeline: '6 meses'
              },
              {
                goal: t('ai_planning.goal_vacation'),
                target: 10000,
                current: 3500,
                timeline: '4 meses'
              },
              {
                goal: t('ai_planning.goal_education'),
                target: 25000,
                current: 12000,
                timeline: '12 meses'
              }
            ].map((item, idx) => {
              const progress = (item.current / item.target) * 100;
              return (
                <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar size={16} className="text-purple-600" />
                        {item.goal}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.timeline}</p>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white text-right">
                      <div className="text-sm text-slate-600 dark:text-slate-400">{Math.round(progress)}%</div>
                      <div className="text-xs text-slate-500">{currencyFormatter(item.current)} / {currencyFormatter(item.target)}</div>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPlanning;
