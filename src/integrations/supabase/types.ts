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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          currency: string
          current_price: number | null
          id: string
          is_active: boolean | null
          last_price_update: string | null
          liquidity_level: string | null
          name: string
          notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          subcategory: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string | null
          currency?: string
          current_price?: number | null
          id?: string
          is_active?: boolean | null
          last_price_update?: string | null
          liquidity_level?: string | null
          name: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          subcategory?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          currency?: string
          current_price?: number | null
          id?: string
          is_active?: boolean | null
          last_price_update?: string | null
          liquidity_level?: string | null
          name?: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          subcategory?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          allocated_amount: number
          category: string
          created_at: string | null
          currency: string
          end_date: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          period: string | null
          start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allocated_amount: number
          category: string
          created_at?: string | null
          currency?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          period?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allocated_amount?: number
          category?: string
          created_at?: string | null
          currency?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          period?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      category_liquidity_settings: {
        Row: {
          category_name: string
          category_type: string
          created_at: string | null
          id: string
          liquidity_level: Database["public"]["Enums"]["liquidity_level"] | null
          liquidity_percentage: number | null
          notes: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category_name: string
          category_type: string
          created_at?: string | null
          id?: string
          liquidity_level?:
            | Database["public"]["Enums"]["liquidity_level"]
            | null
          liquidity_percentage?: number | null
          notes?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category_name?: string
          category_type?: string
          created_at?: string | null
          id?: string
          liquidity_level?:
            | Database["public"]["Enums"]["liquidity_level"]
            | null
          liquidity_percentage?: number | null
          notes?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      debts: {
        Row: {
          created_at: string | null
          currency: string
          current_balance: number
          due_date: number | null
          end_date: string | null
          id: string
          interest_rate: number | null
          is_active: boolean | null
          lender: string | null
          minimum_payment: number | null
          name: string
          notes: string | null
          principal: number
          start_date: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string
          current_balance: number
          due_date?: number | null
          end_date?: string | null
          id?: string
          interest_rate?: number | null
          is_active?: boolean | null
          lender?: string | null
          minimum_payment?: number | null
          name: string
          notes?: string | null
          principal: number
          start_date?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string
          current_balance?: number
          due_date?: number | null
          end_date?: string | null
          id?: string
          interest_rate?: number | null
          is_active?: boolean | null
          lender?: string | null
          minimum_payment?: number | null
          name?: string
          notes?: string | null
          principal?: number
          start_date?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      expense_group_expenses: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          group_id: string
          id: string
          paid_by_member_id: string
          split_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          group_id: string
          id?: string
          paid_by_member_id: string
          split_type?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          group_id?: string
          id?: string
          paid_by_member_id?: string
          split_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_group_expenses_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "expense_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_group_expenses_paid_by_member_id_fkey"
            columns: ["paid_by_member_id"]
            isOneToOne: false
            referencedRelation: "expense_group_members"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_group_members: {
        Row: {
          email: string | null
          group_id: string
          id: string
          is_creator: boolean | null
          joined_at: string | null
          name: string
          user_id: string | null
        }
        Insert: {
          email?: string | null
          group_id: string
          id?: string
          is_creator?: boolean | null
          joined_at?: string | null
          name: string
          user_id?: string | null
        }
        Update: {
          email?: string | null
          group_id?: string
          id?: string
          is_creator?: boolean | null
          joined_at?: string | null
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "expense_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_groups: {
        Row: {
          category: string | null
          created_at: string | null
          currency: string
          description: string | null
          id: string
          invite_code: string | null
          is_active: boolean | null
          is_settled: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          invite_code?: string | null
          is_active?: boolean | null
          is_settled?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          invite_code?: string | null
          is_active?: boolean | null
          is_settled?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      expense_payers: {
        Row: {
          amount: number
          created_at: string | null
          expense_id: string
          id: string
          member_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          expense_id: string
          id?: string
          member_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          expense_id?: string
          id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_payers_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expense_group_expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_payers_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "expense_group_members"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_settlements: {
        Row: {
          amount: number
          from_member_id: string
          group_id: string
          id: string
          settled_at: string | null
          to_member_id: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          from_member_id: string
          group_id: string
          id?: string
          settled_at?: string | null
          to_member_id: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          from_member_id?: string
          group_id?: string
          id?: string
          settled_at?: string | null
          to_member_id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_settlements_from_member_id_fkey"
            columns: ["from_member_id"]
            isOneToOne: false
            referencedRelation: "expense_group_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_settlements_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "expense_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_settlements_to_member_id_fkey"
            columns: ["to_member_id"]
            isOneToOne: false
            referencedRelation: "expense_group_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_settlements_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_splits: {
        Row: {
          amount: number
          created_at: string | null
          expense_id: string
          id: string
          is_paid: boolean | null
          member_id: string
          percentage: number | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          expense_id: string
          id?: string
          is_paid?: boolean | null
          member_id: string
          percentage?: number | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          expense_id?: string
          id?: string
          is_paid?: boolean | null
          member_id?: string
          percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_splits_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expense_group_expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_splits_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "expense_group_members"
            referencedColumns: ["id"]
          },
        ]
      }
      income_sources: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          liquidity_level: Database["public"]["Enums"]["liquidity_level"] | null
          notes: string | null
          partner_id: string
          source_name: string
          source_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          liquidity_level?:
            | Database["public"]["Enums"]["liquidity_level"]
            | null
          notes?: string | null
          partner_id: string
          source_name: string
          source_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          liquidity_level?:
            | Database["public"]["Enums"]["liquidity_level"]
            | null
          notes?: string | null
          partner_id?: string
          source_name?: string
          source_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "income_sources_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          achieved_date: string | null
          category: string | null
          created_at: string | null
          current_amount: number | null
          id: string
          is_achieved: boolean | null
          name: string
          notes: string | null
          notification_milestones: Json | null
          priority: string | null
          target_amount: number
          target_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achieved_date?: string | null
          category?: string | null
          created_at?: string | null
          current_amount?: number | null
          id?: string
          is_achieved?: boolean | null
          name: string
          notes?: string | null
          notification_milestones?: Json | null
          priority?: string | null
          target_amount: number
          target_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achieved_date?: string | null
          category?: string | null
          created_at?: string | null
          current_amount?: number | null
          id?: string
          is_achieved?: boolean | null
          name?: string
          notes?: string | null
          notification_milestones?: Json | null
          priority?: string | null
          target_amount?: number
          target_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          priority: string | null
          related_id: string | null
          related_type: string | null
          scheduled_for: string | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          priority?: string | null
          related_id?: string | null
          related_type?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          priority?: string | null
          related_id?: string | null
          related_type?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          onboarding_progress: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          onboarding_progress?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          onboarding_progress?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recurring_transactions: {
        Row: {
          amount: number
          auto_generate: boolean | null
          category: string
          created_at: string | null
          currency: string
          description: string | null
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean | null
          last_generated_date: string | null
          next_due_date: string
          notes: string | null
          partner_id: string | null
          reminder_days_before: number | null
          start_date: string
          subcategory: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          auto_generate?: boolean | null
          category: string
          created_at?: string | null
          currency?: string
          description?: string | null
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_generated_date?: string | null
          next_due_date: string
          notes?: string | null
          partner_id?: string | null
          reminder_days_before?: number | null
          start_date?: string
          subcategory?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          auto_generate?: boolean | null
          category?: string
          created_at?: string | null
          currency?: string
          description?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_generated_date?: string | null
          next_due_date?: string
          notes?: string | null
          partner_id?: string | null
          reminder_days_before?: number | null
          start_date?: string
          subcategory?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          currency: string
          description: string | null
          id: string
          is_recurring: boolean | null
          notes: string | null
          partner_id: string | null
          recurring_frequency: string | null
          subcategory: string | null
          transaction_date: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          partner_id?: string | null
          recurring_frequency?: string | null
          subcategory?: string | null
          transaction_date?: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          partner_id?: string | null
          recurring_frequency?: string | null
          subcategory?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_expense_group_creator: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: boolean
      }
      is_expense_group_member: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      liquidity_level: "L1" | "L2" | "L3" | "NL"
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
      liquidity_level: ["L1", "L2", "L3", "NL"],
    },
  },
} as const
