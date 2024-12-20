import { CustomMetricsTable, SelectedMetricsTable } from './metrics';
import {
  FacebookAdAccountsTable,
  FacebookAdSetsTable,
  FacebookAdsTable,
  FacebookCampaignsTable
} from './facebook';
import { ProfilesTable } from './profiles';
import { TrackingRequestsTable } from './tracking';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      custom_metrics: CustomMetricsTable
      facebook_ad_accounts: FacebookAdAccountsTable
      facebook_ad_sets: FacebookAdSetsTable
      facebook_ads: FacebookAdsTable
      facebook_campaigns: FacebookCampaignsTable
      profiles: ProfilesTable
      selected_metrics: SelectedMetricsTable
      tracking_requests: TrackingRequestsTable
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export * from './metrics';
export * from './facebook';
export * from './profiles';
export * from './tracking';