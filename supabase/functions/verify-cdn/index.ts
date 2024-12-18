import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function checkDNSPropagation(url: string) {
  try {
    // Primeiro, tentamos um HEAD request para verificar se o domínio responde
    const headResponse = await fetch(url, {
      method: 'HEAD',
      headers: {
        'Accept': '*/*',
      },
    })

    // Se o HEAD request funcionar, verificamos se temos os headers do Cloudflare
    const cfRay = headResponse.headers.get('cf-ray')
    const cfCache = headResponse.headers.get('cf-cache-status')

    // Se temos headers do Cloudflare, significa que está passando pelo CDN
    const isCloudflareEnabled = cfRay !== null || cfCache !== null

    return {
      isAccessible: true,
      statusCode: headResponse.status,
      isCloudflareEnabled,
      cfRay,
      cfCache,
    }
  } catch (error) {
    console.error('Error checking DNS propagation:', error)
    return {
      isAccessible: false,
      error: error.message,
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    console.log('Verificando configuração CDN para URL:', url)
    
    const dnsCheck = await checkDNSPropagation(url)
    console.log('Resultado da verificação:', dnsCheck)

    return new Response(
      JSON.stringify({
        isValid: dnsCheck.isAccessible && dnsCheck.isCloudflareEnabled,
        details: dnsCheck,
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
      },
    )
  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return new Response(
      JSON.stringify({
        error: 'Formato de requisição inválido',
        details: error.message,
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