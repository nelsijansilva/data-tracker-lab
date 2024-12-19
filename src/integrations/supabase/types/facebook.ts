export interface FacebookAdAccountsTable {
  Row: {
    access_token: string
    account_id: string
    account_name: string
    app_id: string
    app_secret: string
    created_at: string
    id: string
    updated_at: string
  }
  Insert: {
    access_token: string
    account_id: string
    account_name?: string
    app_id?: string
    app_secret?: string
    created_at?: string
    id?: string
    updated_at?: string
  }
  Update: {
    access_token?: string
    account_id?: string
    account_name?: string
    app_id?: string
    app_secret?: string
    created_at?: string
    id?: string
    updated_at?: string
  }
  Relationships: []
}

export interface FacebookAdSetsTable {
  Row: {
    ad_set_id: string
    budget_remaining: number | null
    campaign_id: string | null
    created_at: string
    daily_budget: number | null
    id: string
    lifetime_budget: number | null
    name: string
    status: string
    updated_at: string
  }
  Insert: {
    ad_set_id: string
    budget_remaining?: number | null
    campaign_id?: string | null
    created_at?: string
    daily_budget?: number | null
    id?: string
    lifetime_budget?: number | null
    name: string
    status: string
    updated_at?: string
  }
  Update: {
    ad_set_id?: string
    budget_remaining?: number | null
    campaign_id?: string | null
    created_at?: string
    daily_budget?: number | null
    id?: string
    lifetime_budget?: number | null
    name?: string
    status?: string
    updated_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "facebook_ad_sets_campaign_id_fkey"
      columns: ["campaign_id"]
      isOneToOne: false
      referencedRelation: "facebook_campaigns"
      referencedColumns: ["id"]
    }
  ]
}

export interface FacebookAdsTable {
  Row: {
    ad_id: string
    ad_set_id: string | null
    created_at: string
    id: string
    name: string
    preview_url: string | null
    status: string
    updated_at: string
  }
  Insert: {
    ad_id: string
    ad_set_id?: string | null
    created_at?: string
    id?: string
    name: string
    preview_url?: string | null
    status: string
    updated_at?: string
  }
  Update: {
    ad_id?: string
    ad_set_id?: string | null
    created_at?: string
    id?: string
    name?: string
    preview_url?: string | null
    status?: string
    updated_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "facebook_ads_ad_set_id_fkey"
      columns: ["ad_set_id"]
      isOneToOne: false
      referencedRelation: "facebook_ad_sets"
      referencedColumns: ["id"]
    }
  ]
}

export interface FacebookCampaignsTable {
  Row: {
    account_id: string | null
    campaign_id: string
    clicks: number | null
    created_at: string
    id: string
    impressions: number | null
    name: string
    objective: string | null
    spend: number | null
    status: string
    updated_at: string
  }
  Insert: {
    account_id?: string | null
    campaign_id: string
    clicks?: number | null
    created_at?: string
    id?: string
    impressions?: number | null
    name: string
    objective?: string | null
    spend?: number | null
    status: string
    updated_at?: string
  }
  Update: {
    account_id?: string | null
    campaign_id?: string
    clicks?: number | null
    created_at?: string
    id?: string
    impressions?: number | null
    name?: string
    objective?: string | null
    spend?: number | null
    status?: string
    updated_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "facebook_campaigns_account_id_fkey"
      columns: ["account_id"]
      isOneToOne: false
      referencedRelation: "facebook_ad_accounts"
      referencedColumns: ["id"]
    }
  ]
}

export interface FacebookPixelsTable {
  Row: {
    id: string
    pixel_name: string
    pixel_id: string
    pixel_token: string
    event_test_code: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    pixel_name: string
    pixel_id: string
    pixel_token: string
    event_test_code?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    pixel_name?: string
    pixel_id?: string
    pixel_token?: string
    event_test_code?: string | null
    created_at?: string
    updated_at?: string
  }
  Relationships: []
}