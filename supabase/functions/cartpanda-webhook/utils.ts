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
  error = null,
  cartpandaAccountId = null
}: {
  method: string;
  url: string;
  status: number;
  headers: any;
  payload: any;
  error?: any;
  cartpandaAccountId?: string | null;
}) {
  const logPayload = error ? {
    request: {
      method,
      url,
      headers,
      payload
    },
    error: {
      message: error.message,
      name: error.name,
      stack: error.stack
    }
  } : {
    request: {
      method,
      url,
      headers,
      payload
    },
    response: {
      success: true,
      message: 'Webhook processed successfully'
    }
  };

  await supabaseAdmin
    .from('webhook_logs')
    .insert([{
      method,
      url,
      status,
      payload: logPayload,
      cartpanda_account_id: cartpandaAccountId
    }]);
}