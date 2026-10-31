import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';

// ---------------------------------------------------------
// Global Configuration & Singletons
// ---------------------------------------------------------
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

export const prisma = new PrismaClient({
  log: NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

const app = express();

// ---------------------------------------------------------
// Standard Middleware Stack
// ---------------------------------------------------------
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  const start = Date.now();
  _res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${_res.statusCode} - ${duration}ms`);
  });
  next();
});

// ---------------------------------------------------------
// Health Check Endpoint
// ---------------------------------------------------------
app.get('/health', async (_req: Request, res: Response) => {
  try {
    // Database connectivity probe
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: NODE_ENV,
      services: {
        database: 'connected',
      },
    });
  } catch (error) {
    console.error('Health check failure:', error);
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
      },
    });
  }
});

// ---------------------------------------------------------
// Core API Modular Route Mounts (v1)
// ---------------------------------------------------------
const apiRouter = express.Router();

// Placeholder route groupings - To be linked with individual domain routers
apiRouter.get('/meta', (_req: Request, res: Response) => {
  res.json({
    name: 'Subscription Management System API',
    version: '1.0.0',
    documentation: '/api/v1/docs',
  });
});

// Auth & RBAC routes (login, register, token refresh, profile)
// apiRouter.use('/auth', authRouter);

// Subscription & Plan Catalog routes
// apiRouter.use('/plans', planRouter);
// apiRouter.use('/subscriptions', subscriptionRouter);

// Invoicing & Metered Billing routes
// apiRouter.use('/invoices', invoiceRouter);
// apiRouter.use('/usage', usageRouter);

// Executive & Operational Analytics routes
// apiRouter.use('/analytics', analyticsRouter);

app.use('/api/v1', apiRouter);

// ---------------------------------------------------------
// 404 & Centralized Error Handling
// ---------------------------------------------------------
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} does not exist.`,
    },
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);

  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: (err as any).code || 'INTERNAL_SERVER_ERROR',
      message: NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
      ...(NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
});

// ---------------------------------------------------------
// Server Bootstrap & Graceful Shutdown
// ---------------------------------------------------------
const server = app.listen(PORT, () => {
  console.log(`🚀 [Subscription API] Server operational at http://localhost:${PORT}`);
  console.log(`🩺 Health check accessible at http://localhost:${PORT}/health`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Initiating graceful shutdown sequence...`);

  server.close(async () => {
    console.log('HTTP connection listeners closed.');
    try {
      await prisma.$disconnect();
      console.log('Prisma database connections terminated cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('Error during database disconnect:', err);
      process.exit(1);
    }
  });

  // Force termination fallback after 10 seconds timeout
  setTimeout(() => {
    console.error('Graceful shutdown timeout exceeded. Forcing process exit.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;

