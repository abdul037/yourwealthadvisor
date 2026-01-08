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
      affiliate_partners: {
        Row: {
          bonus_coins: number | null
          bonus_description: string | null
          category: string
          commission_type: string | null
          commission_value: number | null
          created_at: string | null
          description: string | null
          display_order: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          logo_url: string | null
          min_deposit: number | null
          name: string
          referral_url: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          bonus_coins?: number | null
          bonus_description?: string | null
          category: string
          commission_type?: string | null
          commission_value?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          logo_url?: string | null
          min_deposit?: number | null
          name: string
          referral_url: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          bonus_coins?: number | null
          bonus_description?: string | null
          category?: string
          commission_type?: string | null
          commission_value?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          logo_url?: string | null
          min_deposit?: number | null
          name?: string
          referral_url?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
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
      challenge_participants: {
        Row: {
          challenge_id: string | null
          completed_at: string | null
          id: string
          joined_at: string | null
          progress: number | null
          rank: number | null
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          completed_at?: string | null
          id?: string
          joined_at?: string | null
          progress?: number | null
          rank?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          completed_at?: string | null
          id?: string
          joined_at?: string | null
          progress?: number | null
          rank?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          challenge_type: string
          circle_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          entry_fee_coins: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_sponsored: boolean | null
          max_participants: number | null
          name: string
          prize_pool_coins: number | null
          sponsor_name: string | null
          start_date: string
          target_metric: string
          target_value: number | null
        }
        Insert: {
          challenge_type: string
          circle_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          entry_fee_coins?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_sponsored?: boolean | null
          max_participants?: number | null
          name: string
          prize_pool_coins?: number | null
          sponsor_name?: string | null
          start_date: string
          target_metric: string
          target_value?: number | null
        }
        Update: {
          challenge_type?: string
          circle_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          entry_fee_coins?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_sponsored?: boolean | null
          max_participants?: number | null
          name?: string
          prize_pool_coins?: number | null
          sponsor_name?: string | null
          start_date?: string
          target_metric?: string
          target_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_memberships: {
        Row: {
          circle_id: string | null
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          circle_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          circle_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_memberships_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circles: {
        Row: {
          category: string
          cover_color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_premium: boolean | null
          is_private: boolean | null
          member_count: number | null
          name: string
          post_count: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          category: string
          cover_color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_premium?: boolean | null
          is_private?: boolean | null
          member_count?: number | null
          name: string
          post_count?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          cover_color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_premium?: boolean | null
          is_private?: boolean | null
          member_count?: number | null
          name?: string
          post_count?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      coin_balances: {
        Row: {
          balance: number | null
          lifetime_earned: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          lifetime_earned?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          lifetime_earned?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          source: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          source?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          source?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          parent_comment_id: string | null
          post_id: string | null
          updated_at: string | null
          upvote_count: number | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          upvote_count?: number | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          upvote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_sharing: {
        Row: {
          created_at: string | null
          id: string
          share_achievements: boolean | null
          share_challenges: boolean | null
          share_net_worth_percentile: boolean | null
          share_savings_rate: boolean | null
          share_streaks: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          share_achievements?: boolean | null
          share_challenges?: boolean | null
          share_net_worth_percentile?: boolean | null
          share_savings_rate?: boolean | null
          share_streaks?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          share_achievements?: boolean | null
          share_challenges?: boolean | null
          share_net_worth_percentile?: boolean | null
          share_savings_rate?: boolean | null
          share_streaks?: boolean | null
          updated_at?: string | null
          user_id?: string
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
          expense_date: string | null
          group_id: string
          id: string
          notes: string | null
          paid_by_member_id: string
          split_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          expense_date?: string | null
          group_id: string
          id?: string
          notes?: string | null
          paid_by_member_id: string
          split_type?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          expense_date?: string | null
          group_id?: string
          id?: string
          notes?: string | null
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
          settlement_date: string | null
          to_member_id: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          from_member_id: string
          group_id: string
          id?: string
          settled_at?: string | null
          settlement_date?: string | null
          to_member_id: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          from_member_id?: string
          group_id?: string
          id?: string
          settled_at?: string | null
          settlement_date?: string | null
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
      leaderboard_entries: {
        Row: {
          avatar_url: string | null
          category: string
          city: string | null
          country: string | null
          created_at: string | null
          display_name: string
          id: string
          is_public: boolean | null
          percentile: number | null
          rank: number | null
          region: string | null
          score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          category?: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          display_name: string
          id?: string
          is_public?: boolean | null
          percentile?: number | null
          rank?: number | null
          region?: string | null
          score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          category?: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string
          id?: string
          is_public?: boolean | null
          percentile?: number | null
          rank?: number | null
          region?: string | null
          score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      posts: {
        Row: {
          author_id: string
          circle_id: string | null
          comment_count: number | null
          content: string
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          is_pinned: boolean | null
          post_type: string | null
          title: string | null
          updated_at: string | null
          upvote_count: number | null
        }
        Insert: {
          author_id: string
          circle_id?: string | null
          comment_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_pinned?: boolean | null
          post_type?: string | null
          title?: string | null
          updated_at?: string | null
          upvote_count?: number | null
        }
        Update: {
          author_id?: string
          circle_id?: string | null
          comment_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_pinned?: boolean | null
          post_type?: string | null
          title?: string | null
          updated_at?: string | null
          upvote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          achievements: Json | null
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          last_activity_date: string | null
          onboarding_completed: boolean | null
          onboarding_progress: Json | null
          preferences: Json | null
          streak_days: number | null
          total_points: number | null
          updated_at: string | null
        }
        Insert: {
          achievements?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          last_activity_date?: string | null
          onboarding_completed?: boolean | null
          onboarding_progress?: Json | null
          preferences?: Json | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string | null
        }
        Update: {
          achievements?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          last_activity_date?: string | null
          onboarding_completed?: boolean | null
          onboarding_progress?: Json | null
          preferences?: Json | null
          streak_days?: number | null
          total_points?: number | null
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
      referral_clicks: {
        Row: {
          clicked_at: string | null
          id: string
          ip_address: string | null
          partner_id: string
          source: string | null
          tracking_code: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          id?: string
          ip_address?: string | null
          partner_id: string
          source?: string | null
          tracking_code: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          id?: string
          ip_address?: string | null
          partner_id?: string
          source?: string | null
          tracking_code?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_clicks_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_conversions: {
        Row: {
          approved_at: string | null
          click_id: string | null
          coins_rewarded: number | null
          commission_earned: number | null
          converted_at: string | null
          id: string
          partner_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          click_id?: string | null
          coins_rewarded?: number | null
          commission_earned?: number | null
          converted_at?: string | null
          id?: string
          partner_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          click_id?: string | null
          coins_rewarded?: number | null
          commission_earned?: number | null
          converted_at?: string | null
          id?: string
          partner_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_conversions_click_id_fkey"
            columns: ["click_id"]
            isOneToOne: false
            referencedRelation: "referral_clicks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_conversions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_tiers: {
        Row: {
          ad_free: boolean
          ai_insights: boolean
          badge_style: string | null
          created_at: string
          description: string | null
          display_name: string
          display_order: number
          features: Json
          id: string
          is_active: boolean
          max_challenges: number
          max_circles: number
          name: string
          price_monthly: number
          price_yearly: number
          priority_support: boolean
          updated_at: string
        }
        Insert: {
          ad_free?: boolean
          ai_insights?: boolean
          badge_style?: string | null
          created_at?: string
          description?: string | null
          display_name: string
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          max_challenges?: number
          max_circles?: number
          name: string
          price_monthly?: number
          price_yearly?: number
          priority_support?: boolean
          updated_at?: string
        }
        Update: {
          ad_free?: boolean
          ai_insights?: boolean
          badge_style?: string | null
          created_at?: string
          description?: string | null
          display_name?: string
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          max_challenges?: number
          max_circles?: number
          name?: string
          price_monthly?: number
          price_yearly?: number
          priority_support?: boolean
          updated_at?: string
        }
        Relationships: []
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
      upvotes: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upvotes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upvotes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_connections: {
        Row: {
          addressee_id: string
          connection_type: string | null
          created_at: string | null
          id: string
          requester_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          addressee_id: string
          connection_type?: string | null
          created_at?: string | null
          id?: string
          requester_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          addressee_id?: string
          connection_type?: string | null
          created_at?: string | null
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_referral_rewards: {
        Row: {
          created_at: string | null
          id: string
          partner_id: string
          reward_type: string | null
          reward_value: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          partner_id: string
          reward_type?: string | null
          reward_value?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          partner_id?: string
          reward_type?: string | null
          reward_value?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_referral_rewards_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          billing_cycle: string
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string
          current_period_start: string
          external_customer_id: string | null
          external_subscription_id: string | null
          id: string
          payment_provider: string
          status: string
          tier_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end: string
          current_period_start?: string
          external_customer_id?: string | null
          external_subscription_id?: string | null
          id?: string
          payment_provider?: string
          status?: string
          tier_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          external_customer_id?: string | null
          external_subscription_id?: string | null
          id?: string
          payment_provider?: string
          status?: string
          tier_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
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
