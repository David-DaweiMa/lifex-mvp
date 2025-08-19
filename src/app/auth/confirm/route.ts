// src/app/auth/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log('=== 邮件确认处理 ===');
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    console.log('收到确认请求:', { token: token?.slice(0, 8) + '...', email });

    if (!token) {
      console.error('❌ 缺少Token参数');
      return redirectToError('缺少验证Token');
    }

    // 查找Token记录
    console.log('🔍 查找Token记录...');
    const { data: tokenRecord, error: tokenError } = await supabaseAdmin
      .from('email_confirmations')
      .select('*')
      .eq('token', token)
      .eq('token_type', 'email_verification')
      .single();

    if (tokenError) {
      console.error('❌ Token查询失败:', tokenError);
      return redirectToError(`Token查询失败: ${tokenError.message}`);
    }

    if (!tokenRecord) {
      console.error('❌ Token不存在');
      return redirectToError('无效的验证Token');
    }

    console.log('✅ 找到Token记录');

    // 检查Token是否已经被使用过
    if (tokenRecord.used_at) {
      console.log('⚠️ Token已被使用过，检查用户验证状态...');
      
      // 检查用户的邮箱验证状态
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('email_verified')
        .eq('id', tokenRecord.user_id)
        .single();

      if (userProfile?.email_verified) {
        console.log('✅ 用户邮箱已验证，重定向到成功页面');
        return redirectToSuccess('您的邮箱已经确认过了！');
      } else {
        console.log('❌ Token已使用但用户未验证');
        return redirectToError('验证Token已被使用，但验证状态异常');
      }
    }

    // 检查Token是否过期
    const now = new Date();
    const expiresAt = new Date(tokenRecord.expires_at);
    
    if (now > expiresAt) {
      console.error('❌ Token已过期');
      
      // 删除过期的Token
      await supabaseAdmin
        .from('email_confirmations')
        .delete()
        .eq('id', tokenRecord.id);
      
      return redirectToError('验证Token已过期，请重新注册');
    }

    console.log('✅ Token有效，未过期');

    // 开始更新用户邮箱验证状态
    console.log('📧 开始更新用户邮箱验证状态...');
    
    try {
      // 1. 更新auth.users表中的邮箱确认状态
      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
        tokenRecord.user_id,
        { email_confirm: true }
      );

      if (authUpdateError) {
        console.error('❌ 更新auth用户状态失败:', authUpdateError);
        return redirectToError('确认过程中发生错误');
      }

      // 2. 更新user_profiles表中的邮箱验证状态
      const { error: profileUpdateError } = await supabaseAdmin
        .from('user_profiles')
        .update({ 
          email_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', tokenRecord.user_id);

      if (profileUpdateError) {
        console.error('❌ 更新用户配置文件失败:', profileUpdateError);
        return redirectToError('确认过程中发生错误');
      }

      // 3. 标记Token为已使用
      const { error: tokenUpdateError } = await supabaseAdmin
        .from('email_confirmations')
        .update({ 
          used_at: new Date().toISOString()
        })
        .eq('id', tokenRecord.id);

      if (tokenUpdateError) {
        console.error('⚠️ 更新Token状态失败:', tokenUpdateError);
        // 这个错误不阻止确认过程，只是记录
      }

      console.log('✅ 邮箱确认成功！');

      // 验证最终状态
      const { data: finalCheck } = await supabaseAdmin
        .from('user_profiles')
        .select('email_verified')
        .eq('id', tokenRecord.user_id)
        .single();

      if (!finalCheck?.email_verified) {
        console.error('❌ 最终验证失败，邮箱验证状态仍为false');
        return redirectToError('确认过程可能未完成，请联系支持团队');
      }

      console.log('✅ 最终验证成功，邮箱已确认');

      // 可选：发送欢迎邮件
      try {
        const { emailService } = await import('@/lib/emailService');
        const username = tokenRecord.email.split('@')[0];
        
        // 获取用户信息
        const { data: userProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('user_type')
          .eq('id', tokenRecord.user_id)
          .single();

        await emailService.sendWelcomeEmail(
          tokenRecord.email, 
          username, 
          userProfile?.user_type || 'free'
        );
        console.log('✅ 欢迎邮件已发送');
      } catch (emailError) {
        console.error('⚠️ 发送欢迎邮件失败:', emailError);
        // 不阻止确认流程
      }

      // 重定向到成功页面
      return redirectToSuccess('邮箱确认成功！欢迎加入LifeX！');

    } catch (updateError) {
      console.error('💥 更新过程中发生异常:', updateError);
      return redirectToError('确认过程中发生系统错误');
    }

  } catch (error) {
    console.error('💥 邮件确认过程中发生异常:', error);
    return redirectToError('确认过程中发生错误');
  }
}

function redirectToError(message: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const errorUrl = `${baseUrl}/auth/confirm-result?status=error&message=${encodeURIComponent(message)}&timestamp=${Date.now()}`;
  
  console.log('🔄 重定向到错误页面:', errorUrl);
  return NextResponse.redirect(errorUrl);
}

function redirectToSuccess(message: string = '邮箱确认成功！欢迎加入LifeX！') {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const successUrl = `${baseUrl}/auth/confirm-result?status=success&message=${encodeURIComponent(message)}&timestamp=${Date.now()}`;
  
  console.log('🔄 重定向到成功页面:', successUrl);
  return NextResponse.redirect(successUrl);
}