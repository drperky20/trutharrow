import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminCRUD } from '@/hooks/useAdminCRUD';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Edit } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  url: string;
  severity: 'info' | 'alert' | 'win';
  active: boolean;
}

export default function AdminBanners() {
  const { items: banners, loading, create, update, remove } = useAdminCRUD<Banner>({
    table: 'banners',
  });
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Banner, 'id'>>({
    title: '',
    url: '',
    severity: 'info',
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = isEditing
      ? await update(isEditing, formData)
      : await create(formData);
    
    if (success) {
      resetForm();
    }
  };

  const handleEdit = (banner: Banner) => {
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
      await remove(id);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await update(id, { active: !active });
  };

  const resetForm = () => {
    setFormData({ title: '', url: '', severity: 'info', active: true });
    setIsEditing(null);
  };

  if (loading && banners.length === 0) {
    return <AdminLayout title="Manage Banners"><p>Loading...</p></AdminLayout>;
  }

  return (
    <AdminLayout title="Manage Banners">
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
    </AdminLayout>
  );
}