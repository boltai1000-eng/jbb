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

export type Filters = {
  dateFrom?: string;
  dateTo?: string;
  seller?: string;
  tableType?: string;
  city?: string;
  search?: string;
};

export type AnalyticsResponse = {
  kpis: {
    totalSales: number;
    totalRevenue: number;
    totalTables: number;
    averageOrderValue: number;
  };
  revenueOverTime: {
    monthly: Array<{ label: string; revenue: number }>;
    weekly: Array<{ label: string; revenue: number }>;
    yearly: Array<{ label: string; revenue: number }>;
  };
  tableTypeDistribution: Array<{ type: string; quantity: number }>;
  sellerPerformance: Array<{
    seller: string;
    revenue: number;
    salesCount: number;
    tablesSold: number;
  }>;
  topCities: Array<{ city: string; revenue: number }>;
};
