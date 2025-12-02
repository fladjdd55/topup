import dotenv from 'dotenv';
// Force override environment variables from .env file
dotenv.config({ override: true });
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { wsManager } from "./websocket";
import { startTelegramBot } from './telegramBot';

const app = express();

// ✅ FIX: Conditionally apply global middleware
// We skip the global parser for specific routes that need custom handling
app.use((req, res, next) => {
  // 1. Stripe Webhook needs the RAW body for signature verification
  if (req.originalUrl === '/api/webhooks/stripe') {
    next();
  } 
  // 2. Profile Update needs a larger size limit (e.g. 10mb for images)
  // The global parser would throw "Payload too large" before the route handler sees it
  else if (req.originalUrl === '/api/profile' && req.method === 'PUT') {
    next();
  }
  // 3. For everything else, use the standard global parser
  else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: false }));

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
  startTelegramBot();

  // ✅ IMPROVED ERROR HANDLER
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the error for debugging
    console.error(`[Error] ${req.method} ${req.path}:`, err);

    // 1. If it's an API request, return JSON (Normal behavior for frontend code)
    if (req.path.startsWith('/api')) {
      res.status(status).json({ message });
    } 
    // 2. If it's a Page request (HTML), show a user-friendly page instead of raw JSON
    else {
      res.status(status).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Une erreur est survenue</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; text-align: center; background: #f9fafb; }
            .container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); max-width: 400px; margin: 0 auto; }
            h1 { color: #ef4444; font-size: 1.5rem; margin-bottom: 1rem; }
            p { color: #374151; margin-bottom: 1.5rem; }
            a { background: #2563eb; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.375rem; }
            a:hover { background: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Oups ! Une erreur est survenue</h1>
            <p>${message}</p>
            <a href="/">Retour à l'accueil</a>
          </div>
        </body>
        </html>
      `);
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  // Use localhost on Windows, 0.0.0.0 on Linux/ (configurable via HOST env var)
  const host = process.env.HOST || (process.platform === 'win32' ? 'localhost' : '0.0.0.0');
  server.listen({
    port,
    host,
    reusePort: process.platform !== 'win32', // reusePort not supported on Windows
  }, () => {
    log(`serving on ${host}:${port}`);
  });
})();
