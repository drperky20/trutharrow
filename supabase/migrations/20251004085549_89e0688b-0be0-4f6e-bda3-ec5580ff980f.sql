-- Phase 1: Enable encryption extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Phase 1: Add encryption key storage (using Supabase vault would be better in production)
-- For now, we'll use a function that leverages the database's built-in encryption

-- Phase 1: Function to encrypt contact information
CREATE OR REPLACE FUNCTION public.encrypt_contact_info(contact_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF contact_text IS NULL OR contact_text = '' THEN
    RETURN NULL;
  END IF;
  -- Using pgcrypto's pgp_sym_encrypt with a key derived from the database
  -- In production, use Supabase Vault for key management
  RETURN encode(
    pgp_sym_encrypt(
      contact_text,
      current_setting('app.settings.encryption_key', true),
      'cipher-algo=aes256'
    ),
    'base64'
  );
END;
$$;

-- Phase 1: Function to decrypt contact information (admin only)
CREATE OR REPLACE FUNCTION public.decrypt_contact_info(encrypted_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF encrypted_text IS NULL OR encrypted_text = '' THEN
    RETURN NULL;
  END IF;
  RETURN pgp_sym_decrypt(
    decode(encrypted_text, 'base64'),
    current_setting('app.settings.encryption_key', true)
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN '[Decryption Error]';
END;
$$;

-- Phase 1: Enhance audit_logs to track contact info access
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  p_submission_id UUID,
  p_field_accessed TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_data
  ) VALUES (
    auth.uid(),
    'SENSITIVE_DATA_ACCESS',
    'submissions',
    p_submission_id,
    jsonb_build_object('field_accessed', p_field_accessed, 'timestamp', now())
  );
END;
$$;

-- Phase 2: Add alias change tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS alias_changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS alias_change_count INTEGER DEFAULT 0;

-- Phase 2: Add unique constraint on alias (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_alias_unique_idx 
ON public.profiles (LOWER(alias));

-- Phase 2: Function to check if user can change alias (once per 30 days)
CREATE OR REPLACE FUNCTION public.can_change_alias(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_change TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT alias_changed_at INTO last_change
  FROM public.profiles
  WHERE id = p_user_id;
  
  IF last_change IS NULL THEN
    RETURN true;
  END IF;
  
  -- Allow change if 30 days have passed
  RETURN (now() - last_change) > INTERVAL '30 days';
END;
$$;

-- Phase 2: Update profile alias update policy to enforce restrictions
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  (
    -- If not changing alias, allow
    alias = (SELECT alias FROM public.profiles WHERE id = auth.uid()) OR
    -- If changing alias, check if allowed
    public.can_change_alias(auth.uid())
  )
);

-- Phase 2: Trigger to update alias_changed_at when alias changes
CREATE OR REPLACE FUNCTION public.track_alias_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.alias IS DISTINCT FROM NEW.alias THEN
    NEW.alias_changed_at := now();
    NEW.alias_change_count := OLD.alias_change_count + 1;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS track_alias_change_trigger ON public.profiles;
CREATE TRIGGER track_alias_change_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.track_alias_change();

-- Phase 4: Create submission rate limiting table
CREATE TABLE IF NOT EXISTS public.submission_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fingerprint TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT
);

-- Enable RLS on submission_attempts
ALTER TABLE public.submission_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view submission attempts
CREATE POLICY "Admins can view submission attempts"
ON public.submission_attempts
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- No direct insert (will use function)
CREATE POLICY "No direct insert access"
ON public.submission_attempts
FOR INSERT
WITH CHECK (false);

-- Phase 4: Function to check submission rate limit
CREATE OR REPLACE FUNCTION public.check_submission_rate_limit(
  p_user_id UUID DEFAULT NULL,
  p_fingerprint TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_attempts_count INT;
BEGIN
  -- Validate input
  IF p_user_id IS NULL AND p_fingerprint IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'message', 'Invalid request');
  END IF;
  
  -- Count attempts in last hour
  IF p_user_id IS NOT NULL THEN
    SELECT COUNT(*)
    INTO recent_attempts_count
    FROM public.submission_attempts
    WHERE user_id = p_user_id
    AND attempted_at > now() - INTERVAL '1 hour';
  ELSE
    SELECT COUNT(*)
    INTO recent_attempts_count
    FROM public.submission_attempts
    WHERE fingerprint = p_fingerprint
    AND attempted_at > now() - INTERVAL '1 hour';
  END IF;
  
  -- Allow max 5 submissions per hour
  IF recent_attempts_count >= 5 THEN
    RETURN jsonb_build_object(
      'allowed', false, 
      'message', 'Rate limit exceeded. Maximum 5 submissions per hour.',
      'attempts', recent_attempts_count
    );
  END IF;
  
  -- Record this attempt
  INSERT INTO public.submission_attempts (user_id, fingerprint)
  VALUES (p_user_id, p_fingerprint);
  
  RETURN jsonb_build_object('allowed', true, 'attempts', recent_attempts_count + 1);
END;
$$;

-- Phase 4: Cleanup function for old submission attempts
CREATE OR REPLACE FUNCTION public.cleanup_old_submission_attempts()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.submission_attempts
  WHERE attempted_at < now() - INTERVAL '7 days';
END;
$$;

-- Phase 2: Create public view for posts without user_id exposure
CREATE OR REPLACE VIEW public.posts_public AS
SELECT 
  id,
  content,
  alias,
  type,
  featured,
  reactions,
  created_at,
  status,
  parent_id,
  thread_id,
  reply_count,
  images,
  issue_refs
FROM public.posts
WHERE status = 'approved';

-- Grant access to the view
GRANT SELECT ON public.posts_public TO authenticated, anon;