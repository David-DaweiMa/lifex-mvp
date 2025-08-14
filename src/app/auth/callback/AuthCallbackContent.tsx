'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { typedSupabase } from '@/lib/supabase';

export default function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string>('处理中...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 获取URL参数
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');
        const error = searchParams.get('error');
        const error_description = searchParams.get('error_description');

        if (error) {
          setStatus(`认证失败: ${error_description || error}`);
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
          return;
        }

        if (access_token && refresh_token) {
          // 设置会话
          const { error: sessionError } = await typedSupabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (sessionError) {
            setStatus(`会话设置失败: ${sessionError.message}`);
            setTimeout(() => {
              router.push('/auth/login');
            }, 3000);
            return;
          }

          // 更新用户验证状态
          const { data: { user } } = await typedSupabase.auth.getUser();
          if (user) {
            const { error: updateError } = await typedSupabase
              .from('user_profiles')
              .update({ is_verified: true })
              .eq('email', user.email);

            if (updateError) {
              console.warn('更新用户验证状态失败:', updateError);
            }
          }

          setStatus('邮箱验证成功！正在跳转...');
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setStatus('无效的认证参数');
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
        }
      } catch (error) {
        console.error('认证回调处理失败:', error);
        setStatus('处理认证回调时发生错误');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-4">邮箱验证</h1>
          <p className="text-gray-300">{status}</p>
        </div>
      </div>
    </div>
  );
}
