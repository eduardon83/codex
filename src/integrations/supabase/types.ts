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
      entities: {
        Row: {
          created_at: string
          district_id: string | null
          id: string
          logo_url: string | null
          name: string
          role_label: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          district_id?: string | null
          id?: string
          logo_url?: string | null
          name: string
          role_label?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          district_id?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          role_label?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      event_media: {
        Row: {
          created_at: string
          event_id: string
          file_size: number | null
          filename: string | null
          id: string
          mime_type: string | null
          sort_order: number
          type: Database["public"]["Enums"]["event_media_type"]
          url: string
        }
        Insert: {
          created_at?: string
          event_id: string
          file_size?: number | null
          filename?: string | null
          id?: string
          mime_type?: string | null
          sort_order?: number
          type: Database["public"]["Enums"]["event_media_type"]
          url: string
        }
        Update: {
          created_at?: string
          event_id?: string
          file_size?: number | null
          filename?: string | null
          id?: string
          mime_type?: string | null
          sort_order?: number
          type?: Database["public"]["Enums"]["event_media_type"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_media_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          event_id: string
          id: string
          registered_at: string
          status: Database["public"]["Enums"]["event_registration_status"]
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string
          status?: Database["public"]["Enums"]["event_registration_status"]
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string
          status?: Database["public"]["Enums"]["event_registration_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          approval_status: Database["public"]["Enums"]["event_approval_status"]
          body: string
          created_at: string
          created_by_user_id: string
          district_id: string | null
          ends_at: string | null
          entity_id: string | null
          id: string
          introduction: string
          is_official: boolean
          linked_book_isbn: string | null
          linked_reading_list_id: string | null
          location: string | null
          online_link: string | null
          registration_closes_at: string | null
          registration_limit: number | null
          registration_opens_at: string | null
          rejection_note: string | null
          school_id: string | null
          scope: Database["public"]["Enums"]["event_scope"]
          starts_at: string | null
          status: Database["public"]["Enums"]["event_status"]
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["event_approval_status"]
          body: string
          created_at?: string
          created_by_user_id: string
          district_id?: string | null
          ends_at?: string | null
          entity_id?: string | null
          id?: string
          introduction: string
          is_official?: boolean
          linked_book_isbn?: string | null
          linked_reading_list_id?: string | null
          location?: string | null
          online_link?: string | null
          registration_closes_at?: string | null
          registration_limit?: number | null
          registration_opens_at?: string | null
          rejection_note?: string | null
          school_id?: string | null
          scope: Database["public"]["Enums"]["event_scope"]
          starts_at?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at?: string
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["event_approval_status"]
          body?: string
          created_at?: string
          created_by_user_id?: string
          district_id?: string | null
          ends_at?: string | null
          entity_id?: string | null
          id?: string
          introduction?: string
          is_official?: boolean
          linked_book_isbn?: string | null
          linked_reading_list_id?: string | null
          location?: string | null
          online_link?: string | null
          registration_closes_at?: string | null
          registration_limit?: number | null
          registration_opens_at?: string | null
          rejection_note?: string | null
          school_id?: string | null
          scope?: Database["public"]["Enums"]["event_scope"]
          starts_at?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_linked_reading_list_id_fkey"
            columns: ["linked_reading_list_id"]
            isOneToOne: false
            referencedRelation: "reading_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          content: string
          created_at: string
          id: string
          is_current: boolean
          language: string
          title: string | null
          type: string
          updated_at: string
          version: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_current?: boolean
          language?: string
          title?: string | null
          type: string
          updated_at?: string
          version: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_current?: boolean
          language?: string
          title?: string | null
          type?: string
          updated_at?: string
          version?: string
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
          account_status: string
          age_group: string
          avatar_url: string | null
          bio: string | null
          country_code: string
          created_at: string
          date_of_birth: string | null
          district_id: string | null
          first_name: string | null
          id: string
          language: string
          last_name: string | null
          location: string | null
          location_lat: number | null
          location_lng: number | null
          parent_consent_confirmed_at: string | null
          parent_consent_expires_at: string | null
          parent_consent_granted_at: string | null
          parent_consent_sent_at: string | null
          parent_consent_token: string | null
          parent_email: string | null
          pending_email_confirmation_after_parental_consent: boolean
          profile_completed: boolean
          school_id: string | null
          suspended: boolean
          terms_accepted_at: string | null
          terms_version: string | null
          theme: string
          tutorial_chapter_statuses: Json
          tutorial_completed: boolean
          tutorial_started_at: string | null
          tutorial_step: number
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          account_status?: string
          age_group?: string
          avatar_url?: string | null
          bio?: string | null
          country_code?: string
          created_at?: string
          date_of_birth?: string | null
          district_id?: string | null
          first_name?: string | null
          id?: string
          language?: string
          last_name?: string | null
          location?: string | null
          location_lat?: number | null
          location_lng?: number | null
          parent_consent_confirmed_at?: string | null
          parent_consent_expires_at?: string | null
          parent_consent_granted_at?: string | null
          parent_consent_sent_at?: string | null
          parent_consent_token?: string | null
          parent_email?: string | null
          pending_email_confirmation_after_parental_consent?: boolean
          profile_completed?: boolean
          school_id?: string | null
          suspended?: boolean
          terms_accepted_at?: string | null
          terms_version?: string | null
          theme?: string
          tutorial_chapter_statuses?: Json
          tutorial_completed?: boolean
          tutorial_started_at?: string | null
          tutorial_step?: number
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          account_status?: string
          age_group?: string
          avatar_url?: string | null
          bio?: string | null
          country_code?: string
          created_at?: string
          date_of_birth?: string | null
          district_id?: string | null
          first_name?: string | null
          id?: string
          language?: string
          last_name?: string | null
          location?: string | null
          location_lat?: number | null
          location_lng?: number | null
          parent_consent_confirmed_at?: string | null
          parent_consent_expires_at?: string | null
          parent_consent_granted_at?: string | null
          parent_consent_sent_at?: string | null
          parent_consent_token?: string | null
          parent_email?: string | null
          pending_email_confirmation_after_parental_consent?: boolean
          profile_completed?: boolean
          school_id?: string | null
          suspended?: boolean
          terms_accepted_at?: string | null
          terms_version?: string | null
          theme?: string
          tutorial_chapter_statuses?: Json
          tutorial_completed?: boolean
          tutorial_started_at?: string | null
          tutorial_step?: number
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
      reading_list_subscriptions: {
        Row: {
          created_at: string
          id: string
          reading_list_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reading_list_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reading_list_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_list_subscriptions_reading_list_id_fkey"
            columns: ["reading_list_id"]
            isOneToOne: false
            referencedRelation: "reading_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_lists: {
        Row: {
          approval_status: string
          created_at: string
          creator_name: string | null
          creator_role: string | null
          district_id: string | null
          education_level: string | null
          id: string
          is_official: boolean
          name: string
          school_id: string | null
          scope: string
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: string
          created_at?: string
          creator_name?: string | null
          creator_role?: string | null
          district_id?: string | null
          education_level?: string | null
          id?: string
          is_official?: boolean
          name?: string
          school_id?: string | null
          scope?: string
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: string
          created_at?: string
          creator_name?: string | null
          creator_role?: string | null
          district_id?: string | null
          education_level?: string | null
          id?: string
          is_official?: boolean
          name?: string
          school_id?: string | null
          scope?: string
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reading_plan_items: {
        Row: {
          author: string | null
          book_id: string | null
          cover_url: string | null
          created_at: string
          id: string
          isbn: string | null
          plan_id: string
          priority: number
          status: Database["public"]["Enums"]["reading_plan_item_status"]
          target_month: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          book_id?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          isbn?: string | null
          plan_id: string
          priority?: number
          status?: Database["public"]["Enums"]["reading_plan_item_status"]
          target_month?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          book_id?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          isbn?: string | null
          plan_id?: string
          priority?: number
          status?: Database["public"]["Enums"]["reading_plan_item_status"]
          target_month?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_plan_items_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_plan_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "reading_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_plans: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          description: string | null
          district_id: string | null
          ends_at: string | null
          id: string
          is_template: boolean
          name: string
          scope: Database["public"]["Enums"]["reading_plan_scope"] | null
          started_at: string | null
          status: Database["public"]["Enums"]["reading_plan_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          district_id?: string | null
          ends_at?: string | null
          id?: string
          is_template?: boolean
          name: string
          scope?: Database["public"]["Enums"]["reading_plan_scope"] | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["reading_plan_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          district_id?: string | null
          ends_at?: string | null
          id?: string
          is_template?: boolean
          name?: string
          scope?: Database["public"]["Enums"]["reading_plan_scope"] | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["reading_plan_status"]
          updated_at?: string
          user_id?: string | null
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      confirm_parental_consent: { Args: { _token: string }; Returns: boolean }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_parental_consent_request: {
        Args: { _token: string }
        Returns: {
          age: number
          first_name: string
          language: string
          terms_accepted_at: string
          terms_version: string
        }[]
      }
      grant_parental_consent: {
        Args: { _token: string }
        Returns: {
          activated: boolean
          first_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
      app_role:
        | "admin"
        | "teacher"
        | "entity"
        | "moderator"
        | "user"
        | "school_admin"
        | "global_admin"
      event_approval_status: "pending" | "approved" | "rejected"
      event_media_type: "banner" | "image" | "attachment"
      event_registration_status: "confirmed" | "waitlisted" | "cancelled"
      event_scope: "school" | "district" | "regional" | "national"
      event_status: "draft" | "published" | "archived" | "cancelled"
      event_type:
        | "reading_group"
        | "author_talk"
        | "writing_comp"
        | "reading_comp"
        | "poetry_slam"
        | "book_club"
        | "symposium"
        | "workshop"
        | "book_fair"
        | "interschool"
        | "library_visit"
        | "reading_week"
        | "storytelling"
        | "news"
        | "award"
        | "pnl_update"
      reading_plan_item_status: "planned" | "reading" | "done" | "skipped"
      reading_plan_scope:
        | "personal"
        | "school_district"
        | "regional"
        | "national"
      reading_plan_status: "active" | "archived"
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
    Enums: {
      app_role: [
        "admin",
        "teacher",
        "entity",
        "moderator",
        "user",
        "school_admin",
        "global_admin",
      ],
      event_approval_status: ["pending", "approved", "rejected"],
      event_media_type: ["banner", "image", "attachment"],
      event_registration_status: ["confirmed", "waitlisted", "cancelled"],
      event_scope: ["school", "district", "regional", "national"],
      event_status: ["draft", "published", "archived", "cancelled"],
      event_type: [
        "reading_group",
        "author_talk",
        "writing_comp",
        "reading_comp",
        "poetry_slam",
        "book_club",
        "symposium",
        "workshop",
        "book_fair",
        "interschool",
        "library_visit",
        "reading_week",
        "storytelling",
        "news",
        "award",
        "pnl_update",
      ],
      reading_plan_item_status: ["planned", "reading", "done", "skipped"],
      reading_plan_scope: [
        "personal",
        "school_district",
        "regional",
        "national",
      ],
      reading_plan_status: ["active", "archived"],
    },
  },
} as const
