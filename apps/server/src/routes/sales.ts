import type { Express } from "express";
import { z } from "zod";
import { authMiddleware } from "./auth.js";
import { createSale, getOptions, getSaleById, listSales, updateSale } from "../services/sales.js";
import { geocodeAddress } from "../services/geocode.js";

const tableSchema = z.object({
  tableName: z.string().min(1),
  type: z.string().min(1),
  size: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  features: z.string().optional().default(""),
});

const saleSchema = z.object({
  customerName: z.string().min(2),
  seller: z.string().min(2),
  saleDate: z.string().min(8),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  totalPrice: z.number().positive(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  notes: z.string().optional().default(""),
  tables: z.array(tableSchema).min(1),
});

export function registerSalesRoutes(app: Express) {
  app.get("/api/options", authMiddleware, async (_req, res, next) => {
    try {
      res.json(await getOptions());
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/sales", authMiddleware, async (req, res, next) => {
    try {
      res.json(
        await listSales({
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

  app.get("/api/sales/:id", authMiddleware, async (req, res, next) => {
    try {
      const sale = await getSaleById(Number(req.params.id));
      if (!sale) return res.status(404).json({ message: "Sale not found" });
      res.json(sale);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/sales", authMiddleware, async (req, res, next) => {
    try {
      const parsed = saleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid sale payload", issues: parsed.error.issues });
      }

      const payload = { ...parsed.data };
      if (!payload.latitude || !payload.longitude) {
        const geocode = await geocodeAddress(payload.address);
        if (geocode) {
          payload.latitude = geocode.latitude;
          payload.longitude = geocode.longitude;
        }
      }

      const sale = await createSale(payload);
      res.status(201).json(sale);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/sales/:id", authMiddleware, async (req, res, next) => {
    try {
      const parsed = saleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid sale payload", issues: parsed.error.issues });
      }

      const id = Number(req.params.id);
      if (!(await getSaleById(id))) {
        return res.status(404).json({ message: "Sale not found" });
      }

      const payload = { ...parsed.data };
      if (!payload.latitude || !payload.longitude) {
        const geocode = await geocodeAddress(payload.address);
        if (geocode) {
          payload.latitude = geocode.latitude;
          payload.longitude = geocode.longitude;
        }
      }

      const sale = await updateSale(id, payload);
      res.json(sale);
    } catch (error) {
      next(error);
    }
  });
}
