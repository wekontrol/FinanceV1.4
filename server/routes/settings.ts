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
  if (req.session?.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Super Admin only' });
  }

  try {
    const configs = db.prepare(`SELECT id, provider, model, created_at FROM api_configurations`).all();
    res.json(configs);
  } catch (error: any) {
    console.error('Error fetching API configs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save or update API configuration
router.post('/api-configs', (req: Request, res: Response) => {
  if (req.session?.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Super Admin only' });
  }

  const { id, provider, apiKey, model } = req.body;

  try {
    if (id) {
      // Update existing
      db.prepare(`
        UPDATE api_configurations 
        SET api_key = ?, model = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(apiKey, model || null, id);
    } else {
      // Create new
      const newId = `cfg_${Date.now()}`;
      db.prepare(`
        INSERT INTO api_configurations (id, provider, api_key, model)
        VALUES (?, ?, ?, ?)
      `).run(newId, provider, apiKey, model || null);
    }
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error saving API config:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get API configuration value (for frontend to use)
router.get('/api-config/:provider', (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const config = db.prepare(`SELECT api_key, model FROM api_configurations WHERE provider = ?`).get(provider) as { api_key: string; model: string } | undefined;
    if (config) {
      res.json({ apiKey: config.api_key, model: config.model });
    } else {
      res.json({ apiKey: null, model: null });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete API configuration
router.delete('/api-configs/:id', (req: Request, res: Response) => {
  if (req.session?.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Super Admin only' });
  }

  const { id } = req.params;
  try {
    db.prepare(`DELETE FROM api_configurations WHERE id = ?`).run(id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting API config:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
