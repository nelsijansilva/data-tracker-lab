import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  try {
    const { url } = await req.json()
    
    const response = await fetch(`${url}/health-check`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    return new Response(
      JSON.stringify({
        isValid: response.ok,
        status: response.status,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        isValid: false,
        error: error.message,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
})