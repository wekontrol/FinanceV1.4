// Puter.js AI Service - No API Key Required
// Puter uses client-side SDK with no backend configuration needed

export const hasPuterEnabled = (): boolean => {
  // Puter.js doesn't require API keys - just check if provider is selected
  const provider = localStorage.getItem('ai_provider');
  return provider === 'puter';
};

export const setPuterAsDefault = (): void => {
  try {
    localStorage.setItem('ai_provider', 'puter');
  } catch (error) {
    console.error('Error setting Puter as default:', error);
    throw error;
  }
};

// Puter functions (these would be called from components)
export const categorizeTransactionWithPuter = async (description: string): Promise<string> => {
  // @ts-ignore - Puter.js is loaded dynamically
  if (typeof window.puter === 'undefined') {
    console.warn('Puter.js not loaded');
    return 'Geral';
  }

  try {
    const prompt = `
      Você é um assistente financeiro. Categorize a seguinte transação financeira em uma única palavra ou frase curta em Português (Ex: Alimentação, Transporte, Moradia, Lazer, Saúde, Educação, Salário, Outros).
      
      Descrição da transação: "${description}"
      
      Responda apenas com a categoria.
    `;

    // @ts-ignore
    const response = await window.puter.ai.chat(prompt, { model: 'gpt-4.1-nano' });
    return response?.trim() || 'Geral';
  } catch (error) {
    console.error('Error categorizing with Puter:', error);
    return 'Geral';
  }
};

export const getFinancialAdviceWithPuter = async (transactions: any[], goals: any[]): Promise<string> => {
  // @ts-ignore
  if (typeof window.puter === 'undefined') {
    return 'Configure Puter em Configurações > Integrações para receber conselhos personalizados.';
  }

  try {
    const summary = JSON.stringify({
      totalTransacoes: transactions.length,
      metas: goals.map(g => ({ nome: g.name, progresso: (g.currentAmount / g.targetAmount).toFixed(2) }))
    });

    const prompt = `
      Analise brevemente este resumo financeiro familiar e dê uma dica curta (máximo 2 frases) de como melhorar a saúde financeira.
      Dados: ${summary}
    `;

    // @ts-ignore
    const response = await window.puter.ai.chat(prompt, { model: 'gpt-4.1-nano' });
    return response?.trim() || 'Mantenha o foco!';
  } catch (error) {
    console.error('Error getting financial advice from Puter:', error);
    return 'Mantenha o foco em suas metas de economia!';
  }
};

export const parseTransactionFromTextWithPuter = async (text: string): Promise<Partial<any>> => {
  // @ts-ignore
  if (typeof window.puter === 'undefined') {
    return { description: text, category: 'Geral' };
  }

  try {
    const prompt = `
      Extraia os dados de uma transação financeira do seguinte texto em Português. Retorne APENAS um JSON válido com:
      - description: Descrição breve
      - amount: Valor numérico
      - type: "INCOME" ou "EXPENSE"
      - category: Categoria (uma palavra)
      - date: Data em formato YYYY-MM-DD (hoje se não mencionada)
      
      Texto: "${text}"
    `;

    // @ts-ignore
    const response = await window.puter.ai.chat(prompt, { model: 'gpt-4.1-nano' });
    let jsonStr = response?.trim() || '{}';

    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/, '').replace(/```$/, '');
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
      jsonStr = jsonStr.slice(0, jsonStr.lastIndexOf('```'));
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error parsing transaction with Puter:', error);
    return { description: text, category: 'Geral' };
  }
};

export const transcribeAudioWithPuter = async (audioFile: File): Promise<string> => {
  // @ts-ignore
  if (typeof window.puter === 'undefined') {
    return 'Áudio não processado';
  }

  try {
    // @ts-ignore
    const result = await window.puter.ai.speech2txt(audioFile);
    return result?.text || result || 'Áudio não processado';
  } catch (error) {
    console.error('Error transcribing audio with Puter:', error);
    return 'Áudio não processado';
  }
};

export default {
  hasPuterEnabled,
  setPuterAsDefault,
  categorizeTransactionWithPuter,
  getFinancialAdviceWithPuter,
  parseTransactionFromTextWithPuter,
  transcribeAudioWithPuter,
};
