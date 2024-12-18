import { getFacebookBrowserParameters } from './fbParameters';

export const buildEventData = async (eventName: string, customData = {}) => {
  const { fbp, fbc } = getFacebookBrowserParameters();
  
  const baseData = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: window.location.href,
    user_data: {
      client_user_agent: navigator.userAgent,
      fbp,
      fbc,
    },
    custom_data: customData
  };

  try {
    const [ipResponse, geoResponse] = await Promise.all([
      fetch('https://api.ipify.org?format=json'),
      fetch('https://ipapi.co/json/')
    ]);

    const [ipData, geoData] = await Promise.all([
      ipResponse.json(),
      geoResponse.json()
    ]);

    return {
      ...baseData,
      user_data: {
        ...baseData.user_data,
        client_ip_address: ipData.ip,
      },
      custom_data: {
        ...baseData.custom_data,
        country: geoData.country,
        city: geoData.city,
        state: geoData.region,
        zip: geoData.postal
      }
    };
  } catch (error) {
    console.error('Error fetching IP or geo data:', error);
    return baseData;
  }
};