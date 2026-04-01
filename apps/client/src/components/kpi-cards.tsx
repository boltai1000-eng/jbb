import { CircleDollarSign, Package, Receipt, TrendingUp } from "lucide-react";
import type { AnalyticsResponse } from "../types";
import { formatCurrency } from "../lib/utils";

const items = [
  {
    key: "totalSales",
    label: "Number of sales",
    icon: Receipt,
    formatter: (value: number) => value.toString(),
  },
  {
    key: "totalRevenue",
    label: "Revenue",
    icon: CircleDollarSign,
    formatter: formatCurrency,
  },
  {
    key: "totalTables",
    label: "Tables sold",
    icon: Package,
    formatter: (value: number) => value.toString(),
  },
  {
    key: "averageOrderValue",
    label: "Avg order value",
    icon: TrendingUp,
    formatter: formatCurrency,
  },
] as const;

export function KpiCards({ kpis }: { kpis: AnalyticsResponse["kpis"] }) {
  return (
    <section className="kpi-grid">
      {items.map(({ key, label, icon: Icon, formatter }) => (
        <article key={key} className="card kpi-card">
          <div className="kpi-icon">
            <Icon size={18} />
          </div>
          <p>{label}</p>
          <h3>{formatter(kpis[key])}</h3>
        </article>
      ))}
    </section>
  );
}
