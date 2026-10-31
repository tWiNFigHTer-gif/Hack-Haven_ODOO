import express, { Request, Response, NextFunction } from 'express';
import { env } from './config/env';
import { routes } from './routes';
import { errorHandler } from './middleware/error';

export const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', env.APP_URL);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Subscription Management System API is running',
    health: '/api/health',
    api: '/api',
  });
});

app.get('/api', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Subscription Management System API v1',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      catalog: '/api/catalog',
      taxes: '/api/taxes',
      discounts: '/api/discounts',
      templates: '/api/templates',
      payments: '/api/payments',
      me: '/api/me',
    },
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api', routes);

app.use(errorHandler);

