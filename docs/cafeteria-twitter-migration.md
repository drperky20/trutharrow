# Cafeteria Twitter-Style Migration Guide

## Overview
This document describes the transformation of TruthArrow's Cafeteria section into a Twitter-style threaded feed with anonymous posting, replies, and engagement-based ranking.

## Database Schema Changes

### Posts Table Modifications
```sql
-- New columns added:
- alias TEXT NOT NULL            -- Display name for each post (no login required)
- parent_id UUID                 -- References parent post for threading
- thread_id UUID                 -- Root post ID for fast thread queries
- reply_count INTEGER DEFAULT 0  -- Cached count of direct replies

-- Modified columns:
- user_id UUID (now nullable)    -- Optional, for logged-in users
- reactions JSONB                -- Format: {"like": 0, "lol": 0, "angry": 0}
```

### New Database Functions

1. **`set_thread_id()`** - Automatically sets thread_id on insert
   - Root posts: `thread_id = id`
   - Replies: `thread_id = parent.thread_id`

2. **`force_pending_status()`** - Ensures all new posts are pending
   - Sets `status = 'pending'` on insert
   - Normalizes alias (trims, defaults to "Anonymous")

3. **`update_reply_count()`** - Maintains reply_count cache
   - Increments parent's reply_count on insert
   - Decrements on delete

4. **`increment_reaction(p_post_id, p_kind)`** - Safe reaction updates
   - Valid kinds: 'like', 'lol', 'angry'
   - Only updates approved posts
   - Uses `SECURITY DEFINER` to bypass RLS

### RLS Policy Changes

**Previous**: Required authentication to post
**New**: 
- Anyone can INSERT (forced to pending status)
- Public can SELECT approved posts
- Logged-in users can SELECT own pending posts
- Only admins can UPDATE/DELETE

## Feed Ranking Algorithm

### Two Modes

1. **"For You" (Hybrid)** - Default
   ```typescript
   score = (like + lol + angry) / pow(hours_since_created + 2, 0.5)
   ```
   - Combines engagement with recency
   - Time decay prevents old viral posts from dominating
   - +2 buffer prevents division issues for brand-new posts

2. **"Latest" (Chronological)**
   - Pure reverse-chronological order
   - No engagement weighting

### Implementation
Currently implemented client-side for MVP. Can migrate to SQL view:
```sql
CREATE VIEW ranked_posts AS
SELECT *,
  (COALESCE((reactions->>'like')::int, 0) + 
   COALESCE((reactions->>'lol')::int, 0) + 
   COALESCE((reactions->>'angry')::int, 0)) / 
  POW(EXTRACT(EPOCH FROM (NOW() - created_at))/3600 + 2, 0.5) AS score
FROM posts
WHERE status = 'approved' AND parent_id IS NULL
ORDER BY score DESC;
```

## Threading System

### Tree Structure
```
Root Post (level 0)
├─ Reply 1 (level 1)
│  ├─ Reply 1.1 (level 2)
│  └─ Reply 1.2 (level 2)
└─ Reply 2 (level 1)
   └─ Reply 2.1 (level 2)
      └─ Reply 2.1.1 (level 3 - collapsed)
```

### Display Rules
- Show up to 2 levels of nesting inline
- Deeper levels: "View more replies..." link
- Visual connector: vertical line on left
- Indent: 48px per level (3rem)

### Thread Queries
```typescript
// Fetch entire thread efficiently:
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('thread_id', rootPostId)
  .eq('status', 'approved')
  .order('created_at', { ascending: true });
```

## Anonymous Posting

### Alias Persistence
```typescript
// Storage key
const ALIAS_STORAGE_KEY = 'trutharrow:lastAlias';

// Save on submit
localStorage.setItem(ALIAS_STORAGE_KEY, alias);

// Load on mount
const savedAlias = localStorage.getItem(ALIAS_STORAGE_KEY);
```

### Avatar Generation
```typescript
// Hash alias to consistent color
const colors = ['bg-blue-500/20', 'bg-green-500/20', ...];
const hash = alias.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
const avatarColor = colors[hash % colors.length];
```

## Reactions System

### Three Reaction Types
- 👍 **Like** (`like`) - General approval
- 😂 **Laugh** (`lol`) - Humor/agreement
- 😡 **Angry** (`angry`) - Concern/disagreement

