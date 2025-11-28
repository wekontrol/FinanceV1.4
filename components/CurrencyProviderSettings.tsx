import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { RateProvider } from '../types';
import { DollarSign, Check, Loader2 } from 'lucide-react';

interface CurrencyProviderSettingsProps {
  currentProvider: RateProvider;
  onProviderChange: (provider: RateProvider) => void;
}

const CurrencyProviderSettings: React.FC<CurrencyProviderSettingsProps> = ({ 
  currentProvider, 
  onProviderChange 
}) => {
  const { t } = useLanguage();
  const [selectedProvider, setSelectedProvider] = useState<RateProvider>(currentProvider);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const providers: RateProvider[] = ['BNA', 'FOREX', 'PARALLEL'];

  const providerDescriptions: Record<RateProvider, string> = {
    BNA: 'Banco Nacional de Angola - Taxas oficiais',
    FOREX: 'Mercado Forex - Taxa comercial',
    PARALLEL: 'Mercado Paralelo - Taxa de mercado negro'
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings/default-currency-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ provider: selectedProvider })
      });

      if (response.ok) {
        onProviderChange(selectedProvider);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving currency provider:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
        <DollarSign size={20} />
        {t('common.conversion_providers') || 'Provedores de Conversão'}
      </h3>

      <div className="space-y-3">
        {providers.map((provider) => (
          <label
            key={provider}
            className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${
              selectedProvider === provider
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <input
              type="radio"
              name="currency-provider"
              value={provider}
              checked={selectedProvider === provider}
              onChange={(e) => setSelectedProvider(e.target.value as RateProvider)}
              className="mt-1 w-5 h-5 cursor-pointer accent-blue-500"
            />
            <div className="flex-1">
              <p className="font-bold text-slate-800 dark:text-white">{provider}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {providerDescriptions[provider]}
              </p>
            </div>
            {currentProvider === provider && (
              <Check size={20} className="text-green-500 mt-1" />
            )}
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving || selectedProvider === currentProvider}
        className={`w-full py-3 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 ${
          isSaving || selectedProvider === currentProvider
            ? 'bg-slate-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isSaving && <Loader2 size={18} className="animate-spin" />}
        {isSaving ? 'Salvando...' : 'Salvar Provedor'}
      </button>

      {saved && (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg flex items-center gap-2">
          <Check size={16} /> Provedor atualizado com sucesso!
        </div>
      )}
    </div>
  );
};

export default CurrencyProviderSettings;
