export * from './common';
export * from './facebook';
export * from './profiles';

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
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}