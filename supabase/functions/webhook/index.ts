import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-source',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405 
        }
      )
    }

    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing authorization header',
          message: 'Please include the Authorization header with format: Bearer YOUR_WEBHOOK_SECRET'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Extract the token
    const token = authHeader.replace('Bearer ', '')
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET')

    // Validate webhook secret
    if (!webhookSecret || token !== webhookSecret) {
      console.error('Invalid webhook secret provided:', token)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid webhook secret',
          message: 'The provided webhook secret is invalid'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    const payload = await req.json()
    const headers = Object.fromEntries(req.headers.entries())

    console.log('Received webhook:', {
      source: headers['x-webhook-source'],
      payload: payload
    })

    // Initialize Supabase client with service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store the webhook data
    const { error } = await supabase
      .from('webhook_logs')
      .insert({
        payload,
        headers,
        source: headers['x-webhook-source'] || 'unknown',
        status: 'received'
      })

    if (error) {
      console.error('Error storing webhook:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to store webhook data' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})