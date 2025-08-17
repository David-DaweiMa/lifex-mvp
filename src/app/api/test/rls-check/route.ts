import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      checks: []
    };

    // 检查1: RLS策略
    try {
      const { data: policies, error } = await supabase.rpc('check_rls_policies');
      if (error) {
        // 如果RPC不存在，直接查询表结构
        const { data: tableInfo, error: tableError } = await supabase
          .from('user_profiles')
          .select('*')
          .limit(1);
        
        if (tableError) {
          results.checks.push({
            name: 'RLS策略',
            status: 'error',
            message: `RLS策略检查失败: ${tableError.message}`,
            details: tableError
          });
        } else {
          results.checks.push({
            name: 'RLS策略',
            status: 'warning',
            message: 'RLS策略状态需要进一步检查',
            details: { tableAccessible: true }
          });
        }
      } else {
        results.checks.push({
          name: 'RLS策略',
          status: 'success',
          message: 'RLS策略检查完成',
          details: policies
        });
      }
    } catch (error: any) {
      results.checks.push({
        name: 'RLS策略',
        status: 'error',
        message: `RLS策略检查异常: ${error.message}`,
        details: error
      });
    }

    // 检查2: 触发器
    try {
      const { data: triggers, error } = await supabase.rpc('check_triggers');
      if (error) {
        results.checks.push({
          name: '触发器',
          status: 'warning',
          message: '触发器检查需要进一步验证',
          details: { error: error.message }
        });
      } else {
        results.checks.push({
          name: '触发器',
          status: 'success',
          message: '触发器检查完成',
          details: triggers
        });
      }
    } catch (error: any) {
      results.checks.push({
        name: '触发器',
        status: 'error',
        message: `触发器检查异常: ${error.message}`,
        details: error
      });
    }

    // 检查3: 表结构
    try {
      const { data: tableStructure, error } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(0);
      
      if (error) {
        results.checks.push({
          name: '表结构',
          status: 'error',
          message: `表结构检查失败: ${error.message}`,
          details: error
        });
      } else {
        results.checks.push({
          name: '表结构',
          status: 'success',
          message: 'user_profiles表可访问',
          details: { accessible: true }
        });
      }
    } catch (error: any) {
      results.checks.push({
        name: '表结构',
        status: 'error',
        message: `表结构检查异常: ${error.message}`,
        details: error
      });
    }

    // 检查4: 邮件确认表
    try {
      const { data: emailTable, error } = await supabase
        .from('email_confirmations')
        .select('*')
        .limit(0);
      
      if (error) {
        results.checks.push({
          name: '邮件确认表',
          status: 'error',
          message: `邮件确认表检查失败: ${error.message}`,
          details: error
        });
      } else {
        results.checks.push({
          name: '邮件确认表',
          status: 'success',
          message: 'email_confirmations表可访问',
          details: { accessible: true }
        });
      }
    } catch (error: any) {
      results.checks.push({
        name: '邮件确认表',
        status: 'error',
        message: `邮件确认表检查异常: ${error.message}`,
        details: error
      });
    }

    // 检查5: 函数存在性
    try {
      const { data: functions, error } = await supabase.rpc('check_functions_exist');
      if (error) {
        results.checks.push({
          name: '函数检查',
          status: 'warning',
          message: '函数检查需要进一步验证',
          details: { error: error.message }
        });
      } else {
        results.checks.push({
          name: '函数检查',
          status: 'success',
          message: '函数检查完成',
          details: functions
        });
      }
    } catch (error: any) {
      results.checks.push({
        name: '函数检查',
        status: 'error',
        message: `函数检查异常: ${error.message}`,
        details: error
      });
    }

    return NextResponse.json(results);

  } catch (error: any) {
    return NextResponse.json({
      error: '检查过程失败',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
