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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
