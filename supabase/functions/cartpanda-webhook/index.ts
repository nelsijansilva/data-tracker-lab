import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function createSupabaseAdmin() {
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

serve(async (req) => {
  console.log('=== CartPanda Webhook Request Details ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    // Get the CartPanda account configuration
    const { data: cartPandaAccount, error: accountError } = await supabaseAdmin
      .from('cartpanda_accounts')
      .select('id, token')
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
    } catch (e) {
      console.error('Error parsing JSON payload:', e);
      throw new Error('Invalid JSON payload');
    }

    // Log the authorization header for debugging
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header:', authHeader);
    console.log('Expected token:', `Bearer ${cartPandaAccount.token}`);

    // Validate token from Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid Authorization header format');
    }

    const token = authHeader.replace('Bearer ', '');
    if (token !== cartPandaAccount.token) {
      console.error('Token mismatch:', { 
        received: token, 
        expected: cartPandaAccount.token 
      });
      throw new Error('Invalid token');
    }

    // Insert order data
    const { error: insertError } = await supabaseAdmin
      .from('cartpanda_orders')
      .insert([{
        cartpanda_account_id: cartPandaAccount.id,
        order_id: payload.order.id,
        cart_token: payload.cart_token,
        email: payload.email,
        phone: payload.phone,
        status: payload.order_status || 'pending',
        payment_status: payload.payment_status,
        total_amount: payload.total_amount,
        currency: payload.currency,
        customer_name: payload.customer?.name,
        customer_email: payload.customer?.email,
        customer_document: payload.customer?.cpf?.toString(),
        payment_method: payload.payment?.type,
        raw_data: payload
      }]);

    if (insertError) {
      console.error('Error inserting order:', insertError);
      throw insertError;
    }

    console.log('Order data saved successfully');

    // Log webhook success
    await supabaseAdmin
      .from('webhook_logs')
      .insert([{
        method: req.method,
        url: req.url,
        status: 200,
        payload: payload,
      }]);

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

    // Log webhook error
    const supabaseAdmin = createSupabaseAdmin();
    await supabaseAdmin
      .from('webhook_logs')
      .insert([{
        method: req.method,
        url: req.url,
        status: 400,
        payload: { error: error instanceof Error ? error.message : 'Unknown error' },
      }]);

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