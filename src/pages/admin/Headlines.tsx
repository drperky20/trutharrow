import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Trash2, Edit, Plus } from 'lucide-react';

interface Headline {
  id: string;
  text: string;
  display_order: number;
  active: boolean;
}

export default function AdminHeadlines() {
  const { isAdmin, loading } = useAuth();
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ text: '', display_order: 0 });

  useEffect(() => {
    fetchHeadlines();
  }, []);

  const fetchHeadlines = async () => {
    const { data, error } = await supabase
      .from('hero_headlines')
      .select('*')
      .order('display_order');
    
    if (error) {
      toast.error('Failed to fetch headlines');
      return;
    }
    setHeadlines(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      const { error } = await supabase
        .from('hero_headlines')
        .update(formData)
        .eq('id', editingId);
      
      if (error) {
        toast.error('Failed to update headline');
        return;
      }
      toast.success('Headline updated');
    } else {
      const { error } = await supabase
        .from('hero_headlines')
        .insert([{ ...formData, active: true }]);
      
      if (error) {
        toast.error('Failed to create headline');
        return;
      }
      toast.success('Headline created');
    }
    
    resetForm();
    fetchHeadlines();
  };

  const handleEdit = (headline: Headline) => {
    setEditingId(headline.id);
    setFormData({ text: headline.text, display_order: headline.display_order });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this headline?')) return;
    
    const { error } = await supabase
      .from('hero_headlines')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to delete headline');
      return;
    }
    toast.success('Headline deleted');
    fetchHeadlines();
  };

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase
      .from('hero_headlines')
      .update({ active: !active })
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to update headline');
      return;
    }
    fetchHeadlines();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ text: '', display_order: 0 });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAdmin) return <Navigate to="/auth" replace />;

  return (
    <div className="container px-4 py-12">
      <h1 className="text-4xl font-black mb-8">Manage Hero Headlines</h1>

      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} Headline</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Headline text"
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            required
          />
          <Input
            type="number"
            placeholder="Display order"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
            required
          />
          <div className="flex gap-2">
            <Button type="submit">
              {editingId ? 'Update' : <><Plus className="h-4 w-4 mr-2" /> Create</>}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Existing Headlines</h2>
        {headlines.map((headline) => (
          <div key={headline.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium">{headline.text}</p>
              <p className="text-sm text-muted-foreground">Order: {headline.display_order}</p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={headline.active}
                onCheckedChange={() => toggleActive(headline.id, headline.active)}
              />
              <Button variant="outline" size="sm" onClick={() => handleEdit(headline)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(headline.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
