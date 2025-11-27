import { Router, Request, Response } from 'express';
import db from '../db/schema';

const router = Router();

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

function requireSuperAdmin(req: Request, res: Response, next: Function) {
  if (!req.session.user || req.session.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Only Super Admin can modify settings' });
  }
  next();
}

// GET all settings (public for Gemini key, authenticated for others)
router.get('/:key', (req: Request, res: Response) => {
  const { key } = req.params;
  
  // Terms of service can be read by anyone (public)
  if (key === 'terms_of_service') {
    const setting = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(key) as any;
    return res.json({ key, value: setting?.value || null });
  }
  
  // Gemini key can be read by anyone (authenticated)
  if (key === 'gemini_api_key' && req.session.userId) {
    const setting = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(key) as any;
    return res.json({ key, value: setting?.value || null });
  }
  
  // Other settings require Super Admin
  if (req.session.user?.role === 'SUPER_ADMIN') {
    const setting = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(key) as any;
    return res.json({ key, value: setting?.value || null });
  }
  
  res.status(403).json({ error: 'Unauthorized' });
});

// POST/PUT - Set a setting (Super Admin only)
router.post('/:key', requireAuth, requireSuperAdmin, (req: Request, res: Response) => {
  const { key } = req.params;
  const { value } = req.body;
  
  if (!value || value.trim().length < 10) {
    return res.status(400).json({ error: 'Invalid value' });
  }
  
  // Only allow specific settings to be configured
  const allowedKeys = ['gemini_api_key', 'openrouter_api_key', 'openrouter_model', 'ai_provider', 'terms_of_service'];
  if (!allowedKeys.includes(key)) {
    return res.status(400).json({ error: 'Invalid setting key' });
  }
  
  // For terms_of_service, don't enforce minimum length
  if (key !== 'terms_of_service') {
    if (!value || value.trim().length < 10) {
      return res.status(400).json({ error: 'Invalid value' });
    }
  }
  
  const finalValue = typeof value === 'string' ? value.trim() : value;
  db.prepare(`
    INSERT INTO app_settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, finalValue);
  
  res.json({ 
    key, 
    value: value.trim(),
    message: 'Setting saved successfully'
  });
});

// GET gemini key specifically (for frontend to load)
router.get('/gemini/key', requireAuth, (req: Request, res: Response) => {
  const setting = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('gemini_api_key') as any;
  res.json({ 
    hasKey: !!setting?.value,
    key: setting?.value || null
  });
});

export default router;
