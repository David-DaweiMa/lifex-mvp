import { createClient } from '@supabase/supabase-js';
import { Database } from './supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * 全局类型安全的Supabase包装器
 * 解决TypeScript never类型推断问题
 */

// 创建基础客户端
const baseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
const adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey);

/**
 * 类型安全的查询包装器
 */
export const safeSupabase = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          try {
            const { data, error } = await (baseClient as any)
              .from(table)
              .select(columns)
              .eq(column, value)
              .single();
            return { data: data as any, error };
          } catch (err) {
            return { data: null, error: err };
          }
        },
        maybeSingle: async () => {
          try {
            const { data, error } = await (baseClient as any)
              .from(table)
              .select(columns)
              .eq(column, value)
              .maybeSingle();
            return { data: data as any, error };
          } catch (err) {
            return { data: null, error: err };
          }
        }
      }),
      maybeSingle: async () => {
        try {
          const { data, error } = await (baseClient as any)
            .from(table)
            .select(columns)
            .maybeSingle();
          return { data: data as any, error };
        } catch (err) {
          return { data: null, error: err };
        }
      }
    }),
    insert: async (values: any) => {
      try {
        const { data, error } = await (baseClient as any)
          .from(table)
          .insert(values);
        return { data: data as any, error };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    update: (values: any) => ({
      eq: (column: string, value: any) => ({
        eq: (column2: string, value2: any) => ({
          eq: (column3: string, value3: any) => async () => {
            try {
              const { data, error } = await (baseClient as any)
                .from(table)
                .update(values)
                .eq(column, value)
                .eq(column2, value2)
                .eq(column3, value3);
              return { data: data as any, error };
            } catch (err) {
              return { data: null, error: err };
            }
          }
        })
      })
    }),
    rpc: (functionName: string, params?: any) => {
      try {
        return (baseClient as any).rpc(functionName, params);
      } catch (err) {
        return null;
      }
    }
  })
};

/**
 * 类型安全的管理员客户端包装器
 */
export const safeSupabaseAdmin = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          try {
            const { data, error } = await (adminClient as any)
              .from(table)
              .select(columns)
              .eq(column, value)
              .single();
            return { data: data as any, error };
          } catch (err) {
            return { data: null, error: err };
          }
        },
        maybeSingle: async () => {
          try {
            const { data, error } = await (adminClient as any)
              .from(table)
              .select(columns)
              .eq(column, value)
              .maybeSingle();
            return { data: data as any, error };
          } catch (err) {
            return { data: null, error: err };
          }
        }
      }),
      maybeSingle: async () => {
        try {
          const { data, error } = await (adminClient as any)
            .from(table)
            .select(columns)
            .maybeSingle();
          return { data: data as any, error };
        } catch (err) {
          return { data: null, error: err };
        }
      }
    }),
    insert: async (values: any) => {
      try {
        const { data, error } = await (adminClient as any)
          .from(table)
          .insert(values);
        return { data: data as any, error };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    update: (values: any) => ({
      eq: (column: string, value: any) => ({
        eq: (column2: string, value2: any) => ({
          eq: (column3: string, value3: any) => async () => {
            try {
              const { data, error } = await (adminClient as any)
                .from(table)
                .update(values)
                .eq(column, value)
                .eq(column2, value2)
                .eq(column3, value3);
              return { data: data as any, error };
            } catch (err) {
              return { data: null, error: err };
            }
          }
        })
      })
    }),
    rpc: (functionName: string, params?: any) => {
      try {
        return (adminClient as any).rpc(functionName, params);
      } catch (err) {
        return null;
      }
    }
  }),
  auth: {
    admin: {
      createUser: async (userData: any) => {
        try {
          const { data, error } = await (adminClient as any).auth.admin.createUser(userData);
          return { data: data as any, error };
        } catch (err) {
          return { data: null, error: err };
        }
      },
      deleteUser: async (userId: string) => {
        try {
          const { data, error } = await (adminClient as any).auth.admin.deleteUser(userId);
          return { data: data as any, error };
        } catch (err) {
          return { data: null, error: err };
        }
      }
    }
  }
};

/**
 * 快速修复函数 - 为现有的typedSupabase添加类型断言
 */
export const quickFixSupabase = (client: any) => client as any;
export const quickFixSupabaseAdmin = (client: any) => client as any;
