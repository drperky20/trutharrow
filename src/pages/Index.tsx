import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/PostCard';
import { IssueCard } from '@/components/IssueCard';
import { AlertBox } from '@/components/AlertBox';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import heroBanner from '@/assets/hero-banner.jpg';

const headlines = [
  'Truth doesn\'t graduate.',
  'Detention for bad behavior: issued.',
  'Tonight\'s homework: read the receipts.',
];

export default function Index() {
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [posts, setPosts] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [poll, setPoll] = useState<any>(null);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeadline((prev) => (prev + 1) % headlines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [postsData, issuesData, pollsData, bannersData] = await Promise.all([
      supabase.from('posts').select('*, profiles(alias)').eq('status', 'approved').order('created_at', { ascending: false }).limit(9),
      supabase.from('issues').select('*').order('last_updated', { ascending: false }),
      supabase.from('polls').select('*').eq('active', true).limit(1),
      supabase.from('banners').select('*').eq('active', true).order('created_at', { ascending: false }).limit(1),
    ]);

    setPosts(postsData.data || []);
    setIssues(issuesData.data || []);
    setPoll(pollsData.data?.[0] || null);
    setBanners(bannersData.data || []);
    setLoading(false);
  };

  const handleVote = async (option: string) => {
    if (!poll) return;
    
    const updatedResults = { ...poll.results, [option]: (poll.results[option] || 0) + 1 };
    await supabase.from('polls').update({ results: updatedResults }).eq('id', poll.id);
    setPoll({ ...poll, results: updatedResults });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const totalVotes = poll ? Object.values(poll.results as Record<string, number>).reduce((a, b) => a + b, 0) : 0;
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBanner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative container px-4 py-20 md:py-32">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 max-w-4xl">
            {headlines[currentHeadline]}
          </h1>
          <div className="flex flex-wrap gap-4">
            <Link to="/issues">
              <Button size="lg" className="font-bold text-base">
                See the Issues
              </Button>
            </Link>
            <Link to="/submit">
              <Button size="lg" variant="outline" className="font-bold text-base">
                Drop Your Homework
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Alert */}
      {banners.length > 0 && (
        <div className="container px-4 py-6">
          <AlertBox pulse>
            {banners[0].title}
          </AlertBox>
        </div>
      )}
      
      {/* Bell Ringers */}
      {posts.length > 0 && (
        <section className="container px-4 py-12">
          <h2 className="text-3xl font-black mb-6">Bell Ringers</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, idx) => (
              <PostCard key={post.id} post={post} isNew={idx < 2} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link to="/feed">
              <Button variant="outline">See All Posts</Button>
            </Link>
          </div>
        </section>
      )}
      
      {/* Detention Board Preview */}
      {issues.length > 0 && (
        <section className="container px-4 py-12">
          <h2 className="text-3xl font-black mb-6">Detention Board</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {issues.slice(0, 3).map((issue: any) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </section>
      )}
      
      {/* Poll of the Week */}
      {poll && (
        <section className="container px-4 py-12">
          <h2 className="text-3xl font-black mb-6">Poll of the Week</h2>
          <div className="bg-card border border-border rounded-lg p-6 max-w-2xl">
            <h3 className="text-xl font-bold mb-6">{poll.question}</h3>
            <div className="space-y-4">
              {poll.options.map((option: string) => {
                const count = poll.results[option] || 0;
                const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                
                return (
                  <button
                    key={option}
                    onClick={() => handleVote(option)}
                    className="w-full text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {option}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {count} votes ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Total votes: {totalVotes}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}