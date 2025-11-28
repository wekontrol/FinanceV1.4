import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Languages, Plus, Save, Loader2 } from 'lucide-react';

interface Translation {
  language: string;
  key: string;
  value: string;
  created_by: string;
  updated_at: string;
}

const TranslationManager: React.FC = () => {
  const { t } = useLanguage();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [languages, setLanguages] = useState<string[]>(['pt', 'en', 'es', 'um', 'ln']);
  const [selectedLanguage, setSelectedLanguage] = useState('pt');
  const [newLanguage, setNewLanguage] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  useEffect(() => {
    loadTranslations();
    loadLanguages();
  }, []);

  const loadTranslations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/translations/editor/all');
      if (response.ok) {
        const data = await response.json();
        setTranslations(data);
      }
    } catch (error) {
      console.error('Erro ao carregar traduções:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLanguages = async () => {
    try {
      const response = await fetch('/api/translations/languages');
      if (response.ok) {
        const data = await response.json();
        setLanguages(data);
      }
    } catch (error) {
      console.error('Erro ao carregar idiomas:', error);
    }
  };

  const handleSaveTranslation = async (language: string, key: string, value: string) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, key, value })
      });
      if (response.ok) {
        setEditingKey(null);
        loadTranslations();
      }
    } catch (error) {
      console.error('Erro ao salvar tradução:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLanguage = async () => {
    if (!newLanguage.trim()) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/translations/language/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: newLanguage, baseLanguage: 'pt' })
      });
      if (response.ok) {
        setNewLanguage('');
        loadLanguages();
        loadTranslations();
      }
    } catch (error) {
      console.error('Erro ao adicionar idioma:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTranslations = translations.filter(t => 
    t.language === selectedLanguage && 
    (searchKey === '' || t.key.toLowerCase().includes(searchKey.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Languages className="text-primary-600" size={24} />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t("translations.manager_title")}</h2>
      </div>

      {/* Seletor de Idioma + Adicionar Idioma */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-2">
              {t("translations.current_language")}
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-2">
              Adicionar Novo Idioma
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value.toLowerCase())}
                placeholder="Código (ex: fr, de)"
                className="flex-1 p-3 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <button
                onClick={handleAddLanguage}
                disabled={isSaving}
                className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pesquisa */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
        <input
          type="text"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          placeholder="Procurar por chave..."
          className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>

      {/* Lista de Traduções */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="animate-spin mx-auto text-primary-600" size={32} />
          </div>
        ) : filteredTranslations.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            Nenhuma tradução encontrada
          </div>
        ) : (
          filteredTranslations.map(translation => (
            <div
              key={`${translation.language}-${translation.key}`}
              className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 hover:shadow-md transition"
            >
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Chave
                  </label>
                  <p className="text-sm font-mono text-slate-700 dark:text-slate-300">
                    {translation.key}
                  </p>
                </div>

                {editingKey === `${translation.language}-${translation.key}` ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveTranslation(translation.language, translation.key, editingValue)}
                        disabled={isSaving}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 text-sm font-bold"
                      >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditingKey(null)}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 text-sm font-bold"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                        Valor
                      </label>
                      <p className="text-sm text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg">
                        {translation.value}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingKey(`${translation.language}-${translation.key}`);
                        setEditingValue(translation.value);
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-bold"
                    >
                      Editar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TranslationManager;
