import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const accountName = url.searchParams.get('account');
    
    if (!accountName) {
      throw new Error('Account name is required');
    }

    console.log('Processing webhook for account:', accountName);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the Ticto account
    const { data: tictoAccount, error: accountError } = await supabaseClient
      .from('ticto_accounts')
      .select('id, token')
      .eq('account_name', accountName)
      .single();

    if (accountError || !tictoAccount) {
      console.error('Error finding Ticto account:', accountError);
      throw new Error('Ticto account not found');
    }

    // Parse webhook payload
    const payload = await req.json();
    console.log('Received webhook payload:', payload);

    // Validate token if provided in the payload
    if (payload.body?.token !== tictoAccount.token) {
      console.error('Invalid token received');
      throw new Error('Invalid token');
    }

    // Extract order data
    const orderData = {
      ticto_account_id: tictoAccount.id,
      order_hash: payload.body.order.hash,
      status: payload.body.status,
      payment_method: payload.body.payment_method,
      paid_amount: payload.body.order.paid_amount,
      installments: payload.body.order.installments,
      product_name: payload.body.item.product_name,
      product_id: payload.body.item.product_id,
      offer_name: payload.body.item.offer_name,
      offer_id: payload.body.item.offer_id,
      customer_name: payload.body.customer.name,
      customer_email: payload.body.customer.email,
      customer_phone: `${payload.body.customer.phone.ddi}${payload.body.customer.phone.ddd}${payload.body.customer.phone.number}`,
      customer_document: payload.body.customer.cpf || payload.body.customer.cnpj
    };

    // Insert order data
    const { error: insertError } = await supabaseClient
      .from('ticto_orders')
      .insert([orderData]);

    if (insertError) {
      console.error('Error inserting order:', insertError);
      throw insertError;
    }

    // Log webhook
    const { error: logError } = await supabaseClient
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

    if (logError) {
      console.error('Error logging webhook:', logError);
    }

    // Return success response
    return new Response(
      JSON.stringify({ message: 'Webhook processed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});