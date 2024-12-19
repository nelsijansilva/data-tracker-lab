export interface TrackingRequestsTable {
  Row: {
    id: string
    domain: string
    user_agent: string | null
    language: string | null
    latitude: number | null
    longitude: number | null
    url: string | null
    timestamp: string
  }
  Insert: {
    id?: string
    domain: string
    user_agent?: string | null
    language?: string | null
    latitude?: number | null
    longitude?: number | null
    url?: string | null
    timestamp?: string
  }
  Update: {
    id?: string
    domain?: string
    user_agent?: string | null
    language?: string | null
    latitude?: number | null
    longitude?: number | null
    url?: string | null
    timestamp?: string
  }
  Relationships: []
}