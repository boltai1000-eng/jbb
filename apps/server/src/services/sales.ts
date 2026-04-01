import type { TableLineItem, SaleFilters, SaleRecord } from "../types/index.js";
import { pool } from "../lib/db.js";
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
  const saleRowsResult = await pool.query(
    `
      SELECT DISTINCT s.*
      FROM sales s
      ${whereClause}
      ORDER BY s.sale_date DESC, s.id DESC
    `,
    params,
  );
  const saleRows = saleRowsResult.rows as SaleRow[];

  if (!saleRows.length) return [];

  const ids = saleRows.map((sale) => sale.id);
  const tableRowsResult = await pool.query(
    "SELECT * FROM sale_tables WHERE sale_id = ANY($1::int[])",
    [ids],
  );
  const tableRows = tableRowsResult.rows as TableRow[];

  return saleRows.map((sale) =>
    mapSale(
      sale,
      tableRows.filter((table) => table.sale_id === sale.id),
    ),
  );
}

export async function getSaleById(id: number) {
  const saleResult = await pool.query("SELECT * FROM sales WHERE id = $1", [id]);
  const row = saleResult.rows[0] as SaleRow | undefined;

  if (!row) return null;

  const tablesResult = await pool.query(
    "SELECT * FROM sale_tables WHERE sale_id = $1 ORDER BY id ASC",
    [id],
  );
  const tables = tablesResult.rows as TableRow[];

  return mapSale(row, tables);
}

type UpsertPayload = Omit<SaleRecord, "id" | "createdAt" | "updatedAt">;

export async function createSale(payload: UpsertPayload) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const saleResult = await client.query(
      `
        INSERT INTO sales (
          customer_name, seller, sale_date, address, city, state, total_price,
          latitude, longitude, notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        RETURNING id
      `,
      [
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
      ],
    );

    const saleId = Number(saleResult.rows[0].id);
    await insertTables(client, saleId, payload.tables);
    await client.query("COMMIT");
    return getSaleById(saleId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateSale(id: number, payload: UpsertPayload) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `
      UPDATE sales
      SET customer_name = $1, seller = $2, sale_date = $3, address = $4, city = $5, state = $6,
          total_price = $7, latitude = $8, longitude = $9, notes = $10, updated_at = NOW()
      WHERE id = $11
      `,
      [
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
      ],
    );

    await client.query("DELETE FROM sale_tables WHERE sale_id = $1", [id]);
    await insertTables(client, id, payload.tables);
    await client.query("COMMIT");
    return getSaleById(id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function insertTables(
  client: { query: (text: string, params?: unknown[]) => Promise<unknown> },
  saleId: number,
  tables: TableLineItem[],
) {
  for (const table of tables) {
    await client.query(
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
        table.features || "",
      ],
    );
  }
}

export async function getOptions() {
  const [sellers, cities, tableTypes, tableNames] = await Promise.all([
    pool.query("SELECT DISTINCT seller FROM sales ORDER BY seller ASC"),
    pool.query("SELECT DISTINCT city FROM sales ORDER BY city ASC"),
    pool.query("SELECT DISTINCT type FROM sale_tables ORDER BY type ASC"),
    pool.query("SELECT DISTINCT table_name FROM sale_tables ORDER BY table_name ASC"),
  ]);

  return {
    sellers: sellers.rows.map((item) => item.seller as string),
    cities: cities.rows.map((item) => item.city as string),
    tableTypes: tableTypes.rows.map((item) => item.type as string),
    tableNames: tableNames.rows.map((item) => item.table_name as string),
  };
}
