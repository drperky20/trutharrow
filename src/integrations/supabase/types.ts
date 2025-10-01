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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          severity: Database["public"]["Enums"]["severity_type"]
          title: string
          url: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          severity: Database["public"]["Enums"]["severity_type"]
          title: string
          url?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          severity?: Database["public"]["Enums"]["severity_type"]
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      evidence: {
        Row: {
          caption: string
          created_at: string | null
          date_of_doc: string
          external_url: string | null
          featured: boolean | null
          file: string | null
          id: string
          issue_ref: string | null
          redacted: boolean | null
          sensitivity: string | null
          title: string
          type: Database["public"]["Enums"]["evidence_type"]
        }
        Insert: {
          caption: string
          created_at?: string | null
          date_of_doc: string
          external_url?: string | null
          featured?: boolean | null
          file?: string | null
          id?: string
          issue_ref?: string | null
          redacted?: boolean | null
          sensitivity?: string | null
          title: string
          type: Database["public"]["Enums"]["evidence_type"]
        }
        Update: {
          caption?: string
          created_at?: string | null
          date_of_doc?: string
          external_url?: string | null
          featured?: boolean | null
          file?: string | null
          id?: string
          issue_ref?: string | null
          redacted?: boolean | null
          sensitivity?: string | null
          title?: string
          type?: Database["public"]["Enums"]["evidence_type"]
        }
        Relationships: [
          {
            foreignKeyName: "evidence_issue_ref_fkey"
            columns: ["issue_ref"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      failed_login_attempts: {
        Row: {
          attempted_at: string | null
          email: string
          fingerprint: string | null
          id: string
          ip_address: string | null
        }
        Insert: {
          attempted_at?: string | null
          email: string
          fingerprint?: string | null
          id?: string
          ip_address?: string | null
        }
        Update: {
          attempted_at?: string | null
          email?: string
          fingerprint?: string | null
          id?: string
          ip_address?: string | null
        }
        Relationships: []
      }
      hero_headlines: {
        Row: {
          active: boolean
          created_at: string
          display_order: number
          id: string
          text: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          text: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          text?: string
        }
        Relationships: []
      }
      issues: {
        Row: {
          created_at: string | null
          grade: string
          hero_image: string | null
          id: string
          last_updated: string | null
          slug: string
          summary: string
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          grade: string
          hero_image?: string | null
          id?: string
          last_updated?: string | null
          slug: string
          summary: string
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          grade?: string
          hero_image?: string | null
          id?: string
          last_updated?: string | null
          slug?: string
          summary?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          created_at: string | null
          fingerprint: string | null
          id: string
          option_index: number
          poll_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          fingerprint?: string | null
          id?: string
          option_index: number
          poll_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          fingerprint?: string | null
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          options: string[]
          question: string
          results: Json | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          options: string[]
          question: string
          results?: Json | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          options?: string[]
          question?: string
          results?: Json | null
        }
        Relationships: []
      }
      post_reactions: {
        Row: {
          created_at: string | null
          fingerprint: string | null
          id: string
          post_id: string
          reaction_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          fingerprint?: string | null
          id?: string
          post_id: string
          reaction_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          fingerprint?: string | null
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          alias: string
          content: string
          created_at: string | null
          featured: boolean | null
          id: string
          images: string[] | null
          issue_refs: string[] | null
          parent_id: string | null
          reactions: Json | null
          reply_count: number | null
          status: string | null
          thread_id: string | null
          type: Database["public"]["Enums"]["post_type"]
          user_id: string | null
        }
        Insert: {
          alias: string
          content: string
          created_at?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          issue_refs?: string[] | null
          parent_id?: string | null
          reactions?: Json | null
          reply_count?: number | null
          status?: string | null
          thread_id?: string | null
          type: Database["public"]["Enums"]["post_type"]
          user_id?: string | null
        }
        Update: {
          alias?: string
          content?: string
          created_at?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          issue_refs?: string[] | null
          parent_id?: string | null
          reactions?: Json | null
          reply_count?: number | null
          status?: string | null
          thread_id?: string | null
          type?: Database["public"]["Enums"]["post_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          alias: string | null
          created_at: string | null
          id: string
        }
        Insert: {
          alias?: string | null
          created_at?: string | null
          id: string
        }
        Update: {
          alias?: string | null
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          admin_notes: string | null
          contact: string | null
          created_at: string | null
          evidence_urls: string[] | null
          fingerprint: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["submission_status"]
          title: string
          user_id: string | null
          verify: string
          what: string
          when_where: string | null
        }
        Insert: {
          admin_notes?: string | null
          contact?: string | null
          created_at?: string | null
          evidence_urls?: string[] | null
          fingerprint?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          title: string
          user_id?: string | null
          verify: string
          what: string
          when_where?: string | null
        }
        Update: {
          admin_notes?: string | null
          contact?: string | null
          created_at?: string | null
          evidence_urls?: string[] | null
          fingerprint?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          title?: string
          user_id?: string | null
          verify?: string
          what?: string
          when_where?: string | null
        }
        Relationships: []
      }
      ticker_quotes: {
        Row: {
          approved: boolean | null
          created_at: string | null
          id: string
          source_label: string
          text: string
        }
        Insert: {
          approved?: boolean | null
          created_at?: string | null
          id?: string
          source_label: string
          text: string
        }
        Update: {
          approved?: boolean | null
          created_at?: string | null
          id?: string
          source_label?: string
          text?: string
        }
        Relationships: []
      }
      timeline: {
        Row: {
          created_at: string | null
          date: string
          entry_type: Database["public"]["Enums"]["entry_type"]
          id: string
          issue_ref: string | null
          note: string
          ref_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          entry_type: Database["public"]["Enums"]["entry_type"]
          id?: string
          issue_ref?: string | null
          note: string
          ref_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          entry_type?: Database["public"]["Enums"]["entry_type"]
          id?: string
          issue_ref?: string | null
          note?: string
          ref_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timeline_issue_ref_fkey"
            columns: ["issue_ref"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_failed_attempts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_alias: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_reaction: {
        Args: { p_kind: string; p_post_id: string }
        Returns: undefined
      }
      increment_reaction_safe: {
        Args: {
          p_fingerprint?: string
          p_kind: string
          p_post_id: string
          p_user_id?: string
        }
        Returns: Json
      }
      is_account_locked: {
        Args: { p_email: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_new_data?: Json
          p_old_data?: Json
          p_record_id?: string
          p_table_name?: string
        }
        Returns: undefined
      }
      record_failed_login_attempt: {
        Args: { p_email: string; p_fingerprint?: string }
        Returns: Json
      }
      vote_on_poll_safe: {
        Args: {
          p_fingerprint?: string
          p_option_index: number
          p_poll_id: string
          p_user_id?: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
      entry_type: "post" | "doc" | "milestone"
      evidence_type: "pdf" | "image" | "url"
      post_type: "assignment" | "detention-slip" | "pop-quiz" | "announcement"
      severity_type: "info" | "alert" | "win"
      submission_status: "pending" | "approved" | "rejected" | "published"
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
      app_role: ["admin", "user"],
      entry_type: ["post", "doc", "milestone"],
      evidence_type: ["pdf", "image", "url"],
      post_type: ["assignment", "detention-slip", "pop-quiz", "announcement"],
      severity_type: ["info", "alert", "win"],
      submission_status: ["pending", "approved", "rejected", "published"],
    },
  },
} as const
