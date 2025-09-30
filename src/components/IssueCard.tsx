import { Issue } from '@/types';
import { Link } from 'react-router-dom';
import { GradeBadge } from './GradeBadge';
import { FileText, Clock } from 'lucide-react';
import { evidence } from '@/data/seedData';

interface IssueCardProps {
  issue: Issue;
}

export const IssueCard = ({ issue }: IssueCardProps) => {
  const docCount = evidence.filter(e => e.issue_ref === issue.id).length;
  
  return (
    <Link to={`/issues/${issue.slug}`}>
      <div className="bg-card border border-border rounded-lg p-5 hover-lift hover:border-primary hover:glow-orange transition-all">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold">{issue.title}</h3>
          <GradeBadge grade={issue.grade} />
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {issue.summary}
        </p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{docCount} docs</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Updated {new Date(issue.last_updated).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3 flex-wrap">
          {issue.tags.map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};
