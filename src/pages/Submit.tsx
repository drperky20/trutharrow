import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getFingerprint } from '@/lib/fingerprint';
import { submissionSchema, sanitizeInput } from '@/lib/validation';
import { z } from 'zod';

export default function Submit() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    what: '',
    when: '',
    verify: '',
    contact: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationErrors({});
    
    try {
      // Validate input
      const validatedData = submissionSchema.parse({
        title: sanitizeInput(formData.title),
        what: sanitizeInput(formData.what),
        when: sanitizeInput(formData.when),
        verify: sanitizeInput(formData.verify),
        contact: sanitizeInput(formData.contact),
      });

      const fingerprint = await getFingerprint();
      
      // Check rate limit
      const { data: rateLimitCheck, error: rateLimitError } = await supabase
        .rpc('check_submission_rate_limit', {
          p_user_id: user?.id || null,
          p_fingerprint: !user ? fingerprint : null,
        });

      if (rateLimitError) {
        throw new Error('Rate limit check failed');
      }

      const rateLimitData = rateLimitCheck as { allowed: boolean; message?: string } | null;

      if (!rateLimitData?.allowed) {
        toast({
          title: 'Rate limit exceeded',
          description: rateLimitData?.message || 'You can submit up to 5 submissions per hour.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      const { error } = await supabase.from('submissions').insert({
        title: validatedData.title,
        what: validatedData.what,
        when_where: validatedData.when || null,
        verify: validatedData.verify,
        contact: validatedData.contact || null,
        user_id: user?.id || null,
        fingerprint: !user ? fingerprint : null,
      });

      if (error) throw error;

      toast({
        title: 'Your homework is in.',
        description: "We'll grade it soon and follow up if we need clarification.",
        className: 'bg-alert text-alert-foreground border-alert',
      });
      
      setFormData({
        title: '',
        what: '',
        when: '',
        verify: '',
        contact: '',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setValidationErrors(errors);
        toast({
          title: 'Validation error',
          description: 'Please check your input and try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Submission failed',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-4">Drop Your Homework</h1>
        <p className="text-muted-foreground text-lg mb-4">
          Submit information anonymously. We verify before publishing.
        </p>
        <div className="bg-alert/10 border border-alert/30 rounded-lg p-4 text-sm">
          <p className="font-medium mb-2">Your submission is completely anonymous.</p>
          <p className="text-muted-foreground">
            We never store IP addresses or identifying info. Providing contact info is optional
            and only used if we need clarification.
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="Brief summary of the issue"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className={validationErrors.title ? 'border-destructive' : ''}
          />
          {validationErrors.title && (
            <p className="text-sm text-destructive">{validationErrors.title}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="what">What happened? *</Label>
          <Textarea
            id="what"
            placeholder="Describe the situation in detail. Include any relevant context."
            value={formData.what}
            onChange={(e) => setFormData({ ...formData, what: e.target.value })}
            rows={6}
            required
            className={validationErrors.what ? 'border-destructive' : ''}
          />
          {validationErrors.what && (
            <p className="text-sm text-destructive">{validationErrors.what}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="when">When and where?</Label>
          <Input
            id="when"
            placeholder="Date, time, location"
            value={formData.when}
            onChange={(e) => setFormData({ ...formData, when: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="evidence">Evidence (optional)</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              Documents, screenshots, photos, videos
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="verify">How can we verify this? *</Label>
          <Textarea
            id="verify"
            placeholder="Who else knows? Are there documents? Where can we look?"
            value={formData.verify}
            onChange={(e) => setFormData({ ...formData, verify: e.target.value })}
            rows={3}
            required
            className={validationErrors.verify ? 'border-destructive' : ''}
          />
          {validationErrors.verify && (
            <p className="text-sm text-destructive">{validationErrors.verify}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact">Contact (optional)</Label>
          <Input
            id="contact"
            type="email"
            placeholder="Email or Signal number (only for clarification)"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            className={validationErrors.contact ? 'border-destructive' : ''}
          />
          {validationErrors.contact && (
            <p className="text-sm text-destructive">{validationErrors.contact}</p>
          )}
          <p className="text-xs text-muted-foreground">
            We'll only reach out if we need to verify details. This is never published.
          </p>
        </div>
        
        <Button type="submit" size="lg" className="w-full font-bold" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Anonymously'}
        </Button>
      </form>
      
      <div className="mt-8 p-6 bg-card border border-border rounded-lg">
        <h3 className="font-bold mb-3">What happens next?</h3>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
          <li>We review your submission and verify the information</li>
          <li>If we need clarification, we'll reach out (only if you provided contact)</li>
          <li>Once verified, we publish it to the appropriate section</li>
          <li>You can track it on the site under your auto-generated alias</li>
        </ol>
      </div>
    </div>
  );
}
