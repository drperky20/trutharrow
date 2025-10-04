import { AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

interface AlertBoxProps {
  children: ReactNode;
  pulse?: boolean;
}

export const AlertBox = ({ children, pulse = false }: AlertBoxProps) => {
  return (
    <div className={`aqua-card bg-gradient-to-b from-[#fffbea] to-[#fef3c7] border-[#f59e0b] p-4 flex items-start gap-3 ${pulse ? 'pulse-yellow' : ''}`}>
      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-[#f59e0b]" />
      <div className="flex-1 text-sm font-medium text-slate-800 aqua-font">{children}</div>
    </div>
  );
};
