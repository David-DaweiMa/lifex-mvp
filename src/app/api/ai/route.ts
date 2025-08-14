import { NextRequest, NextResponse } from 'next/server';
import { generateConversationalResponse, getAIRecommendations } from '@/lib/ai';
import { checkUserQuota, updateUserQuota, recordUsage } from '@/lib/quotaService';
import { typedSupabase } from '@/lib/supabase';
import { getAdForChat } from '@/lib/adService';

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
    const chatQuota = await checkUserQuota(userId, 'chat');
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

    // 获取用户信息
    const { data: user, error: userError } = await typedSupabase
      .from('user_profiles')
      .select('user_type, location')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: '用户信息获取失败' },
        { status: 401 }
      );
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

    // 保存聊天记录
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

    // 更新配额使用量
    await updateUserQuota(userId, 'chat');
    await recordUsage(userId, 'chat');

    // 如果有广告，记录广告展示
    if (adInfo) {
      await recordAdImpression(adInfo.adId, userId, 'ai_response', {
        chat_context: message,
        user_type: user.user_type
      });
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

