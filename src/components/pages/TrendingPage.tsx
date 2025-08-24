// src/components/pages/TrendingPage.tsx - Version 12 (English Version)
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

// Real database interface
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
  // User info from view
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
      alert('File upload failed, please try again');
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
            Create Post
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
          placeholder="Share your thoughts..."
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
              <ImageIcon size={16} style={{ color: darkTheme.text.muted }} />
              <span className="text-sm" style={{ color: darkTheme.text.secondary }}>
                Photo
              </span>
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
              <Video size={16} style={{ color: darkTheme.text.muted }} />
              <span className="text-sm" style={{ color: darkTheme.text.secondary }}>
                Video
              </span>
            </label>
          </div>

          {/* Media Preview */}
          {(images.length > 0 || videos.length > 0) && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {images.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <img src={url} alt="Upload" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setImages(images.filter((_, i) => i !== index))}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/50"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}
              {videos.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <video src={url} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setVideos(videos.filter((_, i) => i !== index))}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/50"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags Input */}
        <div className="mt-4">
          <div className="flex gap-2 mb-2">
            <div className="flex-1 relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkTheme.text.muted }} />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add tags..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  background: darkTheme.background.primary,
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary,
                  '--tw-ring-color': darkTheme.neon.purple,
                } as React.CSSProperties}
              />
            </div>
            <button
              onClick={handleAddTag}
              disabled={!tagInput.trim() || tags.length >= 5}
              className="px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
              style={{
                background: darkTheme.background.glass,
                borderColor: darkTheme.background.glass,
                color: darkTheme.text.primary,
              }}
            >
              Add
            </button>
          </div>

          {/* Tags Display */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <span 
                  key={tag}
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                  style={{
                    background: `${darkTheme.neon.purple}20`,
                    color: darkTheme.neon.purple,
                    border: `1px solid ${darkTheme.neon.purple}40`
                  }}
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-opacity-20 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Location Input */}
        <div className="mt-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkTheme.text.muted }} />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                background: darkTheme.background.primary,
                borderColor: darkTheme.background.glass,
                color: darkTheme.text.primary,
                '--tw-ring-color': darkTheme.neon.purple,
              } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handlePost}
            disabled={!content.trim() || uploading || uploadingFiles}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              (!content.trim() || uploading || uploadingFiles) ? 
                'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              background: darkTheme.neon.purple,
              color: 'white'
            }}
          >
            {uploading && <Loader2 size={16} className="animate-spin" />}
            {uploading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
};

const TrendingPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedMainCategory, setSelectedMainCategory] = useState('Hot');
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

  // Check user login status
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

  // Load trending posts
  useEffect(() => {
    loadTrendingPosts();
  }, [selectedTags]);

  // Check user like status
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

      // Filter by tags
      if (selectedTags.length > 0) {
        query = query.overlaps('hashtags', selectedTags);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Failed to load content, please try again');
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

      // Add to local state
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
    
    // Optimistic update
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
        await typedSupabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
      } else {
        await typedSupabase
          .from('post_likes')
          .insert({
            user_id: user.id,
            post_id: postId,
          });
      }
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert optimistic update
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
      // Record share
      await typedSupabase
        .from('post_shares')
        .insert({
          user_id: user.id,
          post_id: postId,
          share_type: 'native',
          platform: 'app',
        });

      // Update share count
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, share_count: post.share_count + 1 }
          : post
      ));
      
      // Share functionality
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'LifeX - Share Amazing Content',
            url: `${window.location.origin}/trending/post/${postId}`
          });
        } catch (err) {
          // User canceled share
        }
      } else {
        // Copy link to clipboard
        const url = `${window.location.origin}/trending/post/${postId}`;
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  // Main category data
  const mainCategories = [
    { key: 'Hot', label: 'Hot', icon: TrendingUp },
    { key: 'Recommended', label: 'Recommended', icon: Star },
    { key: 'Nearby', label: 'Nearby', icon: MapPin }
  ];

  // Content tags data
  const contentTags = [
    { key: 'all', label: 'All', active: selectedTags.length === 0 },
    { key: 'Tech', label: 'Tech', active: selectedTags.includes('Tech') },
    { key: 'Food', label: 'Food', active: selectedTags.includes('Food') },
    { key: 'Lifestyle', label: 'Lifestyle', active: selectedTags.includes('Lifestyle') },
    { key: 'Travel', label: 'Travel', active: selectedTags.includes('Travel') },
    { key: 'Fashion', label: 'Fashion', active: selectedTags.includes('Fashion') },
    { key: 'Fitness', label: 'Fitness', active: selectedTags.includes('Fitness') },
    { key: 'Art', label: 'Art', active: selectedTags.includes('Art') },
    { key: 'Music', label: 'Music', active: selectedTags.includes('Music') },
    { key: 'Business', label: 'Business', active: selectedTags.includes('Business') }
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
          
          {/* First layer: Main category switching */}
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

              {/* Second layer: Content tags */}
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

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin" style={{ color: darkTheme.neon.purple }} />
              <span className="ml-2" style={{ color: darkTheme.text.secondary }}>
                Loading...
              </span>
            </div>
          )}

          {/* Error state */}
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

          {/* Empty state */}
          {!loading && posts.length === 0 && !error && (
            <div className="text-center py-12">
              <Camera size={48} className="mx-auto mb-4 opacity-50" style={{ color: darkTheme.text.muted }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: darkTheme.text.primary }}>
                No content yet
              </h3>
              <p style={{ color: darkTheme.text.secondary }}>
                Be the first to share amazing content!
              </p>
            </div>
          )}

          {/* Content area - Waterfall layout */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {/* Left column */}
            <div className="space-y-3 md:space-y-4">
              {/* Hot trends - Left column */}
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

              {/* User posts - Left column */}
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
                          <span className="text-white font-medium text-sm">
                            {(post.username || post.full_name || 'U')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate" style={{ color: darkTheme.text.primary }}>
                          {post.username || post.full_name || 'Anonymous'}
                        </h4>
                        <p className="text-xs" style={{ color: darkTheme.text.muted }}>
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-3 leading-relaxed" style={{ color: darkTheme.text.secondary }}>
                      {post.content}
                    </p>

                    {/* Images */}
                    {post.images && post.images.length > 0 && (
                      <div className="mb-3 rounded-lg overflow-hidden">
                        {post.images.length === 1 ? (
                          <img 
                            src={post.images[0]} 
                            alt="Post content" 
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="grid grid-cols-2 gap-1">
                            {post.images.slice(0, 4).map((img, idx) => (
                              <div key={idx} className="relative aspect-square">
                                <img 
                                  src={img} 
                                  alt={`Post content ${idx + 1}`} 
                                  className="w-full h-full object-cover"
                                />
                                {idx === 3 && post.images.length > 4 && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <span className="text-white font-medium">
                                      +{post.images.length - 4}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.hashtags.slice(0, 3).map((tag) => (
                          <span 
                            key={tag}
                            className="px-2 py-1 rounded-full text-xs"
                            style={{
                              background: `${darkTheme.neon.purple}15`,
                              color: darkTheme.neon.purple
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.hashtags.length > 3 && (
                          <span className="text-xs" style={{ color: darkTheme.text.muted }}>
                            +{post.hashtags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLikeClick(post.id)}
                          className="flex items-center gap-1 transition-colors"
                        >
                          <Heart 
                            size={16} 
                            className={likedPosts.has(post.id) ? 'fill-current' : ''}
                            style={{ 
                              color: likedPosts.has(post.id) 
                                ? darkTheme.neon.pink 
                                : darkTheme.text.muted 
                            }} 
                          />
                          <span 
                            className="text-xs"
                            style={{ color: darkTheme.text.muted }}
                          >
                            {post.like_count}
                          </span>
                        </button>

                        <button className="flex items-center gap-1 transition-colors">
                          <MessageCircle size={16} style={{ color: darkTheme.text.muted }} />
                          <span className="text-xs" style={{ color: darkTheme.text.muted }}>
                            {post.comment_count}
                          </span>
                        </button>

                        <button 
                          onClick={() => handleShareClick(post.id)}
                          className="flex items-center gap-1 transition-colors"
                        >
                          <Share2 size={16} style={{ color: darkTheme.text.muted }} />
                          <span className="text-xs" style={{ color: darkTheme.text.muted }}>
                            {post.share_count}
                          </span>
                        </button>
                      </div>

                      <span className="text-xs" style={{ color: darkTheme.text.muted }}>
                        {post.view_count} views
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right column */}
            <div className="space-y-3 md:space-y-4">
              {/* Hot trends - Right column */}
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

              {/* User posts - Right column */}
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
                          <span className="text-white font-medium text-sm">
                            {(post.username || post.full_name || 'U')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate" style={{ color: darkTheme.text.primary }}>
                          {post.username || post.full_name || 'Anonymous'}
                        </h4>
                        <p className="text-xs" style={{ color: darkTheme.text.muted }}>
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-3 leading-relaxed" style={{ color: darkTheme.text.secondary }}>
                      {post.content}
                    </p>

                    {/* Images */}
                    {post.images && post.images.length > 0 && (
                      <div className="mb-3 rounded-lg overflow-hidden">
                        {post.images.length === 1 ? (
                          <img 
                            src={post.images[0]} 
                            alt="Post content" 
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="grid grid-cols-2 gap-1">
                            {post.images.slice(0, 4).map((img, idx) => (
                              <div key={idx} className="relative aspect-square">
                                <img 
                                  src={img} 
                                  alt={`Post content ${idx + 1}`} 
                                  className="w-full h-full object-cover"
                                />
                                {idx === 3 && post.images.length > 4 && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <span className="text-white font-medium">
                                      +{post.images.length - 4}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.hashtags.slice(0, 3).map((tag) => (
                          <span 
                            key={tag}
                            className="px-2 py-1 rounded-full text-xs"
                            style={{
                              background: `${darkTheme.neon.purple}15`,
                              color: darkTheme.neon.purple
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.hashtags.length > 3 && (
                          <span className="text-xs" style={{ color: darkTheme.text.muted }}>
                            +{post.hashtags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLikeClick(post.id)}
                          className="flex items-center gap-1 transition-colors"
                        >
                          <Heart 
                            size={16} 
                            className={likedPosts.has(post.id) ? 'fill-current' : ''}
                            style={{ 
                              color: likedPosts.has(post.id) 
                                ? darkTheme.neon.pink 
                                : darkTheme.text.muted 
                            }} 
                          />
                          <span 
                            className="text-xs"
                            style={{ color: darkTheme.text.muted }}
                          >
                            {post.like_count}
                          </span>
                        </button>

                        <button className="flex items-center gap-1 transition-colors">
                          <MessageCircle size={16} style={{ color: darkTheme.text.muted }} />
                          <span className="text-xs" style={{ color: darkTheme.text.muted }}>
                            {post.comment_count}
                          </span>
                        </button>

                        <button 
                          onClick={() => handleShareClick(post.id)}
                          className="flex items-center gap-1 transition-colors"
                        >
                          <Share2 size={16} style={{ color: darkTheme.text.muted }} />
                          <span className="text-xs" style={{ color: darkTheme.text.muted }}>
                            {post.share_count}
                          </span>
                        </button>
                      </div>

                      <span className="text-xs" style={{ color: darkTheme.text.muted }}>
                        {post.view_count} views
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Create Button */}
      <button
        onClick={handleCreatePostClick}
        className="fixed bottom-20 right-4 md:right-6 w-14 h-14 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 z-40"
        style={{
          background: `linear-gradient(135deg, ${darkTheme.neon.purple} 0%, ${darkTheme.neon.pink} 100%)`,
          boxShadow: `0 8px 32px ${darkTheme.neon.purple}40`
        }}
      >
        <Plus size={24} className="text-white" />
      </button>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPost={handleCreatePost}
        uploading={isCreatingPost}
      />

      {/* Login Prompt */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLoginPrompt(false)}
          />
          <div 
            className="relative mx-4 p-6 rounded-2xl text-center max-w-sm"
            style={{ background: darkTheme.background.card }}
          >
            <h3 className="text-lg font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
              Login Required
            </h3>
            <p className="mb-4" style={{ color: darkTheme.text.secondary }}>
              Please login to interact with posts and create content.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 px-4 py-2 rounded-lg border"
                style={{
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.secondary
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  // Navigate to login page
                  window.location.href = '/auth/login';
                }}
                className="flex-1 px-4 py-2 rounded-lg"
                style={{
                  background: darkTheme.neon.purple,
                  color: 'white'
                }}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendingPage;