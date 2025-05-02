
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

// Define a custom client type that includes our tables
export type DbClient = {
  from<T extends keyof Tables>(table: T): any;
};
