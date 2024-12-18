export const sendToPixel = async (eventName: string, eventData: any): Promise<void> => {
  if (typeof fbq !== 'function') {
    console.error('Facebook Pixel not initialized');
    return;
  }

  fbq('track', eventName, eventData);
};