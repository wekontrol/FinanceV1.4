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
const PORT = parseInt(process.env.PORT || '3001', 10);

initializeDatabase();

// CORS configuration - must be before session middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins in development and production
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const sessionSecret = process.env.SESSION_SECRET || 'gestor-financeiro-secret-key-2024';

// Session middleware - must be before route handlers
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production' && process.env.SECURE_COOKIES !== 'false',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
  },
  proxy: true // Trust proxy for secure cookies
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/budget', budgetRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Production: serve static files from dist
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), 'dist')));
  
  // SPA fallback route
  app.use((req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('Running in production mode');
  } else {
    console.log('Running in development mode');
  }
});
