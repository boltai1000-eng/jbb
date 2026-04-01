import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { api } from "../lib/api";
import { useFilters } from "../components/filters-context";
import { formatCurrency } from "../lib/utils";
const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconAnchor: [12, 41],
});
export function MapPage() {
    const { filters } = useFilters();
    const [selectedId, setSelectedId] = useState(null);
    const { data, isLoading } = useQuery({
        queryKey: ["map", filters],
        queryFn: () => api.map(filters),
    });
    const selected = useMemo(() => data?.find((sale) => sale.id === selectedId) || data?.[0] || null, [data, selectedId]);
    if (isLoading || !data)
        return _jsx("div", { className: "empty-state", children: "Loading map..." });
    return (_jsxs("div", { className: "map-layout", children: [_jsx("div", { className: "card map-card", children: _jsxs(MapContainer, { center: [22.9734, 78.6569], zoom: 5, scrollWheelZoom: true, className: "map-container", children: [_jsx(TileLayer, { attribution: '\u00A9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }), _jsx(MarkerClusterGroup, { chunkedLoading: true, children: data.map((sale) => sale.latitude && sale.longitude ? (_jsx(Marker, { position: [sale.latitude, sale.longitude], icon: markerIcon, eventHandlers: { click: () => setSelectedId(sale.id) }, children: _jsxs(Popup, { children: [_jsx("strong", { children: sale.customerName }), _jsx("br", {}), sale.city] }) }, sale.id)) : null) })] }) }), _jsxs("aside", { className: "card detail-card", children: [_jsx("div", { className: "section-title", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Installation details" }), _jsx("h3", { children: selected ? selected.customerName : "No location selected" })] }) }), selected ? (_jsxs("div", { className: "detail-stack", children: [_jsxs("div", { className: "info-pair", children: [_jsx("span", { children: "Customer" }), _jsx("strong", { children: selected.customerName })] }), _jsxs("div", { className: "info-pair", children: [_jsx("span", { children: "Seller" }), _jsx("strong", { children: selected.seller })] }), _jsxs("div", { className: "info-pair", children: [_jsx("span", { children: "Date" }), _jsx("strong", { children: selected.saleDate })] }), _jsxs("div", { className: "info-pair", children: [_jsx("span", { children: "Address" }), _jsx("strong", { children: selected.address })] }), _jsxs("div", { className: "info-pair", children: [_jsx("span", { children: "Price" }), _jsx("strong", { children: formatCurrency(selected.totalPrice) })] }), _jsx("div", { className: "stacked-table-list", children: selected.tables.map((table) => (_jsxs("div", { className: "table-summary-item", children: [_jsx("strong", { children: table.tableName }), _jsxs("p", { children: [table.type, " | ", table.size, " | Qty ", table.quantity] }), _jsx("p", { children: table.features || "No extra features noted" })] }, `${selected.id}-${table.tableName}`))) })] })) : (_jsx("p", { className: "muted", children: "No installations match the current filters." }))] })] }));
}
