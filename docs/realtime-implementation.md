# Real-Time Updates Implementation

## Overview
Implemented Supabase real-time subscriptions for live updates across the TruthArrow platform. This ensures posts, comments, and moderation changes reflect instantly without manual refresh.

## Features Implemented

### 1. Feed Page Real-Time Updates (`/feed`)
**File:** `src/pages/Feed.tsx`

**Functionality:**
- Subscribes to `INSERT` events on `posts` table with `status=eq.approved` filter
- Subscribes to `UPDATE` events on `posts` table for status changes
- Automatically adds newly approved posts to the feed
- Removes posts that are rejected or have their approval revoked
- Updates existing posts when their content changes

**Implementation Details:**
```typescript
// Creates a channel named 'posts-feed'
// Listens for new approved posts (INSERT)
// Listens for status changes (UPDATE)
// Filters out posts with parent_id (only shows root posts)
```

### 2. Thread View Real-Time Updates (`/feed/:postId`)
**File:** `src/pages/ThreadView.tsx`

**Functionality:**
- Subscribes to replies for the current thread using `parent_id` filter
- Updates existing replies when their content or status changes
- Removes replies that are rejected or deleted
- Updates the root post if it's modified
- Newly approved replies appear instantly in the thread

**Implementation Details:**
```typescript
// Creates a unique channel per thread: 'thread-{postId}'
// Filters INSERT events: parent_id=eq.{postId}
// Handles approval of pending replies
// Syncs with thread_id for nested replies
```

### 3. Admin Moderation Dashboard (`/admin/posts`)
**File:** `src/pages/admin/Posts.tsx`

**Functionality:**
- Subscribes to all `INSERT`, `UPDATE`, and `DELETE` events on `posts` table
- Shows toast notifications for new pending posts
- Updates post status in real-time when other admins take action
- Automatically reflects approvals/rejections made by any moderator
- Removes deleted posts from the list

**Implementation Details:**
```typescript
// Creates channel 'posts-admin'
// No filters - admin sees all posts regardless of status
// Toast notification: "New post pending review"
// Real-time sync prevents double-fetching after moderation actions
```

## Mobile Navigation Improvements

### Changes Made to `src/components/MobileBottomNav.tsx`

1. **Removed Admin Page Restriction**
   - Changed: Only hides nav on `/auth` page (was hiding on `/admin/*` too)
   - Result: Admins now have navigation bar on all admin pages
   
2. **Prevent Label Wrapping**
   - Added: `whitespace-nowrap` class to label spans
   - Result: "Front Office" and other long labels stay on one line
   
3. **Fit Admin Button on Screen**
   - Changed: `min-w-[64px]` → `min-w-[56px]`
   - Added: `flex-1` class to nav items
   - Reduced: `px-3` → `px-2`
   - Result: 6 nav items (including Admin) fit on 360px wide screens
   - Still meets accessibility: 56px ≈ 3.5rem (above 44px minimum touch target)

4. **Enhanced Flex Layout**
   - Added: `flex-shrink-0` to icons
   - Added: `flex-1` to link containers
   - Result: Items distribute evenly, preventing overflow

## Database Setup Required

### Enable Realtime on Supabase

**Important:** You must enable real-time replication on the `posts` table in Supabase.

**Steps:**
1. Go to Supabase Dashboard → Database → Replication
2. Enable real-time for the `posts` table
3. Select the following events:
   - ✅ INSERT
   - ✅ UPDATE
   - ✅ DELETE (for admin view)

**SQL Command (Alternative):**
```sql
-- Enable realtime for posts table
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
```

### Verify Real-Time is Working

**Test Feed Updates:**
1. Open feed page in two browser windows
2. Submit a new post in one window
3. Post should appear instantly in the other window (after AI approval)

**Test Admin Moderation:**
1. Open admin posts page in two browser windows
2. Approve a pending post in one window
3. Status should update to "approved" instantly in the other window
4. Post should appear on public feed immediately

