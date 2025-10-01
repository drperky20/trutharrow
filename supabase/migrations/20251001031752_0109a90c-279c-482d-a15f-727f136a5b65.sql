-- Phase 1: Critical Data Privacy Protection

-- 1. Update profiles RLS policy to require authentication
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 2. Restrict poll_votes RLS to prevent individual vote inspection
DROP POLICY IF EXISTS "Admins can view all votes" ON public.poll_votes;

CREATE POLICY "Admins can manage poll data aggregates only"
ON public.poll_votes
FOR SELECT
USING (has_role(auth.uid(), 'admin') AND FALSE); -- Admins cannot view individual votes

-- Phase 2: Database Function Security Hardening

-- 3. Fix set_thread_id function
CREATE OR REPLACE FUNCTION public.set_thread_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.thread_id := NEW.id;
  ELSE
    SELECT COALESCE(thread_id, id) INTO NEW.thread_id
    FROM posts WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Fix update_reply_count function
CREATE OR REPLACE FUNCTION public.update_reply_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
    UPDATE posts 
    SET reply_count = reply_count + 1 
    WHERE id = NEW.parent_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
    UPDATE posts 
    SET reply_count = GREATEST(reply_count - 1, 0)
    WHERE id = OLD.parent_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 5. Fix increment_reaction function
CREATE OR REPLACE FUNCTION public.increment_reaction(p_post_id uuid, p_kind text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_kind NOT IN ('like', 'lol', 'angry') THEN
    RAISE EXCEPTION 'Invalid reaction type';
  END IF;
  
  UPDATE posts
  SET reactions = jsonb_set(
    reactions,
    ARRAY[p_kind],
    to_jsonb(COALESCE((reactions->>p_kind)::int, 0) + 1)
  )
  WHERE id = p_post_id AND status = 'approved';
END;
$$;

-- 6. Fix validate_post_alias function
CREATE OR REPLACE FUNCTION public.validate_post_alias()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.alias := NULLIF(TRIM(NEW.alias), '');
  IF NEW.alias IS NULL THEN
    NEW.alias := 'Anonymous';
  END IF;
  RETURN NEW;
END;
$$;

-- 7. Fix increment_reaction_safe function
CREATE OR REPLACE FUNCTION public.increment_reaction_safe(
  p_post_id uuid, 
  p_kind text, 
  p_user_id uuid DEFAULT NULL, 
  p_fingerprint text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  already_reacted boolean;
  result jsonb;
BEGIN
  IF p_kind NOT IN ('like', 'lol', 'angry') THEN
    RAISE EXCEPTION 'Invalid reaction type';
  END IF;
  
  IF p_user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.post_reactions 
      WHERE post_id = p_post_id 
      AND user_id = p_user_id 
      AND reaction_type = p_kind
    ) INTO already_reacted;
  ELSE
    SELECT EXISTS(
      SELECT 1 FROM public.post_reactions 
      WHERE post_id = p_post_id 
      AND fingerprint = p_fingerprint 
      AND reaction_type = p_kind
    ) INTO already_reacted;
  END IF;
  
  IF already_reacted THEN
    RETURN jsonb_build_object('success', false, 'message', 'Already reacted');
  END IF;
  
  INSERT INTO public.post_reactions (post_id, user_id, fingerprint, reaction_type)
  VALUES (p_post_id, p_user_id, p_fingerprint, p_kind);
  
  UPDATE posts
  SET reactions = jsonb_set(
    reactions,
    ARRAY[p_kind],
    to_jsonb(COALESCE((reactions->>p_kind)::int, 0) + 1)
  )
  WHERE id = p_post_id AND status = 'approved';
  
  RETURN jsonb_build_object('success', true);
END;
$$;

-- 8. Fix vote_on_poll_safe function
CREATE OR REPLACE FUNCTION public.vote_on_poll_safe(
  p_poll_id uuid, 
  p_option_index integer, 
  p_user_id uuid DEFAULT NULL, 
  p_fingerprint text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  already_voted boolean;
  option_key text;
BEGIN
  IF p_user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.poll_votes 
      WHERE poll_id = p_poll_id 
      AND user_id = p_user_id
    ) INTO already_voted;
  ELSE
    SELECT EXISTS(
      SELECT 1 FROM public.poll_votes 
      WHERE poll_id = p_poll_id 
      AND fingerprint = p_fingerprint
    ) INTO already_voted;
  END IF;
  
  IF already_voted THEN
    RETURN jsonb_build_object('success', false, 'message', 'Already voted');
  END IF;
  
  INSERT INTO public.poll_votes (poll_id, user_id, fingerprint, option_index)
  VALUES (p_poll_id, p_user_id, p_fingerprint, p_option_index);
  
  option_key := p_option_index::text;
  UPDATE polls
  SET results = jsonb_set(
    COALESCE(results, '{}'::jsonb),
    ARRAY[option_key],
    to_jsonb(COALESCE((results->>option_key)::int, 0) + 1)
  )
  WHERE id = p_poll_id;
  
  RETURN jsonb_build_object('success', true);
END;
$$;