'use client';

import { useState } from 'react';
import { typedSupabase } from '@/lib/supabase';

export default function SupabaseTestPage() {
  const [status, setStatus] = useState<string>('');
  const [users, setUsers] = useState<any[]>([]);

  const testConnection = async () => {
    setStatus('Testing connection...');
    try {
      // Test basic connection
      const { data, error } = await typedSupabase.from('user_profiles').select('count').limit(1);
      
      if (error) {
        setStatus(`Connection failed: ${error.message}`);
      } else {
        setStatus('Connection successful!');
      }
    } catch (err) {
      setStatus(`Error: ${err}`);
    }
  };

  const createTestUser = async () => {
    setStatus('Creating test user...');
    try {
      const testEmail = `user${Date.now()}@gmail.com`;
      
      // 直接创建用户配置文件，不依赖Supabase Auth
      const { data: profile, error: profileError } = await typedSupabase
        .from('user_profiles')
        .insert({
          email: testEmail,
          username: 'testuser',
          full_name: 'Test User',
          user_type: 'customer',
          is_verified: true,
          is_active: true
        })
        .select()
        .single();

      if (profileError) {
        setStatus(`Profile creation failed: ${profileError.message}`);
        return;
      }

      setStatus(`Test user created successfully! Email: ${testEmail}, Profile ID: ${profile.id}`);
    } catch (err) {
      setStatus(`Error: ${err}`);
    }
  };

  const listUsers = async () => {
    setStatus('Fetching users...');
    try {
      const { data, error } = await typedSupabase.from('user_profiles').select('*').limit(10);
      
      if (error) {
        setStatus(`Failed to fetch users: ${error.message}`);
      } else {
        setUsers(data || []);
        setStatus(`Found ${data?.length || 0} users`);
      }
    } catch (err) {
      setStatus(`Error: ${err}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Connection Test</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testConnection}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Test Connection
          </button>
          
          <button
            onClick={createTestUser}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded ml-4"
          >
            Create Test User
          </button>
          
          <button
            onClick={listUsers}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded ml-4"
          >
            List Users
          </button>
        </div>

        <div className="bg-gray-800 p-4 rounded mb-8">
          <h2 className="text-xl font-semibold mb-2">Status:</h2>
          <p className="text-gray-300">{status}</p>
        </div>

        {users.length > 0 && (
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-semibold mb-4">Users in Database:</h2>
            <div className="space-y-2">
              {users.map((user, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded">
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Username:</strong> {user.username || 'N/A'}</p>
                  <p><strong>Full Name:</strong> {user.full_name || 'N/A'}</p>
                  <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
