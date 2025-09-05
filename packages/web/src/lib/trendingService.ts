// src/lib/trendingService.ts - 完整版本
import { typedSupabase } from './supabase';

export interface TrendingPost {
  id: string;
  content: string;
  images: string[];
  videos?: string[];
  hashtags: string[];
  location?: string;
  author: string;
  avatar: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  createdAt: string;
  category: string;
}

export interface CreatePostData {
  content: string;
  images?: string[];
  videos?: string[];
  hashtags?: string[];
  location?: string;
  privacy: 'public' | 'followers' | 'private';
}

export interface TrendingFilters {
  category?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

/**
 * 获取trending posts
 */
export async function getTrendingPosts(filters: TrendingFilters = {}): Promise<{
  posts: TrendingPost[];
  hasMore: boolean;
}> {
  try {
    const { category, tags, limit = 20, offset = 0 } = filters;

    const response = await fetch(`/api/trending/posts?${new URLSearchParams({
      ...(category && { category }),
      ...(tags && tags.length > 0 && { tags: tags.join(',') }),
      limit: limit.toString(),
      offset: offset.toString()
    })}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || 'Failed to fetch trending posts');
    }

    const data = await response.json();
    return {
      posts: data.posts || [],
      hasMore: data.hasMore || false
    };
  } catch (error) {
    console.error('获取trending posts失败:', error);
    return { posts: [], hasMore: false };
  }
}

/**
 * 创建新的trending post
 */
export async function createTrendingPost(postData: CreatePostData): Promise<{
  success: boolean;
  post?: TrendingPost;
  error?: string;
}> {
  try {
    const response = await fetch('/api/trending/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to create post'
      };
    }

    return {
      success: true,
      post: data.post
    };
  } catch (error) {
    console.error('创建post失败:', error);
    return {
      success: false,
      error: 'Network error'
    };
  }
}

/**
 * 更新post互动（点赞、评论等）
 */
export async function updatePostInteraction(
  postId: string,
  action: 'like' | 'comment' | 'share' | 'view',
  value?: boolean
): Promise<{
  success: boolean;
  newCount?: number;
  error?: string;
}> {
  try {
    const response = await fetch('/api/trending/posts', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        postId,
        action,
        value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to update interaction'
      };
    }

    return {
      success: true,
      newCount: data.newCount
    };
  } catch (error) {
    console.error('更新互动失败:', error);
    return {
      success: false,
      error: 'Network error'
    };
  }
}

/**
 * 上传媒体文件
 */
export async function uploadMedia(
  file: File,
  type: 'image' | 'video'
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    // 验证文件类型和大小
    const maxSize = type === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB for images, 100MB for videos
    
    if (file.size > maxSize) {
      return {
        success: false,
        error: `File too large. Max size: ${maxSize / 1024 / 1024}MB`
      };
    }

    const allowedTypes = type === 'image' 
      ? ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      : ['video/mp4', 'video/webm', 'video/quicktime'];

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
      };
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const extension = file.name.split('.').pop();
    const fileName = `${type}s/${timestamp}_${randomString}.${extension}`;

    // 上传到Supabase Storage
    const { data, error } = await typedSupabase.storage
      .from('trending-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('上传失败:', error);
      return {
        success: false,
        error: 'Upload failed'
      };
    }

    // 获取公共URL
    const { data: urlData } = typedSupabase.storage
      .from('trending-media')
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl
    };

  } catch (error) {
    console.error('上传媒体文件失败:', error);
    return {
      success: false,
      error: 'Upload error'
    };
  }
}

/**
 * 获取热门hashtags
 */
export async function getTrendingHashtags(limit: number = 20): Promise<{
  tags: Array<{ tag: string; count: number; growth: string }>;
}> {
  try {
    const { data: posts, error } = await (typedSupabase as any)
      .from('trending_posts')
      .select('hashtags, created_at')
      .eq('is_active', true)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // 最近7天
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取hashtags失败:', error);
      return { tags: [] };
    }

    // 统计hashtag使用频率
    const tagCounts: Record<string, number> = {};
    const recentTagCounts: Record<string, number> = {}; // 最近24小时

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    posts?.forEach((post: any) => {
      const postDate = new Date(post.created_at);
      post.hashtags?.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        
        if (postDate >= oneDayAgo) {
          recentTagCounts[tag] = (recentTagCounts[tag] || 0) + 1;
        }
      });
    });

    // 计算增长率并排序
    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => {
        const recentCount = recentTagCounts[tag] || 0;
        const averageCount = count / 7; // 7天平均
        const growth = averageCount > 0 
          ? `+${Math.round(((recentCount - averageCount) / averageCount) * 100)}%`
          : '+0%';
        
        return { tag, count, growth };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return { tags: sortedTags };

  } catch (error) {
    console.error('获取trending hashtags失败:', error);
    return { tags: [] };
  }
}

/**
 * 搜索trending posts
 */
export async function searchTrendingPosts(
  query: string,
  filters: TrendingFilters = {}
): Promise<{
  posts: TrendingPost[];
  hasMore: boolean;
}> {
  try {
    const { limit = 20, offset = 0 } = filters;

    let supabaseQuery = typedSupabase
      .from('trending_posts')
      .select(`
        id,
        content,
        images,
        videos,
        hashtags,
        location,
        view_count,
        like_count,
        comment_count,
        share_count,
        created_at,
        author_id,
        user_profiles!inner(username, full_name, avatar_url)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // 添加搜索条件
    if (query.trim()) {
      // 搜索内容、hashtags或位置
      supabaseQuery = supabaseQuery.or(`
        content.ilike.%${query}%,
        hashtags.cs.{${query}},
        location.ilike.%${query}%
      `);
    }

    const { data: posts, error } = await supabaseQuery;

    if (error) {
      console.error('搜索posts失败:', error);
      return { posts: [], hasMore: false };
    }

    // 转换数据格式
    const formattedPosts: TrendingPost[] = posts?.map((post: any) => {
      const userProfile = post.user_profiles as any;
      
      return {
        id: post.id,
        content: post.content,
        images: post.images || [],
        videos: post.videos || [],
        hashtags: post.hashtags || [],
        location: post.location,
        author: userProfile?.username || userProfile?.full_name || 'Anonymous',
        avatar: userProfile?.avatar_url || `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        likes: post.like_count || 0,
        comments: post.comment_count || 0,
        shares: post.share_count || 0,
        views: post.view_count || 0,
        createdAt: post.created_at,
        category: post.hashtags?.[0] || 'general'
      };
    }) || [];

    return {
      posts: formattedPosts,
      hasMore: formattedPosts.length === limit
    };

  } catch (error) {
    console.error('搜索trending posts失败:', error);
    return { posts: [], hasMore: false };
  }
}

/**
 * 获取用户的trending posts
 */
export async function getUserTrendingPosts(
  userId: string,
  filters: TrendingFilters = {}
): Promise<{
  posts: TrendingPost[];
  hasMore: boolean;
}> {
  try {
    const { limit = 20, offset = 0 } = filters;

    const { data: posts, error } = await (typedSupabase as any)
      .from('trending_posts')
      .select(`
        id,
        content,
        images,
        videos,
        hashtags,
        location,
        view_count,
        like_count,
        comment_count,
        share_count,
        created_at,
        user_profiles!inner(username, full_name, avatar_url)
      `)
      .eq('author_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('获取用户posts失败:', error);
      return { posts: [], hasMore: false };
    }

    // 转换数据格式
    const formattedPosts: TrendingPost[] = posts?.map((post: any) => {
      const userProfile = post.user_profiles as any;
      
      return {
        id: post.id,
        content: post.content,
        images: post.images || [],
        videos: post.videos || [],
        hashtags: post.hashtags || [],
        location: post.location,
        author: userProfile?.username || userProfile?.full_name || 'Anonymous',
        avatar: userProfile?.avatar_url || `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        likes: post.like_count || 0,
        comments: post.comment_count || 0,
        shares: post.share_count || 0,
        views: post.view_count || 0,
        createdAt: post.created_at,
        category: post.hashtags?.[0] || 'general'
      };
    }) || [];

    return {
      posts: formattedPosts,
      hasMore: formattedPosts.length === limit
    };

  } catch (error) {
    console.error('获取用户trending posts失败:', error);
    return { posts: [], hasMore: false };
  }
}

/**
 * 检查用户是否已点赞某个post
 */
export async function checkUserLiked(postId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await (typedSupabase as any)
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('检查点赞状态失败:', error);
    return false;
  }
}

/**
 * 获取post的详细信息
 */
export async function getPostDetails(postId: string): Promise<{
  success: boolean;
  post?: TrendingPost;
  error?: string;
}> {
  try {
    const { data: post, error } = await (typedSupabase as any)
      .from('trending_posts')
      .select(`
        id,
        content,
        images,
        videos,
        hashtags,
        location,
        view_count,
        like_count,
        comment_count,
        share_count,
        created_at,
        author_id,
        user_profiles!inner(username, full_name, avatar_url)
      `)
      .eq('id', postId)
      .eq('is_active', true)
      .single();

    if (error || !post) {
      return {
        success: false,
        error: 'Post not found'
      };
    }

    const userProfile = post.user_profiles as any;
    
    const formattedPost: TrendingPost = {
      id: post.id,
      content: post.content,
      images: post.images || [],
      videos: post.videos || [],
      hashtags: post.hashtags || [],
      location: post.location,
      author: userProfile?.username || userProfile?.full_name || 'Anonymous',
      avatar: userProfile?.avatar_url || `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
      likes: post.like_count || 0,
      comments: post.comment_count || 0,
      shares: post.share_count || 0,
      views: post.view_count || 0,
      createdAt: post.created_at,
      category: post.hashtags?.[0] || 'general'
    };

    return {
      success: true,
      post: formattedPost
    };

  } catch (error) {
    console.error('获取post详情失败:', error);
    return {
      success: false,
      error: 'Failed to fetch post details'
    };
  }
}

/**
 * 删除post (只有作者可以删除)
 */
export async function deletePost(postId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await (typedSupabase as any)
      .from('trending_posts')
      .update({ is_active: false })
      .eq('id', postId);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('删除post失败:', error);
    return {
      success: false,
      error: 'Failed to delete post'
    };
  }
}

/**
 * 举报post
 */
export async function reportPost(
  postId: string,
  reason: string,
  description?: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // 这里可以扩展举报功能，创建举报记录表
    // 暂时只记录到控制台
    console.log('Post reported:', { postId, reason, description });
    
    return {
      success: true
    };

  } catch (error) {
    console.error('举报post失败:', error);
    return {
      success: false,
      error: 'Failed to report post'
    };
  }
}

/**
 * 获取推荐的内容 (基于用户偏好和行为)
 */
export async function getRecommendedPosts(
  userId?: string,
  limit: number = 20
): Promise<{
  posts: TrendingPost[];
  hasMore: boolean;
}> {
  try {
    // 简化的推荐算法：返回最近的热门内容
    const { data: posts, error } = await (typedSupabase as any)
      .from('trending_posts')
      .select(`
        id,
        content,
        images,
        videos,
        hashtags,
        location,
        view_count,
        like_count,
        comment_count,
        share_count,
        created_at,
        author_id,
        user_profiles!inner(username, full_name, avatar_url)
      `)
      .eq('is_active', true)
      .order('like_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('获取推荐内容失败:', error);
      return { posts: [], hasMore: false };
    }

    // 转换数据格式
    const formattedPosts: TrendingPost[] = posts?.map((post: any) => {
      const userProfile = post.user_profiles as any;
      
      return {
        id: post.id,
        content: post.content,
        images: post.images || [],
        videos: post.videos || [],
        hashtags: post.hashtags || [],
        location: post.location,
        author: userProfile?.username || userProfile?.full_name || 'Anonymous',
        avatar: userProfile?.avatar_url || `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        likes: post.like_count || 0,
        comments: post.comment_count || 0,
        shares: post.share_count || 0,
        views: post.view_count || 0,
        createdAt: post.created_at,
        category: post.hashtags?.[0] || 'general'
      };
    }) || [];

    return {
      posts: formattedPosts,
      hasMore: formattedPosts.length === limit
    };

  } catch (error) {
    console.error('获取推荐trending posts失败:', error);
    return { posts: [], hasMore: false };
  }
}