-- Migration: Transform Cafeteria into Twitter-style threaded feed
-- Add threading and anonymous posting support

-- 1. Update posts table structure
ALTER TABLE posts 
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS alias TEXT,
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS thread_id UUID,
  ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;

-- Update existing posts to have an alias (backfill from profiles if possible)
UPDATE posts p 
SET alias = COALESCE(pr.alias, 'Anonymous')
FROM profiles pr 
WHERE p.user_id = pr.id AND p.alias IS NULL;

-- Set remaining nulls to Anonymous
UPDATE posts SET alias = 'Anonymous' WHERE alias IS NULL;

-- Now make alias required
ALTER TABLE posts ALTER COLUMN alias SET NOT NULL;

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_parent_id ON posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_posts_thread_id ON posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_posts_status_created ON posts(status, created_at DESC);

-- 3. Create function to auto-set thread_id
CREATE OR REPLACE FUNCTION set_thread_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If no parent, this is a root post - set thread_id to own id after insert
  IF NEW.parent_id IS NULL THEN
    NEW.thread_id := NEW.id;
  ELSE
    -- If has parent, inherit parent's thread_id
    SELECT COALESCE(thread_id, id) INTO NEW.thread_id
    FROM posts WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_thread_id
  BEFORE INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION set_thread_id();

-- 4. Create function to force pending status on anonymous posts
CREATE OR REPLACE FUNCTION force_pending_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Always set status to pending on insert
  NEW.status := 'pending';
  -- Ensure alias is not empty
  NEW.alias := NULLIF(TRIM(NEW.alias), '');
  IF NEW.alias IS NULL THEN
    NEW.alias := 'Anonymous';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_force_pending
  BEFORE INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION force_pending_status();

-- 5. Create function to update reply counts
CREATE OR REPLACE FUNCTION update_reply_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reply_count
  AFTER INSERT OR DELETE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_reply_count();

-- 6. Create RPC function for incrementing reactions safely
CREATE OR REPLACE FUNCTION increment_reaction(p_post_id UUID, p_kind TEXT)
RETURNS void AS $$
BEGIN
  -- Only allow valid reaction types
  IF p_kind NOT IN ('like', 'lol', 'angry') THEN
    RAISE EXCEPTION 'Invalid reaction type';
  END IF;
  
  -- Increment the reaction for approved posts only
  UPDATE posts
  SET reactions = jsonb_set(
    reactions,
    ARRAY[p_kind],
    to_jsonb(COALESCE((reactions->>p_kind)::int, 0) + 1)
  )
  WHERE id = p_post_id AND status = 'approved';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Update RLS policies for anonymous posting

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create posts" ON posts;
DROP POLICY IF EXISTS "Approved posts viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON posts;

-- Allow anyone to insert posts (trigger will force pending status)
CREATE POLICY "Anyone can create posts"
  ON posts FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow viewing approved posts, or own pending posts, or admins see all
CREATE POLICY "View approved posts or own posts"
  ON posts FOR SELECT
  TO public
  USING (
    status = 'approved' 
    OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR has_role(auth.uid(), 'admin')
  );

-- Only admins can update posts (for moderation)
CREATE POLICY "Admins can update posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Only admins can delete posts
CREATE POLICY "Admins can delete posts"
  ON posts FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- 8. Backfill thread_id for existing root posts
UPDATE posts 
SET thread_id = id 
WHERE parent_id IS NULL AND thread_id IS NULL;

-- 9. Backfill reply_count for existing posts
UPDATE posts p
SET reply_count = (
  SELECT COUNT(*) 
  FROM posts replies 
  WHERE replies.parent_id = p.id
)
WHERE EXISTS (
  SELECT 1 FROM posts replies WHERE replies.parent_id = p.id
);