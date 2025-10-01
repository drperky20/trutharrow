-- Remove the default value from status column
-- This allows the application to control the status directly
ALTER TABLE posts 
ALTER COLUMN status DROP DEFAULT;