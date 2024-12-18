declare global {
  interface Window {
    fbq: (type: string, eventName: string, params?: Record<string, any>) => void;
  }
}

export const initializePixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;

  // Initialize Facebook Pixel
  !(function(f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
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
  if (window.fbq) {
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }
};

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  window.fbq('track', eventName, parameters);
};