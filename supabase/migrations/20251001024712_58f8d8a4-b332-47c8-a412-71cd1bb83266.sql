-- Create post_reactions table to track who reacted to what
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'lol', 'angry')),
  fingerprint text, -- For anonymous users
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id, reaction_type), -- Authenticated users can't react twice
  UNIQUE(post_id, fingerprint, reaction_type) -- Anonymous users can't react twice
);

-- Create poll_votes table to track who voted on what
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  option_index integer NOT NULL,
  fingerprint text, -- For anonymous users
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, user_id), -- Authenticated users can only vote once per poll
  UNIQUE(poll_id, fingerprint) -- Anonymous users can only vote once per poll
);

-- Enable RLS
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_reactions
CREATE POLICY "Anyone can view reactions"
ON public.post_reactions FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert reactions"
ON public.post_reactions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can delete own reactions"
ON public.post_reactions FOR DELETE
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (auth.uid() IS NULL AND fingerprint IS NOT NULL)
);

-- RLS Policies for poll_votes
CREATE POLICY "Admins can view all votes"
ON public.poll_votes FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert votes"
ON public.poll_votes FOR INSERT
WITH CHECK (true);

-- Function to safely increment reaction with duplicate prevention
CREATE OR REPLACE FUNCTION public.increment_reaction_safe(
  p_post_id uuid,
  p_kind text,
  p_user_id uuid DEFAULT NULL,
  p_fingerprint text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  already_reacted boolean;
  result jsonb;
BEGIN
  -- Validate reaction type
  IF p_kind NOT IN ('like', 'lol', 'angry') THEN
    RAISE EXCEPTION 'Invalid reaction type';
  END IF;
  
  -- Check if already reacted
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
  
  -- Insert reaction record
  INSERT INTO public.post_reactions (post_id, user_id, fingerprint, reaction_type)
  VALUES (p_post_id, p_user_id, p_fingerprint, p_kind);
  
  -- Increment counter
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

-- Function to safely vote on poll with duplicate prevention
CREATE OR REPLACE FUNCTION public.vote_on_poll_safe(
  p_poll_id uuid,
  p_option_index integer,
  p_user_id uuid DEFAULT NULL,
  p_fingerprint text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  already_voted boolean;
  option_key text;
BEGIN
  -- Check if already voted
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
  
  -- Insert vote record
  INSERT INTO public.poll_votes (poll_id, user_id, fingerprint, option_index)
  VALUES (p_poll_id, p_user_id, p_fingerprint, p_option_index);
  
  -- Increment vote counter
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