'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Save, Loader2 } from 'lucide-react';
import { darkTheme } from '../../../../lib/theme';
import { useAuth } from '../../../../lib/hooks/useAuth';
import { UserProfile } from '../../../../lib/authService';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateProfile, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        username: user.username || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updates: Partial<UserProfile> = {};
      
      if (formData.full_name !== user?.full_name) {
        updates.full_name = formData.full_name;
      }
      
      if (formData.username !== user?.username) {
        updates.username = formData.username;
      }

      if (Object.keys(updates).length === 0) {
        setSuccess('No changes to save');
        setSaving(false);
        return;
      }

      const result = await updateProfile(updates);

      if (result.success) {
        setSuccess('Profile updated successfully');
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: darkTheme.background.primary }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: darkTheme.neon.purple }} />
          <p style={{ color: darkTheme.text.secondary }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: darkTheme.background.primary }}>
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/"
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: darkTheme.text.muted }}
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: darkTheme.text.primary }}>
              Edit Profile
            </h1>
            <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
              Update your personal information
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkTheme.text.primary }}>
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkTheme.text.muted }} />
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary,
                  '--tw-ring-color': darkTheme.neon.purple,
                } as React.CSSProperties}
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkTheme.text.primary }}>
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkTheme.text.muted }} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary,
                  '--tw-ring-color': darkTheme.neon.purple,
                } as React.CSSProperties}
                placeholder="Choose a username"
              />
            </div>
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkTheme.text.primary }}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkTheme.text.muted }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all opacity-50 cursor-not-allowed"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary,
                }}
                placeholder="Your email address"
              />
            </div>
            <p className="text-xs mt-1" style={{ color: darkTheme.text.muted }}>
              Email address cannot be changed. Contact support if needed.
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ 
              background: saving ? darkTheme.background.secondary : darkTheme.neon.purple, 
              color: 'white' 
            }}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </form>

        {/* Account Info */}
        <div className="mt-8 p-4 rounded-lg border" style={{ 
          background: darkTheme.background.card,
          borderColor: darkTheme.background.glass
        }}>
          <h3 className="font-medium mb-3" style={{ color: darkTheme.text.primary }}>
            Account Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: darkTheme.text.muted }}>Account Type:</span>
              <span style={{ color: darkTheme.text.primary }}>{user.user_type}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: darkTheme.text.muted }}>Member Since:</span>
              <span style={{ color: darkTheme.text.primary }}>
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: darkTheme.text.muted }}>Status:</span>
              <span 
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  (user.is_active ?? true) 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {(user.is_active ?? true) ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
