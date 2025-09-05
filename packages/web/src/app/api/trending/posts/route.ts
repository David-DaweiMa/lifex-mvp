// src/app/api/trending/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUser } from '@/lib/authService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 获取trending posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tags = searchParams.get('tags')?.split(',');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
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

    // 根据分类筛选
    if (category && category !== 'all') {
      query = query.contains('hashtags', [category]);
    }

    // 根据标签筛选
    if (tags && tags.length > 0) {
      query = query.overlaps('hashtags', tags);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('获取trending posts失败:', error);
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    // 转换数据格式
    const formattedPosts = posts?.map((post: any) => {
      // 正确处理Supabase关联查询的结果
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

    return NextResponse.json({
      posts: formattedPosts,
      hasMore: formattedPosts.length === limit
    });

  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 创建新的trending post
export async function POST(request: NextRequest) {
  try {
    // 使用项目现有的认证系统
    const userResult = await getCurrentUser();
    if (!userResult.success || !userResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentUser = userResult.user;
    const body = await request.json();
    const { content, images, videos, hashtags, location, privacy } = body;

    // 验证必填字段
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Content too long (max 2000 characters)' },
        { status: 400 }
      );
    }

    // 验证hashtags
    const validHashtags = hashtags?.filter((tag: string) => 
      typeof tag === 'string' && 
      tag.trim().length > 0 && 
      tag.trim().length <= 50
    ) || [];

    if (validHashtags.length > 10) {
      return NextResponse.json(
        { error: 'Too many hashtags (max 10)' },
        { status: 400 }
      );
    }

    // 验证图片和视频
    const validImages = images?.filter((img: string) => 
      typeof img === 'string' && img.trim().length > 0
    ) || [];

    const validVideos = videos?.filter((video: string) => 
      typeof video === 'string' && video.trim().length > 0
    ) || [];

    if (validImages.length + validVideos.length > 9) {
      return NextResponse.json(
        { error: 'Too many media files (max 9)' },
        { status: 400 }
      );
    }

    // 创建trending post
    const { data: newPost, error: insertError } = await supabase
      .from('trending_posts')
      .insert({
        author_id: currentUser.id,
        content: content.trim(),
        images: validImages,
        videos: validVideos,
        hashtags: validHashtags,
        location: location?.trim() || null,
        is_sponsored: false,
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        share_count: 0,
        is_active: true
      })
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
        created_at
      `)
      .single();

    if (insertError) {
      console.error('创建post失败:', insertError);
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      );
    }

    // 格式化返回数据
    const formattedPost = {
      id: newPost.id,
      content: newPost.content,
      images: newPost.images || [],
      videos: newPost.videos || [],
      hashtags: newPost.hashtags || [],
      location: newPost.location,
      author: currentUser.username || currentUser.full_name || 'Anonymous',
      avatar: currentUser.avatar_url || `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      createdAt: newPost.created_at,
      category: newPost.hashtags?.[0] || 'general'
    };

    return NextResponse.json({
      success: true,
      post: formattedPost
    });

  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 更新trending post（点赞、评论等）
export async function PATCH(request: NextRequest) {
  try {
    // 使用项目现有的认证系统
    const userResult = await getCurrentUser();
    if (!userResult.success || !userResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentUser = userResult.user;
    const body = await request.json();
    const { postId, action, value } = body;

    if (!postId || !action) {
      return NextResponse.json(
        { error: 'Post ID and action are required' },
        { status: 400 }
      );
    }

    // 验证post存在
    const { data: post, error: postError } = await supabase
      .from('trending_posts')
      .select('id, like_count, comment_count, share_count, view_count')
      .eq('id', postId)
      .eq('is_active', true)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    let newCount = 0;

    switch (action) {
      case 'like':
        if (value) {
          // 添加点赞记录
          const { error: likeError } = await supabase
            .from('post_likes')
            .insert({
              user_id: currentUser.id,
              post_id: postId
            });
          
          if (likeError && likeError.code !== '23505') { // 忽略重复插入错误
            throw likeError;
          }
        } else {
          // 删除点赞记录
          await supabase
            .from('post_likes')
            .delete()
            .eq('user_id', currentUser.id)
            .eq('post_id', postId);
        }
        
        // 重新计算点赞数
        const { count } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);
        
        newCount = count || 0;
        
        // 更新post的点赞数
        await supabase
          .from('trending_posts')
          .update({ like_count: newCount })
          .eq('id', postId);
        break;
        
      case 'comment':
        newCount = Math.max(0, (post.comment_count || 0) + 1);
        await supabase
          .from('trending_posts')
          .update({ comment_count: newCount })
          .eq('id', postId);
        break;
        
      case 'share':
        // 记录分享
        await supabase
          .from('post_shares')
          .insert({
            user_id: currentUser.id,
            post_id: postId,
            share_type: 'native'
          });
        
        newCount = Math.max(0, (post.share_count || 0) + 1);
        await supabase
          .from('trending_posts')
          .update({ share_count: newCount })
          .eq('id', postId);
        break;
        
      case 'view':
        newCount = Math.max(0, (post.view_count || 0) + 1);
        await supabase
          .from('trending_posts')
          .update({ view_count: newCount })
          .eq('id', postId);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      newCount: newCount
    });

  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}