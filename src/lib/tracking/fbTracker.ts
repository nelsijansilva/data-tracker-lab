interface TrackingEvent {
  eventName: string;
  parameters?: Record<string, any>;
}

declare global {
  interface Window {
    fbq: (type: string, eventName: string, params?: Record<string, any>) => void;
  }
}

export class FacebookTracker {
  private pixelId: string;

  constructor(pixelId: string) {
    this.pixelId = pixelId;
    this.initializeFacebookPixel();
  }

  private initializeFacebookPixel(): void {
    // Initialize Facebook Pixel
    (function(f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      'script',
      'https://connect.facebook.net/en_US/fbevents.js',
      undefined,
      undefined,
      undefined
    );

    // Initialize the pixel with the provided ID
    window.fbq('init', this.pixelId);
    window.fbq('track', 'PageView');
  }

  public trackEvent(eventName: string, parameters?: Record<string, any>): void {
    if (typeof window.fbq !== 'function') {
      console.error('Facebook Pixel not initialized');
      return;
    }

    window.fbq('track', eventName, parameters);
    console.log('Tracked event:', eventName, parameters);
  }

  public trackPageView(): void {
    this.trackEvent('PageView', {
      path: window.location.pathname,
      title: document.title
    });
  }
}

export const initializeTracker = (pixelId: string): FacebookTracker => {
  return new FacebookTracker(pixelId);
};