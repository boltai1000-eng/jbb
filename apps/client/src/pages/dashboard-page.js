import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useFilters } from "../components/filters-context";
import { KpiCards } from "../components/kpi-cards";
import { RevenueChart, SellerChart, TableTypeChart } from "../components/dashboard-charts";
import { formatCurrency } from "../lib/utils";
export function DashboardPage() {
    const { filters } = useFilters();
    const [mode, setMode] = useState("monthly");
    const { data, isLoading } = useQuery({
        queryKey: ["analytics", filters],
        queryFn: () => api.analytics(filters),
    });
    if (isLoading || !data)
        return _jsx("div", { className: "empty-state", children: "Loading analytics..." });
    return (_jsxs("div", { className: "page-stack", children: [_jsx(KpiCards, { kpis: data.kpis }), _jsxs("div", { className: "card summary-banner", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Snapshot" }), _jsx("h3", { children: "Focused, filter-aware performance view" }), _jsxs("p", { className: "muted", children: ["Revenue is ", formatCurrency(data.kpis.totalRevenue), " across ", data.kpis.totalSales, " filtered sales."] })] }), _jsx("div", { className: "tab-strip", children: ["monthly", "weekly", "yearly"].map((item) => (_jsx("button", { className: mode === item ? "tab-active" : "", onClick: () => setMode(item), children: item }, item))) })] }), _jsxs("section", { className: "two-column-grid", children: [_jsx(RevenueChart, { data: data.revenueOverTime, mode: mode }), _jsx(TableTypeChart, { data: data.tableTypeDistribution })] }), _jsxs("section", { className: "two-column-grid", children: [_jsx(SellerChart, { data: data.sellerPerformance }), _jsxs("div", { className: "card", children: [_jsx("div", { className: "section-title", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Cities" }), _jsx("h3", { children: "Best performing cities" })] }) }), _jsx("div", { className: "score-list", children: data.topCities.map((city, index) => (_jsxs("div", { className: "score-row", children: [_jsx("span", { children: index + 1 }), _jsxs("div", { children: [_jsx("strong", { children: city.city }), _jsx("p", { children: formatCurrency(city.revenue) })] })] }, city.city))) })] })] })] }));
}
