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
      facebook_pixels: FacebookPixelsTable
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