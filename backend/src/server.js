import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { configureSwagger } from '../swagger/swagger.config.js';

// استدعاء ملف السوكت اللي لسه عاملينه
import { initSocket } from './socket/index.js'; 

// Load environment variables
dotenv.config();

// Import routes
import userRoutes from './routes/user.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import adminRoutes from './routes/admin.routes.js';
import publicRoutes from './routes/public.routes.js';
import agoraRoutes from './routes/agora.routes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { rateLimiter } from './middleware/rateLimiter.middleware.js';

// Import logger
import { logger } from './utils/logger.js';
import { getOpenApiSpec } from './config/swagger.js';

const app = express();
const httpServer = createServer(app);

// === تهيئة السوكت ===
initSocket(httpServer);

configureSwagger(app);
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware
// ============================================

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (corsOrigins.indexOf(origin) !== -1 || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(null, true); 
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

app.use('/api/', rateLimiter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use('/assets', express.static(join(__dirname, '../uploads')));
// Public URLs from `toPublicAssetUrl()` use `/uploads/...` (see assessment.utils.js)
app.use('/uploads', express.static(join(__dirname, '../uploads')));

// ============================================
// Routes
// ============================================

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/public', publicRoutes); 
app.use('/api/user', userRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/agora', agoraRoutes);

// ============================================
// Error Handling
// ============================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// Start Server
// ============================================

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('API Docs: /api/docs');
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default app;