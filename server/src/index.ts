import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

import { config } from './config/env';
import { apiLimiter } from './middleware/rateLimiter';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import campaignRoutes from './routes/campaigns';
import donationRoutes from './routes/donations';
import adminRoutes from './routes/admin';
import contactRoutes from './routes/contact';
import impactRoutes from './routes/impact';

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Paystack webhook needs the raw body for HMAC verification.
app.use(
  '/api/donations/webhook',
  express.json({
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
    },
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  }),
);

// Simple request log in development
if (config.env === 'development') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/impact', impactRoutes);

app.get('/api/health', apiLimiter, (_req, res) => {
  res.json({ ok: true, service: 'children-hope-foundation-api', time: new Date().toISOString() });
});

app.use('/api', notFoundHandler);

// In production, serve the built SPA from client/dist
const clientDist = path.resolve(__dirname, '../../client/dist');
if (config.env === 'production' && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🌱 Children Hope Foundation API listening on http://localhost:${config.port}`);
  console.log(`   environment: ${config.env} | client origin: ${config.clientUrl}`);
});
