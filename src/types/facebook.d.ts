interface Window {
  fbq: FacebookPixelTrack;
  _fbq: any;
}

type FacebookPixelTrack = {
  (action: 'init', pixelId: string): void;
  (action: 'track', eventName: string, params?: Record<string, any>, customData?: Record<string, any>): void;
  callMethod?: Function;
  queue?: any[];
  push?: Function;
  loaded?: boolean;
  version?: string;
};

declare const fbq: FacebookPixelTrack;