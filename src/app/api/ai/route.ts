import { NextRequest, NextResponse } from 'next/server';
import { generateConversationalResponse, getAIRecommendations } from '@/lib/ai';
import { checkUserQuota, updateUserQuota, recordUsage } from '@/lib/quotaService';
import { typedSupabase } from '@/lib/supabase';
import { getAdForChat } from '@/lib/adService';
import { ANONYMOUS_QUOTA } from '@/lib/quotaConfig';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { message, userId, sessionId } = data;

    if (!message || !userId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 检查用户 Chat 配额
    let chatQuota = { canUse: true, remaining: 999, current: 0, max: 1000, resetDate: new Date().toISOString() };
    
    if (userId === 'anonymous') {
      // 匿名用户限制：每天最多10次
      const anonymousQuota = await checkAnonymousQuota(sessionId, 'chat');
      if (!anonymousQuota.canUse) {
        return NextResponse.json({
          error: '匿名用户每日使用次数已达上限，请注册以获得更多使用次数',
          quota: {
            remaining: anonymousQuota.remaining,
            current: anonymousQuota.current,
            max: anonymousQuota.max,
            resetDate: anonymousQuota.resetDate
          }
        }, { status: 429 });
      }
      chatQuota = anonymousQuota;
    } else if (userId !== 'demo-user' && userId !== 'admin') {
      // 注册用户配额检查
      chatQuota = await checkUserQuota(userId, 'chat');
      if (!chatQuota.canUse) {
        return NextResponse.json({
          error: 'Chat 使用次数已达上限',
          quota: {
            remaining: chatQuota.remaining,
            current: chatQuota.current,
            max: chatQuota.max,
            resetDate: chatQuota.resetDate
          }
        }, { status: 429 });
      }
    }

    // 获取用户信息
    let user = null;
    if (userId === 'anonymous') {
      // 匿名用户使用默认信息
      user = {
        user_type: 'visitor',
        location: { city: 'Auckland', country: 'New Zealand' }
      };
    } else if (userId === 'demo-user') {
      // 演示用户使用默认信息
      user = {
        user_type: 'tourist',
        location: { city: 'Auckland', country: 'New Zealand' }
      };
    } else {
      // 注册用户从数据库获取信息
      const { data: userData, error: userError } = await typedSupabase
        .from('user_profiles')
        .select('user_type, location')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        return NextResponse.json(
          { error: '用户信息获取失败' },
          { status: 401 }
        );
      }
      user = userData;
    }

    // 检查是否为推荐请求
    const messageLower = message.toLowerCase();
    const isRecommendationRequest = messageLower.includes('recommend') ||
                                   messageLower.includes('find') ||
                                   messageLower.includes('show') ||
                                   messageLower.includes('where') ||
                                   messageLower.includes('coffee') ||
                                   messageLower.includes('food') ||
                                   messageLower.includes('restaurant') ||
                                   messageLower.includes('café');

    let response;
    let recommendations = null;
    let adInfo = null;

    if (isRecommendationRequest) {
      // 处理推荐请求
      const recommendationResult = await getAIRecommendations(
        { query: message, userLocation: user.location },
        null // 这里应该传入真实的商家数据
      );
      
      response = recommendationResult.explanation;
      recommendations = recommendationResult.recommendations;

      // 获取相关广告
      adInfo = await getAdForChat({
        userId,
        userType: user.user_type,
        context: message,
        placementType: 'ai_response'
      });

    } else {
      // 处理一般对话
      const conversationResult = await generateConversationalResponse(message, {
        userType: user.user_type,
        userLocation: user.location
      });
      
      response = conversationResult.message;

      // 获取相关广告
      adInfo = await getAdForChat({
        userId,
        userType: user.user_type,
        context: message,
        placementType: 'ai_response'
      });
    }

    // 保存聊天记录（跳过匿名用户和无限制用户）
    if (userId !== 'anonymous' && userId !== 'demo-user' && userId !== 'admin') {
      const { error: chatError } = await typedSupabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          session_id: sessionId || 'default',
          message_type: 'user',
          content: message,
          created_at: new Date().toISOString()
        });

      if (chatError) {
        console.error('保存用户消息失败:', chatError);
      }

      // 保存 AI 回复
      const { error: aiChatError } = await typedSupabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          session_id: sessionId || 'default',
          message_type: 'ai',
          content: response,
          metadata: {
            recommendations,
            followUpQuestions: isRecommendationRequest ? null : ['推荐一些餐厅', '今天天气如何？', '有什么活动推荐？'],
            adInfo
          },
          is_ad_integrated: !!adInfo,
          ad_info: adInfo,
          created_at: new Date().toISOString()
        });

      if (aiChatError) {
        console.error('保存 AI 回复失败:', aiChatError);
      }
    }

    // 更新配额使用量
    if (userId === 'anonymous') {
      // 更新匿名用户配额
      await updateAnonymousQuota(sessionId, 'chat');
    } else if (userId !== 'demo-user' && userId !== 'admin') {
      // 更新注册用户配额
      await updateUserQuota(userId, 'chat');
      await recordUsage(userId, 'chat');

      // 如果有广告，记录广告展示
      if (adInfo) {
        await recordAdImpression(adInfo.adId, userId, 'ai_response', {
          chat_context: message,
          user_type: user.user_type
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: response,
        recommendations,
        followUpQuestions: isRecommendationRequest ? null : ['推荐一些餐厅', '今天天气如何？', '有什么活动推荐？'],
        adInfo,
        quota: {
          remaining: chatQuota.remaining - 1,
          current: chatQuota.current + 1,
          max: chatQuota.max
        }
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: '服务暂时不可用' },
      { status: 500 }
    );
  }
}

