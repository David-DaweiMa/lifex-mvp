// 生成测试数据的页面 - 专注于Trending页面数据
"use client";

import React, { useState } from 'react';
import { Database, TrendingUp, Heart, Share2, Loader2, CheckCircle, XCircle, MessageCircle, Users, Tag, Star, MapPin } from 'lucide-react';

interface GenerationResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

const GenerateDataPage: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSpecials, setIsGeneratingSpecials] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [specialsResult, setSpecialsResult] = useState<GenerationResult | null>(null);

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

  const generateSpecialsData = async () => {
    setIsGeneratingSpecials(true);
    setSpecialsResult(null);

    try {
      const response = await fetch('/api/test/generate-specials-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setSpecialsResult({
          success: true,
          message: data.message,
          data: data.data
        });
      } else {
        setSpecialsResult({
          success: false,
          message: '生成失败',
          error: data.error || data.details
        });
      }
    } catch (error) {
      setSpecialsResult({
        success: false,
        message: '生成失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsGeneratingSpecials(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">测试数据生成</h1>
              <p className="text-gray-600">生成Trending和Specials页面的测试数据</p>
            </div>
          </div>

          {/* Trending数据生成 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Trending内容数据</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              从数据库中读取现有的trending帖子、点赞、评论和分享记录，用于展示trending页面的功能。
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <TrendingUp className="w-5 h-5 text-purple-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">{result?.data?.posts?.count || 0}个帖子</div>
                <div className="text-xs text-gray-500">丰富内容类型</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <Heart className="w-5 h-5 text-purple-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">{result?.data?.likes?.count || 0}个点赞</div>
                <div className="text-xs text-gray-500">活跃用户互动</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <MessageCircle className="w-5 h-5 text-purple-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">{result?.data?.comments?.count || 0}个评论</div>
                <div className="text-xs text-gray-500">用户讨论</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <Share2 className="w-5 h-5 text-purple-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">{result?.data?.shares?.count || 0}个分享</div>
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
                  正在读取数据...
                </>
              ) : (
                '读取Trending数据'
              )}
            </button>
          </div>

          {/* Specials数据生成 */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Tag className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Specials优惠数据</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              生成20条specials优惠数据，包含餐饮、健身、美容、购物等各类商家的优惠信息。
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <Tag className="w-5 h-5 text-green-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">{specialsResult?.data?.specials?.count || 20}个优惠</div>
                <div className="text-xs text-gray-500">丰富优惠类型</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <Star className="w-5 h-5 text-green-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">4.0-4.9分</div>
                <div className="text-xs text-gray-500">商家评分</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <MapPin className="w-5 h-5 text-green-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">0.2-2.3km</div>
                <div className="text-xs text-gray-500">距离范围</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <Users className="w-5 h-5 text-green-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">多类别</div>
                <div className="text-xs text-gray-500">餐饮/健身/美容</div>
              </div>
            </div>

            <button
              onClick={generateSpecialsData}
              disabled={isGeneratingSpecials}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                isGeneratingSpecials
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isGeneratingSpecials ? (
                <>
                  <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                  正在生成数据...
                </>
              ) : (
                '生成Specials数据'
              )}
            </button>
          </div>

          {/* Trending结果显示 */}
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
                  {/* Trending数据统计 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                        {result.data.comments?.created || 0}
                      </div>
                      <div className="text-sm text-gray-600">评论记录</div>
                    </div>
                    <div className="bg-white rounded p-3 border">
                      <div className="text-lg font-bold text-gray-900">
                        {result.data.shares?.created || 0}
                      </div>
                      <div className="text-sm text-gray-600">分享记录</div>
                    </div>
                  </div>

                  {/* 显示生成的帖子预览 */}
                  {result.data.posts?.data && (
                    <div className="bg-white rounded p-3 border">
                      <h4 className="font-medium text-gray-900 mb-2">生成的帖子预览:</h4>
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
                </div>
              )}
            </div>
          )}

          {/* Specials结果显示 */}
          {specialsResult && (
            <div className={`border rounded-lg p-4 ${
              specialsResult.success 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {specialsResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <h3 className={`font-medium ${
                  specialsResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {specialsResult.message}
                </h3>
              </div>

              {specialsResult.error && (
                <div className="mb-3 p-3 bg-red-100 rounded text-sm text-red-700">
                  {specialsResult.error}
                </div>
              )}

              {specialsResult.data && (
                <div className="space-y-3">
                  {/* Specials数据统计 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white rounded p-3 border">
                      <div className="text-lg font-bold text-gray-900">
                        {specialsResult.data.specials?.count || 0}
                      </div>
                      <div className="text-sm text-gray-600">优惠总数</div>
                    </div>
                    <div className="bg-white rounded p-3 border">
                      <div className="text-lg font-bold text-gray-900">
                        {specialsResult.data.specials?.data?.filter((s: any) => s.category === 'food').length || 0}
                      </div>
                      <div className="text-sm text-gray-600">餐饮优惠</div>
                    </div>
                    <div className="bg-white rounded p-3 border">
                      <div className="text-lg font-bold text-gray-900">
                        {specialsResult.data.specials?.data?.filter((s: any) => s.category === 'fitness').length || 0}
                      </div>
                      <div className="text-sm text-gray-600">健身优惠</div>
                    </div>
                    <div className="bg-white rounded p-3 border">
                      <div className="text-lg font-bold text-gray-900">
                        {specialsResult.data.specials?.data?.filter((s: any) => s.category === 'beauty').length || 0}
                      </div>
                      <div className="text-sm text-gray-600">美容优惠</div>
                    </div>
                  </div>

                  {/* 显示生成的优惠预览 */}
                  {specialsResult.data.specials?.data && (
                    <div className="bg-white rounded p-3 border">
                      <h4 className="font-medium text-gray-900 mb-2">生成的优惠预览:</h4>
                      <div className="space-y-2">
                        {specialsResult.data.specials.data.slice(0, 3).map((special: any, index: number) => (
                          <div key={special.id} className="text-sm text-gray-600 border-l-2 border-green-200 pl-3">
                            <div className="font-medium">{special.businessName} - {special.title}</div>
                            <div className="text-xs text-gray-500">
                              💰 ${special.discountPrice} (原价${special.originalPrice}) | ⭐ {special.rating} | 📍 {special.distance}
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
          {(result?.success || specialsResult?.success) && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">下一步</h3>
              <p className="text-sm text-blue-700 mb-3">
                测试数据已生成成功！现在您可以：
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                {result?.success && (
                  <>
                    <li>• 访问 <a href="/trending" className="underline">Trending页面</a> 查看生成的内容</li>
                    <li>• 测试点赞、评论、分享功能</li>
                    <li>• 验证帖子排序和筛选功能</li>
                  </>
                )}
                {specialsResult?.success && (
                  <>
                    <li>• 访问 <a href="/specials" className="underline">Specials页面</a> 查看生成的优惠数据</li>
                    <li>• 测试优惠筛选和排序功能</li>
                    <li>• 验证优惠详情和领取功能</li>
                  </>
                )}
                <li>• 制作APP Store截图</li>
                <li>• 测试移动端页面显示</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateDataPage;
