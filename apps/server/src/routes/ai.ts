import type { Express } from "express";
import { z } from "zod";
import { authMiddleware } from "./auth.js";
import { chatWithData, generateInsights } from "../services/ai.js";

const chatSchema = z.object({
  question: z.string().min(3),
  filters: z
    .object({
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      seller: z.string().optional(),
      tableType: z.string().optional(),
      city: z.string().optional(),
      search: z.string().optional(),
    })
    .optional()
    .default({}),
});

export function registerAiRoutes(app: Express) {
  app.post("/api/ai/insights", authMiddleware, async (req, res, next) => {
    try {
      const filters = req.body || {};
      const response = await generateInsights(filters);
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/ai/chat", authMiddleware, async (req, res, next) => {
    try {
      const parsed = chatSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid chat request" });
      }

      const response = await chatWithData(parsed.data.question, parsed.data.filters);
      res.json(response);
    } catch (error) {
      next(error);
    }
  });
}
