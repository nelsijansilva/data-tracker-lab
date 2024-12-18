export interface FunnelStep {
  id: string;
  name: string;
  path: string;
  event: string;
  selector?: string;
  triggerType: 'pageview' | 'click' | 'scroll';
}

export interface Funnel {
  id: string;
  name: string;
  steps: FunnelStep[];
}