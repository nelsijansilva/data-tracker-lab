import { FunnelStep } from '@/types/tracking';

export const generateTrackingScript = (
  pixelId: string, 
  apiToken: string, 
  steps: FunnelStep[]
): string => {
  const funnelConfig = {
    pixelId,
    steps
  };
  
  // Create a minified version of the configuration
  const configString = JSON.stringify(funnelConfig);
  
  return `
<!-- Facebook Funnel Tracking Script -->
<script>
(function() {
  // Load the tracking script
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/gh/your-org/fb-funnel-tracker@latest/dist/tracker.min.js';
  script.async = true;
  
  // Initialize tracker with configuration
  script.onload = function() {
    window.FBFunnelTracker.init(${configString});
  };
  
  // Add script to page
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode.insertBefore(script, firstScript);
})();
</script>
<!-- End Facebook Funnel Tracking Script -->`;
};

export const generateTrackerScript = (steps: FunnelStep[]): string => {
  return `
class FBFunnelTracker {
  static init(config) {
    this.pixelId = config.pixelId;
    this.steps = config.steps;
    this.setupTracking();
  }

  static setupTracking() {
    // Initialize Facebook Pixel
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

    this.setupEventListeners();
  }

  static setupEventListeners() {
    // Track page views
    this.trackPageView(window.location.pathname);

    // Set up click tracking
    this.setupClickTracking();

    // Set up scroll tracking
    this.setupScrollTracking();

    // Track SPA navigation
    this.setupNavigationTracking();
  }

  static async trackEvent(step, eventType = 'custom') {
    const eventData = await this.buildEventData(step.event);
    
    // Track with Facebook Pixel
    fbq('track', step.event, eventData);

    // Track with Conversions API
    await this.sendToConversionsApi(step.event, eventData);
  }

  static async buildEventData(eventName) {
    const [ipData, geoData] = await Promise.all([
      fetch('https://api.ipify.org?format=json').then(r => r.json()),
      fetch('https://ipapi.co/json/').then(r => r.json())
    ]);

    return {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: \`\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,
      user_data: {
        client_ip_address: ipData.ip,
        client_user_agent: navigator.userAgent,
        fbp: this.getFbp(),
        fbc: this.getFbc()
      },
      custom_data: {
        country: geoData.country,
        city: geoData.city,
        state: geoData.region,
        zip: geoData.postal
      }
    };
  }

  static getFbp() {
    return document.cookie.split('; ')
      .find(row => row.startsWith('_fbp='))
      ?.split('=')[1] || '';
  }

  static getFbc() {
    return document.cookie.split('; ')
      .find(row => row.startsWith('_fbc='))
      ?.split('=')[1] || '';
  }

  static async sendToConversionsApi(eventName, eventData) {
    const endpoint = \`https://graph.facebook.com/v17.0/\${this.pixelId}/events\`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${this.apiToken}\`
        },
        body: JSON.stringify({
          data: [eventData]
        })
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
    } catch (error) {
      console.error('Error sending to Conversions API:', error);
    }
  }

  static trackPageView(path) {
    const pageViewSteps = this.steps.filter(s => 
      s.triggerType === 'pageview' && s.path === path
    );
    pageViewSteps.forEach(step => this.trackEvent(step, 'pageview'));
  }

  static setupClickTracking() {
    const clickSteps = this.steps.filter(s => s.triggerType === 'click');
    clickSteps.forEach(step => {
      document.querySelectorAll(step.selector).forEach(element => {
        element.addEventListener('click', () => this.trackEvent(step, 'click'));
      });
    });
  }

  static setupScrollTracking() {
    const scrollSteps = this.steps.filter(s => s.triggerType === 'scroll');
    const observedElements = new Set();

    scrollSteps.forEach(step => {
      const elements = document.querySelectorAll(step.selector);
      elements.forEach(element => {
        if (!observedElements.has(element)) {
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  this.trackEvent(step, 'scroll');
                  observer.unobserve(entry.target);
                }
              });
            },
            { threshold: 0.5 }
          );
          observer.observe(element);
          observedElements.add(element);
        }
      });
    });
  }

  static setupNavigationTracking() {
    let lastPath = window.location.pathname;
    const observer = new MutationObserver(() => {
      const currentPath = window.location.pathname;
      if (currentPath !== lastPath) {
        lastPath = currentPath;
        this.trackPageView(currentPath);
        this.setupClickTracking();
        this.setupScrollTracking();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
}

// Make FBFunnelTracker available globally
window.FBFunnelTracker = FBFunnelTracker;
`;
};