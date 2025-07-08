export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
        }
        Insert: {
          color: string
          created_at?: string
          description?: string | null
          icon: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          approved: boolean
          category: string
          created_at: string
          description: string
          featured: boolean
          id: string
          image: string | null
          link: string
          members: number
          name: string
          tags: string[]
          type: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
          verified: boolean
        }
        Insert: {
          approved?: boolean
          category: string
          created_at?: string
          description: string
          featured?: boolean
          id?: string
          image?: string | null
          link: string
          members: number
          name: string
          tags?: string[]
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          verified?: boolean
        }
        Update: {
          approved?: boolean
          category?: string
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          image?: string | null
          link?: string
          members?: number
          name?: string
          tags?: string[]
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "groups_category_fkey"
            columns: ["category"]
            referencedRelation: "categories"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "groups_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      pages: {
        Row: {
          author: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          seo: Json
          slug: string
          status: string
          template: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          seo: Json
          slug: string
          status: string
          template?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          seo?: Json
          slug?: string
          status?: string
          template?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          author: string
          author_id: string
          category: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          read_time: number
          seo: Json
          slug: string
          status: string
          tags: string[]
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author: string
          author_id: string
          category: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          read_time?: number
          seo: Json
          slug: string
          status: string
          tags?: string[]
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author?: string
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          read_time?: number
          seo?: Json
          slug?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      promotions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          end_date: string
          group_id: string
          id: string
          payment_id: string | null
          plan_id: string
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          end_date: string
          group_id: string
          id?: string
          payment_id?: string | null
          plan_id: string
          start_date: string
          status: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          end_date?: string
          group_id?: string
          id?: string
          payment_id?: string | null
          plan_id?: string
          start_date?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_group_id_fkey"
            columns: ["group_id"]
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_groups: {
        Row: {
          category: string
          created_at: string
          group_description: string
          group_image: string | null
          group_name: string
          group_username: string
          id: string
          link: string
          members: number
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submission_note: string | null
          submitted_at: string
          tags: string[]
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          group_description: string
          group_image?: string | null
          group_name: string
          group_username: string
          id?: string
          link: string
          members: number
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status: string
          submission_note?: string | null
          submitted_at?: string
          tags?: string[]
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          group_description?: string
          group_image?: string | null
          group_name?: string
          group_username?: string
          id?: string
          link?: string
          members?: number
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_note?: string | null
          submitted_at?: string
          tags?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_groups_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          last_login: string | null
          role: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          last_login?: string | null
          role?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          last_login?: string | null
          role?: string
          username?: string
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