### Safe Increment Pattern
```typescript
// Client-side optimistic update
setReactions(prev => ({ ...prev, [kind]: prev[kind] + 1 }));

// Server-side via RPC (prevents abuse)
await supabase.rpc('increment_reaction', {
  p_post_id: postId,
  p_kind: kind
});

// Revert on error
if (error) {
  setReactions(prev => ({ ...prev, [kind]: prev[kind] - 1 }));
}
```

## Removed Features
- ❌ Post types (Assignment, Detention Slip, Pop Quiz)
- ❌ Repost/Quote functionality
- ❌ Login requirement for posting

## UI/UX Changes

### Twitter-Style Layout
```
┌─────────────────────────────────────┐
│ Cafeteria                           │
│ The real tea, straight from students│
├─────────────┬───────────────────────┤
│  For You    │     Latest            │ ← Feed mode tabs
├─────────────┴───────────────────────┤
│ [Compose Box - Always Visible]      │
├──────────────────────────────────────┤
│ [@] Alias     [X] Status  · Time     │
│     Content...                       │
│     [Reply] [👍 5] [😂 2] [😡 1]     │
├──────────────────────────────────────┤
│ ...more posts...                     │
└──────────────────────────────────────┘
```

### Responsive Behavior
- **Desktop**: Fixed 672px width (max-w-2xl), centered
- **Mobile**: Full width, border-x removed
- **Thread indent**: Reduced on small screens

## Moderation Flow

1. **Submission**: Any visitor submits alias + content
2. **Database**: Insert with `status = 'pending'` (forced by trigger)
3. **Visibility**: Hidden from public feed
4. **Admin Review**: `/admin/posts` shows all pending
5. **Approval**: Admin clicks "Approve" → `status = 'approved'`
6. **Publication**: Post appears in feed, reactions enabled

### Admin Panel Updates
- Shows `alias` instead of linked profile
- Indicates replies: "↳ Reply in thread"
- Displays timestamp and images
- Quick approve/reject buttons

## Security Considerations

### Rate Limiting (TODO)
Recommended edge function middleware:
```typescript
// Pseudocode - not implemented yet
const ipKey = `ratelimit:${ip}:posts`;
const count = await redis.incr(ipKey);
if (count === 1) await redis.expire(ipKey, 60); // 1 minute window
if (count > 1) throw new Error('Rate limit exceeded');
```

### Input Validation
- Alias: Max 30 chars, trimmed
- Content: Max 500 chars
- Both required (enforced client + server)

### Abuse Prevention
- All posts pending by default
- Reactions via secure RPC only
- No direct JSON manipulation of reactions
- Profanity filter: TODO (see Nice-to-Have)

## Migration Checklist

- [x] Database migration applied
- [x] ComposeBox updated (alias field + persistence)
- [x] PostCard updated (threading + reactions)
- [x] Feed page updated (modes + ranking)
- [x] ThreadView page created
- [x] Routing updated (/feed/:postId)
- [x] Admin panel updated (show alias)
- [x] RLS policies updated (anonymous posting)
- [x] Removed post type dependencies
- [ ] Rate limiting (future)
- [ ] Profanity filter (future)
- [ ] Realtime subscription (future)

## Rollback Procedure

**⚠️ Warning**: This migration adds new columns and triggers. Rolling back requires careful data handling.

### Option 1: Revert Database (Data Loss)
```sql
-- Drop new columns
ALTER TABLE posts 
  DROP COLUMN IF EXISTS alias,
  DROP COLUMN IF EXISTS parent_id,
  DROP COLUMN IF EXISTS thread_id,
  DROP COLUMN IF EXISTS reply_count;

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_set_thread_id ON posts;
DROP TRIGGER IF EXISTS trigger_force_pending ON posts;
DROP TRIGGER IF EXISTS trigger_update_reply_count ON posts;

-- Drop functions
DROP FUNCTION IF EXISTS set_thread_id();
DROP FUNCTION IF EXISTS force_pending_status();
DROP FUNCTION IF EXISTS update_reply_count();
DROP FUNCTION IF EXISTS increment_reaction(UUID, TEXT);

-- Revert RLS policies
-- (Copy original policies from backup)
```

### Option 2: Keep Data, Revert Code
```bash
# Restore previous commit
git checkout <previous-commit-hash>

# Keep database as-is (new columns will be ignored by old code)
# Posts will still be visible, but threading/reactions won't work
```

### Option 3: Incremental Rollback (Recommended)
1. Disable anonymous posting first (re-require login)
2. Hide threading UI (show flat feed)
3. Later: Remove database columns if confirmed unnecessary

