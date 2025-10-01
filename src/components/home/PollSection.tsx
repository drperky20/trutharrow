import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getFingerprint } from '@/lib/fingerprint';

interface PollSectionProps {
  poll: any;
}

export const PollSection = ({ poll }: PollSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [currentPoll, setCurrentPoll] = useState(poll);

  useEffect(() => {
    if (poll) {
      setCurrentPoll(poll);
      checkIfVoted();
    }
  }, [poll, user]);

  const checkIfVoted = async () => {
    if (!poll) return;
    
    const fingerprint = getFingerprint();
    const { data } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', poll.id)
      .or(user ? `user_id.eq.${user.id}` : `fingerprint.eq.${fingerprint}`)
      .maybeSingle();
    
    setHasVoted(!!data);
  };

  const handleVote = async (option: string, optionIndex: number) => {
    if (!currentPoll || voting || hasVoted) return;
    
    setVoting(true);
    const fingerprint = getFingerprint();
    
    // Optimistic update
    const updatedResults = { ...currentPoll.results, [optionIndex]: (currentPoll.results[optionIndex] || 0) + 1 };
    setCurrentPoll({ ...currentPoll, results: updatedResults });
    setHasVoted(true);
    
    const { data, error } = await supabase.rpc('vote_on_poll_safe', {
      p_poll_id: currentPoll.id,
      p_option_index: optionIndex,
      p_user_id: user?.id || null,
      p_fingerprint: user ? null : fingerprint
    });
    
    const result = data as { success: boolean; message?: string } | null;
    
    if (error || !result?.success) {
      // Revert on error
      const revertedResults = { ...currentPoll.results, [optionIndex]: Math.max((currentPoll.results[optionIndex] || 0) - 1, 0) };
      setCurrentPoll({ ...currentPoll, results: revertedResults });
      setHasVoted(false);
      
      toast({
        title: "Already voted",
        description: "You've already voted on this poll.",
        variant: "destructive",
      });
    }
    
    setVoting(false);
  };

  if (!currentPoll) return null;

  const totalVotes = Object.values(currentPoll.results as Record<string, number>).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-xl font-bold mb-6">{currentPoll.question}</h3>
        <div className="space-y-4">
          {currentPoll.options.map((option: string, index: number) => {
            const count = currentPoll.results[index] || 0;
            const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
            
            return (
              <button
                key={option}
                onClick={() => handleVote(option, index)}
                disabled={hasVoted || voting}
                className="w-full text-left group disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium group-hover:text-primary transition-colors group-disabled:opacity-50">
                    {option}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {count} votes ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </button>
            );
          })}
        </div>
        {hasVoted && (
          <p className="text-xs text-muted-foreground mt-2">
            ✓ You've already voted on this poll
          </p>
        )}
      <p className="text-xs text-muted-foreground mt-4">
        Total votes: {totalVotes}
      </p>
    </div>
  );
};
