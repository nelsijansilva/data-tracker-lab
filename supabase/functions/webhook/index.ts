import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, createSupabaseAdmin, processWebhookData } from './utils.ts';
import type { TictoWebhookPayload } from './types.ts';

serve(async (req) => {
  console.log('Received webhook request:', req.method, req.url);

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
    const payload = await req.json() as TictoWebhookPayload;
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
          payload: payload,
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
              method: req.method
            }
          }
        ]);
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        url: req.url,
        method: req.method
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});