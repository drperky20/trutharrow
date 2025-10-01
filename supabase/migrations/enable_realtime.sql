-- Enable real-time replication for the posts table
-- This allows Supabase to broadcast INSERT, UPDATE, and DELETE events
-- to subscribed clients in real-time

-- Add posts table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE posts;

-- Verify the table was added
-- SELECT * FROM pg_publication_tables 
-- WHERE pubname = 'supabase_realtime' 
-- AND tablename = 'posts';

-- Note: You can also enable this via the Supabase Dashboard:
-- Database → Replication → Enable for 'posts' table

