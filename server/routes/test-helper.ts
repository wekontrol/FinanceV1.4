import express from 'express';
import session from 'express-session';
import request from 'supertest';
import db from '../db/schema';
import bcrypt from 'bcryptjs';

export function setupTestApp(router: express.Router, route: string) {
  const app = express();
  app.use(express.json());
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: true,
  }));
  app.use(route, router);

  // Helper route to mock login
  app.post('/mock-login', (req, res) => {
      // @ts-ignore
    req.session.userId = req.body.userId;
      // @ts-ignore
    req.session.user = req.body.user;
    res.sendStatus(200);
  });

  return app;
}

export function mockDatabase() {
  jest.mock('../db/schema', () => {
    const Database = require('better-sqlite3');
    const db = new Database(':memory:');
    db.exec(`
      CREATE TABLE translations (
        id TEXT PRIMARY KEY,
        language TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        created_by TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        UNIQUE(language, key),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        username TEXT,
        password TEXT,
        name TEXT,
        role TEXT,
        avatar TEXT,
        status TEXT,
        created_by TEXT,
        family_id TEXT,
        birth_date TEXT,
        allow_parent_view INTEGER
      );
      CREATE TABLE budget_limits (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        category TEXT,
        limit_amount REAL,
        is_default INTEGER
      );
      CREATE TABLE transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        description TEXT,
        amount REAL,
        date TEXT,
        category TEXT,
        type TEXT,
        is_recurring INTEGER,
        frequency TEXT,
        next_due_date TEXT
      );
    `);
    return db;
  });
}
