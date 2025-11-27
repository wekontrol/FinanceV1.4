import { Router, Request, Response } from 'express';
import db from '../db/schema';

const router = Router();

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

export default router;
