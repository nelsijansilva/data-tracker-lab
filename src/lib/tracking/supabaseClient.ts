import { supabase } from "@/integrations/supabase/client";
import type { FunnelStep, Funnel, PixelConfiguration } from "@/types/tracking";

export const savePixelConfiguration = async (pixelId: string, apiToken: string) => {
  // First, let's get all existing configurations
  const { data: existingConfigs, error: fetchError } = await supabase
    .from('pixel_configurations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (fetchError) throw fetchError;

  const existingConfig = existingConfigs?.[0];

  if (existingConfig) {
    // If exists, update
    const { data, error } = await supabase
      .from('pixel_configurations')
      .update({ pixel_id: pixelId, api_token: apiToken })
      .eq('id', existingConfig.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // If doesn't exist, create new
    const { data, error } = await supabase
      .from('pixel_configurations')
      .insert([{ pixel_id: pixelId, api_token: apiToken }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const getPixelConfiguration = async () => {
  const { data, error } = await supabase
    .from('pixel_configurations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  
  return data ? {
    id: data.id,
    pixelId: data.pixel_id,
    apiToken: data.api_token
  } : null;
};

export const saveFunnel = async (name: string, steps: Omit<FunnelStep, 'id'>[]) => {
  const { data: funnel, error: funnelError } = await supabase
    .from('funnels')
    .insert([{ name }])
    .select()
    .single();

  if (funnelError) throw funnelError;

  const stepsWithFunnelId = steps.map((step, index) => ({
    funnel_id: funnel.id,
    name: step.name,
    path: step.path,
    event: step.event,
    selector: step.selector,
    trigger_type: step.triggerType,
    order_position: index + 1
  }));

  const { data: stepsData, error: stepsError } = await supabase
    .from('funnel_steps')
    .insert(stepsWithFunnelId)
    .select();

  if (stepsError) throw stepsError;

  return {
    ...funnel,
    steps: stepsData
  };
};

export const getFunnels = async () => {
  const { data: funnels, error: funnelsError } = await supabase
    .from('funnels')
    .select('*');

  if (funnelsError) throw funnelsError;

  const { data: steps, error: stepsError } = await supabase
    .from('funnel_steps')
    .select('*');

  if (stepsError) throw stepsError;

  return funnels.map(funnel => ({
    ...funnel,
    steps: steps
      .filter(step => step.funnel_id === funnel.id)
      .map(step => ({
        id: step.id,
        name: step.name,
        path: step.path,
        event: step.event,
        selector: step.selector,
        triggerType: step.trigger_type,
        orderPosition: step.order_position
      }))
      .sort((a, b) => a.orderPosition - b.orderPosition)
  }));
};