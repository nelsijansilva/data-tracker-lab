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
  // ... outros campos conforme necessário
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Obter o token da URL
    const url = new URL(req.url)
    const integrationId = url.searchParams.get('integration_id')

    if (!integrationId) {
      throw new Error('Integration ID is required')
    }

    // Verificar se a integração existe e está ativa
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

    // Ler o payload do webhook
    const payload: TictoWebhookPayload = await req.json()

    // Verificar o token do webhook
    if (payload.token !== integration.webhook_token) {
      throw new Error('Invalid webhook token')
    }

    // Salvar o evento do webhook
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

    console.log(`Webhook processado com sucesso: ${webhookEvent.id}`)

    return new Response(
      JSON.stringify({ success: true, event_id: webhookEvent.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})