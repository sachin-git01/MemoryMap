import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import journeyRoutes from './routes/journeyRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimitMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('[Security Warning] JWT_SECRET is not defined in environment variables!');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Connect to MongoDB
connectDB();

const app = express();

// 1. Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true
    },
    frameguard: {
      action: 'deny'
    },
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    },
    noSniff: true
  })
);

// 2. Strict CORS Allowlist (Supports Local, Custom Domain & Vercel Deployments)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin, matched allowlist, or preview/production vercel.app domains
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(new Error(`Blocked by CORS policy: Origin ${origin} not permitted`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// 3. Body Parsing & Rate Limiting
app.use(express.json({ limit: '10mb' }));
app.use('/api', apiLimiter);

// 4. Static Uploads Folder Serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. Root & Health Check Endpoints
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'PhotoFlow Backend API is secured and running',
    frontendUrl: 'http://localhost:5173',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      upload: 'POST /api/upload',
      journeys: {
        list: 'GET /api/journeys',
        create: 'POST /api/journeys',
        get: 'GET /api/journeys/:id',
        update: 'PUT /api/journeys/:id',
        delete: 'DELETE /api/journeys/:id'
      }
    }
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'PhotoFlow API server is healthy',
    timestamp: new Date().toISOString()
  });
});

// 6. Protected API Routes
app.use('/api/auth', authRoutes);
app.use('/api/journeys', journeyRoutes);
app.use('/api/upload', uploadRoutes);

// 7. 404 & Centralized Sanitized Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[PhotoFlow Server] Running securely on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
