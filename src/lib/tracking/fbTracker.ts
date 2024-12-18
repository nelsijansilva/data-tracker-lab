interface GeoLocation {
  country: string;
  state: string;
  city: string;
  postalCode: string;
}

interface TrackingData {
  ip: string;
  userAgent: string;
  fbp: string;
  fbc: string;
  timestamp: number;
  eventTime: number;
  eventName: string;
  eventId: string;
  location: GeoLocation;
  customParameters?: Record<string, any>;
}

// Declare the Facebook Pixel type
declare global {
  interface Window {
    fbq: (
      type: string,
      eventName: string,
      params?: Record<string, any>
    ) => void;
  }
}

class FacebookTracker {
  private pixelId: string;
  private apiToken: string;

  constructor(pixelId: string, apiToken: string) {
    this.pixelId = pixelId;
    this.apiToken = apiToken;
  }

  private async getGeoLocation(): Promise<GeoLocation> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        country: data.country_name,
        state: data.region,
        city: data.city,
        postalCode: data.postal,
      };
    } catch (error) {
      console.error('Error getting geolocation:', error);
      return {
        country: '',
        state: '',
        city: '',
        postalCode: '',
      };
    }
  }

  private getFbp(): string {
    return document.cookie.split('; ')
      .find(row => row.startsWith('_fbp='))
      ?.split('=')[1] || '';
  }

  private getFbc(): string {
    return document.cookie.split('; ')
      .find(row => row.startsWith('_fbc='))
      ?.split('=')[1] || '';
  }

  private async getIp(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting IP:', error);
      return '';
    }
  }

  private async buildTrackingData(eventName: string): Promise<TrackingData> {
    const [location, ip] = await Promise.all([
      this.getGeoLocation(),
      this.getIp(),
    ]);

    const now = Date.now();
    return {
      ip,
      userAgent: navigator.userAgent,
      fbp: this.getFbp(),
      fbc: this.getFbc(),
      timestamp: now,
      eventTime: Math.floor(now / 1000),
      eventName,
      eventId: `${now}-${Math.random().toString(36).substr(2, 9)}`,
      location,
    };
  }

  private async sendToPixel(data: TrackingData): Promise<void> {
    if (typeof window.fbq !== 'function') {
      console.error('Facebook Pixel not initialized');
      return;
    }

    window.fbq('track', data.eventName, {
      ...data.customParameters,
      country: data.location.country,
      state: data.location.state,
      city: data.location.city,
      zip: data.location.postalCode,
    });
  }

  private async sendToConversionsApi(data: TrackingData): Promise<void> {
    const endpoint = `https://graph.facebook.com/v21.0/${this.pixelId}/events`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiToken}`,
        },
        body: JSON.stringify({
          data: [{
            event_name: data.eventName,
            event_time: data.eventTime,
            event_id: data.eventId,
            user_data: {
              client_ip_address: data.ip,
              client_user_agent: data.userAgent,
              fbp: data.fbp,
              fbc: data.fbc,
            },
            custom_data: {
              ...data.customParameters,
              country: data.location.country,
              state: data.location.state,
              city: data.location.city,
              zip: data.location.postalCode,
            },
          }],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending to Conversions API:', error);
    }
  }

  public async trackEvent(eventName: string, customParameters?: Record<string, any>): Promise<void> {
    const trackingData = await this.buildTrackingData(eventName);
    trackingData.customParameters = customParameters;

    await Promise.all([
      this.sendToPixel(trackingData),
      this.sendToConversionsApi(trackingData),
    ]);

    // Store event for analytics
    this.storeEvent(trackingData);
  }

  private storeEvent(data: TrackingData): void {
    const events = JSON.parse(localStorage.getItem('fb_events') || '[]');
    events.push(data);
    localStorage.setItem('fb_events', JSON.stringify(events));
  }

  public getStoredEvents(): TrackingData[] {
    return JSON.parse(localStorage.getItem('fb_events') || '[]');
  }
}

export default FacebookTracker;