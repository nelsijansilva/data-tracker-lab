export interface TrackingRequestsTable {
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