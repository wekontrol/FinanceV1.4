
import { GoogleGenAI } from "@google/genai";
import { Transaction, LoanSimulation, BudgetLimit, UserBehaviorAnalysis } from "../types";

// Helper to retrieve the API key dynamically (LocalStorage > Env Var)
const getApiKey = () => localStorage.getItem('gemini_api_key') || process.env.REACT_APP_GEMINI_API_KEY || '';

// Helper to instantiate the client with the current key
const getAiClient = () => {
  const apiKey = getApiKey();
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
};

// Export functions to manage the key from the UI
export const setGeminiKey = (key: string) => {
  localStorage.setItem('gemini_api_key', key);
};

export const hasGeminiKey = (): boolean => {
  return !!getApiKey();
};

// --- EXISTING FUNCTIONS REFACTORED ---

export const categorizeTransaction = async (description: string, history: Transaction[] = []): Promise<string> => {
  const exactMatch = history.find(t => t.description.toLowerCase().trim() === description.toLowerCase().trim());
  
  if (exactMatch) {
    return exactMatch.category;
  }

  const ai = getAiClient();
  if (!ai) return "Geral";

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Você é um assistente financeiro. Categorize a seguinte transação financeira em uma única palavra ou frase curta em Português (Ex: Alimentação, Transporte, Moradia, Lazer, Saúde, Educação, Salário, Outros).
      
      Descrição da transação: "${description}"
      
      Responda apenas com a categoria.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text ? response.text.trim() : "Geral";
  } catch (error) {
    console.error("Erro ao categorizar transação com Gemini:", error);
    return "Geral";
  }
};

export const getFinancialAdvice = async (transactions: any[], goals: any[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Configure sua chave de API do Gemini em Configurações > Integrações para receber conselhos personalizados.";

  try {
    const summary = JSON.stringify({
      totalTransacoes: transactions.length,
      metas: goals.map(g => ({ nome: g.name, progresso: (g.currentAmount / g.targetAmount).toFixed(2) }))
    });

    const prompt = `
      Analise brevemente este resumo financeiro familiar e dê uma dica curta (máximo 2 frases) de como melhorar a saúde financeira.
      Dados: ${summary}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text ? response.text.trim() : "Mantenha o foco!";
  } catch (error) {
    return "Mantenha o foco em suas metas de economia!";
  }
};

export const analyzeLoanDocument = async (text: string): Promise<Partial<LoanSimulation>> => {
  const ai = getAiClient();
  if (!ai) throw new Error("API Key não configurada. Vá em Configurações > Integrações para adicionar sua chave do Gemini.");

  try {
    const prompt = `
      Analise o texto completo extraído de um documento bancário (PDF).
      Extraia e retorne APENAS um JSON válido com os campos:
      - loanAmount: O valor do "Capital em Dívida" inicial ou "Montante do Empréstimo". (Número).
      - interestRateAnnual: A taxa de juros anual (%) usada para calcular as prestações. (Número).
      - termMonths: O número total de prestações. (Número).
      - system: 'PRICE' ou 'SAC'. Se a prestação for constante, é PRICE. Se a amortização for constante, é SAC.

      Texto do Documento:
      "${text}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let jsonStr = response.text ? response.text.trim() : "{}";

    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/, '').replace(/```$/, '');
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Erro ao analisar documento:", error);
    throw new Error("Não foi possível analisar o documento. Verifique o formato do PDF.");
  }
};

export const analyzeUserBehavior = async (transactions: Transaction[]): Promise<UserBehaviorAnalysis> => {
  const ai = getAiClient();
  if (!ai) {
    return {
      summary: "Configure a API do Gemini para análise de comportamento.",
      patterns: [],
      recommendations: []
    };
  }

  try {
    const summary = JSON.stringify(transactions.slice(0, 20));

    const prompt = `
      Analise o comportamento financeiro baseado nas transações. Retorne um JSON com:
      - summary: Resumo breve (1 frase) do comportamento
      - patterns: Array de 3 padrões observados (ex: "Gasta mais em fins de semana")
      - recommendations: Array de 3 recomendações
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let jsonStr = response.text ? response.text.trim() : "{}";
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/, '').replace(/```$/, '');
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    return {
      summary: "Comece adicionando mais transações.",
      patterns: [],
      recommendations: []
    };
  }
};

export const parseTransactionFromText = async (text: string): Promise<Partial<Transaction>> => {
  const ai = getAiClient();
  if (!ai) return { description: text, category: "Geral" };

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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let jsonStr = response.text ? response.text.trim() : "{}";
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/, '').replace(/```$/, '');
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
      jsonStr = jsonStr.slice(0, jsonStr.lastIndexOf('```'));
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    return { description: text, category: "Geral" };
  }
};

export const parseTransactionFromAudio = async (base64Audio: string): Promise<Partial<Transaction>> => {
  const ai = getAiClient();
  if (!ai) return { description: "Áudio não processado", category: "Geral" };

  try {
    const prompt = `
      Transcreva e extraia dados de uma transação financeira do seguinte áudio. Retorne APENAS um JSON com:
      - description: Descrição
      - amount: Valor
      - type: "INCOME" ou "EXPENSE"
      - category: Categoria
      - date: YYYY-MM-DD
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { text: prompt },
        {
          inlineData: {
            mimeType: 'audio/webm',
            data: base64Audio,
          },
        },
      ],
    });

    let jsonStr = response.text ? response.text.trim() : "{}";
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/, '').replace(/```$/, '');
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    return { description: "Áudio não processado", category: "Geral" };
  }
};

export default {
  categorizeTransaction,
  getFinancialAdvice,
  analyzeLoanDocument,
  analyzeUserBehavior,
  parseTransactionFromText,
  parseTransactionFromAudio,
  setGeminiKey,
  hasGeminiKey,
};
