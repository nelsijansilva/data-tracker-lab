import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  event: string;
  value: any;
  [key: string]: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verificar método HTTP
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405 
        }
      )
    }

    // Verificar token de autenticação
    const authHeader = req.headers.get('authorization')
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET')
    
    if (!authHeader || !webhookSecret || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== webhookSecret) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Processar payload
    const payload = await req.json() as WebhookPayload
    
    // Validar campos obrigatórios
    if (!payload.event || !payload.value) {
      return new Response(
        JSON.stringify({ error: 'Dados inválidos - event e value são obrigatórios' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Log do payload recebido
    console.log('Webhook recebido:', {
      timestamp: new Date().toISOString(),
      payload: payload
    })

    // Inicializar cliente Supabase com service role key para bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Armazenar o webhook em uma tabela
    const { error } = await supabase
      .from('webhook_events')
      .insert({
        event: payload.event,
        value: payload.value,
        raw_payload: payload
      })

    if (error) {
      console.error('Erro ao armazenar webhook:', error)
      return new Response(
        JSON.stringify({ error: 'Erro ao processar webhook' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Webhook processado com sucesso'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Erro no webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})