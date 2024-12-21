import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, createSupabaseAdmin, processWebhookData } from './utils.ts';
import type { TictoWebhookPayload } from './types.ts';

serve(async (req) => {
  // Log detalhado da requisição recebida
  console.log('=== Webhook Request Details ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2));

  const supabaseAdmin = createSupabaseAdmin();

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
        tictoAccountId: null
      });
      throw error;
    }

    // Get the Ticto account configuration
    const { data: tictoAccount, error: accountError } = await supabaseAdmin
      .from('ticto_accounts')
      .select('id, token')
      .eq('account_name', accountName)
      .single();

    if (accountError || !tictoAccount) {
      console.error('Error finding Ticto account:', accountError);
      const error = new Error(`Ticto account not found for account name: ${accountName}`);
      await logWebhookRequest(supabaseAdmin, {
        method: req.method,
        url: req.url,
        status: 404,
        headers: Object.fromEntries(req.headers.entries()),
        payload: { error: error.message },
        tictoAccountId: null
      });
      throw error;
    }

    console.log('Found Ticto account:', tictoAccount.id);

    // Parse webhook payload
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);

    let payload: TictoWebhookPayload;
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
        tictoAccountId: tictoAccount.id
      });
      throw error;
    }

    // Log the entire payload structure for debugging
    console.log('Received payload structure:', JSON.stringify(payload, null, 2));

    // Validate token
    const receivedToken = payload.token;
    const storedToken = tictoAccount.token;
    
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

    console.log('Token validation successful');

    // Process and validate data
    const processedData = processWebhookData(payload);
    console.log('Processed data:', processedData);

    // Insert order data
    const { error: insertError } = await supabaseAdmin
      .from('ticto_orders')
      .insert([{
        ...processedData,
        ticto_account_id: tictoAccount.id,
        raw_data: payload
      }]);

    if (insertError) {
      console.error('Error inserting order:', insertError);
      throw insertError;
    }

    console.log('Order data saved successfully');

    // Log webhook success
    await logWebhookRequest(supabaseAdmin, {
      method: req.method,
      url: req.url,
      status: 200,
      headers: Object.fromEntries(req.headers.entries()),
      payload,
      tictoAccountId: tictoAccount.id
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Webhook processed successfully',
        order_hash: processedData.order_hash
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    
    const statusCode = error.name === 'AuthorizationError' ? 401 : 400;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Log error in webhook_logs
    if (error instanceof Error) {
      await logWebhookRequest(supabaseAdmin, {
        method: req.method,
        url: req.url,
        status: statusCode,
        headers: Object.fromEntries(req.headers.entries()),
        payload: { error: errorMessage },
        tictoAccountId: null
      });
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      }
    );
  }
});

async function logWebhookRequest(supabaseAdmin: any, {
  method,
  url,
  status,
  headers,
  payload,
  tictoAccountId = null
}: {
  method: string;
  url: string;
  status: number;
  headers: any;
  payload: any;
  tictoAccountId?: string | null;
}) {
  try {
    await supabaseAdmin
      .from('webhook_logs')
      .insert([{
        method,
        url,
        status,
        payload: {
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
        },
        ticto_account_id: tictoAccountId
      }]);
  } catch (error) {
    console.error('Error logging webhook request:', error);
  }
}