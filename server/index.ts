import dotenv from 'dotenv';
// ✅ CRITICAL: Load environment variables BEFORE importing any other files
dotenv.config({ override: true });

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { wsManager } from "./websocket";
import { startRetryJob } from './jobs/retryHandler';
import { startTelegramBot } from './telegramBot';
import helmet from "helmet";

const app = express();

app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP if it conflicts with Vite/Inline scripts
  crossOriginEmbedderPolicy: false,
}));

// Conditionally apply global middleware
app.use((req, res, next) => {
  // 1. Stripe Webhook needs the RAW body
  if (req.originalUrl === '/api/webhooks/stripe') {
    next();
  } 
  // 2. Profile Update needs a larger limit for images
  else if (req.originalUrl === '/api/profile' && req.method === 'PUT') {
    next();
  }
  // 3. Standard JSON parser for everything else
  else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: false }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Initialize WebSocket server
  wsManager.initialize(server);
  
  // Start Telegram Bot (Safe now that env vars are loaded)
  startTelegramBot();
  // Start Background Jobs
  startRetryJob();

  // Error Handler
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(`[Error] ${req.method} ${req.path}:`, err);

    if (req.path.startsWith('/api')) {
      res.status(status).json({ message });
    } else {
      res.status(status).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error</title>
          <style>body{font-family:sans-serif;padding:2rem;text-align:center;}</style>
        </head>
        <body>
          <h1>Something went wrong</h1>
          <p>${message}</p>
          <a href="/">Go Home</a>
        </body>
        </html>
      `);
    }
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  const host = process.env.HOST || (process.platform === 'win32' ? 'localhost' : '0.0.0.0');
  
  server.listen({
    port,
    host,
    reusePort: process.platform !== 'win32',
  }, () => {
    log(`serving on ${host}:${port}`);
  });
})();
