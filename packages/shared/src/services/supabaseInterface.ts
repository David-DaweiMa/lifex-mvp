// Supabase interface for shared services
// This allows shared services to work with different Supabase implementations

export interface SupabaseClient {
  from(table: string): any;
  auth: {
    getUser(): Promise<any>;
    getSession(): Promise<any>;
  };
}

export interface SupabaseQueryBuilder {
  select(columns?: string): SupabaseQueryBuilder;
  insert(data: any): SupabaseQueryBuilder;
  update(data: any): SupabaseQueryBuilder;
  delete(): SupabaseQueryBuilder;
  eq(column: string, value: any): SupabaseQueryBuilder;
  gte(column: string, value: any): SupabaseQueryBuilder;
  lte(column: string, value: any): SupabaseQueryBuilder;
  order(column: string, options?: { ascending?: boolean }): SupabaseQueryBuilder;
  limit(count: number): SupabaseQueryBuilder;
  single(): Promise<any>;
  then(onfulfilled?: ((value: any) => any) | undefined | null, onrejected?: ((reason: any) => any) | undefined | null): Promise<any>;
}

// Mock implementation for testing
export const createMockSupabase = (): SupabaseClient => ({
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
        then: (onfulfilled?: any) => Promise.resolve({ data: [], error: null }).then(onfulfilled)
      }),
      insert: () => ({
        then: (onfulfilled?: any) => Promise.resolve({ data: [], error: null }).then(onfulfilled)
      }),
      update: () => ({
        eq: () => ({
          then: (onfulfilled?: any) => Promise.resolve({ data: [], error: null }).then(onfulfilled)
        })
      }),
      delete: () => ({
        eq: () => ({
          then: (onfulfilled?: any) => Promise.resolve({ data: [], error: null }).then(onfulfilled)
        })
      })
    })
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null })
  }
});
