import { serve } from 'https://deno.fresh.dev/std@v9.6.1/http/server.ts';
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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Log request details
    const method = req.method;
    const url = req.url;
    let payload = null;

    try {
      payload = await req.json();
    } catch (e) {
      console.error('Error parsing payload:', e);
    }

    // Insert log into webhook_logs table
    const { data, error } = await supabaseClient
      .from('webhook_logs')
      .insert([
        {
          method,
          url,
          status: 200,
          payload
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error logging webhook:', error);
      throw error;
    }

    console.log('Webhook logged successfully:', data);

    // Return success response
    return new Response(
      JSON.stringify({ message: 'Webhook received and logged successfully' }),
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