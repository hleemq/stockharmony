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
      batch_operations: {
        Row: {
          affected_items: Json | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          id: string
          operation_type: string
          status: string | null
        }
        Insert: {
          affected_items?: Json | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          operation_type: string
          status?: string | null
        }
        Update: {
          affected_items?: Json | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          operation_type?: string
          status?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      document_templates: {
        Row: {
          content: string
          created_at: string | null
          description: string | null
          file_url: string | null
          id: string
          name: string
          template_category: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          name: string
          template_category?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          name?: string
          template_category?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_analytics: {
        Row: {
          created_at: string | null
          date: string
          id: string
          item_id: string | null
          sales_count: number | null
          stock_level: number
          turnover_rate: number | null
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          item_id?: string | null
          sales_count?: number | null
          stock_level: number
          turnover_rate?: number | null
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          item_id?: string | null
          sales_count?: number | null
          stock_level?: number
          turnover_rate?: number | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_analytics_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_analytics_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_groups: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          barcode: string | null
          box_count: number | null
          category: Database["public"]["Enums"]["item_category"] | null
          created_at: string | null
          description: string | null
          group_id: string | null
          id: string
          image_url: string | null
          last_counted_at: string | null
          last_ordered_at: string | null
          low_stock_threshold: number
          maximum_stock: number | null
          minimum_stock: number | null
          name: string
          price: number
          quantity_per_box: number
          quantity_per_unit: number
          shipment_fees: number | null
          size: string | null
          sku: string
          status: Database["public"]["Enums"]["inventory_status"] | null
          total_quantity: number
          unit_count: number | null
          unit_price: number | null
          updated_at: string | null
          warehouse_id: string | null
        }
        Insert: {
          barcode?: string | null
          box_count?: number | null
          category?: Database["public"]["Enums"]["item_category"] | null
          created_at?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          image_url?: string | null
          last_counted_at?: string | null
          last_ordered_at?: string | null
          low_stock_threshold?: number
          maximum_stock?: number | null
          minimum_stock?: number | null
          name: string
          price?: number
          quantity_per_box?: number
          quantity_per_unit?: number
          shipment_fees?: number | null
          size?: string | null
          sku: string
          status?: Database["public"]["Enums"]["inventory_status"] | null
          total_quantity?: number
          unit_count?: number | null
          unit_price?: number | null
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Update: {
          barcode?: string | null
          box_count?: number | null
          category?: Database["public"]["Enums"]["item_category"] | null
          created_at?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          image_url?: string | null
          last_counted_at?: string | null
          last_ordered_at?: string | null
          low_stock_threshold?: number
          maximum_stock?: number | null
          minimum_stock?: number | null
          name?: string
          price?: number
          quantity_per_box?: number
          quantity_per_unit?: number
          shipment_fees?: number | null
          size?: string | null
          sku?: string
          status?: Database["public"]["Enums"]["inventory_status"] | null
          total_quantity?: number
          unit_count?: number | null
          unit_price?: number | null
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "inventory_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          batch_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          item_id: string | null
          movement_type: string
          quantity: number
          warehouse_id: string | null
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          item_id?: string | null
          movement_type: string
          quantity: number
          warehouse_id?: string | null
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          item_id?: string | null
          movement_type?: string
          quantity?: number
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          order_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          order_id?: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          order_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          template_content: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          template_content: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          template_content?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          customer_id: string | null
          customer_number: string | null
          id: string
          issued_by: string | null
          notes: string | null
          order_date: string | null
          order_number: string
          pdf_url: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number | null
          total_pre_tax: number | null
          unit_type: string | null
          updated_at: string | null
          validity_date: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          customer_number?: string | null
          id?: string
          issued_by?: string | null
          notes?: string | null
          order_date?: string | null
          order_number: string
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number | null
          total_pre_tax?: number | null
          unit_type?: string | null
          updated_at?: string | null
          validity_date?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          customer_number?: string | null
          id?: string
          issued_by?: string | null
          notes?: string | null
          order_date?: string | null
          order_number?: string
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number | null
          total_pre_tax?: number | null
          unit_type?: string | null
          updated_at?: string | null
          validity_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          database_id: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          database_id?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          database_id?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          currency: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          created_at: string | null
          id: string
          item_count: number | null
          location: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_count?: number | null
          location: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_count?: number | null
          location?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_safe_schema_name: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      get_user_schema: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          user_id: string
          required_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "user"
      inventory_status: "in_stock" | "low_stock" | "out_of_stock"
      item_category: "homme" | "femme" | "enfant" | "bebe"
      order_status: "pending" | "processing" | "completed" | "cancelled"
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
