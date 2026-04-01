import type { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../lib/db.js";
import { env } from "../lib/env.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/login", (req, res, next) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid login payload" });
      }

      const user = db
        .prepare("SELECT * FROM users WHERE email = ?")
        .get(parsed.data.email) as
        | { id: number; name: string; email: string; password_hash: string }
        | undefined;

      if (!user || !bcrypt.compareSync(parsed.data.password, user.password_hash)) {
        return res.status(401).json({ message: "Incorrect email or password" });
      }

      const token = jwt.sign(
        { sub: user.id, name: user.name, email: user.email },
        env.jwtSecret,
        { expiresIn: "7d" },
      );

      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/auth/me", authMiddleware, (req, res) => {
    res.json({ user: req.user });
  });
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing authorization token" });
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, env.jwtSecret) as unknown as {
      sub: number;
      name: string;
      email: string;
    };
    req.user = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
    };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        email: string;
      };
    }
  }
}
