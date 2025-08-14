import { NextRequest, NextResponse } from 'next/server';
import { typedSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'connection':
        return await testConnection();
      case 'tables':
        return await testTables();
      case 'schema':
        return await getSchema();
      case 'data':
        return await getData();
      case 'businesses':
        return await getBusinesses();
      case 'all_tables':
        return await getAllTables();
      case 'insert':
        return await testInsert();
      case 'select':
        return await testSelect();
      default:
        return NextResponse.json({
          success: true,
          message: '数据库测试 API 可用',
          available_actions: ['connection', 'tables', 'schema', 'data', 'businesses', 'insert', 'select']
        });
    }
  } catch (error) {
    console.error('数据库测试 API 错误:', error);
    return NextResponse.json(
      { error: '数据库测试失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * 测试 Supabase 连接
 */
async function testConnection() {
  try {
    // 尝试一个简单的查询来测试连接
    const { data, error } = await typedSupabase
      .from('profiles')
      .select('*')
      .limit(1);

    // 如果 profiles 表不存在，尝试其他可能的表
    if (error) {
      const { data: authData, error: authError } = await typedSupabase.auth.getUser();
      
      if (authError) {
        return NextResponse.json({
          success: false,
          error: '数据库连接失败',
          details: authError.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: '数据库连接成功',
      data: {
        connection: 'OK',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('连接测试失败:', error);
    return NextResponse.json({
      success: false,
      error: '连接测试失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
}

/**
 * 获取数据库模式信息
 */
async function getSchema() {
  try {
    // 尝试访问可能存在的表
    const possibleTables = [
      'profiles',
      'user_profiles',
      'users',
      'auth.users',
      'businesses',
      'products',
      'posts',
      'trending_posts',
      'chat_messages',
      'advertisements',
      'subscriptions',
      'quotas',
      'user_quotas',
      'usage_statistics',
      'ad_impressions',
      'user_preferences',
      'search_history',
      'user_actions',
      'notifications'
    ];

    const schemaInfo: any = {};
    
    for (const tableName of possibleTables) {
      try {
        const { data, error } = await typedSupabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error) {
          // 表存在，尝试获取列信息
          schemaInfo[tableName] = {
            exists: true,
            sample_data: data?.[0] || null
          };
        } else {
          schemaInfo[tableName] = {
            exists: false,
            error: error.message
          };
        }
      } catch (err) {
        schemaInfo[tableName] = {
          exists: false,
          error: err instanceof Error ? err.message : '未知错误'
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: '数据库模式获取成功',
      data: {
        schema: schemaInfo,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('获取模式失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取模式失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
}

/**
 * 获取现有数据
 */
async function getData() {
  try {
    // 尝试访问可能存在的表
    const possibleTables = [
      'profiles',
      'user_profiles',
      'users',
      'businesses',
      'products',
      'posts',
      'trending_posts',
      'chat_messages',
      'advertisements',
      'subscriptions',
      'quotas',
      'user_quotas',
      'usage_statistics',
      'ad_impressions',
      'user_preferences',
      'search_history',
      'user_actions',
      'notifications'
    ];

    const dataInfo: any = {};
    
    for (const tableName of possibleTables) {
      try {
        // 获取记录数
        const { count, error: countError } = await typedSupabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (!countError) {
          // 获取前几条记录作为示例
          const { data: sampleData, error: sampleError } = await typedSupabase
            .from(tableName)
            .select('*')
            .limit(3);

          dataInfo[tableName] = {
            exists: true,
            count: count || 0,
            sample: sampleError ? [] : (sampleData || [])
          };
        } else {
          dataInfo[tableName] = {
            exists: false,
            count: 0,
            sample: [],
            error: countError.message
          };
        }
      } catch (err) {
        dataInfo[tableName] = {
          exists: false,
          count: 0,
          sample: [],
          error: err instanceof Error ? err.message : '未知错误'
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: '数据信息获取成功',
      data: {
        dataInfo,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('获取数据信息失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取数据信息失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
}

/**
 * 测试表结构
 */
async function testTables() {
  try {
    // 尝试访问可能存在的表
    const possibleTables = [
      'profiles',
      'user_profiles',
      'users',
      'businesses',
      'products',
      'posts',
      'trending_posts',
      'chat_messages',
      'advertisements',
      'subscriptions',
      'quotas',
      'user_quotas',
      'usage_statistics',
      'ad_impressions',
      'user_preferences',
      'search_history',
      'user_actions',
      'notifications'
    ];

    const results: any = {};

    for (const tableName of possibleTables) {
      try {
        const { data, error } = await typedSupabase
          .from(tableName)
          .select('*')
          .limit(1);

        results[tableName] = {
          exists: !error,
          error: error?.message || null,
          count: data?.length || 0
        };
      } catch (err) {
        results[tableName] = {
          exists: false,
          error: err instanceof Error ? err.message : '未知错误',
          count: 0
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: '表结构检查完成',
      tables: results
    });

  } catch (error) {
    console.error('表结构测试失败:', error);
    return NextResponse.json({
      success: false,
      error: '表结构测试失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
}

/**
 * 测试插入操作
 */
async function testInsert() {
  try {
    // 检查是否存在 profiles 表（Supabase 默认表）
    const { data: profileCheck, error: profileCheckError } = await typedSupabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profileCheckError) {
      return NextResponse.json({
        success: false,
        error: 'profiles 表不存在',
        details: profileCheckError.message,
        suggestion: '请先创建必要的表结构'
      });
    }

    // 创建测试用户配置文件
    const testUser = {
      id: `test-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      username: 'testuser',
      full_name: 'Test User',
      user_type: 'customer',
      is_verified: false,
      is_active: true
    };

    const { data: profile, error: profileError } = await typedSupabase
      .from('profiles')
      .insert(testUser)
      .select()
      .single();

    if (profileError) {
      return NextResponse.json({
        success: false,
        error: '插入用户配置文件失败',
        details: profileError.message
      });
    }

    return NextResponse.json({
      success: true,
      message: '插入测试成功',
      data: {
        profile,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('插入测试失败:', error);
    return NextResponse.json({
      success: false,
      error: '插入测试失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
}

/**
 * 测试查询操作
 */
async function testSelect() {
  try {
    const results: any = {};

    // 尝试查询各种表
    const tablesToCheck = [
      'profiles',
      'user_profiles',
      'users',
      'businesses',
      'products',
      'posts',
      'trending_posts',
      'chat_messages',
      'advertisements',
      'subscriptions',
      'quotas',
      'user_quotas',
      'usage_statistics',
      'ad_impressions',
      'user_preferences',
      'search_history',
      'user_actions',
      'notifications'
    ];

    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await typedSupabase
          .from(tableName)
          .select('*')
          .limit(5);

        results[tableName] = {
          success: !error,
          data: data || [],
          error: error?.message || null,
          count: data?.length || 0
        };
      } catch (err) {
        results[tableName] = {
          success: false,
          data: [],
          error: err instanceof Error ? err.message : '未知错误',
          count: 0
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: '查询测试成功',
      data: {
        results,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('查询测试失败:', error);
    return NextResponse.json({
      success: false,
      error: '查询测试失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
}

/**
 * 获取 businesses 表数据
 */
async function getBusinesses() {
  try {
    // 获取 businesses 表的所有数据
    const { data: businesses, error } = await typedSupabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({
        success: false,
        error: '获取 businesses 数据失败',
        details: error.message
      });
    }

    // 获取记录数
    const { count, error: countError } = await typedSupabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      message: 'businesses 数据获取成功',
      data: {
        businesses: businesses || [],
        count: count || 0,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('获取 businesses 数据失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取 businesses 数据失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
}

/**
 * 获取数据库中所有存在的表
 */
async function getAllTables() {
  try {
    // 尝试查询一些可能的表名
    const possibleTableNames = [
      // 我们已知的表
      'profiles', 'user_profiles', 'users', 'businesses', 'products', 'posts', 
      'trending_posts', 'chat_messages', 'advertisements', 'subscriptions', 
      'quotas', 'user_quotas', 'usage_statistics', 'ad_impressions', 
      'user_preferences', 'search_history', 'user_actions', 'notifications',
      // 可能的其他表
      'categories', 'business_categories', 'locations', 'reviews', 'ratings',
      'favorites', 'bookmarks', 'followers', 'following', 'messages',
      'comments', 'likes', 'shares', 'tags', 'business_tags', 'user_tags',
      'orders', 'payments', 'transactions', 'invoices', 'receipts',
      'events', 'promotions', 'coupons', 'discounts', 'loyalty_points',
      'analytics', 'logs', 'audit_trails', 'backups', 'migrations',
      // Business 相关的表
      'business_descriptions', 'business_editorial_summaries', 'business_menus',
      'business_photos', 'business_hours', 'business_services', 'business_amenities',
      'business_reviews', 'business_ratings', 'business_contacts', 'business_locations',
      'business_social_media', 'business_websites', 'business_phone_numbers',
      'business_emails', 'business_addresses', 'business_coordinates',
      'business_operating_hours', 'business_special_hours', 'business_holidays',
      'business_payment_methods', 'business_delivery_options', 'business_pickup_options',
      'business_reservation_options', 'business_wheelchair_accessible',
      'business_parking_options', 'business_wifi_available', 'business_outdoor_seating',
      'business_live_music', 'business_karaoke', 'business_sports_tv',
      'business_games', 'business_kids_menu', 'business_senior_discounts',
      'business_happy_hour', 'business_breakfast', 'business_brunch',
      'business_lunch', 'business_dinner', 'business_late_night',
      'business_breakfast_menu', 'business_lunch_menu', 'business_dinner_menu',
      'business_drink_menu', 'business_dessert_menu', 'business_special_menu',
      'business_seasonal_menu', 'business_holiday_menu', 'business_chef_specials',
      'business_daily_specials', 'business_weekly_specials', 'business_monthly_specials',
      'business_happy_hour_menu', 'business_bar_menu', 'business_wine_list',
      'business_beer_list', 'business_cocktail_list', 'business_non_alcoholic_drinks',
      'business_coffee_menu', 'business_tea_menu', 'business_smoothie_menu',
      'business_juice_menu', 'business_milkshake_menu', 'business_ice_cream_menu',
      'business_dessert_list', 'business_cake_menu', 'business_pastry_menu',
      'business_bread_menu', 'business_sandwich_menu', 'business_burger_menu',
      'business_pizza_menu', 'business_pasta_menu', 'business_salad_menu',
      'business_soup_menu', 'business_appetizer_menu', 'business_entree_menu',
      'business_side_dish_menu', 'business_vegetarian_menu', 'business_vegan_menu',
      'business_gluten_free_menu', 'business_dairy_free_menu', 'business_nut_free_menu',
      'business_halal_menu', 'business_kosher_menu', 'business_organic_menu',
      'business_local_menu', 'business_farm_to_table_menu', 'business_sustainable_menu',
      'business_healthy_menu', 'business_low_calorie_menu', 'business_low_sodium_menu',
      'business_low_fat_menu', 'business_low_carb_menu', 'business_keto_menu',
      'business_paleo_menu', 'business_mediterranean_menu', 'business_asian_menu',
      'business_italian_menu', 'business_mexican_menu', 'business_indian_menu',
      'business_thai_menu', 'business_japanese_menu', 'business_chinese_menu',
      'business_korean_menu', 'business_vietnamese_menu', 'business_french_menu',
      'business_spanish_menu', 'business_greek_menu', 'business_turkish_menu',
      'business_middle_eastern_menu', 'business_african_menu', 'business_caribbean_menu',
      'business_latin_american_menu', 'business_mediterranean_menu', 'business_european_menu',
      'business_american_menu', 'business_canadian_menu', 'business_australian_menu',
      'business_new_zealand_menu', 'business_pacific_menu', 'business_hawaiian_menu',
      'business_cajun_menu', 'business_creole_menu', 'business_soul_food_menu',
      'business_bbq_menu', 'business_steakhouse_menu', 'business_seafood_menu',
      'business_sushi_menu', 'business_ramen_menu', 'business_pho_menu',
      'business_curry_menu', 'business_kebab_menu', 'business_falafel_menu',
      'business_gyro_menu', 'business_pita_menu', 'business_wrap_menu',
      'business_burrito_menu', 'business_taco_menu', 'business_quesadilla_menu',
      'business_enchilada_menu', 'business_fajita_menu', 'business_guacamole_menu',
      'business_salsa_menu', 'business_chips_menu', 'business_nachos_menu',
      'business_queso_menu', 'business_bean_menu', 'business_rice_menu',
      'business_bean_rice_menu', 'business_refried_beans_menu', 'business_black_beans_menu',
      'business_pinto_beans_menu', 'business_kidney_beans_menu', 'business_garbanzo_beans_menu',
      'business_lentils_menu', 'business_split_peas_menu', 'business_chickpeas_menu',
      'business_hummus_menu', 'business_baba_ganoush_menu', 'business_mutabbal_menu',
      'business_tabbouleh_menu', 'business_fattoush_menu', 'business_kibbeh_menu',
      'business_shawarma_menu', 'business_kebab_menu', 'business_kofta_menu',
      'business_falafel_menu', 'business_gyro_menu', 'business_souvlaki_menu',
      'business_moussaka_menu', 'business_pastitsio_menu', 'business_spanakopita_menu',
      'business_tiropita_menu', 'business_dolmades_menu', 'business_keftedes_menu',
      'business_saganaki_menu', 'business_tzatziki_menu', 'business_taramasalata_menu',
      'business_skordalia_menu', 'business_melitzanosalata_menu', 'business_fava_menu',
      'business_gigantes_menu', 'business_fasolada_menu', 'business_soupa_menu',
      'business_avgolemono_menu', 'business_kakavia_menu', 'business_psarosoupa_menu',
      'business_kotosoupa_menu', 'business_kotosoupa_avgolemono_menu', 'business_mayiritsa_menu',
      'business_patsas_menu', 'business_trahanas_menu', 'business_fasolada_menu',
      'business_lentil_soup_menu', 'business_split_pea_soup_menu', 'business_minestrone_menu',
      'business_tomato_soup_menu', 'business_chicken_noodle_soup_menu', 'business_beef_noodle_soup_menu',
      'business_clam_chowder_menu', 'business_fish_chowder_menu', 'business_corn_chowder_menu',
      'business_potato_soup_menu', 'business_broccoli_soup_menu', 'business_cauliflower_soup_menu',
      'business_mushroom_soup_menu', 'business_onion_soup_menu', 'business_garlic_soup_menu',
      'business_leek_soup_menu', 'business_carrot_soup_menu', 'business_pumpkin_soup_menu',
      'business_butternut_squash_soup_menu', 'business_acorn_squash_soup_menu', 'business_zucchini_soup_menu',
      'business_eggplant_soup_menu', 'business_bell_pepper_soup_menu', 'business_chili_menu',
      'business_gumbo_menu', 'business_jambalaya_menu', 'business_etouffee_menu',
      'business_po_boy_menu', 'business_muffuletta_menu', 'business_beignet_menu',
      'business_king_cake_menu', 'business_praline_menu', 'business_pecan_pie_menu',
      'business_key_lime_pie_menu', 'business_banana_pudding_menu', 'business_bread_pudding_menu',
      'business_rice_pudding_menu', 'business_tapioca_pudding_menu', 'business_flan_menu',
      'business_creme_brulee_menu', 'business_creme_caramel_menu', 'business_panna_cotta_menu',
      'business_tiramisu_menu', 'business_cannoli_menu', 'business_zeppole_menu',
      'business_sfogliatelle_menu', 'business_baba_au_rhum_menu', 'business_profiteroles_menu',
      'business_eclairs_menu', 'business_macarons_menu', 'business_madeleines_menu',
      'business_financiers_menu', 'business_caneles_menu', 'business_palmiers_menu',
      'business_croissants_menu', 'business_pain_au_chocolat_menu', 'business_danish_menu',
      'business_strudel_menu', 'business_kuchen_menu', 'business_torte_menu',
      'business_sacher_torte_menu', 'business_black_forest_cake_menu', 'business_red_velvet_cake_menu',
      'business_chocolate_cake_menu', 'business_vanilla_cake_menu', 'business_carrot_cake_menu',
      'business_cheesecake_menu', 'business_angel_food_cake_menu', 'business_chiffon_cake_menu',
      'business_pound_cake_menu', 'business_bundt_cake_menu', 'business_cupcake_menu',
      'business_muffin_menu', 'business_scone_menu', 'business_biscuit_menu',
      'business_cookie_menu', 'business_brownie_menu', 'business_blondie_menu',
      'business_fudge_menu', 'business_toffee_menu', 'business_caramel_menu',
      'business_nougat_menu', 'business_truffle_menu', 'business_bonbon_menu',
      'business_chocolate_menu', 'business_white_chocolate_menu', 'business_dark_chocolate_menu',
      'business_milk_chocolate_menu', 'business_semi_sweet_chocolate_menu', 'business_bittersweet_chocolate_menu',
      'business_unsweetened_chocolate_menu', 'business_cocoa_menu', 'business_hot_chocolate_menu',
      'business_chocolate_milk_menu', 'business_chocolate_shake_menu', 'business_chocolate_smoothie_menu',
      'business_chocolate_ice_cream_menu', 'business_chocolate_sorbet_menu', 'business_chocolate_gelato_menu',
      'business_chocolate_frozen_yogurt_menu', 'business_chocolate_pudding_menu', 'business_chocolate_mousse_menu',
      'business_chocolate_souffle_menu', 'business_chocolate_fondue_menu', 'business_chocolate_fountain_menu',
      'business_chocolate_dipping_menu', 'business_chocolate_coating_menu', 'business_chocolate_ganache_menu',
      'business_chocolate_glaze_menu', 'business_chocolate_frosting_menu', 'business_chocolate_icing_menu',
      'business_chocolate_sauce_menu', 'business_chocolate_syrup_menu', 'business_chocolate_spread_menu',
      'business_nutella_menu', 'business_chocolate_hazelnut_spread_menu', 'business_chocolate_almond_spread_menu',
      'business_chocolate_peanut_butter_menu', 'business_chocolate_cashew_butter_menu', 'business_chocolate_sunflower_butter_menu',
      'business_chocolate_soy_butter_menu', 'business_chocolate_tahini_menu', 'business_chocolate_hummus_menu',
      'business_chocolate_avocado_menu', 'business_chocolate_banana_menu', 'business_chocolate_strawberry_menu',
      'business_chocolate_raspberry_menu', 'business_chocolate_blueberry_menu', 'business_chocolate_cherry_menu',
      'business_chocolate_orange_menu', 'business_chocolate_lemon_menu', 'business_chocolate_lime_menu',
      'business_chocolate_mint_menu', 'business_chocolate_cinnamon_menu', 'business_chocolate_vanilla_menu',
      'business_chocolate_coffee_menu', 'business_chocolate_espresso_menu', 'business_chocolate_mocha_menu',
      'business_chocolate_latte_menu', 'business_chocolate_cappuccino_menu', 'business_chocolate_macchiato_menu',
      'business_chocolate_americano_menu', 'business_chocolate_breve_menu', 'business_chocolate_cortado_menu',
      'business_chocolate_piccolo_menu', 'business_chocolate_ristretto_menu', 'business_chocolate_lungo_menu',
      'business_chocolate_flat_white_menu', 'business_chocolate_affogato_menu', 'business_chocolate_frappuccino_menu',
      'business_chocolate_frappe_menu', 'business_chocolate_smoothie_menu', 'business_chocolate_milkshake_menu',
      'business_chocolate_malt_menu', 'business_chocolate_float_menu', 'business_chocolate_soda_menu',
      'business_chocolate_egg_cream_menu', 'business_chocolate_phosphate_menu', 'business_chocolate_tonic_menu',
      'business_chocolate_seltzer_menu', 'business_chocolate_sparkling_water_menu', 'business_chocolate_water_menu',
      'business_chocolate_juice_menu', 'business_chocolate_lemonade_menu', 'business_chocolate_limeade_menu',
      'business_chocolate_orangeade_menu', 'business_chocolate_grapeade_menu', 'business_chocolate_cherryade_menu',
      'business_chocolate_raspberryade_menu', 'business_chocolate_strawberryade_menu', 'business_chocolate_blueberryade_menu',
      'business_chocolate_blackberryade_menu', 'business_chocolate_boysenberryade_menu', 'business_chocolate_loganberryade_menu',
      'business_chocolate_marionberryade_menu', 'business_chocolate_olallieberryade_menu', 'business_chocolate_salmonberryade_menu',
      'business_chocolate_thimbleberryade_menu', 'business_chocolate_wineberryade_menu', 'business_chocolate_cloudberryade_menu',
      'business_chocolate_lingonberryade_menu', 'business_chocolate_cranberryade_menu', 'business_chocolate_elderberryade_menu',
      'business_chocolate_gooseberryade_menu', 'business_chocolate_currantade_menu', 'business_chocolate_huckleberryade_menu',
      'business_chocolate_service_areas', 'business_service_areas', 'business_delivery_areas',
      'business_pickup_areas', 'business_catering_areas', 'business_event_areas',
      'business_private_dining_areas', 'business_outdoor_dining_areas', 'business_rooftop_dining_areas',
      'business_patio_dining_areas', 'business_garden_dining_areas', 'business_terrace_dining_areas',
      'business_balcony_dining_areas', 'business_deck_dining_areas', 'business_porch_dining_areas',
      'business_veranda_dining_areas', 'business_lanai_dining_areas', 'business_solarium_dining_areas',
      'business_conservatory_dining_areas', 'business_atrium_dining_areas', 'business_courtyard_dining_areas',
      'business_plaza_dining_areas', 'business_square_dining_areas', 'business_park_dining_areas',
      'business_beach_dining_areas', 'business_waterfront_dining_areas', 'business_harbor_dining_areas',
      'business_marina_dining_areas', 'business_pier_dining_areas', 'business_wharf_dining_areas',
      'business_dock_dining_areas', 'business_berth_dining_areas', 'business_slip_dining_areas',
      'business_mooring_dining_areas', 'business_anchorage_dining_areas', 'business_roadstead_dining_areas',
      'business_roadstead_dining_areas', 'business_roadstead_dining_areas', 'business_roadstead_dining_areas',
      // Business 相关的表
      'business_descriptions', 'business_editorial_summaries', 'business_menus',
      'business_photos', 'business_hours', 'business_services', 'business_amenities',
      'business_reviews', 'business_ratings', 'business_contacts', 'business_locations',
      'business_social_media', 'business_websites', 'business_phone_numbers',
      'business_emails', 'business_addresses', 'business_coordinates',
      'business_operating_hours', 'business_special_hours', 'business_holidays',
      'business_payment_methods', 'business_delivery_options', 'business_pickup_options',
      'business_reservation_options', 'business_wheelchair_accessible',
      'business_parking_options', 'business_wifi_available', 'business_outdoor_seating',
      'business_live_music', 'business_karaoke', 'business_sports_tv',
      'business_games', 'business_kids_menu', 'business_senior_discounts',
      'business_happy_hour', 'business_breakfast', 'business_brunch',
      'business_lunch', 'business_dinner', 'business_late_night',
      'business_breakfast_menu', 'business_lunch_menu', 'business_dinner_menu',
      'business_drink_menu', 'business_dessert_menu', 'business_special_menu',
      'business_seasonal_menu', 'business_holiday_menu', 'business_chef_specials',
      'business_daily_specials', 'business_weekly_specials', 'business_monthly_specials',
      'business_happy_hour_menu', 'business_bar_menu', 'business_wine_list',
      'business_beer_list', 'business_cocktail_list', 'business_non_alcoholic_drinks',
      'business_coffee_menu', 'business_tea_menu', 'business_smoothie_menu',
      'business_juice_menu', 'business_milkshake_menu', 'business_ice_cream_menu',
      'business_dessert_list', 'business_cake_menu', 'business_pastry_menu',
      'business_bread_menu', 'business_sandwich_menu', 'business_burger_menu',
      'business_pizza_menu', 'business_pasta_menu', 'business_salad_menu',
      'business_soup_menu', 'business_appetizer_menu', 'business_entree_menu',
      'business_side_dish_menu', 'business_vegetarian_menu', 'business_vegan_menu',
      'business_gluten_free_menu', 'business_dairy_free_menu', 'business_nut_free_menu',
      'business_halal_menu', 'business_kosher_menu', 'business_organic_menu',
      'business_local_menu', 'business_farm_to_table_menu', 'business_sustainable_menu',
      'business_healthy_menu', 'business_low_calorie_menu', 'business_low_sodium_menu',
      'business_low_fat_menu', 'business_low_carb_menu', 'business_keto_menu',
      'business_paleo_menu', 'business_mediterranean_menu', 'business_asian_menu',
      'business_italian_menu', 'business_mexican_menu', 'business_indian_menu',
      'business_thai_menu', 'business_japanese_menu', 'business_chinese_menu',
      'business_korean_menu', 'business_vietnamese_menu', 'business_french_menu',
      'business_spanish_menu', 'business_greek_menu', 'business_turkish_menu',
      'business_middle_eastern_menu', 'business_african_menu', 'business_caribbean_menu',
      'business_latin_american_menu', 'business_mediterranean_menu', 'business_european_menu',
      'business_american_menu', 'business_canadian_menu', 'business_australian_menu',
      'business_new_zealand_menu', 'business_pacific_menu', 'business_hawaiian_menu',
      'business_cajun_menu', 'business_creole_menu', 'business_soul_food_menu',
      'business_bbq_menu', 'business_steakhouse_menu', 'business_seafood_menu',
      'business_sushi_menu', 'business_ramen_menu', 'business_pho_menu',
      'business_curry_menu', 'business_kebab_menu', 'business_falafel_menu',
      'business_gyro_menu', 'business_pita_menu', 'business_wrap_menu',
      'business_burrito_menu', 'business_taco_menu', 'business_quesadilla_menu',
      'business_enchilada_menu', 'business_fajita_menu', 'business_guacamole_menu',
      'business_salsa_menu', 'business_chips_menu', 'business_nachos_menu',
      'business_queso_menu', 'business_bean_menu', 'business_rice_menu',
      'business_bean_rice_menu', 'business_refried_beans_menu', 'business_black_beans_menu',
      'business_pinto_beans_menu', 'business_kidney_beans_menu', 'business_garbanzo_beans_menu',
      'business_lentils_menu', 'business_split_peas_menu', 'business_chickpeas_menu',
      'business_hummus_menu', 'business_baba_ganoush_menu', 'business_mutabbal_menu',
      'business_tabbouleh_menu', 'business_fattoush_menu', 'business_kibbeh_menu',
      'business_shawarma_menu', 'business_kebab_menu', 'business_kofta_menu',
      'business_falafel_menu', 'business_gyro_menu', 'business_souvlaki_menu',
      'business_moussaka_menu', 'business_pastitsio_menu', 'business_spanakopita_menu',
      'business_tiropita_menu', 'business_dolmades_menu', 'business_keftedes_menu',
      'business_saganaki_menu', 'business_tzatziki_menu', 'business_taramasalata_menu',
      'business_skordalia_menu', 'business_melitzanosalata_menu', 'business_fava_menu',
      'business_gigantes_menu', 'business_fasolada_menu', 'business_soupa_menu',
      'business_avgolemono_menu', 'business_kakavia_menu', 'business_psarosoupa_menu',
      'business_kotosoupa_menu', 'business_kotosoupa_avgolemono_menu', 'business_mayiritsa_menu',
      'business_patsas_menu', 'business_trahanas_menu', 'business_fasolada_menu',
      'business_lentil_soup_menu', 'business_split_pea_soup_menu', 'business_minestrone_menu',
      'business_tomato_soup_menu', 'business_chicken_noodle_soup_menu', 'business_beef_noodle_soup_menu',
      'business_clam_chowder_menu', 'business_fish_chowder_menu', 'business_corn_chowder_menu',
      'business_potato_soup_menu', 'business_broccoli_soup_menu', 'business_cauliflower_soup_menu',
      'business_mushroom_soup_menu', 'business_onion_soup_menu', 'business_garlic_soup_menu',
      'business_leek_soup_menu', 'business_carrot_soup_menu', 'business_pumpkin_soup_menu',
      'business_butternut_squash_soup_menu', 'business_acorn_squash_soup_menu', 'business_zucchini_soup_menu',
      'business_eggplant_soup_menu', 'business_bell_pepper_soup_menu', 'business_chili_menu',
      'business_gumbo_menu', 'business_jambalaya_menu', 'business_etouffee_menu',
      'business_po_boy_menu', 'business_muffuletta_menu', 'business_beignet_menu',
      'business_king_cake_menu', 'business_praline_menu', 'business_pecan_pie_menu',
      'business_key_lime_pie_menu', 'business_banana_pudding_menu', 'business_bread_pudding_menu',
      'business_rice_pudding_menu', 'business_tapioca_pudding_menu', 'business_flan_menu',
      'business_creme_brulee_menu', 'business_creme_caramel_menu', 'business_panna_cotta_menu',
      'business_tiramisu_menu', 'business_cannoli_menu', 'business_zeppole_menu',
      'business_sfogliatelle_menu', 'business_baba_au_rhum_menu', 'business_profiteroles_menu',
      'business_eclairs_menu', 'business_macarons_menu', 'business_madeleines_menu',
      'business_financiers_menu', 'business_caneles_menu', 'business_palmiers_menu',
      'business_croissants_menu', 'business_pain_au_chocolat_menu', 'business_danish_menu',
      'business_strudel_menu', 'business_kuchen_menu', 'business_torte_menu',
      'business_sacher_torte_menu', 'business_black_forest_cake_menu', 'business_red_velvet_cake_menu',
      'business_chocolate_cake_menu', 'business_vanilla_cake_menu', 'business_carrot_cake_menu',
      'business_cheesecake_menu', 'business_angel_food_cake_menu', 'business_chiffon_cake_menu',
      'business_pound_cake_menu', 'business_bundt_cake_menu', 'business_cupcake_menu',
      'business_muffin_menu', 'business_scone_menu', 'business_biscuit_menu',
      'business_cookie_menu', 'business_brownie_menu', 'business_blondie_menu',
      'business_fudge_menu', 'business_toffee_menu', 'business_caramel_menu',
      'business_nougat_menu', 'business_truffle_menu', 'business_bonbon_menu',
      'business_chocolate_menu', 'business_white_chocolate_menu', 'business_dark_chocolate_menu',
      'business_milk_chocolate_menu', 'business_semi_sweet_chocolate_menu', 'business_bittersweet_chocolate_menu',
      'business_unsweetened_chocolate_menu', 'business_cocoa_menu', 'business_hot_chocolate_menu',
      'business_chocolate_milk_menu', 'business_chocolate_shake_menu', 'business_chocolate_smoothie_menu',
      'business_chocolate_ice_cream_menu', 'business_chocolate_sorbet_menu', 'business_chocolate_gelato_menu',
      'business_chocolate_frozen_yogurt_menu', 'business_chocolate_pudding_menu', 'business_chocolate_mousse_menu',
      'business_chocolate_souffle_menu', 'business_chocolate_fondue_menu', 'business_chocolate_fountain_menu',
      'business_chocolate_dipping_menu', 'business_chocolate_coating_menu', 'business_chocolate_ganache_menu',
      'business_chocolate_glaze_menu', 'business_chocolate_frosting_menu', 'business_chocolate_icing_menu',
      'business_chocolate_sauce_menu', 'business_chocolate_syrup_menu', 'business_chocolate_spread_menu',
      'business_nutella_menu', 'business_chocolate_hazelnut_spread_menu', 'business_chocolate_almond_spread_menu',
      'business_chocolate_peanut_butter_menu', 'business_chocolate_cashew_butter_menu', 'business_chocolate_sunflower_butter_menu',
      'business_chocolate_soy_butter_menu', 'business_chocolate_tahini_menu', 'business_chocolate_hummus_menu',
      'business_chocolate_avocado_menu', 'business_chocolate_banana_menu', 'business_chocolate_strawberry_menu',
      'business_chocolate_raspberry_menu', 'business_chocolate_blueberry_menu', 'business_chocolate_cherry_menu',
      'business_chocolate_orange_menu', 'business_chocolate_lemon_menu', 'business_chocolate_lime_menu',
      'business_chocolate_mint_menu', 'business_chocolate_cinnamon_menu', 'business_chocolate_vanilla_menu',
      'business_chocolate_coffee_menu', 'business_chocolate_espresso_menu', 'business_chocolate_mocha_menu',
      'business_chocolate_latte_menu', 'business_chocolate_cappuccino_menu', 'business_chocolate_macchiato_menu',
      'business_chocolate_americano_menu', 'business_chocolate_breve_menu', 'business_chocolate_cortado_menu',
      'business_chocolate_piccolo_menu', 'business_chocolate_ristretto_menu', 'business_chocolate_lungo_menu',
      'business_chocolate_flat_white_menu', 'business_chocolate_affogato_menu', 'business_chocolate_frappuccino_menu',
      'business_chocolate_frappe_menu', 'business_chocolate_smoothie_menu', 'business_chocolate_milkshake_menu',
      'business_chocolate_malt_menu', 'business_chocolate_float_menu', 'business_chocolate_soda_menu',
      'business_chocolate_egg_cream_menu', 'business_chocolate_phosphate_menu', 'business_chocolate_tonic_menu',
      'business_chocolate_seltzer_menu', 'business_chocolate_sparkling_water_menu', 'business_chocolate_water_menu',
      'business_chocolate_juice_menu', 'business_chocolate_lemonade_menu', 'business_chocolate_limeade_menu',
      'business_chocolate_orangeade_menu', 'business_chocolate_grapeade_menu', 'business_chocolate_cherryade_menu',
      'business_chocolate_raspberryade_menu', 'business_chocolate_strawberryade_menu', 'business_chocolate_blueberryade_menu',
      'business_chocolate_blackberryade_menu', 'business_chocolate_boysenberryade_menu', 'business_chocolate_loganberryade_menu',
      'business_chocolate_marionberryade_menu', 'business_chocolate_olallieberryade_menu', 'business_chocolate_salmonberryade_menu',
      'business_chocolate_thimbleberryade_menu', 'business_chocolate_wineberryade_menu', 'business_chocolate_cloudberryade_menu',
      'business_chocolate_lingonberryade_menu', 'business_chocolate_cranberryade_menu', 'business_chocolate_elderberryade_menu',
      'business_chocolate_gooseberryade_menu', 'business_chocolate_currantade_menu', 'business_chocolate_huckleberryade_menu',
      'business_chocolate_service_areas', 'business_service_areas', 'business_delivery_areas',
      'business_pickup_areas', 'business_catering_areas', 'business_event_areas',
      'business_private_dining_areas', 'business_outdoor_dining_areas', 'business_rooftop_dining_areas',
      'business_patio_dining_areas', 'business_garden_dining_areas', 'business_terrace_dining_areas',
      'business_balcony_dining_areas', 'business_deck_dining_areas', 'business_porch_dining_areas',
      'business_veranda_dining_areas', 'business_lanai_dining_areas', 'business_solarium_dining_areas',
      'business_conservatory_dining_areas', 'business_atrium_dining_areas', 'business_courtyard_dining_areas',
      'business_plaza_dining_areas', 'business_square_dining_areas', 'business_park_dining_areas',
      'business_beach_dining_areas', 'business_waterfront_dining_areas', 'business_harbor_dining_areas',
      'business_marina_dining_areas', 'business_pier_dining_areas', 'business_wharf_dining_areas',
      'business_dock_dining_areas', 'business_berth_dining_areas', 'business_slip_dining_areas',
      'business_mooring_dining_areas', 'business_anchorage_dining_areas', 'business_roadstead_dining_areas',
      'business_roadstead_dining_areas', 'business_roadstead_dining_areas', 'business_roadstead_dining_areas',
      // Supabase 系统表
      'auth.users', 'auth.identities', 'auth.sessions', 'auth.refresh_tokens',
      'storage.objects', 'storage.buckets'
    ];

    const results: any = {};
    
    for (const tableName of possibleTableNames) {
      try {
        const { data, error } = await typedSupabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error) {
          // 获取记录数
          const { count, error: countError } = await typedSupabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

          results[tableName] = {
            exists: true,
            count: count || 0,
            error: null
          };
        } else {
          results[tableName] = {
            exists: false,
            count: 0,
            error: error.message
          };
        }
      } catch (err) {
        results[tableName] = {
          exists: false,
          count: 0,
          error: err instanceof Error ? err.message : '未知错误'
        };
      }
    }

    // 过滤出存在的表
    const existingTables = Object.entries(results)
      .filter(([_, info]) => (info as any).exists)
      .map(([tableName, info]) => ({
        tableName,
        count: (info as any).count,
        error: (info as any).error
      }));

    return NextResponse.json({
      success: true,
      message: '所有表检查完成',
      data: {
        allTables: results,
        existingTables,
        totalChecked: possibleTableNames.length,
        totalExisting: existingTables.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('获取所有表失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取所有表失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
}
