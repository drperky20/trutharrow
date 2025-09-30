import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, X } from 'lucide-react';

export default function AdminPolls() {
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [polls, setPolls] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', ''],
    active: true,
  });

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    const { data } = await supabase
      .from('polls')
      .select('*')
      .order('created_at', { ascending: false });
    setPolls(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validOptions = formData.options.filter(o => o.trim());
    if (validOptions.length < 2) {
      toast({ title: "Error", description: "Need at least 2 options", variant: "destructive" });
      return;
    }

    const results: Record<string, number> = {};
    validOptions.forEach(opt => results[opt] = 0);

    const { error } = await supabase.from('polls').insert({
      question: formData.question,
      options: validOptions,
      results,
      active: formData.active,
    });
    
    if (!error) {
      toast({ title: "Poll created!" });
      setFormData({ question: '', options: ['', ''], active: true });
      fetchPolls();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this poll?')) {
      await supabase.from('polls').delete().eq('id', id);
      toast({ title: "Poll deleted" });
      fetchPolls();
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('polls').update({ active: !active }).eq('id', id);
    fetchPolls();
  };

  const addOption = () => {
    setFormData({...formData, options: [...formData.options, '']});
  };

  const removeOption = (index: number) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({...formData, options: newOptions});
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({...formData, options: newOptions});
  };

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return <Navigate to="/auth" replace />;

  return (
    <div className="container px-4 py-12">
      <h1 className="text-3xl font-black mb-8">Manage Polls</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Create Poll</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Question</Label>
              <Input value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} required />
            </div>
            <div>
              <Label>Options</Label>
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input value={option} onChange={e => updateOption(index, e.target.value)} placeholder={`Option ${index + 1}`} />
                  {formData.options.length > 2 && (
                    <Button type="button" size="icon" variant="outline" onClick={() => removeOption(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                <Plus className="h-4 w-4 mr-1" /> Add Option
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
              <Label htmlFor="active">Active</Label>
            </div>
            <Button type="submit">Create Poll</Button>
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Existing Polls</h2>
          {polls.map(poll => {
            const totalVotes = Object.values(poll.results as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
            return (
              <div key={poll.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold">{poll.question}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActive(poll.id, poll.active)}
                      className={`text-xs px-2 py-1 rounded ${
                        poll.active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {poll.active ? 'Active' : 'Inactive'}
                    </button>
                    <Button size="icon" variant="destructive" onClick={() => handleDelete(poll.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="space-y-1">
                  {poll.options.map((option: string) => {
                    const votes = (poll.results as Record<string, number>)[option] || 0;
                    const percent = totalVotes > 0 ? (votes / totalVotes * 100).toFixed(0) : 0;
                    return (
                      <div key={option} className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span>{option}</span>
                          <span className="text-muted-foreground">{votes} ({percent}%)</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{totalVotes} total votes</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}