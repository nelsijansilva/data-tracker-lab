import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, createSupabaseAdmin, processWebhookData } from './utils';
import type { CartpandaWebhookPayload } from './types';

type SupabaseAdmin = {
  from: (tableName: string) => {
    insert: (data: Record<string, unknown>) => Promise<{ error: Error | null }>;
    select: (columns: string) => {
      eq: (
        column: string,
        value: string,
      ) => {
        single: () => Promise<{ data: Record<string, unknown> | null; error: Error | null }>;
      };
    };
  };
};

type LogWebhookRequestParams = {
  method: string;
  url: string;
  status: number;
  headers: Record<string, string>;
  payload: Record<string, unknown>;
  cartpandaAccountId?: string | null;
};

serve(async (req) => {
  // Log detalhado da requisição recebida
  console.log('=== Webhook Request Details ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2));

  const supabaseAdmin: SupabaseAdmin = createSupabaseAdmin();

  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Parse URL and validate account parameter
    const url = new URL(req.url);
    const accountName = url.searchParams.get('account');
    console.log('Account name from URL:', accountName);

    if (!accountName) {
      const error = new Error('Account name is required in query parameters');
      await logWebhookRequest(supabaseAdmin, {
        method: req.method,
        url: req.url,
        status: 400,
        headers: Object.fromEntries(req.headers.entries()),
        payload: { error: error.message },
        cartpandaAccountId: null,
      });
      throw error;
    }

    // Get the Cartpanda account configuration
    const { data: cartpandaAccount, error: accountError } = await supabaseAdmin
      .from('cartpanda_accounts')
      .select('id, token')
      .eq('account_name', accountName)
      .single();

    if (accountError || !cartpandaAccount) {
      console.error('Error finding Cartpanda account:', accountError);
      const error = new Error(`Cartpanda account not found for account name: ${accountName}`);
      await logWebhookRequest(supabaseAdmin, {
        method: req.method,
        url: req.url,
        status: 404,
        headers: Object.fromEntries(req.headers.entries()),
        payload: { error: error.message },
        cartpandaAccountId: null,
      });
      throw error;
    }

    console.log('Found Cartpanda account:', cartpandaAccount.id);

    // Parse webhook payload
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);

    let payload: CartpandaWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      console.error('Error parsing JSON payload:', e);
      const error = new Error('Invalid JSON payload');
      await logWebhookRequest(supabaseAdmin, {
        method: req.method,
        url: req.url,
        status: 400,
        headers: Object.fromEntries(req.headers.entries()),
        payload: { error: error.message, rawBody },
        cartpandaAccountId: cartpandaAccount.id,
      });
      throw error;
    }

    // Log the entire payload structure for debugging
    console.log('Received payload structure:', JSON.stringify(payload, null, 2));

    // Validate token
    const receivedToken = payload.token;
    const storedToken = cartpandaAccount.token;

    console.log('Token validation:');
    console.log('- Received token:', receivedToken);
    console.log('- Stored token:', storedToken);
    console.log('- Token match:', receivedToken === storedToken);

    if (!receivedToken) {
      throw new Error('Token not found in payload');
    }

    if (receivedToken !== storedToken) {
      throw new Error(`Invalid token for account: ${accountName}`);
    }

    // Process the webhook data
    const processedData = processWebhookData(payload);

    // Log the processed data
    console.log('Processed webhook data:', JSON.stringify(processedData, null, 2));

    // Insert processed data into Supabase
    const { error: insertError } = await supabaseAdmin.from('cartpanda_webhook_logs').insert({
      account_id: cartpandaAccount.id,
      order_hash: processedData.order_hash,
      status: processedData.status,
      payment_method: processedData.payment_method,
      paid_amount: processedData.paid_amount,
      raw_data: payload,
    });

    if (insertError) {
      console.error('Error inserting webhook log:', insertError);
      await logWebhookRequest(supabaseAdmin, {
        method: req.method,
        url: req.url,
        status: 500,
        headers: Object.fromEntries(req.headers.entries()),
        payload: { error: insertError.message },
        cartpandaAccountId: cartpandaAccount.id,
      });
      throw insertError;
    }

    // Log successful webhook processing
    await logWebhookRequest(supabaseAdmin, {
      method: req.method,
      url: req.url,
      status: 200,
      headers: Object.fromEntries(req.headers.entries()),
      payload: processedData,
      cartpandaAccountId: cartpandaAccount.id,
    });

    // Return successful response
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);

    const statusCode = error.name === 'AuthorizationError' ? 401 : 400;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: statusCode,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});

async function logWebhookRequest(
  supabaseAdmin: SupabaseAdmin,
  { method, url, status, headers, payload, cartpandaAccountId = null }: LogWebhookRequestParams,
) {
  try {
    const { error } = await supabaseAdmin.from('webhook_request_logs').insert({
      method,
      url,
      status,
      headers: JSON.stringify(headers),
      payload: JSON.stringify(payload),
      account_id: cartpandaAccountId,
    });

    if (error) {
      console.error('Error logging webhook request:', error);
    }
  } catch (logError) {
    console.error('Fatal error logging webhook request:', logError);
  }
}
