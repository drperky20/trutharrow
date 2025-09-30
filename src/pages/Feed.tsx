import { useState } from 'react';
import { PostCard } from '@/components/PostCard';
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
    <div className="container px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-4">Cafeteria</h1>
        <p className="text-muted-foreground text-lg">
          Student posts, observations, and receipts from the ground.
        </p>
      </div>
      
      {/* Filter Tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {(['all', 'assignment', 'detention-slip', 'pop-quiz', 'announcement'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === type
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {typeLabels[type]}
          </button>
        ))}
      </div>
      
      {/* Posts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
  );
}
