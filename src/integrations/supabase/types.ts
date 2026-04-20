export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          affected_record_id: string | null
          affected_user_id: string | null
          created_at: string
          details: string | null
          id: string
          ip_address: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          affected_record_id?: string | null
          affected_user_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          affected_record_id?: string | null
          affected_user_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      app_content: {
        Row: {
          category: string
          created_at: string
          id: string
          key: string
          updated_at: string
          updated_by_admin_id: string | null
          value_en: string | null
          value_es: string | null
          value_fr: string | null
          value_pt: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          updated_by_admin_id?: string | null
          value_en?: string | null
          value_es?: string | null
          value_fr?: string | null
          value_pt?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          updated_by_admin_id?: string | null
          value_en?: string | null
          value_es?: string | null
          value_fr?: string | null
          value_pt?: string | null
        }
        Relationships: []
      }
      book_availability: {
        Row: {
          author: string | null
          auto_accept: boolean
          book_id: string
          cover_url: string | null
          created_at: string
          district_id: string | null
          id: string
          is_available: boolean
          isbn: string | null
          loan_duration_days: number
          owner_user_id: string
          school_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          auto_accept?: boolean
          book_id: string
          cover_url?: string | null
          created_at?: string
          district_id?: string | null
          id?: string
          is_available?: boolean
          isbn?: string | null
          loan_duration_days?: number
          owner_user_id: string
          school_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          auto_accept?: boolean
          book_id?: string
          cover_url?: string | null
          created_at?: string
          district_id?: string | null
          id?: string
          is_available?: boolean
          isbn?: string | null
          loan_duration_days?: number
          owner_user_id?: string
          school_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_availability_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: true
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_availability_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_availability_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      book_cache: {
        Row: {
          author: string | null
          contributed_by_user_id: string
          cover_url: string | null
          created_at: string
          format: string | null
          genre: string | null
          id: string
          isbn: string
          language: string | null
          pages: number | null
          publisher: string | null
          title: string
          year: string | null
        }
        Insert: {
          author?: string | null
          contributed_by_user_id: string
          cover_url?: string | null
          created_at?: string
          format?: string | null
          genre?: string | null
          id?: string
          isbn: string
          language?: string | null
          pages?: number | null
          publisher?: string | null
          title: string
          year?: string | null
        }
        Update: {
          author?: string | null
          contributed_by_user_id?: string
          cover_url?: string | null
          created_at?: string
          format?: string | null
          genre?: string | null
          id?: string
          isbn?: string
          language?: string | null
          pages?: number | null
          publisher?: string | null
          title?: string
          year?: string | null
        }
        Relationships: []
      }
      books: {
        Row: {
          author: string | null
          borrow_notifications_enabled: boolean
          borrowed_from: string | null
          cover_url: string | null
          created_at: string
          format: string | null
          genre: string | null
          id: string
          is_borrowed: boolean
          is_wishlist: boolean
          isbn: string | null
          language: string | null
          library_id: string
          notes: string | null
          page_count: number | null
          publish_date: string | null
          publisher: string | null
          rating: number | null
          reading_status: string
          return_by_date: string | null
          series_name: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          volume_number: number | null
        }
        Insert: {
          author?: string | null
          borrow_notifications_enabled?: boolean
          borrowed_from?: string | null
          cover_url?: string | null
          created_at?: string
          format?: string | null
          genre?: string | null
          id?: string
          is_borrowed?: boolean
          is_wishlist?: boolean
          isbn?: string | null
          language?: string | null
          library_id: string
          notes?: string | null
          page_count?: number | null
          publish_date?: string | null
          publisher?: string | null
          rating?: number | null
          reading_status?: string
          return_by_date?: string | null
          series_name?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          volume_number?: number | null
        }
        Update: {
          author?: string | null
          borrow_notifications_enabled?: boolean
          borrowed_from?: string | null
          cover_url?: string | null
          created_at?: string
          format?: string | null
          genre?: string | null
          id?: string
          is_borrowed?: boolean
          is_wishlist?: boolean
          isbn?: string | null
          language?: string | null
          library_id?: string
          notes?: string | null
          page_count?: number | null
          publish_date?: string | null
          publisher?: string | null
          rating?: number | null
          reading_status?: string
          return_by_date?: string | null
          series_name?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          volume_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "books_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "books_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "public_libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      districts: {
        Row: {
          country_code: string
          created_at: string
          id: string
          name: string
          region: string | null
        }
        Insert: {
          country_code?: string
          created_at?: string
          id?: string
          name: string
          region?: string | null
        }
        Update: {
          country_code?: string
          created_at?: string
          id?: string
          name?: string
          region?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      libraries: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          name: string
          share_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          name?: string
          share_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          name?: string
          share_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      library_cards: {
        Row: {
          card_number: string | null
          created_at: string
          expiry_date: string | null
          id: string
          library_name: string | null
          location: string | null
          member_since: string | null
          name: string
          notes: string | null
          photo_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          card_number?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          library_name?: string | null
          location?: string | null
          member_since?: string | null
          name: string
          notes?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          card_number?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          library_name?: string | null
          location?: string | null
          member_since?: string | null
          name?: string
          notes?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loan_requests: {
        Row: {
          book_author: string | null
          book_cover_url: string | null
          book_id: string
          book_isbn: string | null
          book_title: string
          borrower_confirmed_return: boolean
          created_at: string
          due_date: string | null
          id: string
          lender_confirmed_return: boolean
          message: string | null
          owner_user_id: string
          rejection_reason: string | null
          reminder_3day_sent_at: string | null
          reminder_confirm_sent_at: string | null
          requested_at: string
          requester_user_id: string
          responded_at: string | null
          returned_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          book_author?: string | null
          book_cover_url?: string | null
          book_id: string
          book_isbn?: string | null
          book_title: string
          borrower_confirmed_return?: boolean
          created_at?: string
          due_date?: string | null
          id?: string
          lender_confirmed_return?: boolean
          message?: string | null
          owner_user_id: string
          rejection_reason?: string | null
          reminder_3day_sent_at?: string | null
          reminder_confirm_sent_at?: string | null
          requested_at?: string
          requester_user_id: string
          responded_at?: string | null
          returned_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          book_author?: string | null
          book_cover_url?: string | null
          book_id?: string
          book_isbn?: string | null
          book_title?: string
          borrower_confirmed_return?: boolean
          created_at?: string
          due_date?: string | null
          id?: string
          lender_confirmed_return?: boolean
          message?: string | null
          owner_user_id?: string
          rejection_reason?: string | null
          reminder_3day_sent_at?: string | null
          reminder_confirm_sent_at?: string | null
          requested_at?: string
          requester_user_id?: string
          responded_at?: string | null
          returned_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      loans: {
        Row: {
          book_id: string
          borrower_name: string | null
          borrower_user_id: string | null
          created_at: string
          id: string
          is_active: boolean
          lender_id: string
          loan_date: string
          loan_due_date: string | null
          loan_notifications_enabled: boolean
          return_date: string | null
          updated_at: string
        }
        Insert: {
          book_id: string
          borrower_name?: string | null
          borrower_user_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          lender_id: string
          loan_date?: string
          loan_due_date?: string | null
          loan_notifications_enabled?: boolean
          return_date?: string | null
          updated_at?: string
        }
        Update: {
          book_id?: string
          borrower_name?: string | null
          borrower_user_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          lender_id?: string
          loan_date?: string
          loan_due_date?: string | null
          loan_notifications_enabled?: boolean
          return_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age_group: string
          avatar_url: string | null
          bio: string | null
          country_code: string
          created_at: string
          district_id: string | null
          first_name: string | null
          id: string
          language: string
          last_name: string | null
          location: string | null
          location_lat: number | null
          location_lng: number | null
          profile_completed: boolean
          school_id: string | null
          suspended: boolean
          theme: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          age_group?: string
          avatar_url?: string | null
          bio?: string | null
          country_code?: string
          created_at?: string
          district_id?: string | null
          first_name?: string | null
          id?: string
          language?: string
          last_name?: string | null
          location?: string | null
          location_lat?: number | null
          location_lng?: number | null
          profile_completed?: boolean
          school_id?: string | null
          suspended?: boolean
          theme?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          age_group?: string
          avatar_url?: string | null
          bio?: string | null
          country_code?: string
          created_at?: string
          district_id?: string | null
          first_name?: string | null
          id?: string
          language?: string
          last_name?: string | null
          location?: string | null
          location_lat?: number | null
          location_lng?: number | null
          profile_completed?: boolean
          school_id?: string | null
          suspended?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_history: {
        Row: {
          book_author: string | null
          book_cover_url: string | null
          book_format: string | null
          book_genre: string | null
          book_isbn: string | null
          book_language: string | null
          book_pages: number | null
          book_publisher: string | null
          book_series: string | null
          book_title: string
          book_year: string | null
          created_at: string
          date_added: string
          date_finished: string | null
          date_started: string | null
          id: string
          personal_notes: string | null
          rating: number | null
          removed_from_library: boolean
          source_book_id: string | null
          source_library_name: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          book_author?: string | null
          book_cover_url?: string | null
          book_format?: string | null
          book_genre?: string | null
          book_isbn?: string | null
          book_language?: string | null
          book_pages?: number | null
          book_publisher?: string | null
          book_series?: string | null
          book_title: string
          book_year?: string | null
          created_at?: string
          date_added?: string
          date_finished?: string | null
          date_started?: string | null
          id?: string
          personal_notes?: string | null
          rating?: number | null
          removed_from_library?: boolean
          source_book_id?: string | null
          source_library_name?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          book_author?: string | null
          book_cover_url?: string | null
          book_format?: string | null
          book_genre?: string | null
          book_isbn?: string | null
          book_language?: string | null
          book_pages?: number | null
          book_publisher?: string | null
          book_series?: string | null
          book_title?: string
          book_year?: string | null
          created_at?: string
          date_added?: string
          date_finished?: string | null
          date_started?: string | null
          id?: string
          personal_notes?: string | null
          rating?: number | null
          removed_from_library?: boolean
          source_book_id?: string | null
          source_library_name?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reading_list_books: {
        Row: {
          author: string | null
          cover_url: string | null
          created_at: string
          genre: string | null
          has_warning: boolean
          id: string
          isbn: string | null
          language: string | null
          page_count: number | null
          publish_date: string | null
          publisher: string | null
          reading_list_id: string
          title: string
        }
        Insert: {
          author?: string | null
          cover_url?: string | null
          created_at?: string
          genre?: string | null
          has_warning?: boolean
          id?: string
          isbn?: string | null
          language?: string | null
          page_count?: number | null
          publish_date?: string | null
          publisher?: string | null
          reading_list_id: string
          title: string
        }
        Update: {
          author?: string | null
          cover_url?: string | null
          created_at?: string
          genre?: string | null
          has_warning?: boolean
          id?: string
          isbn?: string | null
          language?: string | null
          page_count?: number | null
          publish_date?: string | null
          publisher?: string | null
          reading_list_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_list_books_reading_list_id_fkey"
            columns: ["reading_list_id"]
            isOneToOne: false
            referencedRelation: "reading_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_lists: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_libraries: {
        Row: {
          created_at: string
          id: string
          library_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          library_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          library_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_libraries_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_libraries_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "public_libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          concelho: string | null
          created_at: string
          district_id: string
          education_levels: string[]
          id: string
          is_active: boolean
          is_verified: boolean
          me_code: string | null
          name: string
          school_type: string
          submitted_by_user_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          concelho?: string | null
          created_at?: string
          district_id: string
          education_levels?: string[]
          id?: string
          is_active?: boolean
          is_verified?: boolean
          me_code?: string | null
          name: string
          school_type?: string
          submitted_by_user_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          concelho?: string | null
          created_at?: string
          district_id?: string
          education_levels?: string[]
          id?: string
          is_active?: boolean
          is_verified?: boolean
          me_code?: string | null
          name?: string
          school_type?: string
          submitted_by_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schools_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_favourites: {
        Row: {
          book_author: string | null
          book_cover_url: string | null
          book_genre: string | null
          book_isbn: string | null
          book_title: string
          created_at: string
          id: string
          position: number
          source_book_id: string | null
          user_id: string
        }
        Insert: {
          book_author?: string | null
          book_cover_url?: string | null
          book_genre?: string | null
          book_isbn?: string | null
          book_title: string
          created_at?: string
          id?: string
          position?: number
          source_book_id?: string | null
          user_id: string
        }
        Update: {
          book_author?: string | null
          book_cover_url?: string | null
          book_genre?: string | null
          book_isbn?: string | null
          book_title?: string
          created_at?: string
          id?: string
          position?: number
          source_book_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_libraries: {
        Row: {
          created_at: string | null
          id: string | null
          is_public: boolean | null
          name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_public?: boolean | null
          name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_public?: boolean | null
          name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          first_name: string | null
          last_name: string | null
          location: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          first_name?: string | null
          last_name?: string | null
          location?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          first_name?: string | null
          last_name?: string | null
          location?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_export_books: { Args: never; Returns: Json }
      admin_export_users: { Args: never; Returns: Json }
      admin_get_stats: { Args: never; Returns: Json }
      admin_get_users: { Args: never; Returns: Json }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      lookup_user_id_by_username: {
        Args: { _username: string }
        Returns: string
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
