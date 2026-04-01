import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalyticsResponse } from "../types";
import { formatCurrency } from "../lib/utils";

const colors = ["#0f766e", "#2563eb", "#f59e0b", "#ef4444", "#7c3aed", "#14b8a6"];

export function RevenueChart({
  data,
  mode,
}: {
  data: AnalyticsResponse["revenueOverTime"];
  mode: "monthly" | "weekly" | "yearly";
}) {
  return (
    <div className="card chart-card">
      <div className="section-title">
        <div>
          <p className="eyebrow">Revenue over time</p>
          <h3>{mode[0].toUpperCase() + mode.slice(1)} trend</h3>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data[mode]}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0f766e" stopOpacity={0.24} />
              <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#e8ecef" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Area type="monotone" dataKey="revenue" stroke="#0f766e" fill="url(#revenueFill)" strokeWidth={2.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TableTypeChart({ data }: { data: AnalyticsResponse["tableTypeDistribution"] }) {
  return (
    <div className="card chart-card">
      <div className="section-title">
        <div>
          <p className="eyebrow">Mix</p>
          <h3>Table type distribution</h3>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} dataKey="quantity" nameKey="type" innerRadius={66} outerRadius={92}>
            {data.map((entry, index) => (
              <Cell key={entry.type} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="legend-list">
        {data.map((item, index) => (
          <div key={item.type} className="legend-row">
            <span className="legend-dot" style={{ backgroundColor: colors[index % colors.length] }} />
            <span>{item.type}</span>
            <strong>{item.quantity}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SellerChart({ data }: { data: AnalyticsResponse["sellerPerformance"] }) {
  return (
    <div className="card chart-card">
      <div className="section-title">
        <div>
          <p className="eyebrow">Performance</p>
          <h3>Seller revenue</h3>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid vertical={false} stroke="#e8ecef" />
          <XAxis dataKey="seller" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Bar dataKey="revenue" fill="#2563eb" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
