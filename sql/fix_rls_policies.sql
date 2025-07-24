-- Fix Row Level Security Policies for HP Indigo Calculator
-- Run this in Supabase SQL Editor to allow user operations

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can manage their own carts" ON carts;
DROP POLICY IF EXISTS "Users can manage their own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can manage their own quote items" ON quote_items;
DROP POLICY IF EXISTS "Anonymous users can manage their session carts" ON carts;

-- CARTS TABLE POLICIES
-- Allow authenticated users to manage their own carts
CREATE POLICY "Users can manage their own carts" ON carts
    FOR ALL USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
        (auth.uid() IS NULL AND session_id IS NOT NULL)
    );

-- Allow anonymous users to manage their session carts
CREATE POLICY "Anonymous users can manage their session carts" ON carts
    FOR ALL USING (
        auth.uid() IS NULL AND session_id IS NOT NULL
    );

-- QUOTES TABLE POLICIES  
-- Allow authenticated users to manage their own quotes
CREATE POLICY "Users can manage their own quotes" ON quotes
    FOR ALL USING (auth.uid() = user_id);

-- QUOTE_ITEMS TABLE POLICIES
-- Allow users to manage quote items for their own quotes
CREATE POLICY "Users can manage their own quote items" ON quote_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM quotes 
            WHERE quotes.id = quote_items.quote_id 
            AND quotes.user_id = auth.uid()
        )
    );

-- Grant usage on sequences (needed for auto-incrementing IDs)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Ensure authenticated users can access the tables
GRANT ALL ON carts TO authenticated;
GRANT ALL ON quotes TO authenticated;
GRANT ALL ON quote_items TO authenticated;

-- Allow anonymous users to access carts (for session-based carts)
GRANT ALL ON carts TO anon;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';