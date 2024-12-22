import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { processWebhookData, validateWebhookUrl, corsHeaders, createSupabaseAdmin } from './utils.ts'

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const supabaseAdmin = createSupabaseAdmin();

    // Parse URL and validate account parameter
    const url = new URL(req.url);
    const accountName = url.searchParams.get('account');
    console.log('Account name from URL:', accountName);
    
    if (!accountName) {
      throw new Error('Account name is required in query parameters');
    }

    // Get the CartPanda account configuration
    const { data: cartPandaAccount, error: accountError } = await supabaseAdmin
      .from('cartpanda_accounts')
      .select('id, token, webhook_url')
      .eq('account_name', accountName)
      .single();

    if (accountError || !cartPandaAccount) {
      console.error('Error finding CartPanda account:', accountError);
      throw new Error(`CartPanda account not found for account name: ${accountName}`);
    }

    console.log('Found CartPanda account:', cartPandaAccount.id);

    // Parse webhook payload
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);

    let payload;
    try {
      payload = JSON.parse(rawBody);
      // If it's an array, get the first item
      if (Array.isArray(payload)) {
        payload = payload[0];
      }
    } catch (e) {
      console.error('Error parsing JSON payload:', e);
      throw new Error('Invalid JSON payload');
    }

    // Validate token
    const receivedToken = payload.token;
    const storedToken = cartPandaAccount.token;
    
    console.log('Token validation:');
    console.log('- Received token:', receivedToken);
    console.log('- Stored token:', storedToken);

    if (!receivedToken || receivedToken !== storedToken) {
      throw new Error('Invalid token');
    }

    // Validate and format webhook URL
    if (cartPandaAccount.webhook_url) {
      cartPandaAccount.webhook_url = validateWebhookUrl(cartPandaAccount.webhook_url);
    }

    // Process webhook data
    const orderData = processWebhookData(payload);

    // Insert order data
    const { error: insertError } = await supabaseAdmin
      .from('cartpanda_orders')
      .insert([{
        cartpanda_account_id: cartPandaAccount.id,
        ...orderData,
        raw_data: payload
      }]);

    if (insertError) {
      console.error('Error inserting order:', insertError);
      throw insertError;
    }

    console.log('Order data saved successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Webhook processed successfully',
        order_id: orderData.order_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error instanceof Error && error.message.includes('not found') ? 404 : 400,
      }
    );
  }
});