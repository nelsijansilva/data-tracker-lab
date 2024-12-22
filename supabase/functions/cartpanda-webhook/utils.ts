import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

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

export function validateWebhookUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    // Remove any empty port
    if (parsedUrl.port === '') {
      parsedUrl.port = '';
    }
    // Ensure no double slash at the end
    return parsedUrl.toString().replace(/\/{2,}$/, '/');
  } catch (error) {
    console.error('Invalid webhook URL:', error);
    throw new Error('Invalid webhook URL format');
  }
}

export function processWebhookData(payload: any) {
  console.log('Processing CartPanda webhook data:', JSON.stringify(payload, null, 2));

  const orderData = payload.body?.order;
  if (!orderData) {
    throw new Error('Order data is missing in payload');
  }

  // Extract UTM parameters from query_params if available
  const queryParams = payload.query_params || {};
  const utmSource = queryParams.utm_source || 'Não Informado';
  const utmMedium = queryParams.utm_medium || 'Não Informado';
  const utmCampaign = queryParams.utm_campaign || 'Não Informado';
  const utmContent = queryParams.utm_content || 'Não Informado';
  const utmTerm = queryParams.utm_term || 'Não Informado';

  const processedData = {
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
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_content: utmContent,
    utm_term: utmTerm
  };

  console.log('Processed CartPanda data:', processedData);
  return processedData;
}