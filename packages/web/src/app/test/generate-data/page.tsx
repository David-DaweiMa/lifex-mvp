// 生成测试数据的页面
"use client";

import React, { useState } from 'react';
import { Database, TrendingUp, Users, Heart, Share2, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface GenerationResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

const GenerateDataPage: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const generateTrendingData = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/test/generate-trending-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          data: data.data
        });
      } else {
        setResult({
          success: false,
          message: '生成失败',
          error: data.error || data.details
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: '生成失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">生成测试数据</h1>
              <p className="text-gray-600">为APP Store截图生成真实的测试数据</p>
            </div>
          </div>

          {/* Trending数据生成 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Trending内容数据</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              生成用户、trending帖子、点赞和分享记录，用于展示trending页面的功能。
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <Users className="w-5 h-5 text-purple-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">5个用户</div>
                <div className="text-xs text-gray-500">不同订阅级别</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <TrendingUp className="w-5 h-5 text-purple-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">5个帖子</div>
                <div className="text-xs text-gray-500">不同类型内容</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <Heart className="w-5 h-5 text-purple-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">点赞记录</div>
                <div className="text-xs text-gray-500">用户互动</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <Share2 className="w-5 h-5 text-purple-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">分享记录</div>
                <div className="text-xs text-gray-500">社交功能</div>
              </div>
            </div>

            <button
              onClick={generateTrendingData}
              disabled={isGenerating}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                isGenerating
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                  正在生成数据...
                </>
              ) : (
                '生成Trending数据'
              )}
            </button>
          </div>

          {/* 结果显示 */}
          {result && (
            <div className={`border rounded-lg p-4 ${
              result.success 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <h3 className={`font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.message}
                </h3>
              </div>

              {result.error && (
                <div className="mb-3 p-3 bg-red-100 rounded text-sm text-red-700">
                  {result.error}
                </div>
              )}

              {result.data && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white rounded p-3 border">
                      <div className="text-lg font-bold text-gray-900">
                        {result.data.users?.created || 0}
                      </div>
                      <div className="text-sm text-gray-600">用户创建</div>
                    </div>
                    <div className="bg-white rounded p-3 border">
                      <div className="text-lg font-bold text-gray-900">
                        {result.data.posts?.created || 0}
                      </div>
                      <div className="text-sm text-gray-600">帖子创建</div>
                    </div>
                    <div className="bg-white rounded p-3 border">
                      <div className="text-lg font-bold text-gray-900">
                        {result.data.likes?.created || 0}
                      </div>
                      <div className="text-sm text-gray-600">点赞记录</div>
                    </div>
                    <div className="bg-white rounded p-3 border">
                      <div className="text-lg font-bold text-gray-900">
                        {result.data.shares?.created || 0}
                      </div>
                      <div className="text-sm text-gray-600">分享记录</div>
                    </div>
                  </div>

                  {result.data.posts?.data && (
                    <div className="bg-white rounded p-3 border">
                      <h4 className="font-medium text-gray-900 mb-2">生成的帖子:</h4>
                      <div className="space-y-2">
                        {result.data.posts.data.map((post: any, index: number) => (
                          <div key={post.id} className="text-sm text-gray-600 border-l-2 border-purple-200 pl-3">
                            <div className="font-medium">{post.content.substring(0, 100)}...</div>
                            <div className="text-xs text-gray-500">
                              👍 {post.like_count} | 💬 {post.comment_count} | 📤 {post.share_count}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 下一步提示 */}
          {result?.success && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">下一步</h3>
              <p className="text-sm text-blue-700 mb-3">
                Trending数据已生成成功！现在您可以：
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 访问 <a href="/trending" className="underline">Trending页面</a> 查看生成的内容</li>
                <li>• 测试点赞、评论、分享功能</li>
                <li>• 生成Specials优惠数据</li>
                <li>• 制作APP Store截图</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateDataPage;
