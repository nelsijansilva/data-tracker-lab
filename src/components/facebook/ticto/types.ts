// Add CartPanda types to the existing types file
export interface CartPandaAccount {
  id?: string;
  account_name: string;
  store_slug: string;
  token: string;
  webhook_url?: string;
}

export interface CartPandaOrder {
  id?: string;
  order_id: number;
  cart_token?: string;
  email: string;
  phone?: string;
  status: string;
  payment_status: string;
  total_amount?: number;
  currency?: string;
  customer_name?: string;
  customer_email?: string;
  customer_document?: string;
  payment_method?: string;
  raw_data?: any;
}