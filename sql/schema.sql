-- Supabase Database Schema for HP Indigo Pricing Calculator
-- Run this in your Supabase SQL editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Paper stocks table
CREATE TABLE IF NOT EXISTS public.paper_stocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text_stock', 'cover_stock')),
  finish TEXT NOT NULL,
  size TEXT NOT NULL,
  weight TEXT NOT NULL,
  cost_per_sheet DECIMAL(10,5) NOT NULL,
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paper stocks policies (public read, admin write)
ALTER TABLE public.paper_stocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view paper stocks" ON public.paper_stocks
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify paper stocks" ON public.paper_stocks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Pricing configurations table
CREATE TABLE IF NOT EXISTS public.pricing_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing configs policies
ALTER TABLE public.pricing_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pricing configs" ON public.pricing_configs
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify pricing configs" ON public.pricing_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  min_quantity INTEGER NOT NULL,
  max_quantity INTEGER NOT NULL,
  efficiency_exponent DECIMAL(3,2) NOT NULL,
  imposition_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Carts table
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- For anonymous users
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_cart UNIQUE(user_id),
  CONSTRAINT unique_session_cart UNIQUE(session_id)
);

-- Carts policies
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart" ON public.carts
  FOR SELECT USING (auth.uid() = user_id OR session_id = current_setting('app.session_id', true));

CREATE POLICY "Users can update own cart" ON public.carts
  FOR ALL USING (auth.uid() = user_id OR session_id = current_setting('app.session_id', true));

-- Quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number TEXT UNIQUE NOT NULL DEFAULT 'Q-' || LPAD(NEXTVAL('quote_number_seq')::TEXT, 6, '0'),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_company TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  valid_until DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  notes TEXT,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,4) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sequence for quote numbers
CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 1000;

-- Quotes policies
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quotes" ON public.quotes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create quotes" ON public.quotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes" ON public.quotes
  FOR UPDATE USING (auth.uid() = user_id);

-- Quote items table
CREATE TABLE IF NOT EXISTS public.quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL,
  configuration JSONB NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,4) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quote items policies
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quote items for own quotes" ON public.quote_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quotes
      WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage quote items for own quotes" ON public.quote_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quotes
      WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()
    )
  );

-- Audit log table for tracking changes
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log policies
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Helper functions
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_paper_stocks_updated_at BEFORE UPDATE ON public.paper_stocks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_pricing_configs_updated_at BEFORE UPDATE ON public.pricing_configs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default pricing configurations
INSERT INTO public.pricing_configs (config_key, config_value, description) VALUES
  ('formula', '{"setupFee": 30.00, "finishingSetupFee": 15.00, "baseProductionRate": 1.50, "efficiencyExponent": 0.75, "clicksCost": 0.10}', 'Core pricing formula values'),
  ('rush_multipliers', '{"standard": {"multiplier": 1.0, "description": "Standard (3-5 business days)"}, "2-day": {"multiplier": 1.25, "description": "2-Day Rush (+25%)"}, "next-day": {"multiplier": 1.50, "description": "Next-Day Rush (+50%)"}, "same-day": {"multiplier": 2.0, "description": "Same-Day Rush (+100%)"}}', 'Rush order pricing multipliers'),
  ('finishing_costs', '{"folding": {"bifold": 0.10, "trifold": 0.10}, "cutting": 0.05, "scoring": 0.10}', 'Per-unit finishing costs')
ON CONFLICT (config_key) DO NOTHING;

-- Insert default products
INSERT INTO public.products (name, slug, description, min_quantity, max_quantity, efficiency_exponent, imposition_data) VALUES
  ('Brochures', 'brochures', 'Tri-fold, bi-fold, and multi-page brochures', 25, 2500, 0.75, '{"8.5x11": 2, "8.5x14": 1, "11x17": 1}'),
  ('Postcards', 'postcards', 'Standard and custom postcard sizes', 100, 5000, 0.70, '{"4x6": 8, "5x7": 4, "5.5x8.5": 4, "6x9": 2}'),
  ('Name Tags', 'name-tags', 'Professional name tags for events and identification', 100, 5000, 0.70, '{"4x6": 8, "5x7": 4, "5.5x8.5": 4, "6x9": 2}'),
  ('Flyers', 'flyers', 'Single and double-sided flyers', 25, 2500, 0.70, '{"5.5x8.5": 4, "8.5x11": 2, "8.5x14": 1, "11x17": 1}'),
  ('Bookmarks', 'bookmarks', 'Professional bookmarks on premium cover stock', 100, 2500, 0.65, '{"2x6": 10, "2x7": 10, "2x8": 10}')
ON CONFLICT (slug) DO NOTHING;