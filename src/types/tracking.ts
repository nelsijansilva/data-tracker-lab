export interface FunnelStep {
  id: string;
  name: string;
  path: string;
  event: string;
  selector?: string;
  triggerType: 'pageview' | 'click' | 'scroll';
  orderPosition: number;
}

export interface Funnel {
  id: string;
  name: string;
  steps: FunnelStep[];
}

export interface CDNConfig {
  id: string;
  subdomain: string;
  status: string;
}