type FacebookPixelTrack = {
  (action: 'init', pixelId: string): void;
  (action: 'track', eventName: string, params?: Record<string, any>): void;
  callMethod?: Function;
  queue?: any[];
  push?: Function;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq: FacebookPixelTrack;
    _fbq: any;
  }
}

export {};