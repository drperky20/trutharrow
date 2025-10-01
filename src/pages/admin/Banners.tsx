import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit } from 'lucide-react';

export default function AdminBanners() {
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [banners, setBanners] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    url: string;
    severity: 'info' | 'alert' | 'win';
    active: boolean;
  }>({
    title: '',
    url: '',
    severity: 'info',
    active: true,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const { data } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false });
    setBanners(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      const { error } = await supabase
        .from('banners')
        .update(formData)
        .eq('id', isEditing);
      
      if (!error) {
        toast({ title: "Banner updated!" });
        setIsEditing(null);
        resetForm();
        fetchBanners();
      }
    } else {
      const { error } = await supabase.from('banners').insert(formData);
      
      if (!error) {
        toast({ title: "Banner created!" });
        resetForm();
        fetchBanners();
      }
    }
  };

  const handleEdit = (banner: any) => {
    setIsEditing(banner.id);
    setFormData({
      title: banner.title,
      url: banner.url || '',
      severity: banner.severity,
      active: banner.active,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this banner?')) {
      await supabase.from('banners').delete().eq('id', id);
      toast({ title: "Banner deleted" });
      fetchBanners();
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('banners').update({ active: !active }).eq('id', id);
    fetchBanners();
  };

  const resetForm = () => {
    setFormData({ title: '', url: '', severity: 'info', active: true });
    setIsEditing(null);
  };

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return <Navigate to="/auth" replace />;

  return (
    <div className="container px-4 py-12">
      <h1 className="text-3xl font-black mb-8">Manage Banners</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Banner' : 'Create Banner'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div>
              <Label>URL (optional)</Label>
              <Input value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="/issues/something" />
            </div>
            <div>
              <Label>Severity</Label>
              <select value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value as 'info' | 'alert' | 'win'})} className="w-full border border-input bg-background rounded-md px-3 py-2">
                <option value="info">Info</option>
                <option value="alert">Alert</option>
                <option value="win">Win</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{isEditing ? 'Update' : 'Create'}</Button>
              {isEditing && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Existing Banners</h2>
          {banners.map(banner => (
            <div key={banner.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{banner.title}</h3>
                  {banner.url && <p className="text-xs text-muted-foreground mt-1">{banner.url}</p>}
                  <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      banner.severity === 'alert' ? 'bg-alert/20 text-alert-foreground' :
                      banner.severity === 'win' ? 'bg-green-500/20 text-green-500' :
                      'bg-primary/20 text-primary'
                    }`}>
                      {banner.severity}
                    </span>
                    <button
                      onClick={() => toggleActive(banner.id, banner.active)}
                      className={`text-xs px-2 py-1 rounded ${
                        banner.active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {banner.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => handleEdit(banner)}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(banner.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}