import { Link } from 'react-router-dom';
import { GradeBadge } from './GradeBadge';
import { Clock } from 'lucide-react';

interface IssueCardProps {
  issue: any;
}

export const IssueCard = ({ issue }: IssueCardProps) => {
  return (
    <Link to={`/issues/${issue.slug}`}>
      <div className="bg-gradient-surface border border-border rounded-lg p-5 shadow-skeu-raised hover:shadow-skeu-raised-lg active:shadow-skeu-pressed transition-all duration-200 ease-out">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold">{issue.title}</h3>
          <GradeBadge grade={issue.grade} />
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {issue.summary}
        </p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Updated {new Date(issue.last_updated).toLocaleDateString()}</span>
          </div>
        </div>
        
        {issue.tags && issue.tags.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {issue.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};