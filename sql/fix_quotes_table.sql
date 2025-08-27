-- Fix Quotes Table - Add Missing Columns
-- Run this in your Supabase SQL Editor to add the missing columns

-- Add department and assigned_by columns to quotes table
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS assigned_by TEXT;

-- Update the comment to reflect the new columns
COMMENT ON COLUMN public.quotes.department IS 'SFU Department/Faculty requesting the quote';
COMMENT ON COLUMN public.quotes.assigned_by IS 'Staff member who assigned or created this quote';

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'quotes' AND table_schema = 'public'
ORDER BY ordinal_position;