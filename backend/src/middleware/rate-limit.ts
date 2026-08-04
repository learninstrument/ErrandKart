import type { Request, Response, NextFunction } from 'express';

type RateLimitOptions = {
  windowMs: number;
  max: number;
  keyGenerator?: (request: Request) => string;
};

type RateEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateEntry>();

// Cleanup expired entries every 60 seconds to prevent memory leaks at scale
const CLEANUP_INTERVAL_MS = 60_000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

const startCleanup = () => {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // Unref so the timer doesn't prevent Node from exiting
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
};

export const rateLimit = ({ windowMs, max, keyGenerator }: RateLimitOptions) => {
  startCleanup();

  return (request: Request, response: Response, next: NextFunction) => {
    const key = keyGenerator
      ? keyGenerator(request)
      : `${request.ip}:${request.path}`;
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      const retryAfter = Math.max(0, Math.ceil((entry.resetAt - now) / 1000));
      response.setHeader('Retry-After', retryAfter.toString());
      return response.status(429).json({
        message: 'Too many requests, please try again later.',
      });
    }

    entry.count += 1;
    return next();
  };
};
