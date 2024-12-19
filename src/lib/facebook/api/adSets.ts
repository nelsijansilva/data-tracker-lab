import { fetchFacebookData, getFacebookCredentials } from './fetchFacebookData';
import type { Metric } from '@/components/facebook/MetricSelector';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

const buildInsightsFields = (metrics: Metric[], dateRange?: DateRange) => {
  const basicFields = ['name', 'status', 'objective', 'daily_budget', 'lifetime_budget', 'budget_remaining'];
  
  const insightsFields = metrics
    .filter(metric => !basicFields.includes(metric.field))
    .map(metric => metric.field);

  let fields = basicFields.join(',');
  
  if (insightsFields.length > 0 && dateRange?.from && dateRange?.to) {
    fields += `,insights.time_range({"since":"${format(dateRange.from, 'yyyy-MM-dd')}","until":"${format(dateRange.to, 'yyyy-MM-dd')}"}).fields(${insightsFields.join(',')})`;
  }
  
  return fields;
};

export const fetchAdSets = async (campaignId: string | null, selectedMetrics: Metric[], dateRange?: DateRange) => {
  try {
    const credentials = await getFacebookCredentials();
    const { account_id, access_token, app_id, app_secret } = credentials;

    const fields = buildInsightsFields(selectedMetrics, dateRange);
    let endpoint = `${account_id}/adsets?fields=${fields}`;
    
    if (campaignId) {
      endpoint += `&filtering=[{"field":"campaign.id","operator":"EQUAL","value":"${campaignId}"}]`;
    }
    
    console.log("Fetching ad sets with endpoint:", endpoint);
    
    const response = await fetchFacebookData(endpoint, { access_token, app_id, app_secret });

    if (!response.data) {
      throw new Error('Nenhum conjunto de anúncios encontrado');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error fetching ad sets:', error);
    throw error;
  }
};