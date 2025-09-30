import { AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

interface AlertBoxProps {
  children: ReactNode;
  pulse?: boolean;
}

export const AlertBox = ({ children, pulse = false }: AlertBoxProps) => {
  return (
    <div className={`bg-alert text-alert-foreground rounded-lg p-4 flex items-start gap-3 ${pulse ? 'pulse-yellow' : ''}`}>
      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm font-medium">{children}</div>
    </div>
  );
};
