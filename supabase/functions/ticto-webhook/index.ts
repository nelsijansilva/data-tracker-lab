import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TictoWebhookPayload {
  version: string;
  commission_type: string;
  status: string;
  status_date: string;
  token: string;
  payment_method: string;
  order: {
    id: number;
    hash: string;
    transaction_hash: string;
    paid_amount: number;
    installments: number;
    order_date: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Garantir que apenas requisições POST sejam aceitas
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ 
        error: 'Method not allowed. Only POST requests are accepted.',
        method: req.method 
      }), 
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Get the integration_id from query params
    const url = new URL(req.url)
    const integrationId = url.searchParams.get('integration_id')
    const token = url.searchParams.get('token')

    if (!integrationId) {
      throw new Error('Integration ID is required')
    }

    if (!token) {
      throw new Error('Token is required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify if the integration exists and is active
    const { data: integration, error: integrationError } = await supabaseClient
      .from('platform_integrations')
      .select('*')
      .eq('id', integrationId)
      .single()

    if (integrationError || !integration) {
      throw new Error('Integration not found')
    }

    if (!integration.is_active) {
      throw new Error('Integration is not active')
    }

    // Verify webhook token
    if (token !== integration.webhook_token) {
      throw new Error('Invalid webhook token')
    }

    // Read the webhook payload
    const payload: TictoWebhookPayload = await req.json()

    // Save the webhook event
    const { data: webhookEvent, error: webhookError } = await supabaseClient
      .from('webhook_events')
      .insert([
        {
          integration_id: integrationId,
          event_type: payload.status,
          payload: payload,
        }
      ])
      .select()
      .single()

    if (webhookError) {
      throw webhookError
    }

    console.log(`Webhook processed successfully: ${webhookEvent.id}`)

    return new Response(
      JSON.stringify({ success: true, event_id: webhookEvent.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})