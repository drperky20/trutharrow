import { useState } from 'react';
import { evidence, issues } from '@/data/seedData';
import { FileText, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Receipts() {
  const [filterIssue, setFilterIssue] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'featured'>('newest');
  
  let filteredEvidence = [...evidence];
  
  if (filterIssue) {
    filteredEvidence = filteredEvidence.filter(e => e.issue_ref === filterIssue);
  }
  
  if (filterType) {
    filteredEvidence = filteredEvidence.filter(e => e.type === filterType);
  }
  
  if (sortBy === 'newest') {
    filteredEvidence.sort((a, b) => 
      new Date(b.date_of_doc).getTime() - new Date(a.date_of_doc).getTime()
    );
  } else {
    filteredEvidence.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
  
  return (
    <div className="container px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-4">The Receipts</h1>
        <p className="text-muted-foreground text-lg">
          Documented evidence, source materials, and the paper trail.
        </p>
      </div>
      
      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4" />
          <span>Filter by:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterIssue(null)}
            className={`text-xs px-3 py-1.5 rounded font-mono transition-colors ${
              !filterIssue
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            All Issues
          </button>
          {issues.map(issue => (
            <button
              key={issue.id}
              onClick={() => setFilterIssue(issue.id)}
              className={`text-xs px-3 py-1.5 rounded font-mono transition-colors ${
                filterIssue === issue.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {issue.title}
            </button>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType(null)}
            className={`text-xs px-3 py-1.5 rounded font-mono transition-colors ${
              !filterType
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            All Types
          </button>
          {(['image', 'pdf'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`text-xs px-3 py-1.5 rounded font-mono transition-colors ${
                filterType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('newest')}
            className={`text-xs px-3 py-1.5 rounded font-mono transition-colors ${
              sortBy === 'newest'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSortBy('featured')}
            className={`text-xs px-3 py-1.5 rounded font-mono transition-colors ${
              sortBy === 'featured'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Featured
          </button>
        </div>
      </div>
      
      {/* Evidence Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredEvidence.map(ev => {
          const relatedIssue = issues.find(i => i.id === ev.issue_ref);
          
          return (
            <div
              key={ev.id}
              className="bg-card border border-border rounded-lg p-5 hover-lift hover:glow-orange transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold">{ev.title}</h3>
                    {ev.featured && (
                      <span className="text-xs px-2 py-0.5 rounded bg-alert/20 text-alert-foreground font-mono">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{ev.caption}</p>
                  {ev.file && (
                    <img
                      src={ev.file}
                      alt={ev.title}
                      className="rounded border border-border w-full mb-3"
                    />
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(ev.date_of_doc).toLocaleDateString()}</span>
                    {relatedIssue && (
                      <Link
                        to={`/issues/${relatedIssue.slug}`}
                        className="text-primary hover:underline font-mono"
                      >
                        #{relatedIssue.slug}
                      </Link>
                    )}
                  </div>
                  {ev.redacted && (
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 rounded bg-destructive/20 text-destructive font-mono">
                        REDACTED
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredEvidence.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No evidence found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
