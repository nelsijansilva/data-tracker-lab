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
      custom_metrics: {
        Row: {
          created_at: string
          field: string
          id: string
          is_custom: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          field: string
          id?: string
          is_custom?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          field?: string
          id?: string
          is_custom?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      facebook_ad_accounts: {
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
      facebook_ad_sets: {
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
          },
        ]
      }
      facebook_ads: {
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
          },
        ]
      }
      facebook_campaigns: {
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
          },
        ]
      }
      facebook_pixels: {
        Row: {
          created_at: string
          event_test_code: string | null
          id: string
          pixel_id: string
          pixel_name: string
          pixel_token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_test_code?: string | null
          id?: string
          pixel_id: string
          pixel_name: string
          pixel_token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_test_code?: string | null
          id?: string
          pixel_id?: string
          pixel_name?: string
          pixel_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      selected_metrics: {
        Row: {
          created_at: string
          id: string
          metric_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "selected_metrics_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "custom_metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_requests: {
        Row: {
          domain: string
          id: string
          language: string | null
          latitude: number | null
          longitude: number | null
          timestamp: string
          url: string | null
          user_agent: string | null
        }
        Insert: {
          domain: string
          id?: string
          language?: string | null
          latitude?: number | null
          longitude?: number | null
          timestamp?: string
          url?: string | null
          user_agent?: string | null
        }
        Update: {
          domain?: string
          id?: string
          language?: string | null
          latitude?: number | null
          longitude?: number | null
          timestamp?: string
          url?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
