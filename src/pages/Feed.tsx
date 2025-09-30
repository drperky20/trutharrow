import { useState } from 'react';
import { PostCard } from '@/components/PostCard';
import { ComposeBox } from '@/components/ComposeBox';
import { posts } from '@/data/seedData';
import { PostType } from '@/types';

const typeLabels: Record<PostType | 'all', string> = {
  all: 'All',
  assignment: 'Assignments',
  'detention-slip': 'Detention Slips',
  'pop-quiz': 'Pop Quizzes',
  announcement: 'Announcements',
};

export default function Feed() {
  const [filter, setFilter] = useState<PostType | 'all'>('all');
  
  const approvedPosts = posts.filter(p => p.status === 'approved');
  const filteredPosts = filter === 'all' 
    ? approvedPosts 
    : approvedPosts.filter(p => p.type === filter);
  
  const sortedPosts = [...filteredPosts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black mb-2">Cafeteria</h1>
          <p className="text-muted-foreground text-sm">
            The real tea, straight from students.
          </p>
        </div>
        
        {/* Filter Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto pb-2 border-b border-border">
          {(['all', 'assignment', 'detention-slip', 'pop-quiz', 'announcement'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors relative ${
                filter === type
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {typeLabels[type]}
              {filter === type && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t" />
              )}
            </button>
          ))}
        </div>
        
        {/* Compose Box */}
        <div className="mb-4">
          <ComposeBox />
        </div>
        
        {/* Posts Feed */}
        <div className="space-y-4">
          {sortedPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        
        {sortedPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
