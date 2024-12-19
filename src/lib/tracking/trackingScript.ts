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
  
  // If no verified CDN is found, use the Supabase Edge Function URL
  const scriptDomain = cdnDomain || 'avxgduktxkorwfmccwbs.supabase.co/functions/v1';
  const scriptPath = cdnDomain ? '/tracking/tracker.min.js' : '/serve-tracker';
  const domain = window.location.hostname;
  
  return `
<!-- Facebook Funnel Tracking Script -->
<script>
  window.pixelId = "${pixelId}";
  var script = document.createElement("script");
  script.setAttribute("async", "");
  script.setAttribute("defer", "");
  script.setAttribute("crossorigin", "anonymous");
  script.setAttribute("src", "https://${scriptDomain}${scriptPath}?domain=${domain}");
  document.head.appendChild(script);
</script>
<!-- End Facebook Funnel Tracking Script -->`;
};