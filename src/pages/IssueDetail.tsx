import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GradeBadge } from '@/components/GradeBadge';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Calendar, AlertCircle } from 'lucide-react';
import { IssueCard } from '@/components/IssueCard';

export default function IssueDetail() {
  const { slug } = useParams();
  const [issue, setIssue] = useState<any>(null);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [relatedIssues, setRelatedIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchIssueData();
  }, [slug]);

  const fetchIssueData = async () => {
    const { data: issueData } = await supabase
      .from('issues')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    
    if (!issueData) {
      setLoading(false);
      return;
    }

    setIssue(issueData);

    const [evidenceData, timelineData, relatedData] = await Promise.all([
      supabase.from('evidence').select('*').eq('issue_ref', issueData.id).order('date_of_doc', { ascending: false }),
      supabase.from('timeline').select('*').eq('issue_ref', issueData.id).order('date', { ascending: false }),
      supabase.from('issues').select('*').neq('id', issueData.id).limit(3),
    ]);

    setEvidence(evidenceData.data || []);
    setTimeline(timelineData.data || []);
    setRelatedIssues(relatedData.data || []);
    setLoading(false);
  };
  
  if (loading) {
    return (
      <div className="container px-4 py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="container px-4 py-12">
        <p>Issue not found.</p>
        <Link to="/issues" className="text-primary hover:underline">← Back to Issues</Link>
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-black mb-4">{issue.title}</h1>
            {issue.tags && issue.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
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
          <GradeBadge grade={issue.grade} size="lg" showLabel />
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-3">Summary</h2>
          <p className="text-muted-foreground leading-relaxed">{issue.summary}</p>
        </div>
        
        <div className="bg-alert/10 border border-alert/30 rounded-lg p-6">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            What this means for students
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-alert mt-1">•</span>
              <span>Direct impact on learning environment and resource availability</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-alert mt-1">•</span>
              <span>Patterns of accountability gaps that affect student voice</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-alert mt-1">•</span>
              <span>Ongoing issues requiring sustained community attention</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Evidence */}
      {evidence.length > 0 && (
        <section className="mb-12">
          <h2 className="text-3xl font-black mb-6">Evidence ({evidence.length})</h2>
          <div className="space-y-4">
            {evidence.map(ev => (
              <div key={ev.id} className="bg-card border border-border rounded-lg p-5 hover-lift hover:glow-orange transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{ev.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{ev.caption}</p>
                      {ev.file && (
                        <img
                          src={ev.file}
                          alt={ev.title}
                          className="rounded border border-border w-full max-w-2xl mt-3"
                          loading="lazy"
                          decoding="async"
                          width={800}
                          height={600}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {ev.redacted && (
                      <span className="text-xs px-2 py-1 rounded bg-alert/20 text-alert-foreground font-mono">
                        REDACTED
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(ev.date_of_doc).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {ev.external_url && (
                  <a
                    href={ev.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open original
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Timeline */}
      {timeline.length > 0 && (
        <section className="mb-12">
          <h2 className="text-3xl font-black mb-6">Timeline</h2>
          <div className="space-y-4">
            {timeline.map((entry, idx) => (
              <div key={entry.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0" />
                  {idx < timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-medium">{entry.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Take Action */}
      <section className="mb-12">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-black mb-4">Take Action</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold mb-2">Contact the Board</h3>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" asChild>
                  <a href="mailto:board@brokenarrowschools.org">
                    Email the Board
                  </a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href="tel:918-259-5700">Call District Office</a>
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">Attend Next Meeting</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Next board meeting: Second Monday of each month, 6:00 PM
              </p>
            </div>
            
            <div className="bg-secondary/50 rounded p-4">
              <h3 className="font-bold mb-2 text-sm">3-Line Call Script</h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>State your name and that you're a student/parent/community member</li>
                <li>Reference this specific issue and ask for transparency</li>
                <li>Request a timeline for resolution and public update</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
      
      {/* Related Issues */}
      {relatedIssues.length > 0 && (
        <section>
          <h2 className="text-3xl font-black mb-6">Related Issues</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {relatedIssues.map(relIssue => (
              <IssueCard key={relIssue.id} issue={relIssue} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}