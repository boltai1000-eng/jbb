import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { env } from "./env.js";

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is required. Set it in apps/server/.env or Render.");
}

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseUrl.includes("localhost")
    ? false
    : env.isProduction
      ? { rejectUnauthorized: false }
      : false,
});

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      customer_name TEXT NOT NULL,
      seller TEXT NOT NULL,
      sale_date DATE NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      total_price NUMERIC(12, 2) NOT NULL,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sale_tables (
      id SERIAL PRIMARY KEY,
      sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
      table_name TEXT NOT NULL,
      type TEXT NOT NULL,
      size TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price NUMERIC(12, 2) NOT NULL,
      features TEXT
    );

    CREATE TABLE IF NOT EXISTS geocode_cache (
      id SERIAL PRIMARY KEY,
      cache_key TEXT NOT NULL UNIQUE,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      formatted_address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await seedAdmin();
  await seedSales();
}

async function seedAdmin() {
  const existing = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    ["admin@jbbtables.com"],
  );
  if (existing.rowCount) return;

  const hash = bcrypt.hashSync("admin123", 10);
  await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)",
    ["JBB Admin", "admin@jbbtables.com", hash],
  );
}

async function seedSales() {
  const countResult = await pool.query("SELECT COUNT(*)::int AS count FROM sales");
  if (countResult.rows[0]?.count > 0) return;

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
    const inserted = await pool.query(
      `
      INSERT INTO sales (
        customer_name, seller, sale_date, address, city, state, total_price,
        latitude, longitude, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
      `,
      [
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
      ],
    );

    const saleId = inserted.rows[0].id as number;
    for (const table of sale.tables) {
      await pool.query(
        `
        INSERT INTO sale_tables (
          sale_id, table_name, type, size, quantity, unit_price, features
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          saleId,
          table.tableName,
          table.type,
          table.size,
          table.quantity,
          table.unitPrice,
          table.features,
        ],
      );
    }
  }
}
