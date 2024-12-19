import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/javascript',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
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
  const domain = 'tracker.easelifeperformance.com';
  
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
      // Queue para eventos antes do carregamento do FB
      var queue = [];
      var loaded = false;

      // Função para processar a fila de eventos
      function processQueue() {
        while (queue.length > 0) {
          var args = queue.shift();
          fbq.apply(null, args);
        }
        loaded = true;
      }

      // Inicializa o objeto fbq
      window.fbq = function() {
        if (loaded) {
          fbq.apply(null, arguments);
        } else {
          queue.push(arguments);
        }
      };

      // Configuração inicial do FB Pixel
      window._fbq = window.fbq;
      window.fbq.push = window.fbq;
      window.fbq.loaded = true;
      window.fbq.version = '2.0';
      window.fbq.queue = queue;

      // Carrega o script do Facebook Pixel
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      
      // Quando o script carregar, inicializa o pixel e processa a fila
      script.onload = function() {
        window.fbq('init', '${pixelId}'${eventTestCode ? `, { external_id: '${eventTestCode}' }` : ''});
        window.fbq('track', 'PageView', {
          source: 'lovable-tracker',
          domain: '${domain}',
          timestamp: new Date().toISOString()
        });
        processQueue();
        
        // Monitora formulários para leads
        document.querySelectorAll('form').forEach(function(form) {
          form.addEventListener('submit', function(e) {
            window.fbq('track', 'Lead');
          });
        });

        // Monitora cliques em botões de compra
        document.querySelectorAll('button, a').forEach(function(el) {
          el.addEventListener('click', function(e) {
            var text = el.textContent?.toLowerCase() || '';
            if (text.includes('comprar') || text.includes('checkout') || text.includes('finalizar')) {
              window.fbq('track', 'InitiateCheckout');
            }
          });
        });

        // Monitora visualização de conteúdo
        var viewContentTracked = false;
        function trackViewContent() {
          if (!viewContentTracked && (window.scrollY > 100 || document.documentElement.scrollTop > 100)) {
            window.fbq('track', 'ViewContent');
            viewContentTracked = true;
          }
        }
        
        window.addEventListener('scroll', trackViewContent);
        setTimeout(trackViewContent, 15000);

        console.log('[FB Pixel] Initialized:', {
          pixelId: '${pixelId}',
          domain: '${domain}',
          ${eventTestCode ? `eventTestCode: '${eventTestCode}',` : ''}
          timestamp: new Date().toISOString()
        });
      };

      // Adiciona o script ao documento
      document.head.appendChild(script);

      // Adiciona o noscript fallback
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

  return new Response(script, { headers: corsHeaders });
});