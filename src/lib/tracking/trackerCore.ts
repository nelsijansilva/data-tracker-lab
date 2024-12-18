import { buildEventData } from './eventBuilder';
import { sendToPixel } from './pixelSender';
import { sendToConversionsApi } from './conversionsApi';

// Use the existing type from facebook.d.ts
import type { FacebookPixelTrack } from '@/types/facebook';

declare global {
  interface Window {
    fbq: FacebookPixelTrack;
    _fbq: any;
  }
}

export class TrackerCore {
  private static instance: TrackerCore;
  private pixelId: string;
  private steps: any[];

  private constructor(pixelId: string, steps: any[]) {
    this.pixelId = pixelId;
    this.steps = steps;
    this.initFacebookPixel();
  }

  static init(pixelId: string, steps: any[]): TrackerCore {
    if (!TrackerCore.instance) {
      TrackerCore.instance = new TrackerCore(pixelId, steps);
    }
    return TrackerCore.instance;
  }

  private initFacebookPixel(): void {
    // Initialize Facebook Pixel
    if (typeof window.fbq === 'undefined') {
      ((f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) => {
        if (f.fbq) return;
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = true;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(
        window,
        document,
        'script',
        'https://connect.facebook.net/en_US/fbevents.js'
      );

      // Initialize pixel after ensuring fbq is defined
      window.fbq('init', this.pixelId);
      window.fbq('track', 'PageView');
    }
  }

  async trackEvent(eventName: string, data: any = {}): Promise<void> {
    const eventData = await buildEventData(eventName, data);
    
    // Send to Facebook Pixel
    await sendToPixel(eventName, eventData);
    
    // Send to Conversions API
    await sendToConversionsApi(this.pixelId, eventName, eventData);
  }
}