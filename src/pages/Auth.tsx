import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { AquaWindow } from '@/components/aqua/AquaWindow';
import { AquaButton } from '@/components/aqua/AquaButton';
import { authSchema } from '@/lib/validation';
import { z } from 'zod';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors({});

    try {
      const validatedData = authSchema.parse({ email, password });

      const { error } = isLogin 
        ? await signIn(validatedData.email, validatedData.password)
        : await signUp(validatedData.email, validatedData.password);

      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('already registered')) {
          errorMessage = 'This email is already registered. Please sign in or use a different email.';
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: isLogin ? "Logged in" : "Account created",
          description: isLogin ? "Welcome back!" : "Account created successfully!",
        });
        navigate('/');
      }
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
          description: Object.values(errors)[0] || 'Please check your input.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <AquaWindow 
        title={isLogin ? 'Sign In' : 'Sign Up'} 
        className="w-full max-w-md"
      >
        <div className="p-6">
          <p className="text-slate-600 mb-6 aqua-font">
            {isLogin ? 'Welcome back to TruthArrow' : 'Join the movement'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="aqua-font text-slate-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`mt-1 aqua-bevel ${validationErrors.email ? 'border-destructive' : ''}`}
              />
              {validationErrors.email && (
                <p className="text-sm text-destructive mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="aqua-font text-slate-700">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={`mt-1 aqua-bevel ${validationErrors.password ? 'border-destructive' : ''}`}
              />
              {validationErrors.password && (
                <p className="text-sm text-destructive mt-1">{validationErrors.password}</p>
              )}
              {!isLogin && (
                <p className="text-xs text-slate-600 mt-1">
                  Must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              )}
            </div>

            <AquaButton
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
            </AquaButton>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm aqua-font text-slate-600 hover:text-slate-800 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </AquaWindow>
    </div>
  );
}