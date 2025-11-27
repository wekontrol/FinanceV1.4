import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'data.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'MEMBER',
      avatar TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      created_by TEXT,
      family_id TEXT,
      birth_date TEXT,
      allow_parent_view INTEGER DEFAULT 0,
      security_question TEXT,
      security_answer TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      is_recurring INTEGER DEFAULT 0,
      frequency TEXT,
      next_due_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS transaction_attachments (
      id TEXT PRIMARY KEY,
      transaction_id TEXT NOT NULL,
      name TEXT NOT NULL,
      size INTEGER,
      type TEXT,
      content TEXT,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS savings_goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      deadline TEXT,
      color TEXT,
      interest_rate REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS goal_transactions (
      id TEXT PRIMARY KEY,
      goal_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      note TEXT,
      FOREIGN KEY (goal_id) REFERENCES savings_goals(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS budget_limits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      limit_amount REAL NOT NULL,
      UNIQUE(user_id, category),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS family_tasks (
      id TEXT PRIMARY KEY,
      family_id TEXT NOT NULL,
      description TEXT NOT NULL,
      assigned_to TEXT,
      is_completed INTEGER DEFAULT 0,
      due_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS family_events (
      id TEXT PRIMARY KEY,
      family_id TEXT NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT DEFAULT 'general',
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS saved_simulations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      loan_amount REAL NOT NULL,
      interest_rate_annual REAL NOT NULL,
      term_months INTEGER NOT NULL,
      system TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin', 10);
    db.prepare(`
      INSERT INTO users (id, username, password, name, role, avatar, status, family_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'u0',
      'admin',
      hashedPassword,
      'Super Admin',
      'SUPER_ADMIN',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Super',
      'APPROVED',
      'fam_admin'
    );

    db.prepare(`
      INSERT INTO users (id, username, password, name, role, avatar, status, created_by, family_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'u1',
      'carlos',
      bcrypt.hashSync('123', 10),
      'Carlos Silva',
      'MANAGER',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      'APPROVED',
      'u0',
      'fam_1'
    );

    db.prepare(`
      INSERT INTO transactions (id, user_id, description, amount, date, category, type, is_recurring, frequency)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      't1', 'u1', 'Supermercado Mensal', 85000.00, '2023-10-15', 'Alimentação', 'DESPESA', 0, null,
      't2', 'u1', 'Salário', 450000.00, '2023-10-05', 'Salário', 'RECEITA', 1, 'monthly',
      't3', 'u1', 'Netflix', 3500.00, '2023-10-10', 'Lazer', 'DESPESA', 1, 'monthly'
    );

    db.prepare(`
      INSERT INTO savings_goals (id, user_id, name, target_amount, current_amount, deadline, color, interest_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('g1', 'u1', 'Casa Própria', 15000000, 2500000, '2028-12-31', '#10B981', 5);
  }

  console.log('Database initialized successfully');
}

export default db;
