import type { SaleFilters } from "../types/index.js";

export function buildFilterSql(filters: SaleFilters) {
  const clauses: string[] = [];
  const params: Array<string | number> = [];

  if (filters.dateFrom) {
    clauses.push("s.sale_date >= ?");
    params.push(filters.dateFrom);
  }

  if (filters.dateTo) {
    clauses.push("s.sale_date <= ?");
    params.push(filters.dateTo);
  }

  if (filters.seller) {
    clauses.push("s.seller = ?");
    params.push(filters.seller);
  }

  if (filters.city) {
    clauses.push("s.city = ?");
    params.push(filters.city);
  }

  if (filters.tableType) {
    clauses.push(
      "EXISTS (SELECT 1 FROM sale_tables st2 WHERE st2.sale_id = s.id AND st2.type = ?)",
    );
    params.push(filters.tableType);
  }

  if (filters.search) {
    clauses.push(
      "(s.customer_name LIKE ? OR s.address LIKE ? OR s.city LIKE ? OR EXISTS (SELECT 1 FROM sale_tables st3 WHERE st3.sale_id = s.id AND st3.table_name LIKE ?))",
    );
    const term = `%${filters.search}%`;
    params.push(term, term, term, term);
  }

  return {
    whereClause: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}
