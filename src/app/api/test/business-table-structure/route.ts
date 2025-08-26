// src/app/api/test/business-table-structure/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    // 检查businesses表的字段结构
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'businesses')
      .eq('table_schema', 'public');

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        hasRequiredFields: false
      });
    }

    const requiredFields = {
      'id': 'uuid',
      'owner_id': 'uuid', 
      'name': 'text',
      'category_id': 'uuid',
      'phone': 'text',
      'email': 'text',
      'is_claimed': 'boolean',
      'is_active': 'boolean'
    };

    const fieldResults: Record<string, any> = {};
    let allFieldsPresent = true;

    Object.entries(requiredFields).forEach(([fieldName, expectedType]) => {
      const column = columns?.find(c => c.column_name === fieldName);
      const isPresent = !!column;
      const typeMatches = column?.data_type === expectedType;
      
      fieldResults[fieldName] = {
        present: isPresent,
        expectedType,
        actualType: column?.data_type,
        typeMatches,
        nullable: column?.is_nullable === 'YES'
      };

      if (!isPresent || !typeMatches) {
        allFieldsPresent = false;
      }
    });

    return NextResponse.json({
      success: true,
      hasRequiredFields: allFieldsPresent,
      allColumns: columns,
      fieldCheck: fieldResults,
      summary: allFieldsPresent ? 
        '所有必需字段都存在且类型正确' : 
        '存在缺失或类型不匹配的字段'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      hasRequiredFields: false
    }, { status: 500 });
  }
}