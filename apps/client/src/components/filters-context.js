import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
const FiltersContext = createContext(null);
export function FiltersProvider({ children }) {
    const [filters, setFilters] = useState({});
    return (_jsx(FiltersContext.Provider, { value: {
            filters,
            setFilters,
            clearFilters: () => setFilters({}),
        }, children: children }));
}
export function useFilters() {
    const value = useContext(FiltersContext);
    if (!value)
        throw new Error("useFilters must be used inside FiltersProvider");
    return value;
}
