import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, createSupabaseAdmin, processWebhookData } from './utils.ts';
import type { TictoWebhookPayload } from './types.ts';

serve(async (req) => {
  console.log('=== Webhook Request Details ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders
    });
  }

  try {
    // Parse URL and validate account parameter
    const url = new URL(req.url);
    const accountName = url.searchParams.get('account');
    console.log('Account name from URL:', accountName);
    
    if (!accountName) {
      throw new Error('Account name is required in query parameters');
    }

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

    console.log('Found Ticto account:', tictoAccount.id);

    // Parse webhook payload
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);

    let payload: TictoWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      console.error('Error parsing JSON payload:', e);
      throw new Error('Invalid JSON payload');
    }

    // Log the entire payload structure for debugging
    console.log('Received payload structure:', JSON.stringify(payload, null, 2));

    // Validate token - now checking if it exists in the body
    const receivedToken = payload.body?.token;
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

    // Insert order data first
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

    console.log('Order data saved successfully to ticto_orders table');

    // Log webhook success - but don't include the full payload to avoid recursion
    await supabaseAdmin
      .from('webhook_logs')
      .insert([
        {
          method: req.method,
          url: req.url,
          status: 200,
          payload: { 
            success: true,
            order_hash: processedData.order_hash 
          },
          ticto_account_id: tictoAccount.id
        }
      ]);

    console.log('Webhook log saved successfully');

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

    // Log error in webhook_logs - but only log the error message to avoid recursion
    if (error instanceof Error) {
      const supabaseAdmin = createSupabaseAdmin();
      
      await supabaseAdmin
        .from('webhook_logs')
        .insert([
          {
            method: req.method,
            url: req.url,
            status: 400,
            payload: { error: error.message },
            ticto_account_id: null
          }
        ]);
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});