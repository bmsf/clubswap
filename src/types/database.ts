export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Domain enums — defined before Database so they can be referenced inside it
export type ListingCategory =
  | 'driver'
  | 'fairway_wood'
  | 'hybrid'
  | 'irons'
  | 'wedge'
  | 'putter'
  | 'bag'
  | 'shoes'
  | 'clothing'
  | 'accessories'
  | 'other'

export type ListingCondition = 'mint' | 'very_good' | 'good' | 'fair'
export type ListingStatus = 'active' | 'sold' | 'archived'
export type CurrencyCode = 'NOK' | 'SEK' | 'DKK' | 'EUR'
export type ShaftFlex = 'ladies' | 'senior' | 'regular' | 'stiff' | 'x_stiff'
export type ShaftMaterial = 'graphite' | 'steel'
export type GripSize = 'undersize' | 'standard' | 'midsize' | 'jumbo'
export type HandPreference = 'right' | 'left'

// Supabase Database generic — must match GenericSchema shape exactly
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          username: string
          avatar_url: string | null
          location_city: string | null
          location_country: string
          handicap_index: number | null
          ngf_member_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          username: string
          avatar_url?: string | null
          location_city?: string | null
          location_country?: string
          handicap_index?: number | null
          ngf_member_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          username?: string
          avatar_url?: string | null
          location_city?: string | null
          location_country?: string
          handicap_index?: number | null
          ngf_member_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          id: string
          seller_id: string
          title: string
          description: string
          category: ListingCategory
          condition: ListingCondition
          price: number
          currency: CurrencyCode
          status: ListingStatus
          location_city: string | null
          location_country: string
          images: string[]
          specs: Json
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          title: string
          description: string
          category: ListingCategory
          condition: ListingCondition
          price: number
          currency?: CurrencyCode
          status?: ListingStatus
          location_city?: string | null
          location_country?: string
          images?: string[]
          specs?: Json
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          title?: string
          description?: string
          category?: ListingCategory
          condition?: ListingCondition
          price?: number
          currency?: CurrencyCode
          status?: ListingStatus
          location_city?: string | null
          location_country?: string
          images?: string[]
          specs?: Json
          views_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'listings_seller_id_fkey'
            columns: ['seller_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      messages: {
        Row: {
          id: string
          listing_id: string
          sender_id: string
          recipient_id: string
          body: string
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          sender_id: string
          recipient_id: string
          body: string
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          sender_id?: string
          recipient_id?: string
          body?: string
          read_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string
          seller_id: string
          listing_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reviewer_id: string
          seller_id: string
          listing_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reviewer_id?: string
          seller_id?: string
          listing_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_reviewer_id_fkey'
            columns: ['reviewer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_seller_id_fkey'
            columns: ['seller_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_listing_id_fkey'
            columns: ['listing_id']
            isOneToOne: false
            referencedRelation: 'listings'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_listing_views: {
        Args: { listing_id: string }
        Returns: undefined
      }
    }
    Enums: {
      listing_category: ListingCategory
      listing_condition: ListingCondition
      listing_status: ListingStatus
      currency_code: CurrencyCode
      shaft_flex: ShaftFlex
      shaft_material: ShaftMaterial
      grip_size: GripSize
      hand_preference: HandPreference
    }
    CompositeTypes: Record<string, never>
  }
}

// ============================================================
// Specs (flexible per category)
// ============================================================

export interface ClubSpecs {
  brand?: string
  model?: string
  year?: number
  hand?: HandPreference
  shaft_flex?: ShaftFlex
  shaft_material?: ShaftMaterial
  loft?: number
  grip_size?: GripSize
  set_composition?: string
}

export interface GearSpecs {
  brand?: string
  model?: string
  size?: string
  color?: string
}

export type ListingSpecs = ClubSpecs | GearSpecs | Record<string, Json>

// ============================================================
// Row types (convenience aliases)
// ============================================================

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Listing = Database['public']['Tables']['listings']['Row']
export type ListingInsert = Database['public']['Tables']['listings']['Insert']
export type ListingUpdate = Database['public']['Tables']['listings']['Update']

export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']

export type Review = Database['public']['Tables']['reviews']['Row']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']

// ============================================================
// Joined / extended types
// ============================================================

export type ListingWithSeller = Listing & {
  seller: Pick<Profile, 'id' | 'username' | 'avatar_url' | 'location_city' | 'location_country'>
}

export type ReviewWithReviewer = Review & {
  reviewer: Pick<Profile, 'id' | 'username' | 'avatar_url'>
}
