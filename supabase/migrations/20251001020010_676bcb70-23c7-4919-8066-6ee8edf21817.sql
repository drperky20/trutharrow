-- Drop the trigger that forces all posts to pending status
DROP TRIGGER IF EXISTS force_pending_status_trigger ON posts;

-- Update the function to only handle alias validation, not force pending status
CREATE OR REPLACE FUNCTION public.validate_post_alias()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Ensure alias is not empty
  NEW.alias := NULLIF(TRIM(NEW.alias), '');
  IF NEW.alias IS NULL THEN
    NEW.alias := 'Anonymous';
  END IF;
  RETURN NEW;
END;
$function$;

-- Create new trigger for alias validation only
CREATE TRIGGER validate_post_alias_trigger
  BEFORE INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION validate_post_alias();