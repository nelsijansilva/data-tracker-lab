import { useEffect, useState } from "react";
import { EventCounter } from "@/components/analytics/EventCounter";
import { EventTimeline } from "@/components/analytics/EventTimeline";
import { GeoDistribution } from "@/components/analytics/GeoDistribution";
import FacebookTracker from "@/lib/tracking/fbTracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [tracker, setTracker] = useState<FacebookTracker | null>(null);
  const [pixelId, setPixelId] = useState(() => localStorage.getItem('fb_pixel_id') || '');
  const [apiToken, setApiToken] = useState(() => localStorage.getItem('fb_api_token') || '');
  const [trackingScript, setTrackingScript] = useState('');
  const { toast } = useToast();

  const generateTrackingScript = (pixelId: string, apiToken: string) => {
    return `
<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', '${pixelId}');
fbq('track', 'PageView');

// Custom tracking script
const fbTracker = {
  pixelId: '${pixelId}',
  apiToken: '${apiToken}',
  async trackEvent(eventName, customParameters = {}) {
    // Send to Pixel
    fbq('track', eventName, customParameters);

    // Send to Conversions API
    const data = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      user_data: {
        client_ip_address: await this.getIp(),
        client_user_agent: navigator.userAgent,
        fbp: this.getFbp(),
        fbc: this.getFbc(),
      },
      custom_data: customParameters,
    };

    try {
      const response = await fetch(\`https://graph.facebook.com/v21.0/\${this.pixelId}/events\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${this.apiToken}\`,
        },
        body: JSON.stringify({ data: [data] }),
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
    } catch (error) {
      console.error('Error sending to Conversions API:', error);
    }
  },
  async getIp() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting IP:', error);
      return '';
    }
  },
  getFbp() {
    return document.cookie.split('; ')
      .find(row => row.startsWith('_fbp='))
      ?.split('=')[1] || '';
  },
  getFbc() {
    return document.cookie.split('; ')
      .find(row => row.startsWith('_fbc='))
      ?.split('=')[1] || '';
  }
};

// Example usage:
// fbTracker.trackEvent('Purchase', { currency: 'USD', value: 100 });
</script>
<noscript>
  <img height="1" width="1" style="display:none"
       src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>
</noscript>
<!-- End Facebook Pixel Code -->`;
  };

  const initializeTracker = () => {
    if (!pixelId || !apiToken) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both Pixel ID and API Token",
        variant: "destructive",
      });
      return;
    }

    // Save credentials to localStorage
    localStorage.setItem('fb_pixel_id', pixelId);
    localStorage.setItem('fb_api_token', apiToken);

    // Generate tracking script
    const script = generateTrackingScript(pixelId, apiToken);
    setTrackingScript(script);

    // Initialize Facebook Tracker
    const fbTracker = new FacebookTracker(pixelId, apiToken);
    setTracker(fbTracker);

    // Track page view
    fbTracker.trackEvent('PageView').catch((error) => {
      toast({
        title: "Tracking Error",
        description: error.message,
        variant: "destructive",
      });
    });

    // Load stored events
    const storedEvents = fbTracker.getStoredEvents();
    setEvents(storedEvents);

    toast({
      title: "Tracker Initialized",
      description: "Facebook tracking script has been generated",
    });
  };

  const copyTrackingScript = () => {
    navigator.clipboard.writeText(trackingScript);
    toast({
      title: "Script Copied",
      description: "Tracking script has been copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-gray-900">Facebook Analytics Dashboard</h1>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Facebook Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="pixelId" className="text-sm font-medium">
                  Pixel ID
                </label>
                <Input
                  id="pixelId"
                  value={pixelId}
                  onChange={(e) => setPixelId(e.target.value)}
                  placeholder="Enter your Facebook Pixel ID"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="apiToken" className="text-sm font-medium">
                  API Token
                </label>
                <Input
                  id="apiToken"
                  type="password"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="Enter your Facebook API Token"
                />
              </div>
            </div>
            <Button onClick={initializeTracker} className="w-full">
              Initialize Tracker
            </Button>
          </CardContent>
        </Card>

        {trackingScript && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Tracking Script</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Copy this script and add it to your website's &lt;head&gt; section to enable Facebook tracking.
                </AlertDescription>
              </Alert>
              <div className="relative">
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                  <code>{trackingScript}</code>
                </pre>
                <Button
                  onClick={copyTrackingScript}
                  className="absolute top-2 right-2"
                  variant="secondary"
                >
                  Copy Script
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {tracker && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <EventCounter events={events} />
              <div className="md:col-span-2">
                <EventTimeline events={events} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GeoDistribution events={events} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;