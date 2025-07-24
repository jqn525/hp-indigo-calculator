-- Disable Authentication and RLS for HP Indigo Calculator
-- This simplifies the system to work without user accounts

-- Disable Row Level Security on all operational tables
ALTER TABLE carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies (cleanup)
DROP POLICY IF EXISTS "Users can manage their own carts" ON carts;
DROP POLICY IF EXISTS "Users can manage their own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can manage their own quote items" ON quote_items;
DROP POLICY IF EXISTS "Anonymous users can manage their session carts" ON carts;

-- Ensure anonymous users can access all tables
GRANT ALL ON carts TO anon;
GRANT ALL ON quotes TO anon;
GRANT ALL ON quote_items TO anon;
GRANT ALL ON paper_stocks TO anon;
GRANT ALL ON pricing_configs TO anon;
GRANT ALL ON products TO anon;

-- Grant usage on sequences for auto-incrementing IDs
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Refresh schema
NOTIFY pgrst, 'reload schema';

-- Success message
SELECT 'Authentication removed successfully! App now works without sign-in requirements.' as status;