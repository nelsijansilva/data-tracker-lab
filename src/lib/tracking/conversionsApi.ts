export const sendToConversionsApi = async (
  pixelId: string,
  eventName: string,
  eventData: any
): Promise<void> => {
  const endpoint = `https://graph.facebook.com/v17.0/${pixelId}/events`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [
          {
            ...eventData,
            event_name: eventName,
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending to Conversions API:', error);
  }
};