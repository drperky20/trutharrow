import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/PostCard';
import { IssueCard } from '@/components/IssueCard';
import { AlertBox } from '@/components/AlertBox';
import { posts, issues, polls } from '@/data/seedData';
import { Progress } from '@/components/ui/progress';
import heroBanner from '@/assets/hero-banner.jpg';

const headlines = [
  'Truth doesn\'t graduate.',
  'Detention for bad behavior: issued.',
  'Tonight\'s homework: read the receipts.',
];

export default function Index() {
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [votes, setVotes] = useState(polls[0].results);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeadline((prev) => (prev + 1) % headlines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  
  const approvedPosts = posts
    .filter(p => p.status === 'approved')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 9);
  
  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
  
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
      <div className="container px-4 py-6">
        <AlertBox pulse>
          🟡 New Assignment posted: admin budgets still don't add up. Check receipts.
        </AlertBox>
      </div>
      
      {/* Bell Ringers */}
      <section className="container px-4 py-12">
        <h2 className="text-3xl font-black mb-6">Bell Ringers</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {approvedPosts.map((post, idx) => (
            <PostCard key={post.id} post={post} isNew={idx < 2} />
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link to="/feed">
            <Button variant="outline">See All Posts</Button>
          </Link>
        </div>
      </section>
      
      {/* Detention Board Preview */}
      <section className="container px-4 py-12">
        <h2 className="text-3xl font-black mb-6">Detention Board</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {issues.map(issue => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </section>
      
      {/* Poll of the Week */}
      <section className="container px-4 py-12">
        <h2 className="text-3xl font-black mb-6">Poll of the Week</h2>
        <div className="bg-card border border-border rounded-lg p-6 max-w-2xl">
          <h3 className="text-xl font-bold mb-6">{polls[0].question}</h3>
          <div className="space-y-4">
            {polls[0].options.map(option => {
              const count = votes[option];
              const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
              
              return (
                <button
                  key={option}
                  onClick={() => {
                    setVotes(prev => ({
                      ...prev,
                      [option]: prev[option] + 1,
                    }));
                  }}
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
    </div>
  );
}
