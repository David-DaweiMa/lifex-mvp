import { typedSupabase } from './supabase';

export interface AdRequest {
  userId: string;
  userType: string;
  context: string;
  placementType: 'ai_response' | 'trending_feed' | 'search_results' | 'recommendations';
}

export interface AdInfo {
  adId: string;
  title: string;
  content: string;
  adType: string;
  businessId?: string;
  businessName?: string;
  isSponsored: boolean;
}

/**
 * 为 Chat 获取相关广告
 */
export async function getAdForChat(request: AdRequest): Promise<AdInfo | null> {
  try {
    // 分析用户消息内容，提取关键词
    const keywords = extractKeywords(request.context);
    
    // 获取匹配的广告
    const { data: ads, error } = await (typedSupabase as any)
      .from('advertisements')
      .select(`
        id,
        title,
        content,
        ad_type,
        business_id,
        target_audience,
        status,
        start_date,
        end_date,
        daily_budget,
        total_spent,
        impressions,
        clicks,
        businesses!inner(name)
      `)
      .eq('status', 'active')
      .eq('ad_type', 'chat_recommendation')
      .eq('placement_type', 'ai_response')
      .gte('start_date', new Date().toISOString().split('T')[0])
      .lte('end_date', new Date().toISOString().split('T')[0])
      .order('clicks', { ascending: false })
      .limit(5);

    if (error || !ads || ads.length === 0) {
      return null;
    }

    // 根据相关性和用户类型筛选广告
    const relevantAds = ads.filter((ad: any) => {
      // 检查预算限制
      if (ad.daily_budget && ad.total_spent >= ad.daily_budget) {
        return false;
      }

      // 检查目标受众匹配度
      const audienceMatch = checkAudienceMatch(ad.target_audience, request.userType);
      if (!audienceMatch) {
        return false;
      }

      // 检查内容相关性
      const relevanceScore = calculateRelevanceScore(ad, keywords);
      return relevanceScore > 0.3; // 最低相关性阈值
    });

    if (relevantAds.length === 0) {
      return null;
    }

    // 选择最佳广告（基于相关性、CTR、预算等因素）
    const bestAd = selectBestAd(relevantAds, keywords);

    return {
      adId: bestAd.id,
      title: bestAd.title,
      content: bestAd.content,
      adType: bestAd.ad_type,
      businessId: bestAd.business_id,
      businessName: bestAd.businesses?.name,
      isSponsored: true
    };

  } catch (error) {
    console.error('获取 Chat 广告失败:', error);
    return null;
  }
}

/**
 * 为 Trending 流获取广告
 */
export async function getAdForTrending(request: AdRequest): Promise<AdInfo | null> {
  try {
    const { data: ads, error } = await (typedSupabase as any)
      .from('advertisements')
      .select(`
        id,
        title,
        content,
        ad_type,
        business_id,
        target_audience,
        status,
        start_date,
        end_date,
        daily_budget,
        total_spent,
        impressions,
        clicks,
        businesses!inner(name)
      `)
      .eq('status', 'active')
      .eq('ad_type', 'trending_sponsored')
      .eq('placement_type', 'trending_feed')
      .gte('start_date', new Date().toISOString().split('T')[0])
      .lte('end_date', new Date().toISOString().split('T')[0])
      .order('clicks', { ascending: false })
      .limit(3);

    if (error || !ads || ads.length === 0) {
      return null;
    }

    // 随机选择一个广告（模拟自然内容流）
    const randomAd = ads[Math.floor(Math.random() * ads.length)];

    return {
      adId: randomAd.id,
      title: randomAd.title,
      content: randomAd.content,
      adType: randomAd.ad_type,
      businessId: randomAd.business_id,
      businessName: randomAd.businesses?.[0]?.name,
      isSponsored: true
    };

  } catch (error) {
    console.error('获取 Trending 广告失败:', error);
    return null;
  }
}

/**
 * 为搜索结果获取广告
 */
