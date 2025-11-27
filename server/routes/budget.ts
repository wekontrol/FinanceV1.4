import { Router, Request, Response } from 'express';
import db from '../db/schema';

const router = Router();

// Função para salvar automaticamente histórico do mês anterior ao final do mês
export function autoSaveMonthlyHistory(userId: string) {
  try {
    const lastSave = db.prepare(`
      SELECT value FROM app_settings WHERE key = ?
    `).get(`budget_history_saved_${userId}`) as any;

    const lastMonth = lastSave?.value || '2000-01';
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Se mudou de mês, salva histórico do mês anterior
    if (lastMonth !== currentMonth) {
      const previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
      
      const limits = db.prepare(`
        SELECT * FROM budget_limits WHERE user_id = ?
      `).all(userId);

      const transactions = db.prepare(`
        SELECT category, SUM(amount) as total
        FROM transactions
        WHERE user_id = ? AND type = 'DESPESA' AND date LIKE ?
        GROUP BY category
      `).all(userId, `${previousMonth}%`) as any[];

      limits.forEach((limit: any) => {
        const spent = transactions.find(t => t.category === limit.category);
        const id = `bh${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        
        db.prepare(`
          INSERT OR REPLACE INTO budget_history (id, user_id, category, month, limit_amount, spent_amount)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(id, userId, limit.category, previousMonth, limit.limit_amount, spent ? spent.total : 0);
      });

      // Atualiza a data do último salvamento
      db.prepare(`
        INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)
      `).run(`budget_history_saved_${userId}`, currentMonth);

      console.log(`Auto-saved budget history for user ${userId}: ${limits.length} categories from ${previousMonth}`);
    }
  } catch (error) {
    console.error('Error in autoSaveMonthlyHistory:', error);
  }
}

// Background scheduler - executa a cada 30 minutos para salvar históricos automáticamente
export function startMonthlyHistoryScheduler() {
  // Executa a cada 30 minutos (1800000 ms)
  const interval = setInterval(() => {
    try {
      // Pega todos os usuários que têm orçamentos definidos
      const users = db.prepare(`
        SELECT DISTINCT user_id FROM budget_limits
      `).all() as any[];

      if (users.length > 0) {
        console.log(`[Budget Scheduler] Verificando ${users.length} usuários para auto-save do histórico...`);
        users.forEach(user => {
          autoSaveMonthlyHistory(user.user_id);
        });
      }
    } catch (error) {
      console.error('[Budget Scheduler] Error:', error);
    }
  }, 30 * 60 * 1000); // 30 minutos

  // Também executa uma vez na inicialização (após 1 segundo de delay)
  setTimeout(() => {
    try {
      const users = db.prepare(`
        SELECT DISTINCT user_id FROM budget_limits
      `).all() as any[];
      
      if (users.length > 0) {
        console.log(`[Budget Scheduler] Execução inicial: verificando ${users.length} usuários...`);
        users.forEach(user => {
          autoSaveMonthlyHistory(user.user_id);
        });
      }
    } catch (error) {
      console.error('[Budget Scheduler] Initial run error:', error);
    }
  }, 1000);

  console.log('📅 [Budget Scheduler] Started - auto-saves history every 30 minutes');
  
  return interval;
}

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

router.use(requireAuth);

router.get('/limits', (req: Request, res: Response) => {
  const userId = req.session.userId;
  const user = req.session.user;

  let limits;
  if (user.role === 'SUPER_ADMIN' || user.role === 'MANAGER') {
    limits = db.prepare(`
      SELECT bl.* FROM budget_limits bl
      JOIN users u ON bl.user_id = u.id
      WHERE u.family_id = ? OR bl.user_id = ?
    `).all(user.familyId, userId);
  } else {
    limits = db.prepare(`
      SELECT * FROM budget_limits WHERE user_id = ?
    `).all(userId);
  }

  const formattedLimits = limits.map((l: any) => ({
    category: l.category,
    limit: l.limit_amount
  }));

  res.json(formattedLimits);
});

