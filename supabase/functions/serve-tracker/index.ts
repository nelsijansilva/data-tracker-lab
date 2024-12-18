import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, Origin',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/javascript',
  'Cache-Control': 'public, max-age=14400', // 4 hours cache
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless'
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

  console.log('Serving tracker script');

  // Get domain from request
  const url = new URL(req.url);
  const domain = url.searchParams.get('domain') || url.headers.get('referer') || 'unknown';

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Log tracking request
    await supabase
      .from('tracking_requests')
      .insert([{ domain, timestamp: new Date().toISOString() }]);

    console.log('Logged tracking request for domain:', domain);
  } catch (error) {
    console.error('Error logging tracking request:', error);
  }

  const script = `
    !function(){
      var e=window.pixelId;
      if(!e) {
        console.error("Facebook Pixel ID not found");
        return;
      }

      // Initialize Facebook Pixel
      !function(f,b,e,v,n,t,s) {
        if(f.fbq)return;
        n=f.fbq=function(){
          n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)
        };
        if(!f._fbq)f._fbq=n;
        n.push=n;
        n.loaded=!0;
        n.version='2.0';
        n.queue=[];
        t=b.createElement(e);
        t.async=!0;
        t.crossOrigin="anonymous";
        t.src=v;
        s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)
      }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

      // Initialize pixel with ID
      fbq('init', e);
      fbq('track', 'PageView', {
        domain: '${domain}',
        timestamp: new Date().toISOString()
      });

      // Track page changes
      var currentPath = window.location.pathname;
      var observer = new MutationObserver(function() {
        var newPath = window.location.pathname;
        if (newPath !== currentPath) {
          currentPath = newPath;
          fbq('trackCustom', 'PageView', {
            path: newPath,
            title: document.title,
            domain: window.location.hostname
          });
        }
      });

      // Start observing DOM changes
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Track clicks
      document.addEventListener('click', function(event) {
        var target = event.target;
        if (target && target.tagName) {
          fbq('trackCustom', 'Click', {
            element: target.tagName.toLowerCase(),
            path: window.location.pathname,
            text: target.textContent?.trim() || '',
            domain: window.location.hostname
          });
        }
      });

      console.log('[FB Tracker] Initialized successfully for domain:', '${domain}');
    }();
  `;

  return new Response(script, {
    headers: corsHeaders
  });
});