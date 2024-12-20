export interface CustomMetricsTable {
  Row: {
    id: string;
    name: string;
    field: string;
    is_custom: boolean | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    name: string;
    field: string;
    is_custom?: boolean | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    name?: string;
    field?: string;
    is_custom?: boolean | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [];
}

export interface SelectedMetricsTable {
  Row: {
    id: string;
    metric_id: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    metric_id: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    metric_id?: string;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "selected_metrics_metric_id_fkey";
      columns: ["metric_id"];
      isOneToOne: false;
      referencedRelation: "custom_metrics";
      referencedColumns: ["id"];
    }
  ];
}