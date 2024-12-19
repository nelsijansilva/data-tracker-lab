export const injectPixelScript = (pixelId: string, eventTestCode: string | null) => {
  // Remove any existing pixel script
  const existingScript = document.querySelector('script[data-pixel-id]');
  existingScript?.remove();

  // First, inject the Facebook base code
  const baseCode = `
    !function(f,b,e,v,n,t,s) {
      if(f.fbq)return;
      n=f.fbq=function(){n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;
      n.push=n;
      n.loaded=!0;
      n.version='2.0';
      n.queue=[];
      t=b.createElement(e);
      t.async=!0;
      t.src=v;
      s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)
    }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
  `;

  // Create and inject the base code script
  const baseScript = document.createElement('script');
  baseScript.textContent = baseCode;
  document.head.appendChild(baseScript);

  // Create the pixel initialization script
  const pixelScript = document.createElement('script');
  pixelScript.setAttribute('data-pixel-id', pixelId);
  
  const pixelCode = `
    fbq('init', '${pixelId}'${eventTestCode ? `, { external_id: '${eventTestCode}' }` : ''});
    fbq('track', 'PageView', {
      source: 'lovable-tracker',
      timestamp: new Date().toISOString()
    });

    // Monitor form submissions for leads
    document.addEventListener('submit', function(e) {
      if (e.target.tagName === 'FORM') {
        fbq('track', 'Lead');
      }
    }, true);

    // Monitor clicks for checkout events
    document.addEventListener('click', function(e) {
      const target = e.target;
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        const text = target.textContent?.toLowerCase() || '';
        if (text.includes('comprar') || text.includes('checkout') || text.includes('finalizar')) {
          fbq('track', 'InitiateCheckout');
        }
      }
    }, true);

    // Monitor scroll for ViewContent
    let viewContentTracked = false;
    function trackViewContent() {
      if (!viewContentTracked && (window.scrollY > 100 || document.documentElement.scrollTop > 100)) {
        fbq('track', 'ViewContent');
        viewContentTracked = true;
        window.removeEventListener('scroll', trackViewContent);
      }
    }
    
    window.addEventListener('scroll', trackViewContent);
    setTimeout(trackViewContent, 15000);

    console.log('[FB Pixel] Initialized:', {
      pixelId: '${pixelId}',
      ${eventTestCode ? `eventTestCode: '${eventTestCode}',` : ''}
      timestamp: new Date().toISOString()
    });
  `;

  pixelScript.textContent = pixelCode;

  // Add a small delay to ensure base code is loaded
  setTimeout(() => {
    document.head.appendChild(pixelScript);
  }, 100);

  // Also add the noscript fallback
  const noscript = document.createElement('noscript');
  const img = document.createElement('img');
  img.height = 1;
  img.width = 1;
  img.style.display = 'none';
  img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
  noscript.appendChild(img);
  document.body.appendChild(noscript);

  return baseScript.outerHTML + pixelScript.outerHTML;
};