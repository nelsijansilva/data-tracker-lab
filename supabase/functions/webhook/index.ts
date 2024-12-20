import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TictoWebhookPayload {
  body: {
    token: string;
    status: string;
    payment_method: string;
    order: {
      hash: string;
      paid_amount: number;
      installments: number;
    };
    item: {
      product_name: string;
      product_id: number;
      offer_name: string;
      offer_id: number;
    };
    customer: {
      name: string;
      email: string;
      phone: {
        ddi: string;
        ddd: string;
        number: string;
      };
      cpf?: string;
      cnpj?: string;
    };
  };
}

function processWebhookData(payload: TictoWebhookPayload) {
  const { body } = payload;
  
  if (!body.order?.hash) {
    throw new Error('Order hash is required');
  }

  if (!body.status) {
    throw new Error('Status is required');
  }

  if (!body.payment_method) {
    throw new Error('Payment method is required');
  }

  return {
    order_hash: body.order.hash,
    status: body.status.toLowerCase(),
    payment_method: body.payment_method.toLowerCase(),
    paid_amount: body.order.paid_amount || 0,
    installments: body.order.installments || 1,
    product_name: body.item?.product_name || null,
    product_id: body.item?.product_id || null,
    offer_name: body.item?.offer_name || null,
    offer_id: body.item?.offer_id || null,
    customer_name: body.customer?.name || null,
    customer_email: body.customer?.email || null,
    customer_phone: body.customer?.phone ? 
      `${body.customer.phone.ddi}${body.customer.phone.ddd}${body.customer.phone.number}` : null,
    customer_document: body.customer?.cpf || body.customer?.cnpj || null
  };
}

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
    const url = new URL(req.url);
    const accountName = url.searchParams.get('account');
    
    if (!accountName) {
      console.error('Account name missing in query parameters');
      throw new Error('Account name is required in query parameters');
    }

    console.log('Processing webhook for account:', accountName);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the Ticto account configuration
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
    const payload = await req.json() as TictoWebhookPayload;
    console.log('Received webhook payload:', JSON.stringify(payload, null, 2));

    // Validar o token
    if (!payload.body?.token || payload.body.token !== tictoAccount.token) {
      console.error('Invalid token received:', payload.body?.token);
      throw new Error('Invalid token');
    }

    // Processar e validar os dados
    const processedData = processWebhookData(payload);
    console.log('Processed data:', processedData);

    // Inserir dados processados
    const { error: insertError } = await supabaseClient
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
    await supabaseClient
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
        order_hash: processedData.order_hash
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);

    // Log error no webhook_logs
    if (error instanceof Error) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabaseClient
        .from('webhook_logs')
        .insert([
          {
            method: req.method,
            url: req.url,
            status: 400,
            payload: { error: error.message }
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