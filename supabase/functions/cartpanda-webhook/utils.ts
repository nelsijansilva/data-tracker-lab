import { createClient } from '@supabase/supabase-js';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const createSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

export const validateWebhookUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    // Remove qualquer porta vazia
    if (parsedUrl.port === '') {
      parsedUrl.port = '';
    }
    // Garante que não tenha barra dupla no final
    return parsedUrl.toString().replace(/\/{2,}$/, '/');
  } catch (error) {
    console.error('Invalid webhook URL:', error);
    throw new Error('Invalid webhook URL format');
  }
};

export const processWebhookData = (payload: any) => {
  const orderData = payload.body?.order;
  if (!orderData) {
    throw new Error('Order data is missing in payload');
  }

  return {
    order_id: orderData.id,
    cart_token: orderData.cart_token,
    email: orderData.email,
    phone: orderData.phone,
    status: orderData.status_id?.toLowerCase() || 'pending',
    payment_status: String(orderData.payment_status || 'pending'),
    total_amount: orderData.total_price || 0,
    currency: orderData.currency || 'BRL',
    customer_name: `${orderData.customer?.first_name || ''} ${orderData.customer?.last_name || ''}`.trim(),
    customer_email: orderData.customer?.email,
    customer_document: orderData.customer?.cpf || orderData.customer?.cnpj,
    payment_method: orderData.payment?.type || orderData.payment_type,
  };
};