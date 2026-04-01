import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useFilters } from "../components/filters-context";
import { formatCurrency } from "../lib/utils";

export function RecordsPage() {
  const { filters } = useFilters();
  const { data, isLoading } = useQuery({
    queryKey: ["sales", filters],
    queryFn: () => api.sales(filters),
  });

  if (isLoading || !data) return <div className="empty-state">Loading records...</div>;

  return (
    <div className="card">
      <div className="section-title">
        <div>
          <p className="eyebrow">Records</p>
          <h3>Sales and installation entries</h3>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Date</th>
              <th>Seller</th>
              <th>City</th>
              <th>Tables</th>
              <th>Amount</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.map((sale) => (
              <tr key={sale.id}>
                <td>
                  <strong>{sale.customerName}</strong>
                  <p>{sale.address}</p>
                </td>
                <td>{sale.saleDate}</td>
                <td>{sale.seller}</td>
                <td>{sale.city}</td>
                <td>
                  {sale.tables.map((table) => `${table.tableName} x${table.quantity}`).join(", ")}
                </td>
                <td>{formatCurrency(sale.totalPrice)}</td>
                <td>
                  <Link className="text-link" to={`/sales/${sale.id}/edit`}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
