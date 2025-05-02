
import type { Database } from "./types";

// Database table definitions for TypeScript
export type Tables = {
  calculations: {
    id: number;
    principal: number;
    rate: number;
    time: number;
    frequency: string;
    final_amount: number;
    solve_for: string;
    created_at: string;
  };
};

// Export the Database type from the generated Supabase types
export type { Database } from "./types";

// Type-safe extension to the Supabase client
export type TablesInsert<T extends keyof Tables> = Tables[T];
export type TablesUpdate<T extends keyof Tables> = Partial<Tables[T]>;

// Extend the Database type with our custom tables
declare module "./types" {
  interface Database {
    public: {
      Tables: {
        calculations: {
          Row: Tables["calculations"];
          Insert: TablesInsert<"calculations">;
          Update: TablesUpdate<"calculations">;
        };
      };
    };
  }
}
