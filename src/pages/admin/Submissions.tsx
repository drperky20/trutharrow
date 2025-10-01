import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'published';

interface Submission {
  id: string;
  title: string;
  what: string;
  when_where: string | null;
  verify: string;
  contact: string | null;
  status: SubmissionStatus;
  created_at: string;
  admin_notes: string | null;
}

export default function AdminSubmissions() {
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filter, setFilter] = useState<SubmissionStatus | 'all'>('pending');

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  const fetchSubmissions = async () => {
    let query = supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    setSubmissions(data || []);
  };

  const updateStatus = async (id: string, status: SubmissionStatus) => {
    const { error } = await supabase
      .from('submissions')
      .update({ 
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        admin_notes: adminNotes || null,
      })
      .eq('id', id);

    if (!error) {
      toast({ title: `Submission ${status}` });
      setAdminNotes('');
      setSelectedSubmission(null);
      fetchSubmissions();
    }
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
      approved: { variant: 'default', icon: CheckCircle, label: 'Approved' },
      rejected: { variant: 'destructive', icon: XCircle, label: 'Rejected' },
      published: { variant: 'outline', icon: Eye, label: 'Published' },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return <Navigate to="/auth" replace />;

  return (
    <div className="container px-4 py-12">
      <h1 className="text-3xl font-black mb-8">Review Submissions</h1>

      <div className="flex gap-2 mb-6">
        {(['pending', 'approved', 'rejected', 'published', 'all'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status)}
            size="sm"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Submissions ({submissions.length})</h2>
          {submissions.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              No submissions found
            </Card>
          ) : (
            submissions.map((submission) => (
              <Card
                key={submission.id}
                className={`p-4 cursor-pointer transition-colors hover:bg-accent ${
                  selectedSubmission?.id === submission.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setSelectedSubmission(submission);
                  setAdminNotes(submission.admin_notes || '');
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold">{submission.title}</h3>
                  {getStatusBadge(submission.status)}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {submission.what}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(submission.created_at).toLocaleDateString()}
                </div>
              </Card>
            ))
          )}
        </div>

        {selectedSubmission && (
          <div className="bg-card border border-border rounded-lg p-6 sticky top-4">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold">Review Details</h2>
              {getStatusBadge(selectedSubmission.status)}
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Title</Label>
                <p className="font-bold">{selectedSubmission.title}</p>
              </div>

              <Separator />

              <div>
                <Label className="text-xs text-muted-foreground">What happened?</Label>
                <p className="text-sm whitespace-pre-wrap">{selectedSubmission.what}</p>
              </div>

              {selectedSubmission.when_where && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-xs text-muted-foreground">When & Where</Label>
                    <p className="text-sm">{selectedSubmission.when_where}</p>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <Label className="text-xs text-muted-foreground">How to verify</Label>
                <p className="text-sm whitespace-pre-wrap">{selectedSubmission.verify}</p>
              </div>

              {selectedSubmission.contact && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-xs text-muted-foreground">Contact</Label>
                    <p className="text-sm font-mono">{selectedSubmission.contact}</p>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <Label htmlFor="notes">Admin Notes</Label>
                <Textarea
                  id="notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                {selectedSubmission.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => updateStatus(selectedSubmission.id, 'approved')}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => updateStatus(selectedSubmission.id, 'rejected')}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                {selectedSubmission.status === 'approved' && (
                  <Button
                    onClick={() => updateStatus(selectedSubmission.id, 'published')}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Mark as Published
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
