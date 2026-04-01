import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./lib/env.js";
import { initializeDatabase } from "./lib/db.js";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerSalesRoutes } from "./routes/sales.js";
import { registerAnalyticsRoutes } from "./routes/analytics.js";
import { registerAiRoutes } from "./routes/ai.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(__dirname, "../../client/dist");

app.use(
  cors({
    origin: env.isProduction ? true : env.clientUrl,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

registerAuthRoutes(app);
registerSalesRoutes(app);
registerAnalyticsRoutes(app);
registerAiRoutes(app);

if (env.isProduction) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

initializeDatabase()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });
