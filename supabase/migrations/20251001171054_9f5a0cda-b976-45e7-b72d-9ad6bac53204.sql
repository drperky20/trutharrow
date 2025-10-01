-- Create table for hero headlines
CREATE TABLE public.hero_headlines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_headlines ENABLE ROW LEVEL SECURITY;

-- Active headlines viewable by everyone
CREATE POLICY "Active headlines viewable by everyone"
ON public.hero_headlines
FOR SELECT
USING (active = true OR has_role(auth.uid(), 'admin'));

-- Admins can manage headlines
CREATE POLICY "Admins can manage headlines"
ON public.hero_headlines
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert default headlines
INSERT INTO public.hero_headlines (text, display_order, active) VALUES
('Truth doesn''t graduate.', 1, true),
('Detention for bad behavior: issued.', 2, true),
('Tonight''s homework: read the receipts.', 3, true);