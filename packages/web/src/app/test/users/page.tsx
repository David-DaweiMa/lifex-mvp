// 测试用户数据展示页面
"use client";

import React, { useState, useEffect } from 'react';
import { Users, User, MapPin, Phone, Globe, Calendar } from 'lucide-react';

interface TestUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  business_name: string;
  avatar_url: string;
  phone: string;
  website: string;
  location: any;
  created_at: string;
}

const TestUsersPage: React.FC = () => {
  const [users, setUsers] = useState<TestUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestUsers();
  }, []);

  const fetchTestUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test/users');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatLocation = (location: any) => {
    if (!location) return 'No location';
    if (typeof location === 'string') {
      try {
        const parsed = JSON.parse(location);
        return `${parsed.city}, ${parsed.country}`;
      } catch {
        return location;
      }
    }
    return `${location.city}, ${location.country}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
          <button
            onClick={fetchTestUsers}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-8 w-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900">Test Users</h1>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {users.length} users
            </span>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No test users found</p>
              <button
                onClick={fetchTestUsers}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <div key={user.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="text-gray-600">{user.email}</span>
                    </div>

                    {user.business_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700">Business:</span>
                        <span className="text-gray-600">{user.business_name}</span>
                      </div>
                    )}

                    {user.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{user.phone}</span>
                      </div>
                    )}

                    {user.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <a
                          href={user.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {user.website}
                        </a>
                      </div>
                    )}

                    {user.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{formatLocation(user.location)}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500 font-mono">
                      ID: {user.id.substring(0, 8)}...
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={fetchTestUsers}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Refresh
            </button>
            <a
              href="/test"
              className="text-blue-600 hover:underline"
            >
              ← Back to Test Pages
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestUsersPage;

