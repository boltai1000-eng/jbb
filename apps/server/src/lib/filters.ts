import type { SaleFilters } from "../types/index.js";

export function buildFilterSql(filters: SaleFilters) {
  const clauses: string[] = [];
  const params: Array<string | number> = [];
  let index = 1;

  if (filters.dateFrom) {
    clauses.push(`s.sale_date >= $${index++}`);
    params.push(filters.dateFrom);
  }

  if (filters.dateTo) {
    clauses.push(`s.sale_date <= $${index++}`);
    params.push(filters.dateTo);
  }

  if (filters.seller) {
    clauses.push(`s.seller = $${index++}`);
    params.push(filters.seller);
  }

  if (filters.city) {
    clauses.push(`s.city = $${index++}`);
    params.push(filters.city);
  }

  if (filters.tableType) {
    clauses.push(
      `EXISTS (SELECT 1 FROM sale_tables st2 WHERE st2.sale_id = s.id AND st2.type = $${index++})`,
    );
    params.push(filters.tableType);
  }

  if (filters.search) {
    const termPlaceholder = `$${index}`;
    const addressPlaceholder = `$${index + 1}`;
    const cityPlaceholder = `$${index + 2}`;
    const tablePlaceholder = `$${index + 3}`;
    clauses.push(
      `(s.customer_name ILIKE ${termPlaceholder} OR s.address ILIKE ${addressPlaceholder} OR s.city ILIKE ${cityPlaceholder} OR EXISTS (SELECT 1 FROM sale_tables st3 WHERE st3.sale_id = s.id AND st3.table_name ILIKE ${tablePlaceholder}))`,
    );
    const term = `%${filters.search}%`;
    params.push(term, term, term, term);
    index += 4;
  }

  return {
    whereClause: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}
