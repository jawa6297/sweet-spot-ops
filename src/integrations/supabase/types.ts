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
      advances: {
        Row: {
          amount: number
          approved_by_accounts: string | null
          approved_by_dept_head: string | null
          approved_by_hr: string | null
          approved_by_md: string | null
          created_at: string | null
          disbursed_at: string | null
          employee_id: string
          id: string
          reason: string | null
          remaining_balance: number | null
          repayment_months: number | null
          status: Database["public"]["Enums"]["approval_status"] | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          approved_by_accounts?: string | null
          approved_by_dept_head?: string | null
          approved_by_hr?: string | null
          approved_by_md?: string | null
          created_at?: string | null
          disbursed_at?: string | null
          employee_id: string
          id?: string
          reason?: string | null
          remaining_balance?: number | null
          repayment_months?: number | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approved_by_accounts?: string | null
          approved_by_dept_head?: string | null
          approved_by_hr?: string | null
          approved_by_md?: string | null
          created_at?: string | null
          disbursed_at?: string | null
          employee_id?: string
          id?: string
          reason?: string | null
          remaining_balance?: number | null
          repayment_months?: number | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          branch_id: string
          check_in_time: string | null
          check_out_time: string | null
          created_at: string | null
          date: string | null
          distance_from_branch: number | null
          employee_id: string
          id: string
          latitude: number | null
          longitude: number | null
          status: string | null
          worked_hours: number | null
        }
        Insert: {
          branch_id: string
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          date?: string | null
          distance_from_branch?: number | null
          employee_id: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          status?: string | null
          worked_hours?: number | null
        }
        Update: {
          branch_id?: string
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          date?: string | null
          distance_from_branch?: number | null
          employee_id?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          status?: string | null
          worked_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          created_at: string | null
          geo_fence_radius: number | null
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          name: string
          pf_enabled: boolean | null
          pf_percentage: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          geo_fence_radius?: number | null
          id?: string
          latitude?: number | null
          location: string
          longitude?: number | null
          name: string
          pf_enabled?: boolean | null
          pf_percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          geo_fence_radius?: number | null
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          name?: string
          pf_enabled?: boolean | null
          pf_percentage?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          branch_id: string | null
          created_at: string | null
          head_employee_id: string | null
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          head_employee_id?: string | null
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          head_employee_id?: string | null
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          avatar_url: string | null
          base_salary: number | null
          branch_id: string
          created_at: string | null
          date_joined: string | null
          department_id: string | null
          designation: string | null
          email: string
          id: string
          name: string
          pf_applicable: boolean | null
          phone: string | null
          status: Database["public"]["Enums"]["employee_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          base_salary?: number | null
          branch_id: string
          created_at?: string | null
          date_joined?: string | null
          department_id?: string | null
          designation?: string | null
          email: string
          id?: string
          name: string
          pf_applicable?: boolean | null
          phone?: string | null
          status?: Database["public"]["Enums"]["employee_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          base_salary?: number | null
          branch_id?: string
          created_at?: string | null
          date_joined?: string | null
          department_id?: string | null
          designation?: string | null
          email?: string
          id?: string
          name?: string
          pf_applicable?: boolean | null
          phone?: string | null
          status?: Database["public"]["Enums"]["employee_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          department_id: string | null
          description: string | null
          destination_branch_id: string | null
          estimated_hours: number | null
          id: string
          origin_branch_id: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          progress_percentage: number | null
          scheduled_end: string | null
          scheduled_start: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          travel_required: boolean | null
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          destination_branch_id?: string | null
          estimated_hours?: number | null
          id?: string
          origin_branch_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          progress_percentage?: number | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          travel_required?: boolean | null
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          destination_branch_id?: string | null
          estimated_hours?: number | null
          id?: string
          origin_branch_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          progress_percentage?: number | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          travel_required?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_destination_branch_id_fkey"
            columns: ["destination_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_origin_branch_id_fkey"
            columns: ["origin_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          employee_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "md" | "dept_head" | "hr" | "accounts" | "employee"
      approval_status: "pending" | "approved" | "rejected"
      employee_status: "active" | "inactive" | "on_leave"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "todo" | "in_progress" | "blocked" | "completed"
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
      app_role: ["md", "dept_head", "hr", "accounts", "employee"],
      approval_status: ["pending", "approved", "rejected"],
      employee_status: ["active", "inactive", "on_leave"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["todo", "in_progress", "blocked", "completed"],
    },
  },
} as const
