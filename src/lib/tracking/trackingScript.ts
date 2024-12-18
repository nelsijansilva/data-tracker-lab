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
  const scriptDomain = cdnDomain || window.location.hostname;
  
  return `
<!-- Facebook Funnel Tracking Script -->
<script>
  window.pixelId = "${pixelId}";
  var script = document.createElement("script");
  script.setAttribute("async", "");
  script.setAttribute("defer", "");
  script.setAttribute("src", "https://${scriptDomain}/tracking/tracker.min.js");
  document.head.appendChild(script);
</script>
<!-- End Facebook Funnel Tracking Script -->`;
};