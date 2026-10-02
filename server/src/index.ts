import express from 'express';
import { config } from './config/env';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';

import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';

import authRoutes from './routes/auth';
import campaignRoutes from './routes/campaigns';
import donationRoutes from './routes/donations';
import adminRoutes from './routes/admin';
import contactRoutes from './routes/contact';
import impactRoutes from './routes/impact';

const app = express();

// Security & utility middleware
app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(compression());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(generalLimiter);

// Note: /api/donations/webhook needs raw body parsing, handled inside donationRoutes
app.use('/api/donations/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads static directory for local MVP storage
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/impact', impactRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
});
