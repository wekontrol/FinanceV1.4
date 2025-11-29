import { Router, Request, Response } from 'express';
import db from '../db/schema';
import ExcelJS from 'exceljs';
import path from 'path';

const router = Router();

// Middleware
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

// Download Excel Template
router.get('/template', requireAuth, async (req: Request, res: Response) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Transações');

    // Headers
    sheet.columns = [
      { header: 'Data (DD/MM/YYYY)', key: 'date', width: 15 },
      { header: 'Descrição', key: 'description', width: 25 },
      { header: 'Categoria', key: 'category', width: 15 },
      { header: 'Tipo (INCOME/EXPENSE)', key: 'type', width: 15 },
      { header: 'Valor', key: 'amount', width: 12 }
    ];

    // Style headers
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4B0082' } };

    // Add example row
    sheet.addRow({
      date: '01/12/2024',
      description: 'Exemplo: Compra no supermercado',
      category: 'Alimentação',
      type: 'EXPENSE',
      amount: 150.00
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="template_transacoes.xlsx"');

    await workbook.xlsx.write(res);
  } catch (error: any) {
    console.error('Error generating template:', error);
    res.status(500).json({ error: error.message });
  }
});

// Import Transactions from Excel
router.post('/import', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { fileData } = req.body;

    if (!fileData) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    // Decode base64
    const buffer = Buffer.from(fileData, 'base64');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    
    const sheet = workbook.getWorksheet('Transações');
    if (!sheet) {
      return res.status(400).json({ error: 'Sheet "Transações" not found' });
    }

    let imported = 0;
    const errors: string[] = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const date = row.getCell(1).value;
      const description = row.getCell(2).value;
      const category = row.getCell(3).value;
      const type = row.getCell(4).value;
      const amount = row.getCell(5).value;

      if (!date || !description || !category || !type || !amount) {
        errors.push(`Row ${rowNumber}: Missing required fields`);
        return;
      }

      try {
        // Parse date (handle DD/MM/YYYY format)
        let dateObj = new Date(date as string);
        if (isNaN(dateObj.getTime())) {
          // Try DD/MM/YYYY format
          const parts = (date as string).split('/');
          if (parts.length === 3) {
            dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
        }

        db.prepare(`
          INSERT INTO transactions (id, user_id, date, description, category, type, amount, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(
          `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          dateObj.toISOString().split('T')[0],
          String(description),
          String(category),
          String(type).toUpperCase(),
          Number(amount)
        );
        imported++;
      } catch (err: any) {
        errors.push(`Row ${rowNumber}: ${err.message}`);
      }
    });

    res.json({
      success: true,
      imported,
      errors,
      message: `Importadas ${imported} transações com sucesso!`
    });
  } catch (error: any) {
    console.error('Error importing Excel:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get app logo
router.get('/logo', (req: Request, res: Response) => {
  try {
    const logo = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('app_logo') as any;
    if (logo && logo.value) {
      res.json({ logo: logo.value });
    } else {
      res.json({ logo: null });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload app logo
router.post('/logo', (req: Request, res: Response) => {
  if (req.session?.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Super Admin only' });
  }

  const { logo } = req.body;
  if (!logo) {
    return res.status(400).json({ error: 'No logo provided' });
  }

  try {
    db.prepare(`
      INSERT INTO app_settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run('app_logo', logo);

    res.json({ success: true, message: 'Logo salvo com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
