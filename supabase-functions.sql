-- 创建获取表结构信息的函数
CREATE OR REPLACE FUNCTION get_table_columns(table_name text, schema_name text DEFAULT 'public')
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text,
    c.data_type::text,
    c.is_nullable::text
  FROM information_schema.columns c
  WHERE c.table_name = get_table_columns.table_name
    AND c.table_schema = get_table_columns.schema_name
  ORDER BY c.ordinal_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建获取RLS策略信息的函数
CREATE OR REPLACE FUNCTION get_table_policies(table_name text, schema_name text DEFAULT 'public')
RETURNS TABLE (
  policy_name text,
  command text,
  definition text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.policy_name::text,
    p.command::text,
    p.definition::text
  FROM pg_policies p
  WHERE p.tablename = get_table_policies.table_name
    AND p.schemaname = get_table_policies.schema_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