/**
 * 检查匿名用户配额
 */
async function checkAnonymousQuota(sessionId: string, feature: string): Promise<{
  canUse: boolean;
  remaining: number;
  current: number;
  max: number;
  resetDate: string;
}> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const key = `anonymous_${sessionId}_${feature}_${today}`;
    
    // 从数据库获取匿名用户使用次数
    const { data: usageData, error: usageError } = await typedSupabase
      .from('anonymous_usage')
      .select('usage_count')
      .eq('session_id', sessionId)
      .eq('feature', feature)
      .eq('usage_date', today)
      .single();

    let currentUsage = 0;
    if (usageData) {
      currentUsage = usageData.usage_count;
    }
    
    const maxUsage = 10; // 匿名用户每天最多10次
    const canUse = currentUsage < maxUsage;
    
    return {
      canUse,
      remaining: Math.max(0, maxUsage - currentUsage),
      current: currentUsage,
      max: maxUsage,
      resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后重置
    };
  } catch (error) {
    console.error('检查匿名用户配额失败:', error);
    return {
      canUse: true,
      remaining: 10,
      current: 0,
      max: 10,
      resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }
}

/**
 * 更新匿名用户配额
 */
async function updateAnonymousQuota(sessionId: string, feature: string): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 尝试更新现有记录
    const { data: updateData, error: updateError } = await typedSupabase
      .from('anonymous_usage')
      .update({ 
        usage_count: typedSupabase.rpc('increment_usage_count'),
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
      .eq('feature', feature)
      .eq('usage_date', today);

    // 如果更新失败（记录不存在），则创建新记录
    if (updateError || !updateData) {
      const { error: insertError } = await typedSupabase
        .from('anonymous_usage')
        .insert({
          session_id: sessionId,
          feature: feature,
          usage_date: today,
          usage_count: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('创建匿名用户使用记录失败:', insertError);
      }
    }

    console.log(`更新匿名用户配额: ${sessionId}_${feature}_${today}`);
  } catch (error) {
    console.error('更新匿名用户配额失败:', error);
  }
}

/**
 * 记录广告展示
 */
async function recordAdImpression(
  adId: string,
  userId: string,
  placementType: string,
  context: any
): Promise<void> {
  try {
    await typedSupabase
      .from('ad_impressions')
      .insert({
        ad_id: adId,
        user_id: userId,
        placement_type: placementType,
        context,
        created_at: new Date().toISOString()
      });

    // 更新广告展示次数 - 暂时注释掉，因为需要数据库函数支持
    // await typedSupabase
    //   .from('advertisements')
    //   .update({
    //     impressions: typedSupabase.rpc('increment_impressions', { ad_id: adId })
    //   })
    //   .eq('id', adId);

  } catch (error) {
    console.error('记录广告展示失败:', error);
  }
}

