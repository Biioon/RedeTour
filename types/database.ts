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
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          email_verified: boolean
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'admin' | 'affiliate'
          is_active: boolean
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
          email_verified?: boolean
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'affiliate'
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          email_verified?: boolean
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'affiliate'
          is_active?: boolean
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          phone: string | null
          birth_date: string | null
          location: string | null
          website: string | null
          social_links: Json | null
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bio?: string | null
          phone?: string | null
          birth_date?: string | null
          location?: string | null
          website?: string | null
          social_links?: Json | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bio?: string | null
          phone?: string | null
          birth_date?: string | null
          location?: string | null
          website?: string | null
          social_links?: Json | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      affiliates: {
        Row: {
          id: string
          user_id: string
          code: string
          commission_rate: number
          total_earnings: number
          total_referrals: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          code: string
          commission_rate?: number
          total_earnings?: number
          total_referrals?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          code?: string
          commission_rate?: number
          total_earnings?: number
          total_referrals?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      commissions: {
        Row: {
          id: string
          affiliate_id: string
          booking_id: string
          amount: number
          status: 'pending' | 'approved' | 'paid' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          affiliate_id: string
          booking_id: string
          amount: number
          status?: 'pending' | 'approved' | 'paid' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          affiliate_id?: string
          booking_id?: string
          amount?: number
          status?: 'pending' | 'approved' | 'paid' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          package_id: string
          affiliate_id: string | null
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          total_amount: number
          booking_date: string
          travel_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          package_id: string
          affiliate_id?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          total_amount: number
          booking_date: string
          travel_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          package_id?: string
          affiliate_id?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          total_amount?: number
          booking_date?: string
          travel_date?: string
          created_at?: string
          updated_at?: string
        }
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
  }
}