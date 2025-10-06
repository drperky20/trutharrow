import { lazy } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { HeroSection } from '@/components/home/HeroSection';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import { AquaWindow } from '@/components/aqua/AquaWindow';
import { usePostData } from '@/hooks/usePostData';
const PostCard = lazy(() => import('@/components/PostCard').then(m => ({
  default: m.PostCard
})));
const IssueCard = lazy(() => import('@/components/IssueCard').then(m => ({
  default: m.IssueCard
})));
const PollSection = lazy(() => import('@/components/home/PollSection').then(m => ({
  default: m.PollSection
})));
export default function Index() {
  const {
    data: posts,
    loading: postsLoading
  } = useOptimizedQuery({
    queryKey: 'home-posts',
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('posts').select('*').eq('status', 'approved').is('parent_id', null).order('created_at', {
        ascending: false
      }).limit(9);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000
  });
  const {
    data: issues,
    loading: issuesLoading
  } = useOptimizedQuery({
    queryKey: 'home-issues',
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('issues').select('*').order('last_updated', {
        ascending: false
      }).limit(3);
      if (error) throw error;
      return data || [];
    },
    staleTime: 120000
  });
  const {
    data: polls
  } = useOptimizedQuery({
    queryKey: 'home-polls',
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('polls').select('*').eq('active', true).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return data || [];
    },
    staleTime: 300000
  });
  const {
    data: banners
  } = useOptimizedQuery({
    queryKey: 'home-banners',
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('banners').select('*').eq('active', true).order('created_at', {
        ascending: false
      }).limit(1);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000
  });
  // Batch fetch post data for all posts
  const postIds = posts?.map(post => post.id) || [];
  const { data: postDataMap } = usePostData(postIds);
  
  const loading = postsLoading || issuesLoading;
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>;
  }
  return <div className="min-h-screen">
      <HeroSection />
      
      {banners && banners.length > 0}
      
      {posts && posts.length > 0 && <section className="container px-4 py-12">
          <AquaWindow title="Bell Ringers" className="mb-8" headingLevel="h2">
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post, idx) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    isNew={idx < 2} 
                    postData={postDataMap?.get(post.id)}
                  />
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link to="/feed">
                  <Button variant="outline" className="skeu-interactive">See All Posts</Button>
                </Link>
              </div>
            </div>
          </AquaWindow>
        </section>}
      
      {issues && issues.length > 0 && <section className="container px-4 py-12">
          <AquaWindow title="Detention Board" className="mb-8" headingLevel="h2">
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {issues.map((issue: any) => <IssueCard key={issue.id} issue={issue} />)}
              </div>
            </div>
          </AquaWindow>
        </section>}
      
      {polls && polls.length > 0 && <section className="container px-4 py-12">
          <AquaWindow title="Polls" className="mb-8" headingLevel="h2">
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {polls.map(poll => <PollSection key={poll.id} poll={poll} />)}
              </div>
            </div>
          </AquaWindow>
        </section>}
    </div>;
}