// src/app/api/test/verify-business-registration/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // 检查auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users.find(u => u.email === email);

    // 检查user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();

    // 检查businesses
    let business = null;
    let businessError = null;
    
    if (profile) {
      const { data: businessData, error: bizError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', profile.id)
        .single();
      
      business = businessData;
      businessError = bizError?.message;
    }

    const verification = {
      email,
      authUserExists: !!authUser,
      authUserId: authUser?.id,
      profileExists: !!profile,
      profileId: profile?.id,
      profileError: profileError?.message,
      businessExists: !!business,
      businessId: business?.id,
      businessError,
      allRecordsExist: !!authUser && !!profile && !!business
    };

    return NextResponse.json({
      success: true,
      verification,
      summary: verification.allRecordsExist ? 
        '所有记录都存在' : 
        `缺失记录: ${[
          !authUser && 'Auth用户',
          !profile && '用户配置文件', 
          !business && '业务记录'
        ].filter(Boolean).join(', ')}`,
      details: {
        authUser: authUser ? { id: authUser.id, email: authUser.email } : null,
        profile: profile,
        business: business
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      allRecordsExist: false
    }, { status: 500 });
  }
}