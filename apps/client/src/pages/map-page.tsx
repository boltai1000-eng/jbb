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
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["map", filters],
    queryFn: () => api.map(filters),
  });

  const selected = useMemo(
    () => data?.find((sale) => sale.id === selectedId) || data?.[0] || null,
    [data, selectedId],
  );

  if (isLoading || !data) return <div className="empty-state">Loading map...</div>;

  return (
    <div className="map-layout">
      <div className="card map-card">
        <MapContainer center={[22.9734, 78.6569]} zoom={5} scrollWheelZoom className="map-container">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MarkerClusterGroup chunkedLoading>
            {data.map((sale) =>
              sale.latitude && sale.longitude ? (
                <Marker
                  key={sale.id}
                  position={[sale.latitude, sale.longitude]}
                  icon={markerIcon}
                  eventHandlers={{ click: () => setSelectedId(sale.id) }}
                >
                  <Popup>
                    <strong>{sale.customerName}</strong>
                    <br />
                    {sale.city}
                  </Popup>
                </Marker>
              ) : null,
            )}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      <aside className="card detail-card">
        <div className="section-title">
          <div>
            <p className="eyebrow">Installation details</p>
            <h3>{selected ? selected.customerName : "No location selected"}</h3>
          </div>
        </div>

        {selected ? (
          <div className="detail-stack">
            <div className="info-pair"><span>Customer</span><strong>{selected.customerName}</strong></div>
            <div className="info-pair"><span>Seller</span><strong>{selected.seller}</strong></div>
            <div className="info-pair"><span>Date</span><strong>{selected.saleDate}</strong></div>
            <div className="info-pair"><span>Address</span><strong>{selected.address}</strong></div>
            <div className="info-pair"><span>Price</span><strong>{formatCurrency(selected.totalPrice)}</strong></div>
            <div className="stacked-table-list">
              {selected.tables.map((table) => (
                <div key={`${selected.id}-${table.tableName}`} className="table-summary-item">
                  <strong>{table.tableName}</strong>
                  <p>{table.type} | {table.size} | Qty {table.quantity}</p>
                  <p>{table.features || "No extra features noted"}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="muted">No installations match the current filters.</p>
        )}
      </aside>
    </div>
  );
}
