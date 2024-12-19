export interface ProfilesTable {
  Row: {
    id: string
    username: string | null
    avatar_url: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id: string
    username?: string | null
    avatar_url?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    username?: string | null
    avatar_url?: string | null
    created_at?: string
    updated_at?: string
  }
  Relationships: []
}