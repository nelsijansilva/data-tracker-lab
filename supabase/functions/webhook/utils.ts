import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { TictoWebhookPayload, ProcessedWebhookData } from './types.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function createSupabaseAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

export function processWebhookData(payload: TictoWebhookPayload): ProcessedWebhookData {
  const { body } = payload;
  
  if (!body.order?.hash) {
    throw new Error('Order hash is required');
  }

  if (!body.status) {
    throw new Error('Status is required');
  }

  if (!body.payment_method) {
    throw new Error('Payment method is required');
  }

  return {
    order_hash: body.order.hash,
    status: body.status.toLowerCase(),
    payment_method: body.payment_method.toLowerCase(),
    paid_amount: body.order.paid_amount || 0,
    installments: body.order.installments || 1,
    product_name: body.item?.product_name || null,
    product_id: body.item?.product_id || null,
    offer_name: body.item?.offer_name || null,
    offer_id: body.item?.offer_id || null,
    customer_name: body.customer?.name || null,
    customer_email: body.customer?.email || null,
    customer_phone: body.customer?.phone ? 
      `${body.customer.phone.ddi}${body.customer.phone.ddd}${body.customer.phone.number}` : null,
    customer_document: body.customer?.cpf || body.customer?.cnpj || null
  };
}