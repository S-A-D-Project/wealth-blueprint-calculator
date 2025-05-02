
-- Create a table for all calculations
CREATE TABLE IF NOT EXISTS public.calculations (
  id SERIAL PRIMARY KEY,
  principal NUMERIC NOT NULL,
  rate NUMERIC NOT NULL, 
  time NUMERIC NOT NULL,
  frequency TEXT NOT NULL,
  final_amount NUMERIC NOT NULL,
  solve_for TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Add RLS policies to allow all operations (for simplicity)
ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON public.calculations FOR ALL USING (true);
