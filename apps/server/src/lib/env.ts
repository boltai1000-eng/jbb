import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const env = {
  port: Number(process.env.PORT || 4000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "development-secret",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  databaseUrl: process.env.DATABASE_URL || "",
  geocodingUserAgent:
    process.env.GEOCODING_USER_AGENT ||
    "JBBTablesDashboard/1.0 (contact@example.com)",
  isProduction: process.env.NODE_ENV === "production",
};
