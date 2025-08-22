// src/components/pages/TrendingPage.tsx - Version 12 (修复版本)
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Heart, 
  MessageCircle, 
  MapPin, 
  Camera, 
  X,
  Image as ImageIcon,
  Video,
  Hash,
  Globe,
  Lock,
  Users,
  Star,
  Loader2,
  RefreshCw,
  AlertCircle,
  Share2
} from 'lucide-react';
import { darkTheme } from '../../lib/theme';
import { trendingData } from '../../lib/mockData';
import { typedSupabase } from '../../lib/supabase';

// 真实的数据库接口
interface TrendingPost {
  id: string;
  content: string;
  images: string[];
  videos?: string[];
  hashtags: string[];
  location?: any;
  author_id: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // 从视图中获取的用户信息
  username?: string;
  full_name?: string;
  avatar_url?: string;
  user_type?: string;
}

interface CreatePostData {
  content: string;
  images?: string[];
  videos?: string[];
  hashtags?: string[];
  location?: any;
}

interface User {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  user_type?: string;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (content: CreatePostData) => Promise<void>;
  uploading: boolean;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPost, uploading }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [location, setLocation] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `trending-media/users/${fileName}`;

        const { data, error } = await typedSupabase.storage
          .from('trending-media')
          .upload(filePath, file);

        if (error) throw error;

        const { data: urlData } = typedSupabase.storage
          .from('trending-media')
          .getPublicUrl(filePath);

        return urlData.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      if (type === 'image') {
        setImages(prev => [...prev, ...uploadedUrls]);
      } else {
        setVideos(prev => [...prev, ...uploadedUrls]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('文件上传失败，请重试');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handlePost = async () => {
    if (content.trim()) {
      try {
        await onPost({
          content: content.trim(),
          images,
          videos,
          hashtags: tags,
          location: location.trim() ? { description: location.trim() } : undefined,
        });
        // Reset form
        setContent('');
        setImages([]);
        setVideos([]);
        setTags([]);
        setLocation('');
        onClose();
      } catch (error) {
        console.error('Post creation failed:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-lg mx-4 rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
        style={{ background: darkTheme.background.card }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: darkTheme.text.primary }}>
            发布内容
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ background: darkTheme.background.glass }}
          >
            <X size={16} style={{ color: darkTheme.text.muted }} />
          </button>
        </div>

        {/* Content Input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="分享你的想法..."
          className="w-full p-4 rounded-xl border resize-none focus:outline-none focus:ring-2"
          style={{
            background: darkTheme.background.primary,
            borderColor: darkTheme.background.glass,
            color: darkTheme.text.primary,
            '--tw-ring-color': darkTheme.neon.purple,
          } as React.CSSProperties}
          rows={4}
        />

        {/* Media Upload */}
        <div className="mt-4">
          <div className="flex gap-2 mb-3">
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors cursor-pointer hover:bg-opacity-80">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'image')}
                className="hidden"
                disabled={uploadingFiles}
              />
              <ImageIcon size={16} />
              <span className="text-sm">添加图片</span>
              {uploadingFiles && <Loader2 size={14} className="animate-spin" />}
            </label>
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors cursor-pointer hover:bg-opacity-80">
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={(e) => handleFileUpload(e, 'video')}
                className="hidden"
                disabled={uploadingFiles}
              />
              <Video size={16} />
              <span className="text-sm">添加视频</span>
            </label>
          </div>

          {/* Media Preview Grid */}
          {(images.length > 0 || videos.length > 0) && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {images.map((image, index) => (
                <div 
                  key={`img-${index}`}
                  className="aspect-square rounded-lg relative overflow-hidden"
                >
                  <img 
                    src={image} 
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setImages(images.filter((_, i) => i !== index))}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: darkTheme.neon.purple }}
                  >
                    <X size={12} style={{ color: 'white' }} />
                  </button>
                </div>
              ))}
              {videos.map((video, index) => (
                <div 
                  key={`vid-${index}`}
                  className="aspect-square rounded-lg relative overflow-hidden"
                >
                  <video 
                    src={video} 
                    className="w-full h-full object-cover"
                    controls={false}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                    <Video size={24} style={{ color: 'white' }} />
                  </div>
                  <button
                    onClick={() => setVideos(videos.filter((_, i) => i !== index))}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: darkTheme.neon.purple }}
                  >
                    <X size={12} style={{ color: 'white' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash size={16} style={{ color: darkTheme.text.muted }} />
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="添加标签"
              className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                background: darkTheme.background.primary,
                borderColor: darkTheme.background.glass,
                color: darkTheme.text.primary,
                '--tw-ring-color': darkTheme.neon.purple,
              } as React.CSSProperties}
            />
            <button
              onClick={handleAddTag}
              className="px-3 py-2 rounded-lg text-sm font-medium"
              style={{ background: darkTheme.neon.purple, color: 'white' }}
            >
              添加
            </button>
          </div>
          
          {/* Tag List */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  style={{
                    background: `${darkTheme.neon.purple}20`,
                    color: darkTheme.neon.purple,
                    border: `1px solid ${darkTheme.neon.purple}40`
                  }}
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <MapPin size={16} style={{ color: darkTheme.text.muted }} />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="添加位置"
              className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                background: darkTheme.background.primary,
                borderColor: darkTheme.background.glass,
                color: darkTheme.text.primary,
                '--tw-ring-color': darkTheme.neon.purple,
              } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t" style={{ borderColor: darkTheme.background.glass }}>
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 py-3 rounded-xl font-medium transition-colors"
            style={{
              background: darkTheme.background.glass,
              color: darkTheme.text.secondary
            }}
          >
            取消
          </button>
          <button
            onClick={handlePost}
            disabled={!content.trim() || uploading || uploadingFiles}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
              (!content.trim() || uploading || uploadingFiles) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              background: darkTheme.neon.purple,
              color: 'white'
            }}
          >
            {uploading && <Loader2 size={16} className="animate-spin" />}
            {uploading ? '发布中...' : '发布'}
          </button>
        </div>
      </div>
    </div>
  );
};

const TrendingPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedMainCategory, setSelectedMainCategory] = useState('热点');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [posts, setPosts] = useState<TrendingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  // 检查用户登录状态
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: authUser } } = await typedSupabase.auth.getUser();
        if (authUser) {
          const { data: profile } = await typedSupabase
            .from('user_profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
          
          if (profile) {
            setUser({
              id: profile.id,
              username: profile.username,
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
              user_type: profile.user_type,
            });
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };

    checkUser();
  }, []);

  // 加载trending posts
  useEffect(() => {
    loadTrendingPosts();
  }, [selectedTags]);

  // 检查用户点赞状态
  useEffect(() => {
    if (user && posts.length > 0) {
      checkLikedPosts();
    }
  }, [user, posts]);

  const loadTrendingPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = typedSupabase
        .from('trending_posts_with_author')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      // 根据标签过滤
      if (selectedTags.length > 0) {
        query = query.overlaps('hashtags', selectedTags);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('加载内容失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const checkLikedPosts = async () => {
    if (!user) return;

    try {
      const { data } = await typedSupabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', posts.map(p => p.id));

      if (data) {
        setLikedPosts(new Set(data.map(like => like.post_id)));
      }
    } catch (error) {
      console.error('Error checking liked posts:', error);
    }
  };

  const handleCreatePost = async (postData: CreatePostData) => {
    if (!user) return;

    setIsCreatingPost(true);
    try {
      const { data, error } = await typedSupabase
        .from('trending_posts')
        .insert({
          author_id: user.id,
          content: postData.content,
          images: postData.images || [],
          videos: postData.videos || [],
          hashtags: postData.hashtags || [],
          location: postData.location,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // 添加到本地状态
      const newPost: TrendingPost = {
        ...data,
        username: user.username,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        user_type: user.user_type,
      };
      
      setPosts(prev => [newPost, ...prev]);
    } catch (error) {
      console.error('Create post error:', error);
      throw error;
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleLikeClick = async (postId: string) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    const isCurrentlyLiked = likedPosts.has(postId);
    
    // 乐观更新
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyLiked) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, like_count: Math.max(0, post.like_count + (isCurrentlyLiked ? -1 : 1)) }
        : post
    ));

    try {
      if (isCurrentlyLiked) {
        // 取消点赞
        const { error } = await typedSupabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) throw error;
      } else {
        // 点赞
        const { error } = await typedSupabase
          .from('post_likes')
          .insert({
            user_id: user.id,
            post_id: postId,
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // 回滚乐观更新
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });

      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, like_count: Math.max(0, post.like_count + (isCurrentlyLiked ? 1 : -1)) }
          : post
      ));
    }
  };

  const handleShareClick = async (postId: string) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    
    try {
      // 记录分享
      await typedSupabase
        .from('post_shares')
        .insert({
          user_id: user.id,
          post_id: postId,
          share_type: 'native',
          platform: 'app',
        });

      // 更新分享计数
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, share_count: post.share_count + 1 }
          : post
      ));
      
      // 分享功能
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'LifeX - 分享精彩内容',
            url: `${window.location.origin}/trending/post/${postId}`
          });
        } catch (err) {
          // 用户取消分享
        }
      } else {
        // 复制链接到剪贴板
        const url = `${window.location.origin}/trending/post/${postId}`;
        await navigator.clipboard.writeText(url);
        alert('链接已复制到剪贴板');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  // 主分类数据
  const mainCategories = [
    { key: '热点', label: '热点', icon: TrendingUp },
    { key: '推荐', label: '推荐', icon: Star },
    { key: '附近', label: '附近', icon: MapPin }
  ];

  // 细分标签数据
  const contentTags = [
    { key: 'all', label: '全部', active: selectedTags.length === 0 },
    { key: '科技', label: '科技', active: selectedTags.includes('科技') },
    { key: '美食', label: '美食', active: selectedTags.includes('美食') },
    { key: '生活方式', label: '生活方式', active: selectedTags.includes('生活方式') },
    { key: '旅行', label: '旅行', active: selectedTags.includes('旅行') },
    { key: '时尚', label: '时尚', active: selectedTags.includes('时尚') },
    { key: '健身', label: '健身', active: selectedTags.includes('健身') },
    { key: '艺术', label: '艺术', active: selectedTags.includes('艺术') },
    { key: '音乐', label: '音乐', active: selectedTags.includes('音乐') },
    { key: '商业', label: '商业', active: selectedTags.includes('商业') }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleTagClick = (tagKey: string) => {
    if (tagKey === 'all') {
      setSelectedTags([]);
    } else {
      setSelectedTags(prev => 
        prev.includes(tagKey) 
          ? prev.filter(t => t !== tagKey)
          : [...prev, tagKey]
      );
    }
  };

  const handleCreatePostClick = () => {
    if (!user) {
      setShowLoginPrompt(true);
    } else {
      setShowCreateModal(true);
    }
  };

  return (
    <div className="h-full overflow-y-auto pb-20" style={{ background: darkTheme.background.primary, WebkitOverflowScrolling: 'touch' }}>
      <div className="relative px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-8 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
          
          {/* 第一层：主分类切换 */}
          <div 
            className={`transition-transform duration-300 ease-in-out ${
              isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
            }`}
          >
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <div 
                  className="flex rounded-2xl p-1"
                  style={{ background: darkTheme.background.glass }}
                >
                  {mainCategories.map((category) => (
                    <button
                      key={category.key}
                      onClick={() => setSelectedMainCategory(category.key)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all ${
                        selectedMainCategory === category.key ? 'shadow-lg' : ''
                      }`}
                      style={{
                        background: selectedMainCategory === category.key 
                          ? darkTheme.neon.purple 
                          : 'transparent',
                        color: selectedMainCategory === category.key 
                          ? 'white' 
                          : darkTheme.text.primary,
                      }}
                    >
                      <category.icon size={16} />
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 第二层：细分标签 */}
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-2 min-w-max">
                  {contentTags.map((tag) => (
                    <button
                      key={tag.key}
                      onClick={() => handleTagClick(tag.key)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap`}
                      style={{
                        background: tag.active 
                          ? `${darkTheme.neon.purple}20` 
                          : darkTheme.background.card,
                        borderColor: tag.active 
                          ? darkTheme.neon.purple 
                          : darkTheme.background.glass,
                        color: tag.active 
                          ? darkTheme.neon.purple 
                          : darkTheme.text.primary,
                      }}
                    >
                      {tag.label}
                      {tag.active && selectedTags.length > 0 && (
                        <span className="ml-1 text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 内容区域 - 瀑布流布局 */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {/* 左列 */}
            <div className="space-y-3 md:space-y-4">
              {/* 热门趋势 - 左列 */}
              {trendingData.filter((_, index) => index % 2 === 0).map((trend, idx) => (
                <div 
                  key={trend.id}
                  className="p-4 md:p-5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${trend.color}20`, border: `1px solid ${trend.color}40` }}
                    >
                      <trend.icon size={20} className="md:w-6 md:h-6" style={{ color: trend.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm md:text-base pr-2" style={{ color: darkTheme.text.primary }}>
                          {trend.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <TrendingUp size={12} className="md:w-4 md:h-4" style={{ color: darkTheme.neon.green }} />
                          <span className="text-xs md:text-sm font-medium" style={{ color: darkTheme.neon.green }}>
                            {trend.growth}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs md:text-sm mb-2" style={{ color: darkTheme.text.secondary }}>
                        {trend.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span 
                          className="px-2 md:px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: `${trend.color}20`,
                            color: trend.color,
                            border: `1px solid ${trend.color}40`
                          }}
                        >
                          {trend.category}
                        </span>
                        <span className="text-xs" style={{ color: darkTheme.text.muted }}>
                          #{idx * 2 + 1} trending
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 用户发布的内容 - 左列 */}
              {posts.filter((_, index) => index % 2 === 0).map((post) => (
                <div 
                  key={post.id}
                  className="rounded-2xl border overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center"
                        style={{ 
                          background: post.avatar_url 
                            ? undefined 
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}
                      >
                        {post.avatar_url ? (
                          <img 
                            src={post.avatar_url} 
                            alt={post.username || post.full_name || 'User'}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-sm font-medium">
                            {(post.username || post.full_name || 'U').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm md:text-base" style={{ color: darkTheme.text.primary }}>
                          {post.username || post.full_name || 'Anonymous'}
                        </h4>
                        {post.location && typeof post.location === 'object' && post.location.description && (
                          <p className="text-xs flex items-center gap-1" style={{ color: darkTheme.text.muted }}>
                            <MapPin size={10} />
                            {post.location.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-sm md:text-base mb-3" style={{ color: darkTheme.text.primary }}>
                      {post.content}
                    </p>

                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.hashtags.map((tag, tagIdx) => (
                          <span 
                            key={tagIdx}
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              background: `${darkTheme.neon.blue}20`,
                              color: darkTheme.neon.blue
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {post.images && post.images.length > 0 && (
                      <div className={`grid ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-3`}>
                        {post.images.map((image, imgIdx) => (
                          <div 
                            key={imgIdx}
                            className="rounded-xl h-24 md:h-32 relative overflow-hidden"
                          >
                            <img 
                              src={image} 
                              alt={`Post image ${imgIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: darkTheme.background.glass }}>
                      <div className="flex items-center gap-4">
                        <button 
                          className="flex items-center gap-1 transition-colors hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeClick(post.id);
                          }}
                        >
                          <Heart 
                            size={14} 
                            className="md:w-4 md:h-4" 
                            style={{ 
                              color: likedPosts.has(post.id) ? darkTheme.neon.pink : darkTheme.text.muted,
                              fill: likedPosts.has(post.id) ? darkTheme.neon.pink : 'none'
                            }} 
                          />
                          <span className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                            {post.like_count}
                          </span>
                        </button>
                        <button className="flex items-center gap-1 transition-colors hover:scale-105">
                          <MessageCircle size={14} className="md:w-4 md:h-4" style={{ color: darkTheme.text.muted }} />
                          <span className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                            {post.comment_count}
                          </span>
                        </button>
                        <button 
                          className="flex items-center gap-1 transition-colors hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareClick(post.id);
                          }}
                        >
                          <Share2 size={14} className="md:w-4 md:h-4" style={{ color: darkTheme.text.muted }} />
                          <span className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                            {post.share_count}
                          </span>
                        </button>
                      </div>
                      <div className="text-xs" style={{ color: darkTheme.text.muted }}>
                        {post.view_count} 浏览
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 右列 */}
            <div className="space-y-3 md:space-y-4">
              {/* 热门趋势 - 右列 */}
              {trendingData.filter((_, index) => index % 2 === 1).map((trend, idx) => (
                <div 
                  key={trend.id}
                  className="p-4 md:p-5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${trend.color}20`, border: `1px solid ${trend.color}40` }}
                    >
                      <trend.icon size={20} className="md:w-6 md:h-6" style={{ color: trend.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm md:text-base pr-2" style={{ color: darkTheme.text.primary }}>
                          {trend.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <TrendingUp size={12} className="md:w-4 md:h-4" style={{ color: darkTheme.neon.green }} />
                          <span className="text-xs md:text-sm font-medium" style={{ color: darkTheme.neon.green }}>
                            {trend.growth}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs md:text-sm mb-2" style={{ color: darkTheme.text.secondary }}>
                        {trend.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span 
                          className="px-2 md:px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: `${trend.color}20`,
                            color: trend.color,
                            border: `1px solid ${trend.color}40`
                          }}
                        >
                          {trend.category}
                        </span>
                        <span className="text-xs" style={{ color: darkTheme.text.muted }}>
                          #{idx * 2 + 2} trending
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 用户发布的内容 - 右列 */}
              {posts.filter((_, index) => index % 2 === 1).map((post) => (
                <div 
                  key={post.id}
                  className="rounded-2xl border overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center"
                        style={{ 
                          background: post.avatar_url 
                            ? undefined 
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}
                      >
                        {post.avatar_url ? (
                          <img 
                            src={post.avatar_url} 
                            alt={post.username || post.full_name || 'User'}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-sm font-medium">
                            {(post.username || post.full_name || 'U').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm md:text-base" style={{ color: darkTheme.text.primary }}>
                          {post.username || post.full_name || 'Anonymous'}
                        </h4>
                        {post.location && typeof post.location === 'object' && post.location.description && (
                          <p className="text-xs flex items-center gap-1" style={{ color: darkTheme.text.muted }}>
                            <MapPin size={10} />
                            {post.location.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-sm md:text-base mb-3" style={{ color: darkTheme.text.primary }}>
                      {post.content}
                    </p>

                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.hashtags.map((tag, tagIdx) => (
                          <span 
                            key={tagIdx}
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              background: `${darkTheme.neon.blue}20`,
                              color: darkTheme.neon.blue
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {post.images && post.images.length > 0 && (
                      <div className={`grid ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-3`}>
                        {post.images.map((image, imgIdx) => (
                          <div 
                            key={imgIdx}
                            className="rounded-xl h-24 md:h-32 relative overflow-hidden"
                          >
                            <img 
                              src={image} 
                              alt={`Post image ${imgIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: darkTheme.background.glass }}>
                      <div className="flex items-center gap-4">
                        <button 
                          className="flex items-center gap-1 transition-colors hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeClick(post.id);
                          }}
                        >
                          <Heart 
                            size={14} 
                            className="md:w-4 md:h-4" 
                            style={{ 
                              color: likedPosts.has(post.id) ? darkTheme.neon.pink : darkTheme.text.muted,
                              fill: likedPosts.has(post.id) ? darkTheme.neon.pink : 'none'
                            }} 
                          />
                          <span className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                            {post.like_count}
                          </span>
                        </button>
                        <button className="flex items-center gap-1 transition-colors hover:scale-105">
                          <MessageCircle size={14} className="md:w-4 md:h-4" style={{ color: darkTheme.text.muted }} />
                          <span className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                            {post.comment_count}
                          </span>
                        </button>
                        <button 
                          className="flex items-center gap-1 transition-colors hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareClick(post.id);
                          }}
                        >
                          <Share2 size={14} className="md:w-4 md:h-4" style={{ color: darkTheme.text.muted }} />
                          <span className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                            {post.share_count}
                          </span>
                        </button>
                      </div>
                      <div className="text-xs" style={{ color: darkTheme.text.muted }}>
                        {post.view_count} 浏览
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 加载状态 */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin" style={{ color: darkTheme.neon.purple }} />
              <span className="ml-2" style={{ color: darkTheme.text.secondary }}>
                加载中...
              </span>
            </div>
          )}

          {/* 错误状态 */}
          {error && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: `${darkTheme.neon.pink}20` }}>
                <AlertCircle size={16} style={{ color: darkTheme.neon.pink }} />
                <span style={{ color: darkTheme.neon.pink }}>{error}</span>
                <button 
                  onClick={() => {
                    setError(null);
                    loadTrendingPosts();
                  }}
                  className="ml-2 p-1 rounded hover:bg-opacity-20"
                  style={{ background: `${darkTheme.neon.pink}10` }}
                >
                  <RefreshCw size={14} style={{ color: darkTheme.neon.pink }} />
                </button>
              </div>
            </div>
          )}

          {/* 空状态 */}
          {!loading && posts.length === 0 && !error && (
            <div className="text-center py-12">
              <Camera size={48} className="mx-auto mb-4 opacity-50" style={{ color: darkTheme.text.muted }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: darkTheme.text.primary }}>
                还没有内容
              </h3>
              <p style={{ color: darkTheme.text.secondary }}>
                成为第一个分享精彩内容的人！
              </p>
            </div>
          )}

          {/* 发布按钮 - 悬浮操作按钮 */}
          <div className="fixed bottom-24 right-4 md:right-6 z-40">
            <button 
              onClick={handleCreatePostClick}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
              style={{ 
                background: `linear-gradient(135deg, ${darkTheme.neon.purple}, ${darkTheme.neon.pink})`,
                boxShadow: `0 8px 20px ${darkTheme.neon.purple}40`
              }}
            >
              <Camera className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* 创建内容模态框 */}
      <CreatePostModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPost={handleCreatePost}
        uploading={isCreatingPost}
      />

      {/* 登录提示模态框 */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLoginPrompt(false)}
          />
          
          <div 
            className="relative w-full max-w-sm mx-4 rounded-2xl p-6"
            style={{ background: darkTheme.background.card }}
          >
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: `${darkTheme.neon.purple}20` }}
              >
                <Camera size={24} style={{ color: darkTheme.neon.purple }} />
              </div>
              
              <h3 className="text-lg font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                登录后发布内容
              </h3>
              
              <p className="text-sm mb-6" style={{ color: darkTheme.text.secondary }}>
                注册或登录账户，即可分享你的精彩瞬间
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 py-3 rounded-xl font-medium transition-colors"
                  style={{
                    background: darkTheme.background.glass,
                    color: darkTheme.text.secondary
                  }}
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    // 跳转到登录页面
                    window.location.href = '/auth/login';
                  }}
                  className="flex-1 py-3 rounded-xl font-medium transition-colors"
                  style={{
                    background: darkTheme.neon.purple,
                    color: 'white'
                  }}
                >
                  去登录
                </button>
              </div>
              
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  // 跳转到注册页面
                  window.location.href = '/auth/register';
                }}
                className="w-full mt-3 py-2 text-sm underline transition-colors"
                style={{ color: darkTheme.neon.purple }}
              >
                还没有账户？立即注册
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendingPage;