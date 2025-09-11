import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 创建Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const typedSupabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    console.log('开始读取trending数据...');

    // 1. 读取现有的trending帖子
    const { data: existingPosts, error: postError } = await (typedSupabase as any)
      .from('trending_posts')
      .select(`
        *,
        user_profiles!trending_posts_author_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (postError) {
      console.error('读取帖子失败:', postError);
      return NextResponse.json(
        { 
          success: false, 
          message: '读取帖子失败', 
          error: postError.message 
        },
        { status: 500 }
      );
    }

    console.log(`找到 ${existingPosts?.length || 0} 个现有帖子`);

    // 2. 读取点赞记录
    const { data: existingLikes, error: likeError } = await (typedSupabase as any)
      .from('post_likes')
      .select('*')
      .limit(100);

    if (likeError) {
      console.error('读取点赞记录失败:', likeError);
      // 不返回错误，因为点赞记录不是必需的
    } else {
      console.log(`找到 ${existingLikes?.length || 0} 个点赞记录`);
    }

    // 3. 读取分享记录
    const { data: existingShares, error: shareError } = await (typedSupabase as any)
      .from('post_shares')
      .select('*')
      .limit(100);

    if (shareError) {
      console.error('读取分享记录失败:', shareError);
      // 不返回错误，因为分享记录不是必需的
    } else {
      console.log(`找到 ${existingShares?.length || 0} 个分享记录`);
    }

    // 4. 计算统计信息
    const postCount = existingPosts?.length || 0;
    const likeCount = existingLikes?.length || 0;
    const shareCount = existingShares?.length || 0;
    
    // 计算总的评论数（从帖子数据中获取）
    const totalComments = existingPosts?.reduce((sum: number, post: any) => sum + (post.comment_count || 0), 0) || 0;

    console.log('Trending数据读取完成！');

    return NextResponse.json({
      success: true,
      message: 'Trending数据读取成功',
      data: {
        posts: {
          count: postCount,
          data: existingPosts || []
        },
        likes: {
          count: likeCount,
          data: existingLikes || []
        },
        comments: {
          count: totalComments,
          data: []
        },
        shares: {
          count: shareCount,
          data: existingShares || []
        }
      }
    });

  } catch (error) {
    console.error('读取trending数据时出错:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '读取trending数据时出错', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}