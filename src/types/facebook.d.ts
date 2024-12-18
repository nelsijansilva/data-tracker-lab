interface Window {
  fbq: any;
  _fbq: any;
}

declare function fbq(
  action: string,
  eventName: string,
  params?: Record<string, any>,
  customData?: Record<string, any>
): void;