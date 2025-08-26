// src/app/api/test/category-mapping/route.ts
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
    const { service_category } = await request.json();

    const mappedId = SERVICE_CATEGORY_MAPPING[service_category];
    
    if (!mappedId) {
      return NextResponse.json({
        success: false,
        error: `类别映射不存在: ${service_category}`,
        service_category,
        availableCategories: Object.keys(SERVICE_CATEGORY_MAPPING)
      });
    }

    // 验证该ID在categories表中是否存在
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', mappedId)
      .single();

    return NextResponse.json({
      success: !error,
      service_category,
      mappedId,
      categoryExists: !!category,
      categoryData: category,
      error: error?.message
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}