import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { getFingerprint } from '@/lib/fingerprint';

export interface PostData {
  id: string;
  userReactions: Set<string>;
  isAuthorAdmin: boolean;
}

export const usePostData = (postIds: string[]) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['post-data', postIds, user?.id],
    queryFn: async (): Promise<Map<string, PostData>> => {
      if (postIds.length === 0) return new Map();

      const fingerprint = getFingerprint();
      const userId = user?.id;

      // Batch fetch all user reactions for these posts
      const { data: reactions } = await supabase
        .from('post_reactions')
        .select('post_id, reaction_type')
        .in('post_id', postIds)
        .or(userId ? `user_id.eq.${userId}` : `fingerprint.eq.${fingerprint}`);

      // Batch fetch admin status for all post authors
      const { data: posts } = await supabase
        .from('posts')
        .select('id, user_id')
        .in('id', postIds);

      const userIds = [...new Set(posts?.map(p => p.user_id).filter(Boolean) || [])];
      
      const { data: admins } = userIds.length > 0 ? await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')
        .in('user_id', userIds) : { data: [] };

      const adminSet = new Set(admins?.map(a => a.user_id) || []);

      // Build the result map
      const result = new Map<string, PostData>();
      
      postIds.forEach(postId => {
        const post = posts?.find(p => p.id === postId);
        const userReactions = new Set(
          reactions
            ?.filter(r => r.post_id === postId)
            .map(r => r.reaction_type) || []
        );
        
        result.set(postId, {
          id: postId,
          userReactions,
          isAuthorAdmin: post?.user_id ? adminSet.has(post.user_id) : false,
        });
      });

      return result;
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: postIds.length > 0,
  });
};
