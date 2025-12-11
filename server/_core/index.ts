import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { sdk } from "./sdk";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Development helper: quick login route to create a dev session without an OAuth server.
  // This route is only enabled when running in non-production to avoid accidental use.
  if (process.env.NODE_ENV !== "production") {
    app.get("/dev-login", async (req, res) => {
      try {
        // Create a simple dev openId and upsert user (upsert is a no-op if DB not configured)
        const devOpenId = `dev-user`;

        try {
          // attempt to persist user if DB available
          await import("../db").then(db =>
            db.upsertUser({ openId: devOpenId, name: "Dev User" })
          );
        } catch (e) {
          // ignore DB errors during dev login
        }

        const token = await sdk.createSessionToken(devOpenId, { name: "Dev User" });
        const cookieOptions = getSessionCookieOptions(req as any);
        res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 365 });
        res.redirect("/");
      } catch (error) {
        console.error("/dev-login failed", error);
        res.status(500).send("dev-login failed");
      }
    });
  }
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
