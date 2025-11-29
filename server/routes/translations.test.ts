import express from 'express';
import session from 'express-session';
import request from 'supertest';
import translationsRouter from './translations';
import db from '../db/schema';

const app = express();
app.use(express.json());
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: true,
}));
app.use('/translations', translationsRouter);

jest.mock('../db/schema', () => {
  const Database = require('better-sqlite3');
  const db = new Database(':memory:');
  db.exec(`
    CREATE TABLE translations (
      id TEXT PRIMARY KEY,
      language TEXT,
      key TEXT,
      value TEXT,
      created_by TEXT,
      updated_at TEXT,
      status TEXT
    );
  `);
  return db;
});

describe('GET /translations/stats', () => {
  let translatorUser: any;

  beforeEach(() => {
    db.exec('DELETE FROM translations');

    translatorUser = { id: 'translator1', role: 'TRANSLATOR' };

    // English (base language)
    db.prepare('INSERT INTO translations (id, language, key, value, status) VALUES (?, ?, ?, ?, ?)').run('1', 'en', 'common.hello', 'Hello', 'active');
    db.prepare('INSERT INTO translations (id, language, key, value, status) VALUES (?, ?, ?, ?, ?)').run('2', 'en', 'common.world', 'World', 'active');
    db.prepare('INSERT INTO translations (id, language, key, value, status) VALUES (?, ?, ?, ?, ?)').run('3', 'en', 'common.submit', 'Submit', 'active');

    // French (partially translated)
    db.prepare('INSERT INTO translations (id, language, key, value, status) VALUES (?, ?, ?, ?, ?)').run('4', 'fr', 'common.hello', 'Bonjour', 'active');
    db.prepare('INSERT INTO translations (id, language, key, value, status) VALUES (?, ?, ?, ?, ?)').run('5', 'fr', 'common.world', 'Monde', 'active');

    // Spanish (with a unique key)
    db.prepare('INSERT INTO translations (id, language, key, value, status) VALUES (?, ?, ?, ?, ?)').run('6', 'es', 'common.unique', 'Unico', 'active');
  });

  it('should calculate translation statistics correctly based on the English reference language', async () => {
    const agent = request.agent(app);
    await agent.post('/mock-login').send({ userId: translatorUser.id, user: translatorUser });

    const response = await agent.get('/translations/stats');

    expect(response.status).toBe(200);
    const stats = response.body;

    const enStats = stats.find((s: any) => s.language === 'en');
    expect(enStats.percentage).toBe(100);

    const frStats = stats.find((s: any) => s.language === 'fr');
    expect(frStats.percentage).toBe(67); // 2 out of 3 keys translated
  });
});

// Helper route to mock login
app.post('/mock-login', (req, res) => {
    // @ts-ignore
  req.session.userId = req.body.userId;
    // @ts-ignore
  req.session.user = req.body.user;
  res.sendStatus(200);
});
