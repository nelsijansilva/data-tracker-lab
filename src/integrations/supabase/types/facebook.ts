export interface FacebookAdAccountsTable {
  Row: {
    id: string;
    account_id: string;
    access_token: string;
    created_at: string;
    updated_at: string;
    app_id: string;
    app_secret: string;
    account_name: string;
  };
  Insert: {
    id?: string;
    account_id: string;
    access_token: string;
    created_at?: string;
    updated_at?: string;
    app_id?: string;
    app_secret?: string;
    account_name?: string;
  };
  Update: {
    id?: string;
    account_id?: string;
    access_token?: string;
    created_at?: string;
    updated_at?: string;
    app_id?: string;
    app_secret?: string;
    account_name?: string;
  };
  Relationships: [];
}

export interface FacebookAdSetsTable {
  Row: {
    id: string;
    ad_set_id: string;
    campaign_id: string | null;
    name: string;
    status: string;
    budget_remaining: number | null;
    daily_budget: number | null;
    lifetime_budget: number | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    ad_set_id: string;
    campaign_id?: string | null;
    name: string;
    status: string;
    budget_remaining?: number | null;
    daily_budget?: number | null;
    lifetime_budget?: number | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    ad_set_id?: string;
    campaign_id?: string | null;
    name?: string;
    status?: string;
    budget_remaining?: number | null;
    daily_budget?: number | null;
    lifetime_budget?: number | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "facebook_ad_sets_campaign_id_fkey";
      columns: ["campaign_id"];
      isOneToOne: false;
      referencedRelation: "facebook_campaigns";
      referencedColumns: ["id"];
    }
  ];
}

export interface FacebookAdsTable {
  Row: {
    id: string;
    ad_id: string;
    ad_set_id: string | null;
    name: string;
    status: string;
    preview_url: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    ad_id: string;
    ad_set_id?: string | null;
    name: string;
    status: string;
    preview_url?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    ad_id?: string;
    ad_set_id?: string | null;
    name?: string;
    status?: string;
    preview_url?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "facebook_ads_ad_set_id_fkey";
      columns: ["ad_set_id"];
      isOneToOne: false;
      referencedRelation: "facebook_ad_sets";
      referencedColumns: ["id"];
    }
  ];
}

export interface FacebookCampaignsTable {
  Row: {
    id: string;
    campaign_id: string;
    account_id: string | null;
    name: string;
    status: string;
    objective: string | null;
    spend: number | null;
    impressions: number | null;
    clicks: number | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    campaign_id: string;
    account_id?: string | null;
    name: string;
    status: string;
    objective?: string | null;
    spend?: number | null;
    impressions?: number | null;
    clicks?: number | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    campaign_id?: string;
    account_id?: string | null;
    name?: string;
    status?: string;
    objective?: string | null;
    spend?: number | null;
    impressions?: number | null;
    clicks?: number | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "facebook_campaigns_account_id_fkey";
      columns: ["account_id"];
      isOneToOne: false;
      referencedRelation: "facebook_ad_accounts";
      referencedColumns: ["id"];
    }
  ];
}