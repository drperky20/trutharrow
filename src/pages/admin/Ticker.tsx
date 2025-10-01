import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminCRUD } from '@/hooks/useAdminCRUD';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Check, X } from 'lucide-react';

interface TickerQuote {
  id: string;
  text: string;
  source_label: string;
  approved: boolean;
}

export default function AdminTicker() {
  const { items: quotes, loading, create, update, remove } = useAdminCRUD<TickerQuote>({
    table: 'ticker_quotes',
  });
  
  const [formData, setFormData] = useState({
    text: '',
    source_label: 'student',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await create({ ...formData, approved: true });
    if (success) {
      setFormData({ text: '', source_label: 'student' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this quote?')) {
      await remove(id);
    }
  };

  const toggleApproved = async (id: string, approved: boolean) => {
    await update(id, { approved: !approved });
  };

  if (loading && quotes.length === 0) {
    return <AdminLayout title="Manage Ticker Quotes"><p>Loading...</p></AdminLayout>;
  }

  return (
    <AdminLayout title="Manage Ticker Quotes">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Create Quote</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Quote Text</Label>
              <Input 
                value={formData.text} 
                onChange={e => setFormData({...formData, text: e.target.value})} 
                placeholder="Short quote for ticker..."
                required 
              />
            </div>
            <div>
              <Label>Source</Label>
              <select 
                value={formData.source_label} 
                onChange={e => setFormData({...formData, source_label: e.target.value})} 
                className="w-full border border-input bg-background rounded-md px-3 py-2"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <Button type="submit">Create Quote</Button>
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Existing Quotes</h2>
          {quotes.map(quote => (
            <div key={quote.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm mb-2">"{quote.text}"</p>
                  <span className="text-xs text-muted-foreground">— {quote.source_label}</span>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => toggleApproved(quote.id, quote.approved)}
                    className={`p-2 rounded ${
                      quote.approved ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                    }`}
                    title={quote.approved ? 'Approved' : 'Not approved'}
                  >
                    {quote.approved ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </button>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(quote.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}