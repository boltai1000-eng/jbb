export type TableLineItem = {
  id?: number;
  tableName: string;
  type: string;
  size: string;
  quantity: number;
  unitPrice: number;
  features?: string;
};

export type SaleRecord = {
  id: number;
  customerName: string;
  seller: string;
  saleDate: string;
  address: string;
  city: string;
  state: string;
  totalPrice: number;
  latitude: number | null;
  longitude: number | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  tables: TableLineItem[];
};

export type SaleFilters = {
  dateFrom?: string;
  dateTo?: string;
  seller?: string;
  tableType?: string;
  city?: string;
  search?: string;
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
};
