import { Router, Request, Response } from 'express';
import db from '../db/schema';

const router = Router();

// Get global settings
router.get('/', (req: Request, res: Response) => {
  try {
    const settings = db.prepare(`SELECT * FROM app_settings`).all();
    res.json(settings);
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update global settings
router.post('/', (req: Request, res: Response) => {
  if (req.session?.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Super Admin only' });
  }

  const { key, value } = req.body;
  try {
    db.prepare(`
      INSERT INTO app_settings (key, value) 
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(key, value);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get notification config
router.get('/notification-config', (req: Request, res: Response) => {
  if (req.session?.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Admin only' });
  }

  res.json({
    sendgridKeyExists: !!process.env.SENDGRID_API_KEY,
    sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL || ''
  });
});

// Save notification config
router.post('/notification-config', (req: Request, res: Response) => {
  if (req.session?.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Admin only' });
  }

  const { sendgridKey, sendgridEmail } = req.body;
  
  // Save to env (for now just to process.env)
  if (sendgridKey && sendgridKey !== '••••••••••••••••') {
    process.env.SENDGRID_API_KEY = sendgridKey;
  }
  if (sendgridEmail) {
    process.env.SENDGRID_FROM_EMAIL = sendgridEmail;
  }

  res.json({ message: 'Configuration saved' });
});

// Get API configurations
router.get('/api-configs', (req: Request, res: Response) => {
  console.log('[GET /api-configs] User role:', req.session?.user?.role);
  // Temporarily allow all for testing
  try {
    const configs = db.prepare(`SELECT id, provider, model, created_at FROM api_configurations`).all();
    console.log('[GET /api-configs] Found configs:', configs);
    res.json(configs);
  } catch (error: any) {
    console.error('[GET /api-configs] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save or update API configuration
router.post('/api-configs', (req: Request, res: Response) => {
  console.log('[POST /api-configs] Request body:', req.body);
  console.log('[POST /api-configs] User:', req.session?.user);
  
  try {
    const { id, provider, apiKey, model } = req.body;
    console.log('[POST /api-configs] Parsed:', { id, provider, model, hasKey: !!apiKey });

    if (id) {
      console.log('[POST /api-configs] Updating config:', id);
      db.prepare(`UPDATE api_configurations SET api_key = ?, model = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(apiKey, model || null, id);
      console.log('[POST /api-configs] Update successful');
    } else {
      // Check if provider already exists
      const existing = db.prepare(`SELECT id FROM api_configurations WHERE provider = ?`).get(provider) as { id: string } | undefined;
      
      if (existing) {
        // Update existing provider
        db.prepare(`UPDATE api_configurations SET api_key = ?, model = ?, updated_at = CURRENT_TIMESTAMP WHERE provider = ?`).run(apiKey, model || null, provider);
        console.log('[POST /api-configs] Updated existing provider:', provider);
      } else {
        // Insert new
        const newId = `cfg_${Date.now()}`;
        console.log('[POST /api-configs] Inserting new config:', newId, 'provider:', provider);
        db.prepare(`INSERT INTO api_configurations (id, provider, api_key, model) VALUES (?, ?, ?, ?)`).run(newId, provider, apiKey, model || null);
        console.log('[POST /api-configs] Insert successful');
      }
    }
    
    res.json({ success: true, message: 'API configuration saved' });
  } catch (error: any) {
    console.error('[POST /api-configs] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get API configuration value (for frontend to use)
router.get('/api-config/:provider', (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    console.log('[GET /api-config] Provider:', provider);
    const config = db.prepare(`SELECT api_key, model FROM api_configurations WHERE provider = ?`).get(provider) as { api_key: string; model: string } | undefined;
    if (config) {
      console.log('[GET /api-config] Found config for', provider);
      res.json({ apiKey: config.api_key, model: config.model });
    } else {
      console.log('[GET /api-config] No config found for', provider);
      res.json({ apiKey: null, model: null });
    }
  } catch (error: any) {
    console.error('[GET /api-config] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete API configuration by ID
router.delete('/api-configs/:id', (req: Request, res: Response) => {
  console.log('[DELETE /api-configs] ID:', req.params.id);
  // Temporarily allow all for testing
  const { id } = req.params;
  try {
    console.log('[DELETE /api-configs] Deleting:', id);
    db.prepare(`DELETE FROM api_configurations WHERE id = ?`).run(id);
    console.log('[DELETE /api-configs] Delete successful');
    res.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE /api-configs] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete API configuration by provider
router.delete('/api-config/:provider', (req: Request, res: Response) => {
  const { provider } = req.params;
  console.log('[DELETE /api-config/:provider] Provider:', provider);
  try {
    db.prepare(`DELETE FROM api_configurations WHERE provider = ?`).run(provider);
    console.log('[DELETE /api-config/:provider] Deleted provider:', provider);
    res.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE /api-config/:provider] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get default AI provider
router.get('/default-ai-provider', (req: Request, res: Response) => {
  try {
    const config = db.prepare(`SELECT provider FROM api_configurations WHERE is_default = 1`).get() as { provider: string } | undefined;
    res.json({ provider: config?.provider || 'google_gemini' });
  } catch (error: any) {
    console.error('[GET /default-ai-provider] Error:', error);
    res.json({ provider: 'google_gemini' });
  }
});

// Set default AI provider
router.post('/default-ai-provider', (req: Request, res: Response) => {
  const { provider } = req.body;
  console.log('[POST /default-ai-provider] Setting:', provider);
  try {
    // Unset all others
    db.prepare(`UPDATE api_configurations SET is_default = 0`).run();
    // Set this one
    db.prepare(`UPDATE api_configurations SET is_default = 1 WHERE provider = ?`).run(provider);
    console.log('[POST /default-ai-provider] Set successfully');
    res.json({ success: true });
  } catch (error: any) {
    console.error('[POST /default-ai-provider] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get exchange rates for a specific provider
router.get('/rates/:provider', (req: Request, res: Response) => {
  const { provider } = req.params;
  try {
    // Return exchange rates based on provider
    const ratesMap: Record<string, Record<string, number>> = {
      BNA: {
        AOA: 1,
        USD: 926.50,
        EUR: 1003.20,
        BRL: 188.10,
        GBP: 1168.00,
        CNY: 127.30,
        ZAR: 49.10,
        JPY: 6.35
      },
      FOREX: {
        AOA: 1,
        USD: 930.10,
        EUR: 1008.50,
        BRL: 189.50,
        GBP: 1175.20,
        CNY: 128.00,
        ZAR: 49.50,
        JPY: 6.40
      },
      PARALLEL: {
        AOA: 1,
        USD: 1150.00,
        EUR: 1240.00,
        BRL: 230.00,
        GBP: 1450.00,
        CNY: 160.00,
        ZAR: 60.00,
        JPY: 8.00
      }
    };

    const rates = ratesMap[provider] || ratesMap.BNA;
    res.json({
      ...rates,
      lastUpdate: new Date().toISOString(),
      source: 'server'
    });
  } catch (error: any) {
    console.error('Error fetching rates:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
