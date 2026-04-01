import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useFilters } from "../components/filters-context";
import { KpiCards } from "../components/kpi-cards";
import { RevenueChart, SellerChart, TableTypeChart } from "../components/dashboard-charts";
import { formatCurrency } from "../lib/utils";

export function DashboardPage() {
  const { filters } = useFilters();
  const [mode, setMode] = useState<"monthly" | "weekly" | "yearly">("monthly");
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", filters],
    queryFn: () => api.analytics(filters),
  });

  if (isLoading || !data) return <div className="empty-state">Loading analytics...</div>;

  return (
    <div className="page-stack">
      <KpiCards kpis={data.kpis} />

      <div className="card summary-banner">
        <div>
          <p className="eyebrow">Snapshot</p>
          <h3>Focused, filter-aware performance view</h3>
          <p className="muted">
            Revenue is {formatCurrency(data.kpis.totalRevenue)} across {data.kpis.totalSales} filtered sales.
          </p>
        </div>
        <div className="tab-strip">
          {(["monthly", "weekly", "yearly"] as const).map((item) => (
            <button
              key={item}
              className={mode === item ? "tab-active" : ""}
              onClick={() => setMode(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <section className="two-column-grid">
        <RevenueChart data={data.revenueOverTime} mode={mode} />
        <TableTypeChart data={data.tableTypeDistribution} />
      </section>

      <section className="two-column-grid">
        <SellerChart data={data.sellerPerformance} />
        <div className="card">
          <div className="section-title">
            <div>
              <p className="eyebrow">Cities</p>
              <h3>Best performing cities</h3>
            </div>
          </div>
          <div className="score-list">
            {data.topCities.map((city, index) => (
              <div className="score-row" key={city.city}>
                <span>{index + 1}</span>
                <div>
                  <strong>{city.city}</strong>
                  <p>{formatCurrency(city.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
