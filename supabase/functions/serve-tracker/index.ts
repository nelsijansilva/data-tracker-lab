import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/javascript; charset=utf-8',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

serve(async (req) => {
  // Handle CORS preflight requests
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
        domain: url.hostname,
        url: url.toString(),
        user_agent: req.headers.get('user-agent'),
        language: req.headers.get('accept-language'),
        timestamp: new Date().toISOString()
      }]);
  } catch (error) {
    console.error('Error logging tracking request:', error);
  }

  const script = `
    !function(f,b,e,v,n,t,s) {
      if(f.fbq)return;
      n=f.fbq=function(){
        n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments)
      };
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
    }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');

    // Initialize the pixel with optional test code
    fbq('init', '${pixelId}'${eventTestCode ? `, { external_id: '${eventTestCode}' }` : ''});
    
    // Track PageView
    fbq('track', 'PageView', {
      source: 'lovable-tracker',
      timestamp: new Date().toISOString()
    });

    // Monitor form submissions for leads
    document.addEventListener('submit', function(e) {
      if (e.target.tagName === 'FORM') {
        fbq('track', 'Lead');
      }
    }, true);

    // Monitor clicks for checkout events
    document.addEventListener('click', function(e) {
      const target = e.target;
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        const text = target.textContent?.toLowerCase() || '';
        if (text.includes('comprar') || text.includes('checkout') || text.includes('finalizar')) {
          fbq('track', 'InitiateCheckout');
        }
      }
    }, true);

    // Monitor scroll for ViewContent
    let viewContentTracked = false;
    function trackViewContent() {
      if (!viewContentTracked && (window.scrollY > 100 || document.documentElement.scrollTop > 100)) {
        fbq('track', 'ViewContent');
        viewContentTracked = true;
        window.removeEventListener('scroll', trackViewContent);
      }
    }
    
    window.addEventListener('scroll', trackViewContent);
    setTimeout(trackViewContent, 15000);

    console.log('[FB Pixel] Initialized:', {
      pixelId: '${pixelId}',
      ${eventTestCode ? `eventTestCode: '${eventTestCode}',` : ''}
      timestamp: new Date().toISOString()
    });
  `;

  return new Response(script, { headers: corsHeaders });
});