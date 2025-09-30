import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit } from 'lucide-react';

export default function AdminEvidence() {
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [evidence, setEvidence] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    caption: string;
    issue_ref: string;
    date_of_doc: string;
    sensitivity: string;
    type: 'image' | 'pdf' | 'url';
    external_url: string;
    featured: boolean;
  }>({
    title: '',
    caption: '',
    issue_ref: '',
    date_of_doc: '',
    sensitivity: 'low',
    type: 'image',
    external_url: '',
    featured: false,
  });

  useEffect(() => {
    fetchEvidence();
    fetchIssues();
  }, []);

  const fetchEvidence = async () => {
    const { data } = await supabase
      .from('evidence')
      .select('*, issues(title)')
      .order('created_at', { ascending: false });
    setEvidence(data || []);
  };

  const fetchIssues = async () => {
    const { data } = await supabase.from('issues').select('id, title');
    setIssues(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const evidenceData = {
      ...formData,
      issue_ref: formData.issue_ref || null,
    };

    if (isEditing) {
      const { error } = await supabase
        .from('evidence')
        .update(evidenceData)
        .eq('id', isEditing);
      
      if (!error) {
        toast({ title: "Evidence updated!" });
        setIsEditing(null);
        resetForm();
        fetchEvidence();
      }
    } else {
      const { error } = await supabase.from('evidence').insert(evidenceData);
      
      if (!error) {
        toast({ title: "Evidence created!" });
        resetForm();
        fetchEvidence();
      }
    }
  };

  const handleEdit = (item: any) => {
    setIsEditing(item.id);
    setFormData({
      title: item.title,
      caption: item.caption,
      issue_ref: item.issue_ref || '',
      date_of_doc: item.date_of_doc,
      sensitivity: item.sensitivity,
      type: item.type,
      external_url: item.external_url || '',
      featured: item.featured,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this evidence?')) {
      await supabase.from('evidence').delete().eq('id', id);
      toast({ title: "Evidence deleted" });
      fetchEvidence();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      caption: '',
      issue_ref: '',
      date_of_doc: '',
      sensitivity: 'low',
      type: 'image',
      external_url: '',
      featured: false,
    });
    setIsEditing(null);
  };

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return <Navigate to="/auth" replace />;

  return (
    <div className="container px-4 py-12">
      <h1 className="text-3xl font-black mb-8">Manage Evidence</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Evidence' : 'Create Evidence'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div>
              <Label>Caption</Label>
              <Textarea value={formData.caption} onChange={e => setFormData({...formData, caption: e.target.value})} required />
            </div>
            <div>
              <Label>Link to Issue (optional)</Label>
              <select value={formData.issue_ref} onChange={e => setFormData({...formData, issue_ref: e.target.value})} className="w-full border border-input bg-background rounded-md px-3 py-2">
                <option value="">None</option>
                {issues.map(issue => <option key={issue.id} value={issue.id}>{issue.title}</option>)}
              </select>
            </div>
            <div>
              <Label>Date of Document</Label>
              <Input type="date" value={formData.date_of_doc} onChange={e => setFormData({...formData, date_of_doc: e.target.value})} required />
            </div>
            <div>
              <Label>Type</Label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as 'image' | 'pdf' | 'url'})} className="w-full border border-input bg-background rounded-md px-3 py-2">
                <option value="image">Image</option>
                <option value="pdf">PDF</option>
                <option value="url">URL</option>
              </select>
            </div>
            {formData.type === 'url' && (
              <div>
                <Label>External URL</Label>
                <Input value={formData.external_url} onChange={e => setFormData({...formData, external_url: e.target.value})} />
              </div>
            )}
            <div>
              <Label>Sensitivity</Label>
              <select value={formData.sensitivity} onChange={e => setFormData({...formData, sensitivity: e.target.value})} className="w-full border border-input bg-background rounded-md px-3 py-2">
                <option value="low">Low</option>
                <option value="med">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="featured" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} />
              <Label htmlFor="featured">Featured</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{isEditing ? 'Update' : 'Create'}</Button>
              {isEditing && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Existing Evidence</h2>
          {evidence.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.caption}</p>
                  {item.issues && <p className="text-xs text-primary mt-1">Issue: {item.issues.title}</p>}
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">{item.type}</span>
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">{item.sensitivity}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}