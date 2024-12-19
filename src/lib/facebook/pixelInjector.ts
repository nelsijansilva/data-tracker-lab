export const injectPixelScript = (pixelId: string, eventTestCode: string | null) => {
  // Remove any existing pixel script
  const existingScript = document.querySelector('script[data-pixel-id]');
  existingScript?.remove();

  // Create the script element
  const script = document.createElement('script');
  script.setAttribute('data-pixel-id', pixelId);
  script.async = true;
  script.defer = true;
  script.src = `https://avxgduktxkorwfmccwbs.supabase.co/functions/v1/serve-tracker?pixel_id=${pixelId}${
    eventTestCode ? `&event_test_code=${eventTestCode}` : ''
  }`;

  // Append to document head
  document.head.appendChild(script);

  return script.outerHTML;
};