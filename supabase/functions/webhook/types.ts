export interface CartpandaWebhookPayload {
  order: {
    hash: string;
    paid_amount?: number;
    installments?: number;
    external_id?: string;
  };
  status: string;
  payment_method: string;
  item?: {
    product_name?: string;
    product_id?: string;
    offer_name?: string;
    offer_id?: string;
  };
  customer?: {
    name?: string;
    email?: string;
    phone?: {
      ddi?: string;
      ddd?: string;
      number?: string;
    };
    cpf?: string;
    cnpj?: string;
  };
  token?: string;
}

export interface ProcessedWebhookData {
  order_hash: string;
  status: string;
  payment_method: string;
  paid_amount: number;
  installments: number;
  product_name: string | null;
  product_id: string | null;
  offer_name: string | null;
  offer_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_document: string | null;
  raw_data: CartpandaWebhookPayload;
}
