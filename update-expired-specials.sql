-- 更新已过期的specials数据的valid_until日期到11月底
-- 方便测试，让所有数据都显示在页面上

-- 1. 查看当前过期数据
SELECT '更新前的过期数据:' as info;
SELECT 
  id,
  title,
  valid_until,
  is_active,
  CASE 
    WHEN valid_until < CURRENT_DATE THEN '已过期'
    WHEN valid_until = CURRENT_DATE THEN '今天到期'
    ELSE '未来有效'
  END as status
FROM public.specials 
WHERE valid_until < CURRENT_DATE
ORDER BY valid_until;

-- 2. 更新已过期的数据到11月底 (2025-11-30)
UPDATE public.specials 
SET 
  valid_until = '2025-11-30'::date,
  updated_at = NOW()
WHERE valid_until < CURRENT_DATE;

-- 3. 显示更新结果
SELECT '更新结果:' as info;
SELECT 
  COUNT(*) as total_updated,
  '条已过期的specials数据已更新到2025-11-30' as message
FROM public.specials 
WHERE valid_until = '2025-11-30'::date;

-- 4. 查看所有数据的有效期分布
SELECT '更新后的有效期分布:' as info;
SELECT 
  CASE 
    WHEN valid_until < CURRENT_DATE THEN '已过期'
    WHEN valid_until = CURRENT_DATE THEN '今天到期'
    WHEN valid_until <= CURRENT_DATE + INTERVAL '7 days' THEN '7天内到期'
    WHEN valid_until <= CURRENT_DATE + INTERVAL '30 days' THEN '30天内到期'
    ELSE '30天以上有效'
  END as validity_period,
  COUNT(*) as count
FROM public.specials 
WHERE is_active = true
GROUP BY 
  CASE 
    WHEN valid_until < CURRENT_DATE THEN '已过期'
    WHEN valid_until = CURRENT_DATE THEN '今天到期'
    WHEN valid_until <= CURRENT_DATE + INTERVAL '7 days' THEN '7天内到期'
    WHEN valid_until <= CURRENT_DATE + INTERVAL '30 days' THEN '30天内到期'
    ELSE '30天以上有效'
  END
ORDER BY 
  CASE 
    WHEN valid_until < CURRENT_DATE THEN 1
    WHEN valid_until = CURRENT_DATE THEN 2
    WHEN valid_until <= CURRENT_DATE + INTERVAL '7 days' THEN 3
    WHEN valid_until <= CURRENT_DATE + INTERVAL '30 days' THEN 4
    ELSE 5
  END;

-- 5. 显示所有活跃的specials
SELECT '所有活跃的specials:' as info;
SELECT 
  id,
  title,
  valid_until,
  discount_percent,
  category,
  location
FROM public.specials 
WHERE is_active = true
ORDER BY valid_until, created_at;


