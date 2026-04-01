import type { SaleFilters } from "../types/index.js";
import { listSales } from "./sales.js";

export async function buildAnalytics(filters: SaleFilters) {
  const sales = await listSales(filters);
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalSales = sales.length;
  const totalTables = sales.reduce(
    (sum, sale) =>
      sum + sale.tables.reduce((inner, table) => inner + table.quantity, 0),
    0,
  );
  const averageOrderValue = totalSales ? totalRevenue / totalSales : 0;

  const monthlyMap = new Map<string, number>();
  const weeklyMap = new Map<string, number>();
  const yearlyMap = new Map<string, number>();
  const tableTypeMap = new Map<string, number>();
  const sellerMap = new Map<
    string,
    { revenue: number; salesCount: number; tablesSold: number }
  >();
  const cityRevenue = new Map<string, number>();

  for (const sale of sales) {
    const date = new Date(sale.saleDate);
    const monthKey = date.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
    const yearKey = String(date.getFullYear());
    const weekKey = `${date.getFullYear()}-W${getWeekNumber(date)}`;

    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + sale.totalPrice);
    weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + sale.totalPrice);
    yearlyMap.set(yearKey, (yearlyMap.get(yearKey) || 0) + sale.totalPrice);
    cityRevenue.set(sale.city, (cityRevenue.get(sale.city) || 0) + sale.totalPrice);

    const seller = sellerMap.get(sale.seller) || {
      revenue: 0,
      salesCount: 0,
      tablesSold: 0,
    };
    seller.revenue += sale.totalPrice;
    seller.salesCount += 1;
    seller.tablesSold += sale.tables.reduce((sum, table) => sum + table.quantity, 0);
    sellerMap.set(sale.seller, seller);

    for (const table of sale.tables) {
      tableTypeMap.set(
        table.type,
        (tableTypeMap.get(table.type) || 0) + table.quantity,
      );
    }
  }

  const topCities = [...cityRevenue.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city, revenue]) => ({ city, revenue }));

  return {
    kpis: {
      totalSales,
      totalRevenue,
      totalTables,
      averageOrderValue,
    },
    revenueOverTime: {
      monthly: [...monthlyMap.entries()].map(([label, revenue]) => ({
        label,
        revenue,
      })),
      weekly: [...weeklyMap.entries()].map(([label, revenue]) => ({
        label,
        revenue,
      })),
      yearly: [...yearlyMap.entries()].map(([label, revenue]) => ({
        label,
        revenue,
      })),
    },
    tableTypeDistribution: [...tableTypeMap.entries()].map(([type, quantity]) => ({
      type,
      quantity,
    })),
    sellerPerformance: [...sellerMap.entries()]
      .map(([seller, value]) => ({
        seller,
        ...value,
      }))
      .sort((a, b) => b.revenue - a.revenue),
    topCities,
  };
}

function getWeekNumber(date: Date) {
  const copy = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = copy.getUTCDay() || 7;
  copy.setUTCDate(copy.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1));
  return Math.ceil((((copy.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
