-- Create audit logs table for tracking admin actions
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create index for performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Create failed login attempts table for rate limiting
CREATE TABLE public.failed_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  attempted_at timestamp with time zone DEFAULT now(),
  fingerprint text
);

-- Enable RLS on failed_login_attempts
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert failed attempts (needed for tracking)
CREATE POLICY "Anyone can insert failed attempts"
ON public.failed_login_attempts
FOR INSERT
WITH CHECK (true);

-- Only admins can view failed attempts
CREATE POLICY "Admins can view failed attempts"
ON public.failed_login_attempts
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create index for performance
CREATE INDEX idx_failed_login_email ON public.failed_login_attempts(email, attempted_at DESC);

-- Function to check if account is locked due to failed attempts
CREATE OR REPLACE FUNCTION public.is_account_locked(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_failures int;
  last_attempt timestamp with time zone;
BEGIN
  -- Count failed attempts in last 15 minutes
  SELECT COUNT(*), MAX(attempted_at)
  INTO recent_failures, last_attempt
  FROM public.failed_login_attempts
  WHERE email = p_email
  AND attempted_at > now() - interval '15 minutes';
  
  -- Lock if 5 or more failures in 15 minutes
  IF recent_failures >= 5 THEN
    -- Check if last attempt was less than 15 minutes ago
    IF last_attempt > now() - interval '15 minutes' THEN
      RETURN true;
    END IF;
  END IF;
  
  RETURN false;
END;
$$;

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action text,
  p_table_name text DEFAULT NULL,
  p_record_id uuid DEFAULT NULL,
  p_old_data jsonb DEFAULT NULL,
  p_new_data jsonb DEFAULT NULL
)
RETURNS void
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
    old_data,
    new_data
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_data,
    p_new_data
  );
END;
$$;

-- Function to clean old failed login attempts (older than 1 day)
CREATE OR REPLACE FUNCTION public.cleanup_old_failed_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.failed_login_attempts
  WHERE attempted_at < now() - interval '1 day';
END;
$$;