// src/app/api/test/create-business-record/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SERVICE_CATEGORY_MAPPING: Record<string, string> = {
  'dining': 'fea943e5-08f2-493a-9f36-8cbf50d3024f',
  'beverage': 'bd303355-2e83-4565-98e5-917e742fe10d',
  'entertainment': 'abcbe7a9-b7ec-427f-9a3a-010e922e5bd8',
  'recreation': 'fe0194cd-5c25-470e-ace7-3d5e5a1a47a4',
  'shopping': 'bd96d407-5f7b-45ef-b8d5-637a316dbd25',
  'accommodation': 'df52a25b-e863-4455-bfd6-a746220984c9',
  'beauty': '84102d22-f0a8-49a9-bf2b-489868529d93',
  'wellness': '929e40f3-67ce-46e0-9509-9b63d345dd7c',
  'other': 'aa411129-9c7c-431d-a66a-0e61fd79deeb'
};

export async function POST(request: NextRequest) {
  try {
    const { userId, businessName, serviceCategory, phone, email } = await request.json();

    const categoryId = SERVICE_CATEGORY_MAPPING[serviceCategory];
    if (!categoryId) {
      return NextResponse.json({
        success: false,
        error: `无效的服务类别: ${serviceCategory}`,
        availableCategories: Object.keys(SERVICE_CATEGORY_MAPPING)
      }, { status: 400 });
    }

    console.log('尝试创建业务记录:', {
      userId,
      businessName,
      serviceCategory,
      categoryId,
      phone,
      email
    });

    const insertData = {
      owner_id: userId,
      name: businessName,
      description: `${businessName} - Test business record`,
      category_id: categoryId,
      phone: phone,
      email: email,
      city: 'Auckland',
      country: 'New Zealand',
      is_claimed: false,
      is_active: true
    };

    console.log('插入数据:', insertData);

    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .insert(insertData)
      .select()
      .single();

    if (businessError) {
      console.error('业务记录创建失败:', businessError);
      return NextResponse.json({
        success: false,
        error: businessError.message,
        errorDetails: {
          message: businessError.message,
          details: businessError.details,
          hint: businessError.hint,
          code: businessError.code
        },
        attemptedData: insertData
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      businessId: businessData.id,
      businessData: businessData,
      message: '业务记录创建成功'
    });

  } catch (error) {
    console.error('业务记录创建异常:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}