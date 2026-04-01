import type { Express } from "express";
import { authMiddleware } from "./auth.js";
import { buildAnalytics } from "../services/analytics.js";
import { listSales } from "../services/sales.js";

export function registerAnalyticsRoutes(app: Express) {
  app.get("/api/analytics/overview", authMiddleware, async (req, res, next) => {
    try {
      res.json(
        await buildAnalytics({
          dateFrom: req.query.dateFrom as string | undefined,
          dateTo: req.query.dateTo as string | undefined,
          seller: req.query.seller as string | undefined,
          tableType: req.query.tableType as string | undefined,
          city: req.query.city as string | undefined,
          search: req.query.search as string | undefined,
        }),
      );
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/map/installations", authMiddleware, async (req, res, next) => {
    try {
      const data = await listSales({
        dateFrom: req.query.dateFrom as string | undefined,
        dateTo: req.query.dateTo as string | undefined,
        seller: req.query.seller as string | undefined,
        tableType: req.query.tableType as string | undefined,
        city: req.query.city as string | undefined,
        search: req.query.search as string | undefined,
      });
      res.json(data.filter((item) => item.latitude && item.longitude));
    } catch (error) {
      next(error);
    }
  });
}
