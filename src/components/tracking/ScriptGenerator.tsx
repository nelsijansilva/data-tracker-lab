import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface FunnelStep {
  id: string;
  name: string;
  path: string;
  event: string;
}

interface ScriptGeneratorProps {
  pixelId: string;
  apiToken: string;
  backendUrl: string;
  steps: FunnelStep[];
}

export const ScriptGenerator = ({ pixelId, apiToken, backendUrl, steps }: ScriptGeneratorProps) => {
  const { toast } = useToast();
  const [trackingScript, setTrackingScript] = useState("");

  const generateScript = () => {
    const script = `
<!-- Facebook Tracking Script -->
<script>
(function() {
  // Initialize tracking
  const PIXEL_ID = '${pixelId}';
  const BACKEND_URL = '${backendUrl}';
  const FUNNEL_STEPS = ${JSON.stringify(steps)};

  // Initialize Facebook Pixel
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');

  // Track funnel steps
  function trackFunnelStep(path) {
    const step = FUNNEL_STEPS.find(s => s.path === path);
    if (step) {
      // Track with Facebook Pixel
      fbq('track', step.event);

      // Send to backend
      fetch(BACKEND_URL + '/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pixelId: PIXEL_ID,
          event: step.event,
          stepName: step.name,
          path: step.path,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(console.error);
    }
  }

  // Track initial page load
  trackFunnelStep(window.location.pathname);

  // Track navigation changes
  let lastPath = window.location.pathname;
  const observer = new MutationObserver(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      trackFunnelStep(currentPath);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
</script>
<noscript>
  <img height="1" width="1" style="display:none"
       src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>
</noscript>
<!-- End Facebook Tracking Script -->`;

    setTrackingScript(script);
    toast({
      title: "Script Generated",
      description: "Tracking script has been generated successfully",
    });
  };

  const copyScript = () => {
    navigator.clipboard.writeText(trackingScript);
    toast({
      title: "Script Copied",
      description: "Tracking script has been copied to clipboard",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracking Script</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={generateScript} className="w-full">
          Generate Script
        </Button>
        
        {trackingScript && (
          <>
            <Alert>
              <AlertDescription>
                Copy this script and add it to your website's &lt;head&gt; section to enable tracking.
              </AlertDescription>
            </Alert>
            <div className="relative">
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                <code>{trackingScript}</code>
              </pre>
              <Button
                onClick={copyScript}
                className="absolute top-2 right-2"
                variant="secondary"
              >
                Copy Script
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};