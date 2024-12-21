import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { TictoWebhookPayload, ProcessedWebhookData } from './types.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function createSupabaseAdmin() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function processWebhookData(payload: TictoWebhookPayload): ProcessedWebhookData {
  console.log('Processing webhook data:', JSON.stringify(payload, null, 2));

  if (!payload.order?.hash) {
    throw new Error('Order hash is required');
  }

  if (!payload.status) {
    throw new Error('Status is required');
  }

  if (!payload.payment_method) {
    throw new Error('Payment method is required');
  }

  const processedData = {
    order_hash: payload.order.hash,
    status: payload.status.toLowerCase(),
    payment_method: payload.payment_method.toLowerCase(),
    paid_amount: payload.order.paid_amount || 0,
    installments: payload.order.installments || 1,
    product_name: payload.item?.product_name || null,
    product_id: payload.item?.product_id || null,
    offer_name: payload.item?.offer_name || null,
    offer_id: payload.item?.offer_id || null,
    customer_name: payload.customer?.name || null,
    customer_email: payload.customer?.email || null,
    customer_phone: payload.customer?.phone ? 
      `${payload.customer.phone.ddi}${payload.customer.phone.ddd}${payload.customer.phone.number}` : null,
    customer_document: payload.customer?.cpf || payload.customer?.cnpj || null,
    raw_data: payload
  };

  console.log('Processed webhook data:', JSON.stringify(processedData, null, 2));
  return processedData;
}