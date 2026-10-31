import { Router } from 'express';
import fs from 'fs';
import path from 'path';

export const routes = Router();

const modulesDir = path.resolve(__dirname, '../modules');

if (fs.existsSync(modulesDir)) {
  const entries = fs.readdirSync(modulesDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const modulePath = path.join(modulesDir, entry.name);
      const tsFile = path.join(modulePath, 'index.ts');
      const jsFile = path.join(modulePath, 'index.js');

      if (fs.existsSync(tsFile) || fs.existsSync(jsFile)) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const mod = require(modulePath);
          const router = mod.router;
          if (router) {
            routes.use(`/${entry.name}`, router);
          }
        } catch {
          // Skip directories without a valid router export
        }
      }
    }
  }
}

