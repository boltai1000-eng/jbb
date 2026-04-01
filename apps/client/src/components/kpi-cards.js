import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CircleDollarSign, Package, Receipt, TrendingUp } from "lucide-react";
import { formatCurrency } from "../lib/utils";
const items = [
    {
        key: "totalSales",
        label: "Number of sales",
        icon: Receipt,
        formatter: (value) => value.toString(),
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
        formatter: (value) => value.toString(),
    },
    {
        key: "averageOrderValue",
        label: "Avg order value",
        icon: TrendingUp,
        formatter: formatCurrency,
    },
];
export function KpiCards({ kpis }) {
    return (_jsx("section", { className: "kpi-grid", children: items.map(({ key, label, icon: Icon, formatter }) => (_jsxs("article", { className: "card kpi-card", children: [_jsx("div", { className: "kpi-icon", children: _jsx(Icon, { size: 18 }) }), _jsx("p", { children: label }), _jsx("h3", { children: formatter(kpis[key]) })] }, key))) }));
}
