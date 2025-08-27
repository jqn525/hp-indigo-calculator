-- Inventory Management Database Schema
-- SFU Document Solutions

-- Create inventory_requests table
CREATE TABLE IF NOT EXISTS inventory_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  items JSONB NOT NULL, -- Array of requested items with quantities
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_requests_user_id ON inventory_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_requests_status ON inventory_requests(status);
CREATE INDEX IF NOT EXISTS idx_inventory_requests_created_at ON inventory_requests(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE inventory_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests
CREATE POLICY "Users can view own requests" ON inventory_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own requests
CREATE POLICY "Users can create requests" ON inventory_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all requests
CREATE POLICY "Admins can view all requests" ON inventory_requests
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE is_admin = true
    )
  );

-- Policy: Admins can update all requests
CREATE POLICY "Admins can update requests" ON inventory_requests
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE is_admin = true
    )
  );

-- Policy: Admins can delete requests
CREATE POLICY "Admins can delete requests" ON inventory_requests
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE is_admin = true
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_requests_updated_at 
  BEFORE UPDATE ON inventory_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data structure for items JSONB field:
-- [
--   {
--     "id": "COPY_8511_20_WHT",
--     "name": "White 20lb Copy Paper",
--     "sku": "COPY-8511-20-WHT",
--     "quantity": 5,
--     "unit": "ream",
--     "location": "Paper Storage A",
--     "category": "Paper Products > 8.5x11 Paper > Copy Paper"
--   }
-- ]

-- Optional: Create a view for easier querying
CREATE OR REPLACE VIEW inventory_requests_with_user_info AS
SELECT 
  r.*,
  p.email as profile_email,
  p.full_name as profile_name,
  p.is_admin as user_is_admin,
  processor.email as processed_by_email,
  processor.full_name as processed_by_name
FROM inventory_requests r
LEFT JOIN profiles p ON r.user_id = p.id
LEFT JOIN profiles processor ON r.processed_by = processor.id;

-- Grant permissions for the view
GRANT SELECT ON inventory_requests_with_user_info TO authenticated;