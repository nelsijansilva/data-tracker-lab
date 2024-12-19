import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/javascript',
  'Cache-Control': 'public, max-age=14400', // 4 hours cache
};

serve(async (req) => {
  console.log('Received request:', req.url);

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
  const domain = url.searchParams.get('domain') || url.headers.get('referer') || 'unknown';
  
  console.log('Processing request:', {
    pixelId,
    eventTestCode,
    domain
  });

  if (!pixelId) {
    return new Response('Pixel ID is required', { 
      status: 400,
      headers: corsHeaders
    });
  }

  // Initialize Supabase client with anon key
  const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Log tracking request
    await supabase
      .from('tracking_requests')
      .insert([{
        domain,
        url: url.toString(),
        user_agent: req.headers.get('user-agent'),
        language: req.headers.get('accept-language'),
        timestamp: new Date().toISOString()
      }]);

    console.log('Logged tracking request for domain:', domain);
  } catch (error) {
    console.error('Error logging tracking request:', error);
    // Continue even if logging fails
  }

  const script = `
    // Initialize Facebook Pixel
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

    // Store pixel configuration
    window.pixelId = '${pixelId}';
    ${eventTestCode ? `window.eventTestCode = '${eventTestCode}';` : ''}

    // Initialize pixel with test code if available
    fbq('init', '${pixelId}'${eventTestCode ? `, {
      external_id: '${eventTestCode}'
    }` : ''});

    // Track PageView event
    fbq('track', 'PageView', {
      source: 'lovable-tracker',
      domain: '${domain}',
      timestamp: new Date().toISOString()
    });

    // Debug logging
    console.log('[FB Pixel] Initialized:', {
      pixelId: '${pixelId}',
      domain: '${domain}',
      ${eventTestCode ? `eventTestCode: '${eventTestCode}',` : ''}
      timestamp: new Date().toISOString()
    });

    // Track page changes for SPAs
    let currentPath = window.location.pathname;
    const observer = new MutationObserver(function() {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        currentPath = newPath;
        console.log("[FB Pixel] Tracking page view:", newPath);
        fbq('track', 'PageView', {
          source: 'lovable-tracker',
          path: newPath,
          title: document.title,
          domain: window.location.hostname,
          timestamp: new Date().toISOString()
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Track click events
    document.addEventListener('click', function(event) {
      const target = event.target;
      if (target && target.tagName) {
        console.log("[FB Pixel] Tracking click:", {
          element: target.tagName.toLowerCase(),
          text: target.textContent?.trim() || ''
        });
        
        fbq('trackCustom', 'Click', {
          source: 'lovable-tracker',
          element: target.tagName.toLowerCase(),
          text: target.textContent?.trim() || '',
          domain: window.location.hostname,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Add noscript fallback
    const noscript = document.createElement('noscript');
    noscript.innerHTML = '<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />';
    document.body.appendChild(noscript);
  `;

  return new Response(script, { 
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache, no-store, must-revalidate', // Disable caching for debugging
    } 
  });
});