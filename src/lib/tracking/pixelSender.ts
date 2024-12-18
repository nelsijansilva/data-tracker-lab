export const sendToPixel = async (eventName: string, eventData: any): Promise<void> => {
  if (typeof window.fbq !== 'function') {
    console.error('Facebook Pixel not initialized');
    return;
  }

  window.fbq('track', eventName, eventData);
};