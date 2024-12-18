import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    console.log('Verifying CDN configuration for URL:', url)
    
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'Accept': '*/*',
        },
      })

      console.log('CDN verification response status:', response.status)

      return new Response(
        JSON.stringify({
          isValid: response.ok,
          status: response.status,
        }),
        {
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          },
        },
      )
    } catch (error) {
      console.error('Error verifying CDN:', error)
      return new Response(
        JSON.stringify({
          isValid: false,
          error: error.message,
        }),
        {
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          },
        },
      )
    }
  } catch (error) {
    console.error('Error parsing request:', error)
    return new Response(
      JSON.stringify({
        error: 'Invalid request format',
      }),
      {
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
      },
    )
  }
})