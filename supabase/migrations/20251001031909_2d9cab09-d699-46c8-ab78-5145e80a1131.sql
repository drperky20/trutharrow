-- Comprehensive Poll Voting Privacy Protection

-- Remove the insufficient policy
DROP POLICY IF EXISTS "Admins can manage poll data aggregates only" ON public.poll_votes;

-- Create a policy that completely blocks direct access to individual votes
-- No one should be able to SELECT individual vote records
CREATE POLICY "No direct vote access"
ON public.poll_votes
FOR SELECT
USING (FALSE); -- Completely block direct SELECT access

-- Votes can only be inserted (already has policy "Anyone can insert votes")
-- Votes can only be counted via the aggregate results in the polls table
-- Admins can view aggregated results in polls.results, but not individual votes

-- Add comment for documentation
COMMENT ON TABLE public.poll_votes IS 'Individual votes are private. Access vote counts only through polls.results aggregates.';