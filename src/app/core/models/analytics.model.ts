export interface AnalyticsPoint {
  label: string;
  value: number;
  count: number;
}

export interface AnalyticsCategory {
  key: string;
  label: string;
  value: number;
  count: number;
}

export interface CommercialFunnel {
  quotes: number;
  approvedQuotes: number;
  convertedQuotes: number;
  orders: number;
  soldOrders: number;
  sales: number;
  approvalRate: number;
  quoteToOrderRate: number;
  orderToSaleRate: number;
}

export interface AnalyticsOverview {
  funnel: CommercialFunnel;
  monthlyRevenue: AnalyticsPoint[];
  monthlySales: AnalyticsPoint[];
  monthlyPurchases: AnalyticsPoint[];
  quoteStatuses: AnalyticsCategory[];
  orderStatuses: AnalyticsCategory[];
  licenseStatuses: AnalyticsCategory[];
  productionStatuses: AnalyticsCategory[];
  wasteClassifications: AnalyticsCategory[];
  topProducts: AnalyticsCategory[];
  topCustomers: AnalyticsCategory[];
  totalRevenue: number;
  totalPurchases: number;
  grossCommercialMargin: number;
  averageTicket: number;
}
