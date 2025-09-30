-- Fix search_path for generate_alias function
CREATE OR REPLACE FUNCTION public.generate_alias()
RETURNS TEXT
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_alias TEXT;
BEGIN
  new_alias := 'Student-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE alias = new_alias) LOOP
    new_alias := 'Student-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END LOOP;
  RETURN new_alias;
END;
$$;