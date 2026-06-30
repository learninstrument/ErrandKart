import cors from 'cors';
import express from 'express';
import type { Request } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';
import { adminRouter } from './routes/admin.js';
import { authRouter } from './routes/auth.js';
import { healthRouter } from './routes/health.js';
import { supermarketsRouter } from './routes/supermarkets.js';
import { walletRouter } from './routes/wallet.js';
import { webhooksRouter } from './routes/webhooks.js';
import { errandsRouter } from './routes/errands.js';
import { locationsRouter }  from './routes/locations.js'



export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.APP_ORIGIN ?? true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(
  express.json({
    limit: '1mb',
    verify: (request, _response, buffer) => {
      if ((request as any).originalUrl?.startsWith('/api/webhooks/paystack')) {
        (request as Request & { rawBody?: Buffer }).rawBody = buffer;
      }
    },
  })
);
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/', (_request, response) => {
  response.json({
    service: 'errandkart-backend',
    version: '0.1.0',
  });
});

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/supermarkets', supermarketsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/errands', errandsRouter);
app.use('/api/locations', locationsRouter);


app.use(notFoundHandler);
app.use(errorHandler);
