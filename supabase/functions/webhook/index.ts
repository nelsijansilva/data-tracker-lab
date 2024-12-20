import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, createSupabaseAdmin, processWebhookData } from './utils.ts';
import type { TictoWebhookPayload } from './types.ts';

serve(async (req) => {
  console.log('=== Webhook Request Details ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      }
    });
  }

  try {
    // Clone the request to read the body multiple times if needed
    const clonedReq = req.clone();
    const rawBody = await clonedReq.text();
    console.log('Raw request body:', rawBody);

    // Parse URL and validate account parameter
    const url = new URL(req.url);
    console.log('Full URL:', url.toString());
    console.log('Search params:', Object.fromEntries(url.searchParams.entries()));
    
    const accountName = url.searchParams.get('account');
    console.log('Account name from URL:', accountName);
    
    if (!accountName) {
      throw new Error('Account name is required in query parameters');
    }

    console.log('Processing webhook for account:', accountName);

    const supabaseAdmin = createSupabaseAdmin();

    // Get the Ticto account configuration
    const { data: tictoAccount, error: accountError } = await supabaseAdmin
      .from('ticto_accounts')
      .select('id, token')
      .eq('account_name', accountName)
      .single();

    if (accountError || !tictoAccount) {
      console.error('Error finding Ticto account:', accountError);
      throw new Error(`Ticto account not found for account name: ${accountName}`);
    }

    // Parse webhook payload
    let payload: TictoWebhookPayload;
    try {
      payload = JSON.parse(rawBody) as TictoWebhookPayload;
    } catch (e) {
      console.error('Error parsing JSON payload:', e);
      throw new Error('Invalid JSON payload');
    }
    console.log('Received webhook payload:', JSON.stringify(payload, null, 2));

    // Validate token
    if (!payload.body?.token || payload.body.token !== tictoAccount.token) {
      console.error('Invalid token received:', payload.body?.token);
      throw new Error('Invalid token');
    }

    // Process and validate data
    const processedData = processWebhookData(payload);
    console.log('Processed data:', processedData);

    // Insert processed data
    const { error: insertError } = await supabaseAdmin
      .from('ticto_orders')
      .insert([{
        ...processedData,
        ticto_account_id: tictoAccount.id
      }]);

    if (insertError) {
      console.error('Error inserting order:', insertError);
      throw insertError;
    }

    // Log webhook
    await supabaseAdmin
      .from('webhook_logs')
      .insert([
        {
          method: req.method,
          url: req.url,
          status: 200,
          payload: {
            headers: Object.fromEntries(req.headers.entries()),
            body: payload,
            rawBody: rawBody
          },
          ticto_account_id: tictoAccount.id
        }
      ]);

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Webhook processed successfully',
        order_hash: processedData.order_hash,
        account_name: accountName
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);

    // Log error in webhook_logs
    if (error instanceof Error) {
      const supabaseAdmin = createSupabaseAdmin();
      
      await supabaseAdmin
        .from('webhook_logs')
        .insert([
          {
            method: req.method,
            url: req.url,
            status: 400,
            payload: { 
              error: error.message,
              url: req.url,
              method: req.method,
              headers: Object.fromEntries(req.headers.entries())
            }
          }
        ]);
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        url: req.url,
        method: req.method,
        headers: Object.fromEntries(req.headers.entries())
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});