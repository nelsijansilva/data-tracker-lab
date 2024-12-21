import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

export async function logWebhookRequest(supabaseAdmin: any, {
  method,
  url,
  status,
  headers,
  payload,
  cartpandaAccountId = null
}: {
  method: string;
  url: string;
  status: number;
  headers: any;
  payload: any;
  cartpandaAccountId?: string | null;
}) {
  const logPayload = {
    request: {
      method,
      url,
      headers,
      payload
    },
    response: {
      success: status >= 200 && status < 300,
      status,
      message: status >= 200 && status < 300 ? 'Webhook processed successfully' : 'Error processing webhook'
    }
  };

  try {
    await supabaseAdmin
      .from('webhook_logs')
      .insert([{
        method,
        url,
        status,
        payload: logPayload,
        cartpanda_account_id: cartpandaAccountId
      }]);
    
    console.log('Webhook log saved successfully');
  } catch (error) {
    console.error('Error saving webhook log:', error);
  }
}