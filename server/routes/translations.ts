import { Router, Request, Response } from 'express';
import db from '../db/schema';

const router = Router();

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

function requireTranslatorOrAdmin(req: Request, res: Response, next: Function) {
  if (!req.session.user || (req.session.user.role !== 'TRANSLATOR' && req.session.user.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Only translators and admins can access this' });
  }
  next();
}

router.use(requireAuth);

// Get all translations for a language
router.get('/language/:language', (req: Request, res: Response) => {
  const { language } = req.params;
  
  const translations = db.prepare(`
    SELECT key, value FROM translations WHERE language = ? AND status = 'active'
    ORDER BY key
  `).all(language);

  const result: Record<string, string> = {};
  translations.forEach((t: any) => {
    result[t.key] = t.value;
  });

  res.json(result);
});

// Get all translation keys and languages (for translator editor)
router.get('/editor/all', requireTranslatorOrAdmin, (req: Request, res: Response) => {
  const translations = db.prepare(`
    SELECT DISTINCT language, key, value, created_by, updated_at
    FROM translations
    WHERE status = 'active'
    ORDER BY language, key
  `).all();

  res.json(translations);
});

// Get languages list
router.get('/languages', requireTranslatorOrAdmin, (req: Request, res: Response) => {
  const languages = db.prepare(`
    SELECT DISTINCT language FROM translations ORDER BY language
  `).all();

  res.json(languages.map((l: any) => l.language));
});

// Save translation
router.post('/', requireTranslatorOrAdmin, (req: Request, res: Response) => {
  const userId = req.session.userId;
  const { language, key, value } = req.body;

  if (!language || !key || !value) {
    return res.status(400).json({ error: 'Language, key, and value are required' });
  }

  const id = `tr${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

  try {
    db.prepare(`
      INSERT OR REPLACE INTO translations (id, language, key, value, created_by, updated_at, status)
      VALUES (?, ?, ?, ?, ?, datetime('now'), 'active')
    `).run(id, language, key, value, userId);

    res.status(201).json({ id, language, key, value });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Add new language
router.post('/language/add', requireTranslatorOrAdmin, (req: Request, res: Response) => {
  const { language, baseLanguage } = req.body;
  const userId = req.session.userId;

  if (!language) {
    return res.status(400).json({ error: 'Language code is required' });
  }

  // If baseLanguage provided, copy translations from base
  if (baseLanguage) {
    const baseTranslations = db.prepare(`
      SELECT key, value FROM translations WHERE language = ? AND status = 'active'
    `).all(baseLanguage);

    baseTranslations.forEach((t: any) => {
      const id = `tr${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      db.prepare(`
        INSERT OR IGNORE INTO translations (id, language, key, value, created_by, status)
        VALUES (?, ?, ?, ?, ?, 'active')
      `).run(id, language, t.key, t.value, userId);
    });
  }

  res.json({ message: `Language ${language} added successfully` });
});

export default router;
