import {
  AnalyticsCategory,
  AnalyticsPoint
} from './analytics.model';

export interface DashboardSummary {
  totalUsers: number;
  internalUsers: number;
  portalAccounts: number;
  totalCustomers: number;
  totalInstitutions: number;

  totalQuotes: number;
  pendingQuotes: number;
  approvedQuotes: number;
  convertedQuotes: number;

  totalOrders: number;
  pendingOrders: number;
  awaitingProductionOrders: number;
  readyForSaleOrders: number;

  totalSales: number;
  totalRevenue: number;
  currentMonthRevenue: number;

  totalLicenses: number;
  availableLicenses: number;
  activeLicenses: number;
  expiredLicenses: number;
  revokedLicenses: number;

  totalProducts: number;
  lowFinishedStockProducts: number;
  totalRawMaterials: number;
  lowRawMaterialStock: number;

  totalProductionOrders: number;
  activeProductionOrders: number;

  totalSupportTickets: number;
  openSupportTickets: number;
  pendingComments: number;
  approvedComments: number;

  monthlyRevenue: AnalyticsPoint[];
  monthlySales: AnalyticsPoint[];
  topProducts: AnalyticsCategory[];
}
