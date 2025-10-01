import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/PostCard';
import { IssueCard } from '@/components/IssueCard';
import { AlertBox } from '@/components/AlertBox';
import { supabase } from '@/integrations/supabase/client';
import { HeroSection } from '@/components/home/HeroSection';
import { PollSection } from '@/components/home/PollSection';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import { TweetSkeleton } from '@/components/TweetSkeleton';
import { IssueCardSkeleton } from '@/components/IssueCardSkeleton';

export default function Index() {
  const { data: posts, loading: postsLoading } = useOptimizedQuery({
    queryKey: 'home-posts',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'approved')
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .limit(9);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: issues, loading: issuesLoading } = useOptimizedQuery({
    queryKey: 'home-issues',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 120000,
  });

  const { data: poll } = useOptimizedQuery({
    queryKey: 'home-poll',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('active', true)
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    staleTime: 300000,
  });

  const { data: banners } = useOptimizedQuery({
    queryKey: 'home-banners',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const loading = postsLoading || issuesLoading;
  
  return (
    <div className="min-h-screen">
      <HeroSection />
      
      {banners && banners.length > 0 && (
        <div className="container px-4 py-6">
          <AlertBox pulse>
            {banners[0].title}
          </AlertBox>
        </div>
      )}
      
      <section className="container px-4 py-12">
        <h2 className="text-3xl font-black mb-6">Bell Ringers</h2>
        {postsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-card/80 border border-border rounded-lg overflow-hidden">
                <TweetSkeleton />
              </div>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, idx) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  isNew={idx < 2}
                />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link to="/feed">
                <Button variant="outline">See All Posts</Button>
              </Link>
            </div>
          </>
        ) : null}
      </section>
      
      <section className="container px-4 py-12">
        <h2 className="text-3xl font-black mb-6">Detention Board</h2>
        {issuesLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <IssueCardSkeleton key={i} />
            ))}
          </div>
        ) : issues && issues.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {issues.map((issue: any) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        ) : null}
      </section>
      
      {poll && <PollSection poll={poll} />}
    </div>
  );
}
