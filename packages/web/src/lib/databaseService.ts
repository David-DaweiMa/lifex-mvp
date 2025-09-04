import { typedSupabase, typedSupabaseAdmin } from './supabase';

/**
 * 数据库服务 - 使用安全的数据库函数
 * 解决 TypeScript 类型错误的最佳实践
 */

// =============================================
// 用户相关服务
// =============================================

export interface UserProfileData {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  website?: string;
  subscription_level?: 'free' | 'essential' | 'premium';
  has_business_features?: boolean;
  business_name?: string;
  email_verified?: boolean;
  is_active?: boolean;
}

/**
 * 更新用户邮箱验证状态
 */
export async function updateUserEmailVerification(
  userId: string,
  verified: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await (typedSupabaseAdmin as any).rpc('update_user_email_verification', {
      user_id: userId,
      verified: verified
    });

    if (error) {
      console.error('更新邮箱验证状态失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('更新邮箱验证状态异常:', error);
    return { success: false, error: '更新邮箱验证状态时发生错误' };
  }
}

/**
 * 创建用户配置文件
 */
export async function createUserProfile(
  userId: string,
  email: string,
  userData?: UserProfileData
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const { data, error } = await typedSupabaseAdmin.rpc('create_user_profile', {
      user_id: userId,
      user_email: email,
      user_data: userData || {}
    });

    if (error) {
      console.error('创建用户配置文件失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true, user: data };
  } catch (error) {
    console.error('创建用户配置文件异常:', error);
    return { success: false, error: '创建用户配置文件时发生错误' };
  }
}

/**
 * 更新用户配置文件
 */
export async function updateUserProfile(
  userId: string,
  profileData: UserProfileData
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const { data, error } = await typedSupabase.rpc('update_user_profile', {
      user_id: userId,
      profile_data: profileData
    });

    if (error) {
      console.error('更新用户配置文件失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true, user: data };
  } catch (error) {
    console.error('更新用户配置文件异常:', error);
    return { success: false, error: '更新用户配置文件时发生错误' };
  }
}

// =============================================
// 业务相关服务
// =============================================

export interface BusinessData {
  name: string;
  description?: string;
  category: string;
  contact_info?: any;
  address?: any;
  opening_hours?: any;
  price_range?: string;
  amenities?: any;
  website?: string;
  phone?: string;
  email?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  external_id?: string;
  google_maps_url?: string;
  is_verified?: boolean;
  is_active?: boolean;
  rating?: number;
  review_count?: number;
}

/**
 * 创建业务记录
 */
export async function createBusiness(
  ownerId: string,
  businessData: BusinessData
): Promise<{ success: boolean; business?: any; error?: string }> {
  try {
    const { data, error } = await typedSupabase.rpc('create_business', {
      owner_id: ownerId,
      business_data: businessData
    });

    if (error) {
      console.error('创建业务记录失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true, business: data };
  } catch (error) {
    console.error('创建业务记录异常:', error);
    return { success: false, error: '创建业务记录时发生错误' };
  }
}

// =============================================
// 趋势帖子相关服务
// =============================================

export interface TrendingPostData {
  business_id?: string;
  content: string;
  images?: string[];
  videos?: string[];
  hashtags?: string[];
  location?: any;
  is_sponsored?: boolean;
  sponsor_info?: any;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  is_active?: boolean;
}

/**
 * 创建趋势帖子
 */
export async function createTrendingPost(
  authorId: string,
  postData: TrendingPostData
): Promise<{ success: boolean; post?: any; error?: string }> {
  try {
    const { data, error } = await typedSupabase.rpc('create_trending_post', {
      author_id: authorId,
      post_data: postData
    });

    if (error) {
      console.error('创建趋势帖子失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true, post: data };
  } catch (error) {
    console.error('创建趋势帖子异常:', error);
    return { success: false, error: '创建趋势帖子时发生错误' };
  }
}

/**
 * 点赞帖子
 */
export async function likePost(
  userId: string,
  postId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await typedSupabase.rpc('like_post', {
      user_id: userId,
      post_id: postId
    });

    if (error) {
      console.error('点赞帖子失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('点赞帖子异常:', error);
    return { success: false, error: '点赞帖子时发生错误' };
  }
}

/**
 * 分享帖子
 */
export async function sharePost(
  userId: string,
  postId: string,
  shareType: string = 'native',
  platform: string = 'app'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await typedSupabase.rpc('share_post', {
      user_id: userId,
      post_id: postId,
      share_type: shareType,
      platform: platform
    });

    if (error) {
      console.error('分享帖子失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('分享帖子异常:', error);
    return { success: false, error: '分享帖子时发生错误' };
  }
}

// =============================================
// 聊天消息相关服务
// =============================================

export interface ChatMessageData {
  session_id: string;
  message_type: 'user' | 'ai' | 'system';
  content: string;
  metadata?: any;
  is_ad_integrated?: boolean;
  ad_info?: any;
}

/**
 * 创建聊天消息
 */
export async function createChatMessage(
  userId: string,
  messageData: ChatMessageData
): Promise<{ success: boolean; message?: any; error?: string }> {
  try {
    const { data, error } = await typedSupabase.rpc('create_chat_message', {
      user_id: userId,
      session_id: messageData.session_id,
      message_type: messageData.message_type,
      content: messageData.content,
      metadata: messageData.metadata,
      is_ad_integrated: messageData.is_ad_integrated || false,
      ad_info: messageData.ad_info
    });

    if (error) {
      console.error('创建聊天消息失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true, message: data };
  } catch (error) {
    console.error('创建聊天消息异常:', error);
    return { success: false, error: '创建聊天消息时发生错误' };
  }
}

// =============================================
// 助手使用相关服务
// =============================================

/**
 * 记录助手使用
 */
export async function recordAssistantUsage(
  userId: string,
  assistantType: 'coly' | 'max'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await typedSupabase.rpc('record_assistant_usage', {
      user_id: userId,
      assistant_type: assistantType
    });

    if (error) {
      console.error('记录助手使用失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('记录助手使用异常:', error);
    return { success: false, error: '记录助手使用时发生错误' };
  }
}

// =============================================
// 匿名使用相关服务
// =============================================

/**
 * 记录匿名使用
 */
export async function recordAnonymousUsage(
  sessionId: string,
  feature: string,
  usageDate?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await typedSupabase.rpc('record_anonymous_usage', {
      session_id: sessionId,
      feature: feature,
      usage_date: usageDate || new Date().toISOString().split('T')[0]
    });

    if (error) {
      console.error('记录匿名使用失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('记录匿名使用异常:', error);
    return { success: false, error: '记录匿名使用时发生错误' };
  }
}

// =============================================
// 广告相关服务
// =============================================

/**
 * 记录广告点击
 */
export async function recordAdClick(
  adId: string,
  userId: string,
  revenue: number = 0.5
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await typedSupabase.rpc('record_ad_click', {
      ad_id: adId,
      user_id: userId,
      revenue: revenue
    });

    if (error) {
      console.error('记录广告点击失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('记录广告点击异常:', error);
    return { success: false, error: '记录广告点击时发生错误' };
  }
}

// =============================================
// 业务描述相关服务
// =============================================

/**
 * 创建业务描述
 */
export async function createBusinessDescription(
  businessId: string,
  description: string
): Promise<{ success: boolean; description?: any; error?: string }> {
  try {
    const { data, error } = await typedSupabase.rpc('create_business_description', {
      business_id: businessId,
      description: description
    });

    if (error) {
      console.error('创建业务描述失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true, description: data };
  } catch (error) {
    console.error('创建业务描述异常:', error);
    return { success: false, error: '创建业务描述时发生错误' };
  }
}

/**
 * 创建业务菜单
 */
export async function createBusinessMenu(
  businessId: string,
  menuData: any
): Promise<{ success: boolean; menu?: any; error?: string }> {
  try {
    const { data, error } = await typedSupabase.rpc('create_business_menu', {
      business_id: businessId,
      menu_data: menuData
    });

    if (error) {
      console.error('创建业务菜单失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true, menu: data };
  } catch (error) {
    console.error('创建业务菜单异常:', error);
    return { success: false, error: '创建业务菜单时发生错误' };
  }
}

/**
 * 创建业务照片
 */
export async function createBusinessPhoto(
  businessId: string,
  photoUrl: string,
  caption?: string
): Promise<{ success: boolean; photo?: any; error?: string }> {
  try {
    const { data, error } = await typedSupabase.rpc('create_business_photo', {
      business_id: businessId,
      photo_url: photoUrl,
      caption: caption
    });

    if (error) {
      console.error('创建业务照片失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true, photo: data };
  } catch (error) {
    console.error('创建业务照片异常:', error);
    return { success: false, error: '创建业务照片时发生错误' };
  }
}

/**
 * 创建业务评论
 */
export async function createBusinessReview(
  businessId: string,
  userId: string,
  rating: number,
  comment?: string
): Promise<{ success: boolean; review?: any; error?: string }> {
  try {
    const { data, error } = await typedSupabase.rpc('create_business_review', {
      business_id: businessId,
      user_id: userId,
      rating: rating,
      comment: comment
    });

    if (error) {
      console.error('创建业务评论失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true, review: data };
  } catch (error) {
    console.error('创建业务评论异常:', error);
    return { success: false, error: '创建业务评论时发生错误' };
  }
}
