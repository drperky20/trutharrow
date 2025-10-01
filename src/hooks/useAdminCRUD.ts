import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';

interface CRUDOptions<T> {
  table: string;
  orderBy?: { column: string; ascending?: boolean };
  realtime?: boolean;
  onInsert?: (record: T) => void;
  onUpdate?: (record: T) => void;
  onDelete?: (record: { id: string }) => void;
}

export const useAdminCRUD = <T extends { id: string }>({
  table,
  orderBy = { column: 'created_at', ascending: false },
  realtime = false,
  onInsert,
  onUpdate,
  onDelete,
}: CRUDOptions<T>) => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { logAction } = useAuditLog();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      // @ts-expect-error - Dynamic table name
      let query = supabase.from(table).select('*');
      
      if (orderBy) {
        query = query.order(orderBy.column as any, { ascending: orderBy.ascending ?? false });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setItems((data as any as T[]) || []);
    } catch (error) {
      console.error(`Error fetching ${table}:`, error);
      toast({
        title: 'Error',
        description: `Failed to load ${table}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [table, orderBy.column, orderBy.ascending]);

  useEffect(() => {
    fetchItems();

    if (!realtime) return;

    // Set up real-time subscription
    const channel = supabase
      .channel(`${table}-admin`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table },
        (payload) => {
          const newRecord = payload.new as T;
          setItems((curr) => [newRecord, ...curr]);
          onInsert?.(newRecord);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table },
        (payload) => {
          const updated = payload.new as T;
          setItems((curr) => curr.map((item) => (item.id === updated.id ? updated : item)));
          onUpdate?.(updated);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table },
        (payload) => {
          const deleted = payload.old as { id: string };
          setItems((curr) => curr.filter((item) => item.id !== deleted.id));
          onDelete?.(deleted);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, realtime]);

  const create = async (data: Partial<T>) => {
    try {
      // @ts-expect-error - Dynamic table name
      const { error } = await supabase.from(table).insert(data as any);
      
      if (error) throw error;
      
      await logAction(`Created ${table} record`, table as any, undefined, null, data as any);
      
      toast({ title: 'Success', description: 'Record created successfully' });
      
      if (!realtime) await fetchItems();
      
      return true;
    } catch (error) {
      console.error(`Error creating ${table}:`, error);
      toast({
        title: 'Error',
        description: 'Failed to create record',
        variant: 'destructive',
      });
      return false;
    }
  };

  const update = async (id: string, data: Partial<T>) => {
    try {
      const oldRecord = items.find((item) => item.id === id);
      
      // @ts-expect-error - Dynamic table name
      const { error } = await supabase.from(table).update(data as any).eq('id', id);
      
      if (error) throw error;
      
      await logAction(`Updated ${table} record`, table as any, id, oldRecord as any, data as any);
      
      toast({ title: 'Success', description: 'Record updated successfully' });
      
      if (!realtime) await fetchItems();
      
      return true;
    } catch (error) {
      console.error(`Error updating ${table}:`, error);
      toast({
        title: 'Error',
        description: 'Failed to update record',
        variant: 'destructive',
      });
      return false;
    }
  };

  const remove = async (id: string) => {
    try {
      // @ts-expect-error - Dynamic table name
      const { error } = await supabase.from(table).delete().eq('id', id);
      
      if (error) throw error;
      
      await logAction(`Deleted ${table} record`, table as any, id, null, null);
      
      toast({ title: 'Success', description: 'Record deleted successfully' });
      
      if (!realtime) await fetchItems();
      
      return true;
    } catch (error) {
      console.error(`Error deleting ${table}:`, error);
      toast({
        title: 'Error',
        description: 'Failed to delete record',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    items,
    loading,
    create,
    update,
    remove,
    refetch: fetchItems,
  };
};

