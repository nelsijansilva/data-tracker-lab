import { FunnelStep } from '@/types/tracking';
import { buildEventData } from './eventBuilder';
import { sendToPixel } from './pixelSender';
import { sendToConversionsApi } from './conversionsApi';

export class TrackerCore {
  private static instance: TrackerCore;
  private pixelId: string;
  private steps: FunnelStep[];

  private constructor(pixelId: string, steps: FunnelStep[]) {
    this.pixelId = pixelId;
    this.steps = steps;
    this.initFacebookPixel();
  }

  static init(pixelId: string, steps: FunnelStep[]): TrackerCore {
    if (!TrackerCore.instance) {
      TrackerCore.instance = new TrackerCore(pixelId, steps);
    }
    return TrackerCore.instance;
  }

  private initFacebookPixel(): void {
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', this.pixelId);
    fbq('track', 'PageView');
  }

  async trackEvent(eventName: string, data: any = {}): Promise<void> {
    const eventData = await buildEventData(eventName, data);
    
    // Send to Facebook Pixel
    await sendToPixel(eventName, eventData);
    
    // Send to Conversions API
    await sendToConversionsApi(this.pixelId, eventName, eventData);
  }
}