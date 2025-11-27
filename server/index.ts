import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { initializeDatabase } from './db/schema';
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';
import goalRoutes from './routes/goals';
import userRoutes from './routes/users';
import familyRoutes from './routes/family';
import budgetRoutes from './routes/budget';

const app = express();
const PORT = process.env.PORT || 3001;

initializeDatabase();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const sessionSecret = process.env.SESSION_SECRET || 'gestor-financeiro-secret-key-2024';

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/budget', budgetRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), 'dist')));
  
  app.get('/*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  });
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
