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

// Exchange rates endpoints
async function fetchExchangeRates(provider: string = 'BNA') {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/AOA');
    const data = await response.json();
    
    const rates: Record<string, number> = {
      AOA: 1,
      USD: data.rates?.USD || 926.50,
      EUR: data.rates?.EUR || 1003.20,
      BRL: data.rates?.BRL || 188.10,
      GBP: data.rates?.GBP || 1168.00,
      CNY: data.rates?.CNY || 127.30,
      ZAR: data.rates?.ZAR || 49.10,
      JPY: data.rates?.JPY || 6.35
    };
    
    const nextUpdate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    db.prepare(`
      INSERT INTO exchange_rates (provider, rates, last_update, next_update)
      VALUES (?, ?, CURRENT_TIMESTAMP, ?)
      ON CONFLICT(provider) DO UPDATE SET rates = excluded.rates, last_update = CURRENT_TIMESTAMP, next_update = excluded.next_update
    `).run(provider, JSON.stringify(rates), nextUpdate);
    
    return rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Return cached rates or defaults
    const cached = db.prepare('SELECT rates FROM exchange_rates WHERE provider = ?').get(provider) as any;
    if (cached) {
      return JSON.parse(cached.rates);
    }
    // Return defaults
    return {
      AOA: 1, USD: 926.50, EUR: 1003.20, BRL: 188.10,
      GBP: 1168.00, CNY: 127.30, ZAR: 49.10, JPY: 6.35
    };
  }
}

// GET exchange rates (public)
router.get('/rates/:provider', async (req: Request, res: Response) => {
  const { provider } = req.params;
  const validProviders = ['BNA', 'FOREX', 'PARALLEL'];
  
  if (!validProviders.includes(provider)) {
    return res.status(400).json({ error: 'Invalid provider' });
  }
  
  try {
    let cached = db.prepare('SELECT rates, next_update FROM exchange_rates WHERE provider = ?').get(provider) as any;
    const now = new Date().toISOString();
    
    // Check if update is needed (24 hours elapsed or first time)
    if (!cached || (cached.next_update && new Date(cached.next_update) <= new Date(now))) {
      const rates = await fetchExchangeRates(provider);
      return res.json({
        ...rates,
        lastUpdate: new Date().toISOString(),
        source: 'live'
      });
    }
    
    const rates = JSON.parse(cached.rates);
    res.json({
      ...rates,
      lastUpdate: cached.last_update,
      source: 'cached'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

export default router;
