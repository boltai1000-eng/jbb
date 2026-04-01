import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { env } from "./env.js";

fs.mkdirSync(env.dataDir, { recursive: true });

export const db = new Database(path.join(env.dataDir, "jbb.db"));
db.pragma("foreign_keys = ON");

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      seller TEXT NOT NULL,
      sale_date TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      total_price REAL NOT NULL,
      latitude REAL,
      longitude REAL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sale_tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      table_name TEXT NOT NULL,
      type TEXT NOT NULL,
      size TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      features TEXT,
      FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS geocode_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cache_key TEXT NOT NULL UNIQUE,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      formatted_address TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedAdmin();
  seedSales();
}

function seedAdmin() {
  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get("admin@jbbtables.com");
  if (existing) return;

  const hash = bcrypt.hashSync("admin123", 10);
  db.prepare(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
  ).run("JBB Admin", "admin@jbbtables.com", hash);
}

function seedSales() {
  const countResult = db.prepare("SELECT COUNT(*) AS count FROM sales").get() as {
    count: number;
  };
  if (countResult.count > 0) return;

  const sales = [
    {
      customerName: "Arihant Club",
      seller: "Rohan Mehta",
      saleDate: "2026-01-12",
      address: "Vastrapur Lake Road, Ahmedabad, Gujarat",
      city: "Ahmedabad",
      state: "Gujarat",
      totalPrice: 128000,
      latitude: 23.0375,
      longitude: 72.5299,
      notes: "Premium install for club lounge",
      tables: [
        {
          tableName: "Signature Pro",
          type: "Pool Table",
          size: "8 ft",
          quantity: 1,
          unitPrice: 88000,
          features: "Italian slate, walnut finish",
        },
        {
          tableName: "Arcade Air",
          type: "Air Hockey",
          size: "7 ft",
          quantity: 1,
          unitPrice: 40000,
          features: "LED scoring",
        },
      ],
    },
    {
      customerName: "Elite Sports Arena",
      seller: "Neha Kapoor",
      saleDate: "2026-02-03",
      address: "Koregaon Park, Pune, Maharashtra",
      city: "Pune",
      state: "Maharashtra",
      totalPrice: 214000,
      latitude: 18.5362,
      longitude: 73.8939,
      notes: "Bulk order for reopening",
      tables: [
        {
          tableName: "Tournament Elite",
          type: "Snooker Table",
          size: "12 ft",
          quantity: 1,
          unitPrice: 140000,
          features: "Championship cloth",
        },
        {
          tableName: "Foos Pro",
          type: "Foosball",
          size: "Standard",
          quantity: 2,
          unitPrice: 37000,
          features: "Counter-balanced men",
        },
      ],
    },
    {
      customerName: "Blue Circle Cafe",
      seller: "Rohan Mehta",
      saleDate: "2026-02-19",
      address: "Indiranagar, Bengaluru, Karnataka",
      city: "Bengaluru",
      state: "Karnataka",
      totalPrice: 76000,
      latitude: 12.9719,
      longitude: 77.6412,
      notes: "Compact recreation corner",
      tables: [
        {
          tableName: "Urban Fold",
          type: "Table Tennis",
          size: "9 ft",
          quantity: 1,
          unitPrice: 76000,
          features: "Foldable competition model",
        },
      ],
    },
    {
      customerName: "Royal Leisure Hub",
      seller: "Ishita Shah",
      saleDate: "2026-03-08",
      address: "Salt Lake Sector V, Kolkata, West Bengal",
      city: "Kolkata",
      state: "West Bengal",
      totalPrice: 189000,
      latitude: 22.5765,
      longitude: 88.4332,
      notes: "Corporate recreation floor",
      tables: [
        {
          tableName: "Signature Pro",
          type: "Pool Table",
          size: "9 ft",
          quantity: 1,
          unitPrice: 99000,
          features: "Commercial steel frame",
        },
        {
          tableName: "Carrom Luxe",
          type: "Carrom",
          size: "Tournament",
          quantity: 3,
          unitPrice: 30000,
          features: "Birch plywood board",
        },
      ],
    },
  ];

  for (const sale of sales) {
    const inserted = db.prepare(
      `
      INSERT INTO sales (
        customer_name, seller, sale_date, address, city, state, total_price,
        latitude, longitude, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    ).run(
        sale.customerName,
        sale.seller,
        sale.saleDate,
        sale.address,
        sale.city,
        sale.state,
        sale.totalPrice,
        sale.latitude,
        sale.longitude,
        sale.notes,
    );

    const saleId = Number(inserted.lastInsertRowid);
    for (const table of sale.tables) {
      db.prepare(
        `
        INSERT INTO sale_tables (
          sale_id, table_name, type, size, quantity, unit_price, features
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
      ).run(
          saleId,
          table.tableName,
          table.type,
          table.size,
          table.quantity,
          table.unitPrice,
          table.features,
      );
    }
  }
}
