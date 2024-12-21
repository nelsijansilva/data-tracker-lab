import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, createSupabaseAdmin, logWebhookRequest } from './utils.ts';

serve(async (req) => {
  console.log('=== CartPanda Webhook Request Details ===');
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
        cartpandaAccountId: null
      });
      throw error;
    }

    // Get the CartPanda account configuration
    const { data: cartPandaAccount, error: accountError } = await supabaseAdmin
      .from('cartpanda_accounts')
      .select('id, token')
      .eq('account_name', accountName)
      .single();

    if (accountError || !cartPandaAccount) {
      console.error('Error finding CartPanda account:', accountError);
      const error = new Error(`CartPanda account not found for account name: ${accountName}`);
      await logWebhookRequest(supabaseAdmin, {
        method: req.method,
        url: req.url,
        status: 404,
        headers: Object.fromEntries(req.headers.entries()),
        payload: { error: error.message },
        cartpandaAccountId: null
      });
      throw error;
    }

    console.log('Found CartPanda account:', cartPandaAccount.id);

    // Parse webhook payload
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);

    let payload;
    try {
      payload = JSON.parse(rawBody);
      // Se for um array, pega o primeiro item
      if (Array.isArray(payload)) {
        payload = payload[0];
      }
    } catch (e) {
      console.error('Error parsing JSON payload:', e);
      const error = new Error('Invalid JSON payload');
      await logWebhookRequest(supabaseAdmin, {
        method: req.method,
        url: req.url,
        status: 400,
        headers: Object.fromEntries(req.headers.entries()),
        payload: { error: error.message, rawBody },
        cartpandaAccountId: cartPandaAccount.id
      });
      throw error;
    }

    // Validate token from Authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header received:', authHeader ? 'Present' : 'Missing');

    if (!authHeader) {
      const error = new Error('Authorization header is missing');
      await logWebhookRequest(supabaseAdmin, {
        method: req.method,
        url: req.url,
        status: 401,
        headers: Object.fromEntries(req.headers.entries()),
        payload: { error: error.message, ...payload },
        cartpandaAccountId: cartPandaAccount.id
      });
      throw error;
    }

    if (!authHeader.startsWith('Bearer ')) {
      const error = new Error('Invalid Authorization header format. Must start with "Bearer "');
      await logWebhookRequest(supabaseAdmin, {
        method: req.method,
        url: req.url,
        status: 401,
        headers: Object.fromEntries(req.headers.entries()),
        payload: { error: error.message, ...payload },
        cartpandaAccountId: cartPandaAccount.id
      });
      throw error;
    }

    const token = authHeader.replace('Bearer ', '');
    if (token !== cartPandaAccount.token) {
      const error = new Error('Invalid token');
      await logWebhookRequest(supabaseAdmin, {
        method: req.method,
        url: req.url,
        status: 401,
        headers: Object.fromEntries(req.headers.entries()),
        payload: { error: error.message, ...payload },
        cartpandaAccountId: cartPandaAccount.id
      });
      throw error;
    }

    console.log('Token validation successful');

    const orderData = payload.body?.order;
    if (!orderData) {
      throw new Error('Order data is missing in payload');
    }

    // Insert order data
    const { error: insertError } = await supabaseAdmin
      .from('cartpanda_orders')
      .insert([{
        cartpanda_account_id: cartPandaAccount.id,
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
      cartpandaAccountId: cartPandaAccount.id
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Webhook processed successfully'
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