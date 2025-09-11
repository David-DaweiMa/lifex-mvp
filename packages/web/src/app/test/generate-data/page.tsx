// 生成测试数据的页面
"use client";

import React, { useState } from 'react';
import { Database, TrendingUp, Heart, Share2, Loader2, CheckCircle, XCircle, Store, MapPin, Star } from 'lucide-react';

interface GenerationResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

const GenerateDataPage: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'trending' | 'businesses' | 'reviews'>('trending');

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

  const generateBusinessData = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/test/generate-business-data', {
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

  const generateReviewData = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/test/generate-review-data', {
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
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">生成测试数据</h1>
              <p className="text-gray-600">为APP Store截图生成真实的测试数据</p>
            </div>
          </div>

          {/* 标签页导航 */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'trending'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Trending内容
            </button>
            <button
              onClick={() => setActiveTab('businesses')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'businesses'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Store className="w-4 h-4 inline mr-2" />
              商家数据
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'reviews'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Star className="w-4 h-4 inline mr-2" />
              评价数据
            </button>
          </div>

          {/* Trending数据生成 */}
          {activeTab === 'trending' && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Trending内容数据</h2>
              </div>
              
              <p className="text-gray-600 mb-4">
                生成trending帖子、点赞和分享记录，用于展示trending页面的功能。
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3 border border-purple-100">
                  <TrendingUp className="w-5 h-5 text-purple-600 mb-2" />
                  <div className="text-sm font-medium text-gray-900">20个帖子</div>
                  <div className="text-xs text-gray-500">丰富内容类型</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-100">
                  <Heart className="w-5 h-5 text-purple-600 mb-2" />
                  <div className="text-sm font-medium text-gray-900">150+点赞</div>
                  <div className="text-xs text-gray-500">活跃用户互动</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-100">
                  <Share2 className="w-5 h-5 text-purple-600 mb-2" />
                  <div className="text-sm font-medium text-gray-900">40+分享</div>
                  <div className="text-xs text-gray-500">社交传播</div>
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
          )}

          {/* 商家数据生成 */}
          {activeTab === 'businesses' && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Store className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">商家数据</h2>
              </div>
              
              <p className="text-gray-600 mb-4">
                生成商家信息、菜单、照片等数据，用于展示商家发现页面。
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <Store className="w-5 h-5 text-blue-600 mb-2" />
                  <div className="text-sm font-medium text-gray-900">50个商家</div>
                  <div className="text-xs text-gray-500">多种服务类型</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <MapPin className="w-5 h-5 text-blue-600 mb-2" />
                  <div className="text-sm font-medium text-gray-900">完整地址</div>
                  <div className="text-xs text-gray-500">新西兰各地</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <Star className="w-5 h-5 text-blue-600 mb-2" />
                  <div className="text-sm font-medium text-gray-900">评分数据</div>
                  <div className="text-xs text-gray-500">真实评分范围</div>
                </div>
              </div>

              <button
                onClick={generateBusinessData}
                disabled={isGenerating}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  isGenerating
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                    正在生成数据...
                  </>
                ) : (
                  '生成商家数据'
                )}
              </button>
            </div>
          )}

          {/* 评价数据生成 */}
          {activeTab === 'reviews' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">评价数据</h2>
              </div>
              
              <p className="text-gray-600 mb-4">
                生成用户评价、评分和评论数据，用于展示商家评价系统。
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <Star className="w-5 h-5 text-green-600 mb-2" />
                  <div className="text-sm font-medium text-gray-900">200+评价</div>
                  <div className="text-xs text-gray-500">真实用户评价</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <Heart className="w-5 h-5 text-green-600 mb-2" />
                  <div className="text-sm font-medium text-gray-900">详细评论</div>
                  <div className="text-xs text-gray-500">多语言内容</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <TrendingUp className="w-5 h-5 text-green-600 mb-2" />
                  <div className="text-sm font-medium text-gray-900">评分分布</div>
                  <div className="text-xs text-gray-500">1-5星评分</div>
                </div>
              </div>

              <button
                onClick={generateReviewData}
                disabled={isGenerating}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  isGenerating
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                    正在生成数据...
                  </>
                ) : (
                  '生成评价数据'
                )}
              </button>
            </div>
          )}

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
                  {/* 根据当前标签页显示不同的数据统计 */}
                  {activeTab === 'trending' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                  )}

                  {activeTab === 'businesses' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="bg-white rounded p-3 border">
                        <div className="text-lg font-bold text-gray-900">
                          {result.data.businesses?.created || 0}
                        </div>
                        <div className="text-sm text-gray-600">商家创建</div>
                      </div>
                      <div className="bg-white rounded p-3 border">
                        <div className="text-lg font-bold text-gray-900">
                          {result.data.menus?.created || 0}
                        </div>
                        <div className="text-sm text-gray-600">菜单项目</div>
                      </div>
                      <div className="bg-white rounded p-3 border">
                        <div className="text-lg font-bold text-gray-900">
                          {result.data.photos?.created || 0}
                        </div>
                        <div className="text-sm text-gray-600">商家照片</div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="bg-white rounded p-3 border">
                        <div className="text-lg font-bold text-gray-900">
                          {result.data.reviews?.created || 0}
                        </div>
                        <div className="text-sm text-gray-600">评价创建</div>
                      </div>
                      <div className="bg-white rounded p-3 border">
                        <div className="text-lg font-bold text-gray-900">
                          {result.data.ratings?.created || 0}
                        </div>
                        <div className="text-sm text-gray-600">评分记录</div>
                      </div>
                      <div className="bg-white rounded p-3 border">
                        <div className="text-lg font-bold text-gray-900">
                          {result.data.comments?.created || 0}
                        </div>
                        <div className="text-sm text-gray-600">评论记录</div>
                      </div>
                    </div>
                  )}

                  {/* 显示生成的数据预览 */}
                  {result.data.posts?.data && activeTab === 'trending' && (
                    <div className="bg-white rounded p-3 border">
                      <h4 className="font-medium text-gray-900 mb-2">生成的帖子:</h4>
                      <div className="space-y-2">
                        {result.data.posts.data.slice(0, 3).map((post: any, index: number) => (
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

                  {result.data.businesses?.data && activeTab === 'businesses' && (
                    <div className="bg-white rounded p-3 border">
                      <h4 className="font-medium text-gray-900 mb-2">生成的商家:</h4>
                      <div className="space-y-2">
                        {result.data.businesses.data.slice(0, 3).map((business: any, index: number) => (
                          <div key={business.id} className="text-sm text-gray-600 border-l-2 border-blue-200 pl-3">
                            <div className="font-medium">{business.name}</div>
                            <div className="text-xs text-gray-500">
                              📍 {business.address} | ⭐ {business.rating} | 🏷️ {business.category}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.data.reviews?.data && activeTab === 'reviews' && (
                    <div className="bg-white rounded p-3 border">
                      <h4 className="font-medium text-gray-900 mb-2">生成的评价:</h4>
                      <div className="space-y-2">
                        {result.data.reviews.data.slice(0, 3).map((review: any, index: number) => (
                          <div key={review.id} className="text-sm text-gray-600 border-l-2 border-green-200 pl-3">
                            <div className="font-medium">{review.content.substring(0, 100)}...</div>
                            <div className="text-xs text-gray-500">
                              ⭐ {review.rating} | 👤 {review.user_name} | 📅 {new Date(review.created_at).toLocaleDateString()}
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
                {activeTab === 'trending' && 'Trending数据已生成成功！现在您可以：'}
                {activeTab === 'businesses' && '商家数据已生成成功！现在您可以：'}
                {activeTab === 'reviews' && '评价数据已生成成功！现在您可以：'}
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                {activeTab === 'trending' && (
                  <>
                    <li>• 访问 <a href="/trending" className="underline">Trending页面</a> 查看生成的内容</li>
                    <li>• 测试点赞、评论、分享功能</li>
                    <li>• 制作APP Store截图</li>
                  </>
                )}
                {activeTab === 'businesses' && (
                  <>
                    <li>• 访问 <a href="/discover" className="underline">商家发现页面</a> 查看生成的商家</li>
                    <li>• 测试搜索和筛选功能</li>
                    <li>• 查看商家详情页面</li>
                  </>
                )}
                {activeTab === 'reviews' && (
                  <>
                    <li>• 访问商家详情页面查看评价</li>
                    <li>• 测试评价和评分功能</li>
                    <li>• 验证评价统计显示</li>
                  </>
                )}
                <li>• 生成其他类型的数据</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateDataPage;