router.post('/limits', (req: Request, res: Response) => {
  const userId = req.session.userId;
  const { category, limit } = req.body;

  if (!category || limit === undefined) {
    return res.status(400).json({ error: 'Category and limit are required' });
  }

  const existing = db.prepare(`
    SELECT * FROM budget_limits WHERE user_id = ? AND category = ?
  `).get(userId, category);

  if (existing) {
    db.prepare(`
      UPDATE budget_limits SET limit_amount = ? WHERE user_id = ? AND category = ?
    `).run(limit, userId, category);
  } else {
    const id = `bl${Date.now()}`;
    db.prepare(`
      INSERT INTO budget_limits (id, user_id, category, limit_amount)
      VALUES (?, ?, ?, ?)
    `).run(id, userId, category, limit);
  }

  res.json({ category, limit });
});

router.delete('/limits/:category', (req: Request, res: Response) => {
  const userId = req.session.userId;
  const { category } = req.params;

  db.prepare(`
    DELETE FROM budget_limits WHERE user_id = ? AND category = ?
  `).run(userId, decodeURIComponent(category));

  res.json({ message: 'Budget limit deleted' });
});

router.get('/summary', (req: Request, res: Response) => {
  const userId = req.session.userId;
  const user = req.session.user;

  const currentMonth = new Date().toISOString().slice(0, 7);

  let transactions;
  if (user.role === 'SUPER_ADMIN' || user.role === 'MANAGER') {
    transactions = db.prepare(`
      SELECT category, SUM(amount) as total
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE u.family_id = ? AND type = 'DESPESA' AND date LIKE ?
      GROUP BY category
    `).all(user.familyId, `${currentMonth}%`);
  } else {
    transactions = db.prepare(`
      SELECT category, SUM(amount) as total
      FROM transactions
      WHERE user_id = ? AND type = 'DESPESA' AND date LIKE ?
      GROUP BY category
    `).all(userId, `${currentMonth}%`);
  }

  const limits = db.prepare(`
    SELECT * FROM budget_limits WHERE user_id = ?
  `).all(userId);

  const summary = limits.map((l: any) => {
    const spent = (transactions as any[]).find(t => t.category === l.category);
    return {
      category: l.category,
      limit: l.limit_amount,
      spent: spent ? spent.total : 0,
      percentage: spent ? Math.round((spent.total / l.limit_amount) * 100) : 0
    };
  });

  res.json(summary);
});

// Get budget history for all months
router.get('/history', (req: Request, res: Response) => {
  const userId = req.session.userId;
  
  const history = db.prepare(`
    SELECT * FROM budget_history 
    WHERE user_id = ? 
    ORDER BY month DESC 
    LIMIT 12
  `).all(userId);

  const grouped = history.reduce((acc: any, row: any) => {
    if (!acc[row.month]) {
      acc[row.month] = [];
    }
    acc[row.month].push({
      category: row.category,
      limit: row.limit_amount,
      spent: row.spent_amount
    });
    return acc;
  }, {});

  res.json(grouped);
});

// Save current month to history (called at end of month or manually)
router.post('/history/save', (req: Request, res: Response) => {
  const userId = req.session.userId;
  const currentMonth = new Date().toISOString().slice(0, 7);

  try {
    const limits = db.prepare(`
      SELECT * FROM budget_limits WHERE user_id = ?
    `).all(userId);

    const transactions = db.prepare(`
      SELECT category, SUM(amount) as total
      FROM transactions
      WHERE user_id = ? AND type = 'DESPESA' AND date LIKE ?
      GROUP BY category
    `).all(userId, `${currentMonth}%`) as any[];

    let saved = 0;
    limits.forEach((limit: any) => {
      const spent = transactions.find(t => t.category === limit.category);
      const id = `bh${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      db.prepare(`
        INSERT OR REPLACE INTO budget_history (id, user_id, category, month, limit_amount, spent_amount)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, userId, limit.category, currentMonth, limit.limit_amount, spent ? spent.total : 0);
      
      saved++;
    });

    res.json({ message: `Histórico de ${saved} categorias salvo para ${currentMonth}` });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar histórico' });
  }
});

export default router;
