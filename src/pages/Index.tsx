import { useEffect, useState } from "react";
import { EventCounter } from "@/components/analytics/EventCounter";
import { EventTimeline } from "@/components/analytics/EventTimeline";
import { GeoDistribution } from "@/components/analytics/GeoDistribution";
import FacebookTracker from "@/lib/tracking/fbTracker";

const Index = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [tracker, setTracker] = useState<FacebookTracker | null>(null);

  useEffect(() => {
    // Initialize Facebook Tracker
    // Note: Replace with your actual Pixel ID and API Token
    const fbTracker = new FacebookTracker('YOUR_PIXEL_ID', 'YOUR_API_TOKEN');
    setTracker(fbTracker);

    // Track page view
    fbTracker.trackEvent('PageView');

    // Load stored events
    const storedEvents = fbTracker.getStoredEvents();
    setEvents(storedEvents);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-gray-900">Facebook Analytics Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EventCounter events={events} />
          <div className="md:col-span-2">
            <EventTimeline events={events} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GeoDistribution events={events} />
        </div>
      </div>
    </div>
  );
};

export default Index;