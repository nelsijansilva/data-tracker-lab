import { useEffect, useState } from "react";
import { EventCounter } from "@/components/analytics/EventCounter";
import { EventTimeline } from "@/components/analytics/EventTimeline";
import { GeoDistribution } from "@/components/analytics/GeoDistribution";
import FacebookTracker from "@/lib/tracking/fbTracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [tracker, setTracker] = useState<FacebookTracker | null>(null);
  const [pixelId, setPixelId] = useState(() => localStorage.getItem('fb_pixel_id') || '');
  const [apiToken, setApiToken] = useState(() => localStorage.getItem('fb_api_token') || '');
  const { toast } = useToast();

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
      description: "Facebook tracking is now active",
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