export async function getAdForSearch(
  request: AdRequest,
  searchQuery: string
): Promise<AdInfo | null> {
  try {
    const keywords = extractKeywords(searchQuery);
    
    const { data: ads, error } = await (typedSupabase as any)
      .from('advertisements')
      .select(`
        id,
        title,
        content,
        ad_type,
        business_id,
        target_audience,
        status,
        start_date,
        end_date,
        daily_budget,
        total_spent,
        impressions,
        clicks,
        businesses!inner(name)
      `)
      .eq('status', 'active')
      .eq('ad_type', 'search_promoted')
      .eq('placement_type', 'search_results')
      .gte('start_date', new Date().toISOString().split('T')[0])
      .lte('end_date', new Date().toISOString().split('T')[0])
      .order('clicks', { ascending: false })
      .limit(5);

    if (error || !ads || ads.length === 0) {
      return null;
    }

    // 根据搜索关键词匹配广告
    const relevantAds = ads.filter((ad: any) => {
      const relevanceScore = calculateRelevanceScore(ad, keywords);
      return relevanceScore > 0.5; // 搜索广告需要更高的相关性
    });

    if (relevantAds.length === 0) {
      return null;
    }

    const bestAd = selectBestAd(relevantAds, keywords);

    return {
      adId: bestAd.id,
      title: bestAd.title,
      content: bestAd.content,
      adType: bestAd.ad_type,
      businessId: bestAd.business_id,
      businessName: bestAd.businesses?.[0]?.name,
      isSponsored: true
    };

  } catch (error) {
    console.error('获取搜索广告失败:', error);
    return null;
  }
}

/**
 * 提取关键词
 */
function extractKeywords(text: string): string[] {
  const stopWords = ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'];
  
  return text
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter((word: any) => word.length > 1 && !stopWords.includes(word));
}

/**
 * 检查目标受众匹配
 */
function checkAudienceMatch(targetAudience: any, userType: string): boolean {
  if (!targetAudience || !targetAudience.userTypes) {
    return true; // 如果没有设置目标受众，默认匹配所有用户
  }

  return targetAudience.userTypes.includes(userType);
}

/**
 * 计算相关性分数
 */
function calculateRelevanceScore(ad: any, keywords: string[]): number {
  if (!keywords.length) return 0;

  const adText = `${ad.title} ${ad.content}`.toLowerCase();
  let matchCount = 0;

  for (const keyword of keywords) {
    if (adText.includes(keyword)) {
      matchCount++;
    }
  }

  return matchCount / keywords.length;
}

/**
 * 选择最佳广告
 */
function selectBestAd(ads: any[], keywords: string[]): any {
  // 计算每个广告的综合分数
  const scoredAds = ads.map((ad: any) => {
    const relevanceScore = calculateRelevanceScore(ad, keywords);
    const ctrScore = ad.impressions > 0 ? ad.clicks / ad.impressions : 0;
    const budgetScore = ad.daily_budget ? (ad.daily_budget - ad.total_spent) / ad.daily_budget : 1;
    
    // 综合分数 = 相关性 * 0.5 + CTR * 0.3 + 预算 * 0.2
    const totalScore = relevanceScore * 0.5 + ctrScore * 0.3 + budgetScore * 0.2;
    
    return { ...ad, score: totalScore };
  });

  // 按分数排序并返回最佳广告
  scoredAds.sort((a, b) => b.score - a.score);
  return scoredAds[0];
}

/**
 * 记录广告点击
 */
export async function recordAdClick(adId: string, userId: string): Promise<boolean> {
  try {
    // 记录点击
    await (typedSupabase as any)
      .from('ad_impressions')
      .update({
        is_clicked: true,
        revenue: 0.5 // 假设每次点击 0.5 美元
      })
      .eq('ad_id', adId)
      .eq('user_id', userId);

    // 更新广告统计 - 暂时注释掉，因为需要数据库函数支持
    // await typedSupabase
    //   .from('advertisements')
    //   .update({
    //     clicks: typedSupabase.sql`clicks + 1`,
    //     total_spent: typedSupabase.sql`total_spent + 0.5`
    //   })
    //   .eq('id', adId);

    return true;
  } catch (error) {
    console.error('记录广告点击失败:', error);
    return false;
  }
}

/**
 * 创建内嵌广告内容
 */
export function createEmbeddedAdContent(adInfo: AdInfo, placementType: string): string {
  switch (placementType) {
    case 'ai_response':
      return createChatAdContent(adInfo);
    case 'trending_feed':
      return createTrendingAdContent(adInfo);
    case 'search_results':
      return createSearchAdContent(adInfo);
    default:
      return adInfo.content;
  }
}

/**
 * 创建 Chat 中的广告内容
 */
function createChatAdContent(adInfo: AdInfo): string {
  return `💡 推荐：${adInfo.content}

📍 ${adInfo.businessName || '商家'}
[赞助内容]`;
}

/**
 * 创建 Trending 中的广告内容
 */
function createTrendingAdContent(adInfo: AdInfo): string {
  return `${adInfo.content}

#推荐 #${adInfo.businessName?.replace(/\s+/g, '') || '商家'}
[赞助]`;
}

/**
 * 创建搜索结果中的广告内容
 */
function createSearchAdContent(adInfo: AdInfo): string {
  return `⭐ ${adInfo.title}
${adInfo.content}
📍 ${adInfo.businessName || '商家'}
[推广]`;
}
