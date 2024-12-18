import { FunnelStep } from '@/types/tracking';

export const generateTrackingScript = (
  pixelId: string, 
  apiToken: string, 
  steps: FunnelStep[]
): string => {
  return `
<!-- Facebook Tracking Script -->
<script>
(function() {
  // Initialize tracking
  const PIXEL_ID = '${pixelId}';
  const API_TOKEN = '${apiToken}';
  const FUNNEL_STEPS = ${JSON.stringify(steps, null, 2)};
  const API_ENDPOINT = 'https://graph.facebook.com/v17.0/' + PIXEL_ID + '/events';

  // Initialize Facebook Pixel
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');

  // Utility functions
  async function getIpAddress() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting IP:', error);
      return '';
    }
  }

  function getFacebookBrowserParams() {
    return {
      fbp: document.cookie.split('; ').find(row => row.startsWith('_fbp='))?.split('=')[1] || '',
      fbc: document.cookie.split('; ').find(row => row.startsWith('_fbc='))?.split('=')[1] || ''
    };
  }

  // Track funnel events
  async function trackFunnelEvent(stepData, eventType = 'custom') {
    const timestamp = Date.now();
    const eventId = \`\${timestamp}-\${Math.random().toString(36).substr(2, 9)}\`;
    const { fbp, fbc } = getFacebookBrowserParams();
    
    // Track with Facebook Pixel
    fbq('track', stepData.event, {
      eventID: eventId
    });

    // Prepare data for Conversions API
    const eventData = {
      data: [{
        event_name: stepData.event,
        event_time: Math.floor(timestamp / 1000),
        event_id: eventId,
        event_source_url: window.location.href,
        action_source: 'website',
        user_data: {
          client_user_agent: navigator.userAgent,
          client_ip_address: await getIpAddress(),
          fbp,
          fbc
        }
      }]
    };

    // Send to Conversions API
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${API_TOKEN}\`
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      
      console.log('Event tracked successfully:', stepData.event);
    } catch (error) {
      console.error('Error sending to Conversions API:', error);
    }
  }

  // Track page views
  function trackPageView(path) {
    const pageViewSteps = FUNNEL_STEPS.filter(s => s.triggerType === 'pageview' && s.path === path);
    pageViewSteps.forEach(step => trackFunnelEvent(step, 'pageview'));
  }

  // Set up click event listeners
  function setupClickListeners() {
    const clickSteps = FUNNEL_STEPS.filter(s => s.triggerType === 'click' && s.selector);
    clickSteps.forEach(step => {
      document.querySelectorAll(step.selector).forEach(element => {
        element.addEventListener('click', () => trackFunnelEvent(step, 'click'));
      });
    });
  }

  // Set up scroll event listeners
  function setupScrollListeners() {
    const scrollSteps = FUNNEL_STEPS.filter(s => s.triggerType === 'scroll' && s.selector);
    let scrollEvents = new Set();

    scrollSteps.forEach(step => {
      const elements = document.querySelectorAll(step.selector);
      elements.forEach(element => {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting && !scrollEvents.has(step.id)) {
                trackFunnelEvent(step, 'scroll');
                scrollEvents.add(step.id);
              }
            });
          },
          { threshold: 0.5 }
        );
        observer.observe(element);
      });
    });
  }

  // Track initial page load
  trackPageView(window.location.pathname);
  setupClickListeners();
  setupScrollListeners();

  // Track navigation changes (for SPAs)
  let lastPath = window.location.pathname;
  const observer = new MutationObserver(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      trackPageView(currentPath);
      setupClickListeners();
      setupScrollListeners();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
</script>
<noscript>
  <img height="1" width="1" style="display:none"
       src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>
</noscript>
<!-- End Facebook Tracking Script -->`;
};