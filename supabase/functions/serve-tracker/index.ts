import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/javascript',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders
    });
  }

  const url = new URL(req.url);
  const pixelId = url.searchParams.get('pixel_id');
  const eventTestCode = url.searchParams.get('event_test_code');
  const domain = url.searchParams.get('domain') || url.headers.get('referer') || 'unknown';
  
  if (!pixelId) {
    return new Response('Pixel ID is required', { 
      status: 400,
      headers: corsHeaders
    });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    await supabase
      .from('tracking_requests')
      .insert([{
        domain,
        url: url.toString(),
        user_agent: req.headers.get('user-agent'),
        language: req.headers.get('accept-language'),
        timestamp: new Date().toISOString()
      }]);
  } catch (error) {
    console.error('Error logging tracking request:', error);
  }

  const script = `
    (function() {
      // Create Facebook Pixel base code script
      var fbPixelScript = document.createElement('script');
      fbPixelScript.innerHTML = \`
        !function(f,b,e,v,n,t,s) {
          if(f.fbq)return;
          n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;
          n.push=n;
          n.loaded=!0;
          n.version='2.0';
          n.queue=[];
          t=b.createElement(e);
          t.async=!0;
          t.src=v;
          s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)
        }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      \`;
      document.head.appendChild(fbPixelScript);

      // Create and append the Facebook Pixel init script
      var fbInitScript = document.createElement('script');
      fbInitScript.innerHTML = \`
        fbq('init', '${pixelId}'${eventTestCode ? `, { external_id: '${eventTestCode}' }` : ''});
        fbq('track', 'PageView', {
          source: 'lovable-tracker',
          domain: '${domain}',
          timestamp: new Date().toISOString()
        });
        console.log('[FB Pixel] Initialized:', {
          pixelId: '${pixelId}',
          domain: '${domain}',
          ${eventTestCode ? `eventTestCode: '${eventTestCode}',` : ''}
          timestamp: new Date().toISOString()
        });
      \`;
      document.head.appendChild(fbInitScript);

      // Add noscript fallback
      var noscript = document.createElement('noscript');
      var img = document.createElement('img');
      img.height = 1;
      img.width = 1;
      img.style.display = 'none';
      img.src = 'https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1';
      noscript.appendChild(img);
      document.body.appendChild(noscript);
    })();
  `;

  return new Response(script, { 
    headers: {
      ...corsHeaders,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    } 
  });
});