**Test Thread Replies:**
1. Open a thread in two browser windows
2. Submit a reply in one window
3. Reply should appear instantly in the other window (after approval)

## Performance Considerations

### Channel Management
- Each page creates its own channel with cleanup on unmount
- Channels are properly removed with `supabase.removeChannel(channel)`
- Uses unique channel names to avoid conflicts:
  - `posts-feed` - Feed page
  - `thread-{postId}` - Each thread view
  - `posts-admin` - Admin dashboard

### Optimistic Updates
- Admin actions still update local state immediately
- Real-time subscriptions handle updates from other users
- Prevents duplicate fetches after moderation actions

### Memory Safety
- All subscriptions cleaned up on component unmount
- No memory leaks from unclosed channels
- React's cleanup function ensures proper disposal

## User Experience Improvements

### For Regular Users
- ✅ See new posts appear without refresh
- ✅ See approved posts instantly after moderation
- ✅ Real-time comment threads
- ✅ Smooth, dynamic feed experience

### For Admins (Mobile & Desktop)
- ✅ Instant notifications for new pending posts
- ✅ See status changes from other moderators in real-time
- ✅ Mobile navigation always visible on admin pages
- ✅ All nav items fit on screen (including Admin button)
- ✅ Clean, aligned navigation layout

### For Moderators
- ✅ No more refresh needed after moderating
- ✅ Collaborative moderation - see what others are doing
- ✅ Pending posts appear immediately
- ✅ Feed updates instantly when approving posts

## Integration with AI Moderation

The real-time system works seamlessly with the existing AI moderation:

1. **User submits post** → AI reviews via `moderate-post` Edge Function
2. **If approved** → Post inserted with `status='approved'` → Real-time INSERT event → Appears on feed instantly
3. **If flagged** → Post inserted with `status='pending'` → Real-time INSERT event → Appears on admin dashboard with notification
4. **Admin approves** → Status updated to `approved` → Real-time UPDATE event → Post appears on feed + disappears from pending list
5. **Admin rejects** → Status updated to `rejected` → Real-time UPDATE event → Post removed from any public views

## Code Quality

### Type Safety
- Uses TypeScript throughout
- Proper typing for payload events
- Type-safe state updates

### Error Handling
- Graceful handling of subscription failures
- Toast notifications for moderation errors
- Fail-safe approach (subscriptions won't crash app)

### Best Practices
- Single responsibility per subscription
- Clear separation of concerns
- Documented code with comments
- Follows React hooks best practices

## Testing Checklist

- [ ] Enable real-time replication on Supabase `posts` table
- [ ] Test feed updates across multiple browser windows
- [ ] Test thread reply updates in real-time
- [ ] Test admin dashboard notifications for new posts
- [ ] Test moderation actions sync across multiple admin users
- [ ] Test mobile navigation on admin pages (iPhone/Android)
- [ ] Test "Front Office" label doesn't wrap on small screens
- [ ] Test 6 nav items fit on 360px width screen
- [ ] Verify no memory leaks (check browser DevTools Performance)
- [ ] Confirm AI moderation still works with real-time updates

## Troubleshooting

### Real-Time Not Working?
1. Check Supabase Dashboard → Logs → Realtime
2. Verify table replication is enabled
3. Check browser console for subscription errors
4. Ensure proper authentication (realtime requires auth)

### Mobile Nav Issues?
1. Check viewport width in DevTools
2. Verify `mobile-nav-padding` class is applied to routes
3. Test on actual devices, not just DevTools
4. Clear cache and hard refresh

### Posts Not Appearing?
1. Check post status is 'approved'
2. Verify parent_id is null for feed posts
3. Check filter logic in real-time subscription
4. Test with browser console logs

## Future Enhancements

- [ ] Add typing indicators for comments
- [ ] Show "New posts available" banner instead of auto-insert
- [ ] Add sound/visual notification for admin pending posts
- [ ] Implement read receipts for moderators
- [ ] Add presence indicators (who's online)
- [ ] Optimize for large feeds (pagination + real-time)

