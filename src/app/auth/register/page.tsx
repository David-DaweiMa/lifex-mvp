
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, CheckCircle } from 'lucide-react';
import { darkTheme } from '../../../lib/theme';
import { useAuth } from '../../../lib/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    full_name: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRegistrationSuccess(false);

    // Client-side validation
    if (!formData.email || !formData.password || !formData.full_name) {
      setError('请填写所有必填字段');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('密码不匹配');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('密码至少需要6个字符');
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 开始注册流程...', {
        email: formData.email,
        username: formData.username,
        full_name: formData.full_name
      });

      const result = await register(formData.email, formData.password, {
        username: formData.username,
        full_name: formData.full_name
      });

      console.log('📋 注册结果:', result);

      if (result.success && result.user) {
        // 🎉 注册成功
        console.log('✅ 注册成功!', result.user);
        
        // 清除任何错误信息
        setError('');
        setRegistrationSuccess(true);
        
        // 检查用户是否已验证
        if (!result.user.email_verified) {
          console.log('📧 需要邮箱验证，显示确认对话框');
          setShowEmailConfirmation(true);
        } else {
          console.log('✅ 邮箱已验证，跳转到首页');
          router.push('/');
        }
      } else {
        // ❌ 注册失败
        console.error('❌ 注册失败:', result.error);
        setError(result.error || '注册失败，请重试');
        setRegistrationSuccess(false);
      }
    } catch (err) {
      console.error('💥 注册过程中发生异常:', err);
      setError('发生意外错误，请稍后重试');
      setRegistrationSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setLoading(true);
      console.log('🔄 重新发送确认邮件...');
      
      // 这里可以调用重新发送邮件的API
      // const resendResult = await resendVerificationEmail(formData.email);
      
      // 临时显示消息
      alert('确认邮件已重新发送，请检查您的邮箱');
    } catch (error) {
      console.error('重新发送邮件失败:', error);
      alert('重新发送失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: darkTheme.background.primary }}>
      <div className="w-full max-w-md px-6 py-8">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: darkTheme.text.muted }}
        >
          <ArrowLeft size={16} />
          返回首页
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: darkTheme.text.primary }}>
            创建账户
          </h1>
          <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
            加入 LifeX，发现精彩的本地服务
          </p>
        </div>

        {/* Success Message */}
        {registrationSuccess && !showEmailConfirmation && (
          <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ 
            background: 'rgba(34, 197, 94, 0.1)', 
            borderLeft: `4px solid #22c55e` 
          }}>
            <CheckCircle size={20} style={{ color: '#22c55e' }} />
            <div>
              <p className="font-medium" style={{ color: '#22c55e' }}>注册成功！</p>
              <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                您的账户已创建，请检查邮箱完成验证
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkTheme.text.primary }}>
              真实姓名 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkTheme.text.muted }} />
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary,
                  '--tw-ring-color': darkTheme.neon.purple,
                } as React.CSSProperties}
                placeholder="请输入您的真实姓名"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkTheme.text.primary }}>
              用户名 <span className="text-xs opacity-60">(可选)</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkTheme.text.muted }} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary,
                  '--tw-ring-color': darkTheme.neon.purple,
                } as React.CSSProperties}
                placeholder="选择一个用户名"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkTheme.text.primary }}>
              邮箱地址 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkTheme.text.muted }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary,
                  '--tw-ring-color': darkTheme.neon.purple,
                } as React.CSSProperties}
                placeholder="请输入您的邮箱地址"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkTheme.text.primary }}>
              密码 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkTheme.text.muted }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full pl-10 pr-12 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary,
                  '--tw-ring-color': darkTheme.neon.purple,
                } as React.CSSProperties}
                placeholder="创建密码（至少6个字符）"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 disabled:opacity-50"
                style={{ color: darkTheme.text.muted }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkTheme.text.primary }}>
              确认密码 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkTheme.text.muted }} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full pl-10 pr-12 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary,
                  '--tw-ring-color': darkTheme.neon.purple,
                } as React.CSSProperties}
                placeholder="请再次输入密码"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 disabled:opacity-50"
                style={{ color: darkTheme.text.muted }}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg text-sm border-l-4" style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: '#ef4444',
              borderLeftColor: '#ef4444'
            }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ 
              background: loading ? darkTheme.background.secondary : darkTheme.neon.purple, 
              color: 'white' 
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                创建账户中...
              </>
            ) : (
              '创建账户'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
            已有账户？{' '}
            <Link 
              href="/auth/login"
              className="font-medium transition-colors hover:underline"
              style={{ color: darkTheme.neon.purple }}
            >
              立即登录
            </Link>
          </p>
        </div>

        {/* Terms */}
        <div className="text-center mt-4">
          <p className="text-xs" style={{ color: darkTheme.text.muted }}>
            创建账户即表示您同意我们的{' '}
            <Link href="/terms" className="underline hover:opacity-80">服务条款</Link>
            {' '}和{' '}
            <Link href="/privacy" className="underline hover:opacity-80">隐私政策</Link>
          </p>
        </div>
      </div>

      {/* Email Confirmation Modal */}
      {showEmailConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                注册成功！
              </h3>
              
              {/* Message */}
              <p className="text-sm text-gray-600 mb-6">
                我们已向 <strong className="text-gray-900">{formData.email}</strong> 发送了一封确认邮件。
                <br />
                请点击邮件中的链接来激活您的账户。
              </p>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowEmailConfirmation(false)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  我知道了
                </button>
                
                <button
                  onClick={handleResendEmail}
                  disabled={loading}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  {loading ? '发送中...' : '重新发送邮件'}
                </button>
                
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full text-gray-500 py-2 px-4 rounded-md hover:text-gray-700 transition-colors"
                >
                  返回登录
                </button>
              </div>
              
              {/* Help Text */}
              <p className="text-xs text-gray-500 mt-4">
                没有收到邮件？请检查垃圾邮件文件夹，或点击上方按钮重新发送。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}