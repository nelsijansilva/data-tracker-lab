export interface CustomMetricsTable {
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

export interface SelectedMetricsTable {
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
    }
  ]
}