## Performance Notes

### Indexes
```sql
-- Added for query optimization:
CREATE INDEX idx_posts_parent_id ON posts(parent_id);
CREATE INDEX idx_posts_thread_id ON posts(thread_id);
CREATE INDEX idx_posts_status_created ON posts(status, created_at DESC);
```

### Query Patterns
- Feed: `WHERE status = 'approved' AND parent_id IS NULL` (uses composite index)
- Thread: `WHERE thread_id = ?` (uses thread_id index)
- Replies: `WHERE parent_id = ?` (uses parent_id index)

### Caching Strategy
- `reply_count` is denormalized (cached in parent row)
- Reactions are cached in `reactions` JSONB column
- No JOIN needed for posts (alias stored per-post)

## Testing Recommendations

### Unit Tests
- [ ] Alias persistence (localStorage)
- [ ] Reaction increment (optimistic + revert)
- [ ] Thread tree builder
- [ ] Avatar color hash

### Integration Tests
- [ ] Post submission (anon + logged-in)
- [ ] Reply creation (thread_id propagation)
- [ ] Moderation flow (pending → approved)
- [ ] Reaction RPC (valid/invalid kinds)

### E2E Tests
- [ ] Full user flow: compose → pending → approve → visible
- [ ] Thread navigation: feed → thread → reply → back
- [ ] Feed mode switch: For You ↔ Latest
- [ ] Mobile responsive: compose, thread indent, actions

## Future Enhancements (Nice-to-Have)

### Realtime Updates
```typescript
// Subscribe to new approved posts
const channel = supabase
  .channel('posts')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'posts',
    filter: 'status=eq.approved'
  }, payload => {
    // Show "New posts available" snackbar
  })
  .subscribe();
```

### Profanity Filter
```typescript
// Client-side pre-check (can be bypassed)
const badWords = ['...'];
const containsProfanity = badWords.some(word => 
  content.toLowerCase().includes(word)
);

// Server-side webhook (more robust)
// Call external moderation API on insert
```

### Enhanced Ranking
```sql
-- Weight reactions differently
SELECT *,
  ((reactions->>'like')::int * 1.0 + 
   (reactions->>'lol')::int * 1.2 + 
   (reactions->>'angry')::int * 1.5) / 
  POW(hours_ago + 2, 0.5) AS weighted_score
FROM posts;
```

### User Reputation (Optional)
```sql
-- Track alias across posts (even if anonymous)
CREATE TABLE alias_reputation (
  alias TEXT PRIMARY KEY,
  post_count INT DEFAULT 0,
  total_reactions INT DEFAULT 0,
  trust_score FLOAT DEFAULT 1.0
);
```

## Support & Maintenance

### Common Issues

**Q: Posts not appearing in feed**
A: Check `status` column. Only `approved` posts are visible. Admin must approve.

**Q: Reactions not incrementing**
A: Ensure `increment_reaction` RPC exists and has `SECURITY DEFINER`. Check browser console for errors.

**Q: Thread view shows nothing**
A: Verify `thread_id` is set. Run: `SELECT thread_id FROM posts WHERE parent_id IS NOT NULL;`

**Q: Alias not persisting**
A: Check browser localStorage. Key: `trutharrow:lastAlias`. May be blocked by privacy mode.

### Monitoring Queries

```sql
-- Count posts by status
SELECT status, COUNT(*) FROM posts GROUP BY status;

-- Find orphaned replies (parent deleted)
SELECT id, alias, content FROM posts 
WHERE parent_id IS NOT NULL 
  AND parent_id NOT IN (SELECT id FROM posts);

-- Top-engaged threads (last 24h)
SELECT thread_id, COUNT(*) AS reply_count, 
       SUM((reactions->>'like')::int) AS total_likes
FROM posts 
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND status = 'approved'
GROUP BY thread_id
ORDER BY reply_count + total_likes DESC
LIMIT 10;
```

## Terminology Reference

| Old Term | New Term | Notes |
|----------|----------|-------|
| Post Types | (Removed) | No more Assignment/Detention/Pop Quiz |
| User Profile | Alias | Per-post, no account needed |
| Categories | Feed Modes | For You / Latest |
| Shares | (Removed) | No repost/quote functionality |
| Comments | Replies | Threaded, nested |

---

**Last Updated**: 2025-10-01  
**Migration Version**: 1.0  
**Status**: ✅ Complete
