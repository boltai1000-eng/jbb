import type { TableLineItem, SaleFilters, SaleRecord } from "../types/index.js";
import { db } from "../lib/db.js";
import { buildFilterSql } from "../lib/filters.js";

type SaleRow = {
  id: number;
  customer_name: string;
  seller: string;
  sale_date: string;
  address: string;
  city: string;
  state: string;
  total_price: number;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type TableRow = {
  id: number;
  sale_id: number;
  table_name: string;
  type: string;
  size: string;
  quantity: number;
  unit_price: number;
  features: string | null;
};

function mapTable(row: TableRow): TableLineItem {
  return {
    id: row.id,
    tableName: row.table_name,
    type: row.type,
    size: row.size,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
    features: row.features || "",
  };
}

function mapSale(row: SaleRow, tables: TableRow[]): SaleRecord {
  return {
    id: row.id,
    customerName: row.customer_name,
    seller: row.seller,
    saleDate: row.sale_date,
    address: row.address,
    city: row.city,
    state: row.state,
    totalPrice: Number(row.total_price),
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    notes: row.notes || "",
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    tables: tables.map(mapTable),
  };
}

export async function listSales(filters: SaleFilters) {
  const { whereClause, params } = buildFilterSql(filters);
  const saleRows = db
    .prepare(
      `
      SELECT DISTINCT s.*
      FROM sales s
      ${whereClause}
      ORDER BY s.sale_date DESC, s.id DESC
    `,
    )
    .all(...params) as SaleRow[];

  if (!saleRows.length) return [];

  const placeholders = saleRows.map(() => "?").join(",");
  const tableRows = db
    .prepare(`SELECT * FROM sale_tables WHERE sale_id IN (${placeholders})`)
    .all(...saleRows.map((sale) => sale.id)) as TableRow[];

  return saleRows.map((sale) =>
    mapSale(
      sale,
      tableRows.filter((table) => table.sale_id === sale.id),
    ),
  );
}

export async function getSaleById(id: number) {
  const row = db.prepare("SELECT * FROM sales WHERE id = ?").get(id) as
    | SaleRow
    | undefined;

  if (!row) return null;

  const tables = db
    .prepare("SELECT * FROM sale_tables WHERE sale_id = ? ORDER BY id ASC")
    .all(id) as TableRow[];

  return mapSale(row, tables);
}

type UpsertPayload = Omit<SaleRecord, "id" | "createdAt" | "updatedAt">;

export async function createSale(payload: UpsertPayload) {
  const transaction = db.transaction(() => {
    const saleResult = db
      .prepare(
        `
        INSERT INTO sales (
          customer_name, seller, sale_date, address, city, state, total_price,
          latitude, longitude, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      )
      .run(
        payload.customerName,
        payload.seller,
        payload.saleDate,
        payload.address,
        payload.city,
        payload.state,
        payload.totalPrice,
        payload.latitude,
        payload.longitude,
        payload.notes || "",
      );

    const saleId = Number(saleResult.lastInsertRowid);
    insertTables(saleId, payload.tables);
    return saleId;
  });

  return getSaleById(transaction());
}

export async function updateSale(id: number, payload: UpsertPayload) {
  const transaction = db.transaction(() => {
    db.prepare(
      `
      UPDATE sales
      SET customer_name = ?, seller = ?, sale_date = ?, address = ?, city = ?, state = ?,
          total_price = ?, latitude = ?, longitude = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
    ).run(
        payload.customerName,
        payload.seller,
        payload.saleDate,
        payload.address,
        payload.city,
        payload.state,
        payload.totalPrice,
        payload.latitude,
        payload.longitude,
        payload.notes || "",
        id,
    );

    db.prepare("DELETE FROM sale_tables WHERE sale_id = ?").run(id);
    insertTables(id, payload.tables);
  });

  transaction();
  return getSaleById(id);
}

function insertTables(saleId: number, tables: TableLineItem[]) {
  const stmt = db.prepare(
    `
      INSERT INTO sale_tables (
        sale_id, table_name, type, size, quantity, unit_price, features
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
  );

  for (const table of tables) {
    stmt.run(
        saleId,
        table.tableName,
        table.type,
        table.size,
        table.quantity,
        table.unitPrice,
        table.features || "",
    );
  }
}

export async function getOptions() {
  const sellers = db
    .prepare("SELECT DISTINCT seller FROM sales ORDER BY seller ASC")
    .all() as Array<{ seller: string }>;
  const cities = db
    .prepare("SELECT DISTINCT city FROM sales ORDER BY city ASC")
    .all() as Array<{ city: string }>;
  const tableTypes = db
    .prepare("SELECT DISTINCT type FROM sale_tables ORDER BY type ASC")
    .all() as Array<{ type: string }>;
  const tableNames = db
    .prepare("SELECT DISTINCT table_name FROM sale_tables ORDER BY table_name ASC")
    .all() as Array<{ table_name: string }>;

  return {
    sellers: sellers.map((item) => item.seller),
    cities: cities.map((item) => item.city),
    tableTypes: tableTypes.map((item) => item.type),
    tableNames: tableNames.map((item) => item.table_name),
  };
}
