import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function AdminIssues() {
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [issues, setIssues] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    grade: 'C',
    summary: '',
    tags: '',
  });

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    const { data } = await supabase.from('issues').select('*').order('created_at', { ascending: false });
    setIssues(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const issueData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    if (isEditing) {
      const { error } = await supabase
        .from('issues')
        .update(issueData)
        .eq('id', isEditing);
      
      if (!error) {
        toast({ title: "Issue updated!" });
        setIsEditing(null);
        resetForm();
        fetchIssues();
      }
    } else {
      const { error } = await supabase.from('issues').insert(issueData);
      
      if (!error) {
        toast({ title: "Issue created!" });
        resetForm();
        fetchIssues();
      }
    }
  };

  const handleEdit = (issue: any) => {
    setIsEditing(issue.id);
    setFormData({
      title: issue.title,
      slug: issue.slug,
      grade: issue.grade,
      summary: issue.summary,
      tags: issue.tags.join(', '),
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this issue?')) {
      await supabase.from('issues').delete().eq('id', id);
      toast({ title: "Issue deleted" });
      fetchIssues();
    }
  };

  const resetForm = () => {
    setFormData({ title: '', slug: '', grade: 'C', summary: '', tags: '' });
    setIsEditing(null);
  };

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return <Navigate to="/auth" replace />;

  return (
    <div className="container px-4 py-12">
      <h1 className="text-3xl font-black mb-8">Manage Issues</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Issue' : 'Create Issue'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
            </div>
            <div>
              <Label>Grade (A-F)</Label>
              <select value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full border border-input bg-background rounded-md px-3 py-2">
                {['A', 'B', 'C', 'D', 'F'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <Label>Summary</Label>
              <Textarea value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} required />
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
            </div>
            <div className="flex gap-2">
              <Button type="submit">{isEditing ? 'Update' : 'Create'}</Button>
              {isEditing && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Existing Issues</h2>
          {issues.map(issue => (
            <div key={issue.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{issue.title}</h3>
                  <p className="text-sm text-muted-foreground">{issue.slug}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Grade: {issue.grade}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => handleEdit(issue)}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(issue.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}