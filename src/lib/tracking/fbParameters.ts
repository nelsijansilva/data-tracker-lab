import crypto from 'crypto';

export interface FacebookEventData {
  event_name: string;
  event_time: number;
  event_id: string;
  event_source_url: string;
  user_data: {
    client_user_agent: string;
    client_ip_address?: string;
    fbp?: string;
    fbc?: string;
    em?: string;
    ph?: string;
    ge?: string;
    db?: string;
    ln?: string;
    fn?: string;
    ct?: string;
    st?: string;
    zp?: string;
    country?: string;
    external_id?: string;
  };
  custom_data?: Record<string, any>;
  action_source: 'website' | 'app' | 'physical_store' | 'chat' | 'email' | 'other';
}

export const hashValue = (value: string): string => {
  return crypto
    .createHash('sha256')
    .update(value.toLowerCase().trim())
    .digest('hex');
};

export const generateEventId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getFacebookBrowserParameters = (): { fbp: string; fbc: string } => {
  const fbp = document.cookie
    .split('; ')
    .find(row => row.startsWith('_fbp='))
    ?.split('=')[1] || '';

  const fbc = document.cookie
    .split('; ')
    .find(row => row.startsWith('_fbc='))
    ?.split('=')[1] || '';

  return { fbp, fbc };
};

export const buildEventData = (eventName: string, userData?: Partial<FacebookEventData['user_data']>): FacebookEventData => {
  const { fbp, fbc } = getFacebookBrowserParameters();
  
  return {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: generateEventId(),
    event_source_url: window.location.href,
    action_source: 'website',
    user_data: {
      client_user_agent: navigator.userAgent,
      fbp,
      fbc,
      ...userData
    }
  };
};