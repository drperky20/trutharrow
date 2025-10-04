import { Link } from 'react-router-dom';
import { GradeBadge } from './GradeBadge';
import { Clock } from 'lucide-react';

interface IssueCardProps {
  issue: any;
}

export const IssueCard = ({ issue }: IssueCardProps) => {
  const gradeColors: Record<string, { from: string; to: string; border: string }> = {
    'A': { from: '#4ade80', to: '#22c55e', border: '#16a34a' },
    'B': { from: '#60a5fa', to: '#3b82f6', border: '#2563eb' },
    'C': { from: '#fbbf24', to: '#f59e0b', border: '#d97706' },
    'D': { from: '#fb923c', to: '#f97316', border: '#ea580c' },
    'F': { from: '#ff6b6b', to: '#e34747', border: '#b93a3a' },
  };
  
  const gradeColor = gradeColors[issue.grade] || gradeColors['F'];

  return (
    <Link to={`/issues/${issue.slug}`}>
      <div className="bg-gradient-surface border border-border rounded-lg p-5 shadow-skeu-raised hover:shadow-skeu-raised-lg active:shadow-skeu-pressed transition-all duration-200 ease-out">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold flex-1 pr-2">{issue.title}</h3>
          <span 
            className="ml-auto rounded-full px-2 py-0.5 text-white text-sm font-bold aqua-pressable"
            style={{
              background: `linear-gradient(to bottom, ${gradeColor.from}, ${gradeColor.to})`,
              border: `1px solid ${gradeColor.border}`,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6), 0 1px 2px rgba(0,0,0,.2)'
            }}
          >
            {issue.grade}
          </span>
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
                className="text-xs px-2 py-1 rounded-full border border-[#aab4d0] bg-gradient-to-b from-white to-[#e6ecf9] font-mono"
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