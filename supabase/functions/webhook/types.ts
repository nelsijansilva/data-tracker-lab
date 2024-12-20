export interface TictoWebhookPayload {
  token: string;
  body: {
    status: string;
    payment_method: string;
    order: {
      hash: string;
      paid_amount: number;
      installments: number;
    };
    item: {
      product_name: string;
      product_id: number;
      offer_name: string;
      offer_id: number;
    };
    customer: {
      name: string;
      email: string;
      phone: {
        ddi: string;
        ddd: string;
        number: string;
      };
      cpf?: string;
      cnpj?: string;
    };
  };
}

export interface ProcessedWebhookData {
  order_hash: string;
  status: string;
  payment_method: string;
  paid_amount: number;
  installments: number;
  product_name: string | null;
  product_id: number | null;
  offer_name: string | null;
  offer_id: number | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_document: string | null;
}