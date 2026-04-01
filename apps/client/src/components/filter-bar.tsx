import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { api } from "../lib/api";
import { useFilters } from "./filters-context";

export function FilterBar() {
  const { filters, setFilters, clearFilters } = useFilters();
  const { data } = useQuery({
    queryKey: ["options"],
    queryFn: api.options,
  });

  return (
    <section className="filters-panel">
      <div className="input-with-icon">
        <Search size={16} />
        <input
          placeholder="Search customer, address, table..."
          value={filters.search || ""}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, search: event.target.value || undefined }))
          }
        />
      </div>

      <div className="mini-grid">
        <label>
          <span>Date from</span>
          <input
            type="date"
            value={filters.dateFrom || ""}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, dateFrom: event.target.value || undefined }))
            }
          />
        </label>

        <label>
          <span>Date to</span>
          <input
            type="date"
            value={filters.dateTo || ""}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, dateTo: event.target.value || undefined }))
            }
          />
        </label>

        <label>
          <span>Seller</span>
          <select
            value={filters.seller || ""}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, seller: event.target.value || undefined }))
            }
          >
            <option value="">All sellers</option>
            {data?.sellers.map((seller) => (
              <option key={seller} value={seller}>
                {seller}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Table type</span>
          <select
            value={filters.tableType || ""}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, tableType: event.target.value || undefined }))
            }
          >
            <option value="">All types</option>
            {data?.tableTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>City</span>
          <select
            value={filters.city || ""}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, city: event.target.value || undefined }))
            }
          >
            <option value="">All cities</option>
            {data?.cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="filter-actions">
        <span className="pill">
          <SlidersHorizontal size={14} />
          Shared filters
        </span>
        <button className="secondary-button" onClick={clearFilters}>
          <X size={14} />
          Reset
        </button>
      </div>
    </section>
  );
}
