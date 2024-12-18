import { supabase } from "@/integrations/supabase/client";

const getVerifiedCDN = async (): Promise<string | null> => {
  const { data, error } = await supabase
    .from('cdn_configurations')
    .select('subdomain')
    .eq('status', 'verified')
    .limit(1)
    .single();
  
  if (error || !data) return null;
  return data.subdomain;
};

export const generateCDNScript = async (pixelId: string): Promise<string> => {
  const cdnDomain = await getVerifiedCDN();
  
  // Se não houver CDN verificado, use o domínio atual
  const scriptDomain = cdnDomain || window.location.hostname;
  
  // Gera o script de inicialização que será incluído no site do cliente
  return `
<!-- Facebook Funnel Tracking Script -->
<script>
  (function() {
    window.fbTrackingConfig = {
      pixelId: "${pixelId}",
      version: "1.0.0"
    };

    // Função para carregar o script principal
    function loadTracker() {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.defer = true;
      script.onerror = function() {
        console.error('Failed to load tracking script from CDN, falling back to direct pixel');
        // Inicializa o pixel do Facebook diretamente em caso de falha
        !function(f,b,e,v,n,t,s) {
          if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', "${pixelId}");
          fbq('track', 'PageView');
      };
      script.src = 'https://${scriptDomain}/tracking/tracker.min.js';
      document.head.appendChild(script);
    }

    // Carrega o script quando o DOM estiver pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadTracker);
    } else {
      loadTracker();
    }
  })();
</script>
<!-- End Facebook Funnel Tracking Script -->`;
};