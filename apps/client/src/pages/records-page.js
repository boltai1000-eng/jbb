import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    if (isLoading || !data)
        return _jsx("div", { className: "empty-state", children: "Loading records..." });
    return (_jsxs("div", { className: "card", children: [_jsx("div", { className: "section-title", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Records" }), _jsx("h3", { children: "Sales and installation entries" })] }) }), _jsx("div", { className: "table-wrap", children: _jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Customer" }), _jsx("th", { children: "Date" }), _jsx("th", { children: "Seller" }), _jsx("th", { children: "City" }), _jsx("th", { children: "Tables" }), _jsx("th", { children: "Amount" }), _jsx("th", {})] }) }), _jsx("tbody", { children: data.map((sale) => (_jsxs("tr", { children: [_jsxs("td", { children: [_jsx("strong", { children: sale.customerName }), _jsx("p", { children: sale.address })] }), _jsx("td", { children: sale.saleDate }), _jsx("td", { children: sale.seller }), _jsx("td", { children: sale.city }), _jsx("td", { children: sale.tables.map((table) => `${table.tableName} x${table.quantity}`).join(", ") }), _jsx("td", { children: formatCurrency(sale.totalPrice) }), _jsx("td", { children: _jsx(Link, { className: "text-link", to: `/sales/${sale.id}/edit`, children: "Edit" }) })] }, sale.id))) })] }) })] }));
}
