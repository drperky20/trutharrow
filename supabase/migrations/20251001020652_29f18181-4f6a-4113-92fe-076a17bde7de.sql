-- Drop the remaining trigger that forces pending status
DROP TRIGGER IF EXISTS trigger_force_pending ON posts;

-- Drop the function if it still exists
DROP FUNCTION IF EXISTS force_pending_status();