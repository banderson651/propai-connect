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
      automation_rules: {
        Row: {
          actions: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          trigger_condition: string
          trigger_type: string
          updated_at: string
        }
        Insert: {
          actions: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          trigger_condition: string
          trigger_type: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          trigger_condition?: string
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_import_mappings: {
        Row: {
          created_at: string
          id: string
          import_id: string
          source_column: string
          target_field: string
        }
        Insert: {
          created_at?: string
          id?: string
          import_id: string
          source_column: string
          target_field: string
        }
        Update: {
          created_at?: string
          id?: string
          import_id?: string
          source_column?: string
          target_field?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_import_mappings_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "contact_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_imports: {
        Row: {
          created_at: string
          filename: string
          id: string
          imported_rows: number
          status: string
          total_rows: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filename: string
          id?: string
          imported_rows?: number
          status?: string
          total_rows?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filename?: string
          id?: string
          imported_rows?: number
          status?: string
          total_rows?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      email_accounts: {
        Row: {
          created_at: string
          email: string
          host: string
          id: string
          last_checked: string | null
          name: string
          password: string
          port: number
          secure: boolean | null
          smtp_host: string
          smtp_password: string
          smtp_port: number
          smtp_secure: boolean
          smtp_username: string
          status: string | null
          type: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          host: string
          id?: string
          last_checked?: string | null
          name: string
          password: string
          port: number
          secure?: boolean | null
          smtp_host: string
          smtp_password: string
          smtp_port: number
          smtp_secure?: boolean
          smtp_username: string
          status?: string | null
          type: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          host?: string
          id?: string
          last_checked?: string | null
          name?: string
          password?: string
          port?: number
          secure?: boolean | null
          smtp_host?: string
          smtp_password?: string
          smtp_port?: number
          smtp_secure?: boolean
          smtp_username?: string
          status?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          contact_id: string
          content: string
          created_at: string
          date: string
          id: string
          subject: string | null
          type: string
          updated_at: string
        }
        Insert: {
          contact_id: string
          content: string
          created_at?: string
          date?: string
          id?: string
          subject?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          contact_id?: string
          content?: string
          created_at?: string
          date?: string
          id?: string
          subject?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_config: {
        Row: {
          api_key: string
          business_account_id: string | null
          created_at: string
          id: string
          phone_number: string
          updated_at: string
        }
        Insert: {
          api_key: string
          business_account_id?: string | null
          created_at?: string
          id: string
          phone_number: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          business_account_id?: string | null
          created_at?: string
          id?: string
          phone_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          contact_id: string
          content: string
          created_at: string
          direction: string
          id: string
          message_id: string | null
          timestamp: string
        }
        Insert: {
          contact_id: string
          content: string
          created_at?: string
          direction: string
          id?: string
          message_id?: string | null
          timestamp?: string
        }
        Update: {
          contact_id?: string
          content?: string
          created_at?: string
          direction?: string
          id?: string
          message_id?: string | null
          timestamp?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
