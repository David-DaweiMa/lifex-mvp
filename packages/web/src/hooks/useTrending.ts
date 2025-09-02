// src/hooks/useTrending.ts
import { useState, useEffect, useCallback } from 'react';
import {
  getTrendingPosts,
  createTrendingPost,
  updatePostInteraction,
  uploadMedia,
  getTrendingHashtags,
  searchTrendingPosts,
  getUserTrendingPosts,
  TrendingPost,
  CreatePostData,
  TrendingFilters
} from '../lib/trendingService';

interface UseTrendingReturn {
  // Posts state
  posts: TrendingPost[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  
  // Actions
  loadPosts: (filters?: TrendingFilters) => Promise<void>;
  loadMorePosts: () => Promise<void>;
  createPost: (data: CreatePostData) => Promise<{ success: boolean; error?: string }>;
  likePost: (postId: string, liked: boolean) => Promise<void>;
  sharePost: (postId: string) => Promise<void>;
  viewPost: (postId: string) => Promise<void>;
  uploadFile: (file: File, type: 'image' | 'video') => Promise<{ success: boolean; url?: string; error?: string }>;
  
  // Search and filter
  searchPosts: (query: string, filters?: TrendingFilters) => Promise<void>;
  refreshPosts: () => Promise<void>;
}

export const useTrending = (initialFilters: TrendingFilters = {}): UseTrendingReturn => {
  const [posts, setPosts] = useState<TrendingPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<TrendingFilters>(initialFilters);
  const [offset, setOffset] = useState(0);

  // 加载posts
  const loadPosts = useCallback(async (filters: TrendingFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const newFilters = { ...currentFilters, ...filters, offset: 0 };
      setCurrentFilters(newFilters);
      setOffset(0);
      
      const result = await getTrendingPosts(newFilters);
      
      setPosts(result.posts);
      setHasMore(result.hasMore);
      setOffset(result.posts.length);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  // 加载更多posts
  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loading) return;
    
    try {
      setLoading(true);
      
      const result = await getTrendingPosts({
        ...currentFilters,
        offset
      });
      
      setPosts(prev => [...prev, ...result.posts]);
      setHasMore(result.hasMore);
      setOffset(prev => prev + result.posts.length);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more posts');
    } finally {
      setLoading(false);
    }
  }, [currentFilters, offset, hasMore, loading]);

  // 创建新post
  const createPost = useCallback(async (data: CreatePostData) => {
    try {
      const result = await createTrendingPost(data);
      
      if (result.success && result.post) {
        // 将新post添加到列表顶部
        setPosts(prev => [result.post!, ...prev]);
      }
      
      return result;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create post'
      };
    }
  }, []);

  // 点赞post
  const likePost = useCallback(async (postId: string, liked: boolean) => {
    try {
      // 乐观更新UI
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: Math.max(0, post.likes + (liked ? 1 : -1)) }
          : post
      ));

      const result = await updatePostInteraction(postId, 'like', liked);
      
      if (!result.success) {
        // 回滚乐观更新
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes: Math.max(0, post.likes + (liked ? -1 : 1)) }
            : post
        ));
        
        setError(result.error || 'Failed to update like');
      } else if (result.newCount !== undefined) {
        // 使用服务器返回的准确计数
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes: result.newCount! }
            : post
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like post');
      
      // 回滚乐观更新
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: Math.max(0, post.likes + (liked ? -1 : 1)) }
          : post
      ));
    }
  }, []);

  // 分享post
  const sharePost = useCallback(async (postId: string) => {
    try {
      // 乐观更新UI
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, shares: post.shares + 1 }
          : post
      ));

      const result = await updatePostInteraction(postId, 'share');
      
      if (!result.success) {
        // 回滚乐观更新
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, shares: Math.max(0, post.shares - 1) }
            : post
        ));
        
        setError(result.error || 'Failed to share post');
      } else if (result.newCount !== undefined) {
        // 使用服务器返回的准确计数
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, shares: result.newCount! }
            : post
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share post');
      
      // 回滚乐观更新
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, shares: Math.max(0, post.shares - 1) }
          : post
      ));
    }
  }, []);

  // 查看post
  const viewPost = useCallback(async (postId: string) => {
    try {
      // 乐观更新UI
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, views: post.views + 1 }
          : post
      ));

      // 在后台更新服务器
      await updatePostInteraction(postId, 'view');
    } catch (err) {
      // 静默处理错误，因为view计数不那么重要
      console.warn('Failed to update view count:', err);
    }
  }, []);

  // 上传文件
  const uploadFile = useCallback(async (file: File, type: 'image' | 'video') => {
    try {
      return await uploadMedia(file, type);
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to upload file'
      };
    }
  }, []);

  // 搜索posts
  const searchPosts = useCallback(async (query: string, filters: TrendingFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchFilters = { ...currentFilters, ...filters, offset: 0 };
      setCurrentFilters(searchFilters);
      setOffset(0);
      
      const result = await searchTrendingPosts(query, searchFilters);
      
      setPosts(result.posts);
      setHasMore(result.hasMore);
      setOffset(result.posts.length);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  // 刷新posts
  const refreshPosts = useCallback(async () => {
    await loadPosts(currentFilters);
  }, [loadPosts, currentFilters]);

  // 初始加载
  useEffect(() => {
    loadPosts(initialFilters);
  }, []); // 仅在组件挂载时执行

  return {
    posts,
    loading,
    error,
    hasMore,
    loadPosts,
    loadMorePosts,
    createPost,
    likePost,
    sharePost,
    viewPost,
    uploadFile,
    searchPosts,
    refreshPosts
  };
};

// 专门用于获取热门hashtags的Hook
export const useTrendingHashtags = (limit: number = 20) => {
  const [hashtags, setHashtags] = useState<Array<{ tag: string; count: number; growth: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHashtags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getTrendingHashtags(limit);
      setHashtags(result.tags);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hashtags');
      setHashtags([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadHashtags();
  }, [loadHashtags]);

  return {
    hashtags,
    loading,
    error,
    refresh: loadHashtags
  };
};

// 专门用于获取用户posts的Hook
export const useUserTrendingPosts = (userId: string, filters: TrendingFilters = {}) => {
  const [posts, setPosts] = useState<TrendingPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const loadUserPosts = useCallback(async (resetOffset = true) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const currentOffset = resetOffset ? 0 : offset;
      const result = await getUserTrendingPosts(userId, { ...filters, offset: currentOffset });
      
      if (resetOffset) {
        setPosts(result.posts);
        setOffset(result.posts.length);
      } else {
        setPosts(prev => [...prev, ...result.posts]);
        setOffset(prev => prev + result.posts.length);
      }
      
      setHasMore(result.hasMore);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user posts');
      if (resetOffset) {
        setPosts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, filters, offset]);

  const loadMoreUserPosts = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadUserPosts(false);
  }, [loadUserPosts, hasMore, loading]);

  useEffect(() => {
    if (userId) {
      loadUserPosts(true);
    }
  }, [userId, JSON.stringify(filters)]); // 使用JSON.stringify来比较filters对象

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore: loadMoreUserPosts,
    refresh: () => loadUserPosts(true)
  };
};