import { createContext, useContext, useState } from "react";
import type { Filters } from "../types";

type FiltersContextValue = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  clearFilters: () => void;
};

const FiltersContext = createContext<FiltersContextValue | null>(null);

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<Filters>({});
  return (
    <FiltersContext.Provider
      value={{
        filters,
        setFilters,
        clearFilters: () => setFilters({}),
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const value = useContext(FiltersContext);
  if (!value) throw new Error("useFilters must be used inside FiltersProvider");
  return value;
}
