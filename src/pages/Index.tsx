import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/PostCard';
import { IssueCard } from '@/components/IssueCard';
import { AlertBox } from '@/components/AlertBox';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getFingerprint } from '@/lib/fingerprint';
import heroBanner from '@/assets/hero-banner.jpg';
import { Shield, Eye, Lock, MessageSquare, BookOpen } from 'lucide-react';

const headlines = [
  'Truth doesn\'t graduate.',
  'Detention for bad behavior: issued.',
  'Tonight\'s homework: read the receipts.',
];

export default function Index() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [posts, setPosts] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [poll, setPoll] = useState<any>(null);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeadline((prev) => (prev + 1) % headlines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (poll) {
      checkIfVoted();
    }
  }, [poll, user]);

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

  const checkIfVoted = async () => {
    if (!poll) return;
    
    const fingerprint = getFingerprint();
    const { data } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', poll.id)
      .or(user ? `user_id.eq.${user.id}` : `fingerprint.eq.${fingerprint}`)
      .maybeSingle();
    
    setHasVoted(!!data);
  };

  const handleVote = async (option: string, optionIndex: number) => {
    if (!poll || voting || hasVoted) return;
    
    setVoting(true);
    const fingerprint = getFingerprint();
    
    // Optimistic update
    const updatedResults = { ...poll.results, [optionIndex]: (poll.results[optionIndex] || 0) + 1 };
    setPoll({ ...poll, results: updatedResults });
    setHasVoted(true);
    
    const { data, error } = await supabase.rpc('vote_on_poll_safe', {
      p_poll_id: poll.id,
      p_option_index: optionIndex,
      p_user_id: user?.id || null,
      p_fingerprint: user ? null : fingerprint
    });
    
    const result = data as { success: boolean; message?: string } | null;
    
    if (error || !result?.success) {
      // Revert on error
      const revertedResults = { ...poll.results, [optionIndex]: Math.max((poll.results[optionIndex] || 0) - 1, 0) };
      setPoll({ ...poll, results: revertedResults });
      setHasVoted(false);
      
      toast({
        title: "Already voted",
        description: "You've already voted on this poll.",
        variant: "destructive",
      });
    }
    
    setVoting(false);
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
      <section className="relative overflow-hidden border-b border-primary/30">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background z-[1]" />
        <img
          src={heroBanner}
          alt="Broken Arrow Public Schools campus"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          loading="eager"
          sizes="100vw"
        />
        <div className="relative z-[2] container px-4 py-20 md:py-32">
          <div className="inline-block bg-primary/20 border-2 border-primary px-4 py-2 rounded-lg mb-4">
            <p className="text-primary font-black text-sm md:text-base">
              🐯 BROKEN ARROW TIGERS • TRUTH MATTERS
            </p>
          </div>
          <h1 
            className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 max-w-4xl bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent"
            style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }}
          >
            {headlines[currentHeadline]}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
            The official truth and accountability platform for Broken Arrow Public Schools students, staff, and families.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/issues">
              <Button 
                size="lg" 
                className="font-bold text-base min-h-[44px] px-6"
              >
                See the Issues
              </Button>
            </Link>
            <Link to="/submit">
              <Button 
                size="lg" 
                variant="outline" 
                className="font-bold text-base min-h-[44px] px-6"
              >
                Drop Your Homework
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* How We Work / Yearbook */}
      <section className="border-b border-border bg-muted/30">
        <div className="container px-4 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-8 w-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-black">How We Work</h2>
          </div>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
            TruthArrow is a student-run accountability watchdog for Broken Arrow Public Schools. 
            We investigate, document, and publish verifiable information with journalistic standards 
            and source protection.
          </p>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold">Verification First</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every submission verified through multiple sources before publication.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold">Source Protection</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Anonymous submissions stay anonymous. No IP logging, no tracking.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold">Editorial Standards</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Journalistic ethics: verify, protect sources, correct errors publicly.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold">Transparency</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Open methodology, public corrections, explained grading system.
              </p>
            </div>
          </div>
          
          <Link to="/about">
            <Button variant="outline" size="lg" className="font-semibold min-h-[44px]">
              Read Full Yearbook
            </Button>
          </Link>
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
              <PostCard 
                key={post.id} 
                post={post} 
                isNew={idx < 2}
                onDelete={() => setPosts(prev => prev.filter(p => p.id !== post.id))}
              />
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
              {poll.options.map((option: string, index: number) => {
                const count = poll.results[index] || 0;
                const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                
                return (
                  <button
                    key={option}
                    onClick={() => handleVote(option, index)}
                    disabled={hasVoted || voting}
                    className="w-full text-left group disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium group-hover:text-primary transition-colors group-disabled:opacity-50">
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
            {hasVoted && (
              <p className="text-xs text-muted-foreground mt-2">
                ✓ You've already voted on this poll
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              Total votes: {totalVotes}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}