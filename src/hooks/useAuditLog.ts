import { supabase } from '@/integrations/supabase/client';

export const useAuditLog = () => {
  const logAction = async (
    action: string,
    tableName?: string,
    recordId?: string,
    oldData?: any,
    newData?: any
  ) => {
    try {
      await supabase.rpc('log_audit_event', {
        p_action: action,
        p_table_name: tableName || null,
        p_record_id: recordId || null,
        p_old_data: oldData || null,
        p_new_data: newData || null
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  };

  return { logAction };
};
