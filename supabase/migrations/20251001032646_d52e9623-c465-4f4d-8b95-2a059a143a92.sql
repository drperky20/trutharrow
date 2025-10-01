-- Drop the insecure public insert policy
DROP POLICY IF EXISTS "Anyone can insert failed attempts" ON public.failed_login_attempts;

-- Create a secure function to record failed login attempts
-- This prevents direct table access and adds validation
CREATE OR REPLACE FUNCTION public.record_failed_login_attempt(
  p_email text,
  p_fingerprint text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_attempts_count int;
BEGIN
  -- Validate email format (basic check)
  IF p_email IS NULL OR p_email = '' OR p_email !~ '^[^@]+@[^@]+\.[^@]+$' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid email format');
  END IF;
  
  -- Rate limit: prevent more than 10 attempts per email in 1 minute
  -- This prevents attackers from spamming the system
  SELECT COUNT(*)
  INTO recent_attempts_count
  FROM public.failed_login_attempts
  WHERE email = p_email
  AND attempted_at > now() - interval '1 minute';
  
  IF recent_attempts_count >= 10 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Rate limit exceeded');
  END IF;
  
  -- Insert the failed attempt record
  INSERT INTO public.failed_login_attempts (email, fingerprint)
  VALUES (p_email, p_fingerprint);
  
  RETURN jsonb_build_object('success', true);
END;
$$;

-- Only allow admins to manually query failed attempts
-- No direct INSERT for anyone
CREATE POLICY "No direct insert access"
ON public.failed_login_attempts
FOR INSERT
WITH CHECK (false);

-- Add policy to allow the security definer function to work
-- (it bypasses RLS anyway, but this makes intent clear)
ALTER TABLE public.failed_login_attempts FORCE ROW LEVEL SECURITY;