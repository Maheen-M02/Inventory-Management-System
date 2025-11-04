-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create stock_movements table for tracking history
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sale', 'restock', 'adjustment')),
  quantity_change INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for inventory system)
CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow public read access on stock_movements" ON public.stock_movements FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on stock_movements" ON public.stock_movements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on stock_movements" ON public.stock_movements FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on stock_movements" ON public.stock_movements FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert seed data
INSERT INTO public.products (name, category, cost_price, selling_price, quantity, reorder_level) VALUES
('Laptop Dell XPS 13', 'Electronics', 850.00, 1200.00, 15, 5),
('Office Chair Pro', 'Furniture', 120.00, 200.00, 8, 3),
('Wireless Mouse', 'Electronics', 15.00, 35.00, 45, 10),
('USB-C Cable', 'Accessories', 5.00, 12.00, 3, 15),
('Desk Lamp LED', 'Furniture', 25.00, 50.00, 20, 5),
('Notebook A4', 'Stationery', 2.00, 5.00, 100, 20),
('Mechanical Keyboard', 'Electronics', 65.00, 120.00, 12, 8),
('Monitor 27"', 'Electronics', 180.00, 320.00, 2, 5),
('Printer HP LaserJet', 'Electronics', 250.00, 450.00, 6, 3),
('Storage Box', 'Furniture', 8.00, 18.00, 30, 10);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_movements;