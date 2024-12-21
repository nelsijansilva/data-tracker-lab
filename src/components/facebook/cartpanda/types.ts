export interface UnifiedSale {
  id: string;
  order_id: string;
  platform: string;
  platform_account_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_document?: string;
  total_amount?: number;
  currency?: string;
  status: string;
  payment_status: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  raw_data?: any;
}

// Add the SalesMetrics interface to resolve the import error
export interface SalesMetrics {
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  salesByPlatform: Record<string, number>;
  paymentMethodStats: Record<string, number>;
}