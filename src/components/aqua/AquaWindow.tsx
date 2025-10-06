import { ReactNode } from "react";
import { AquaTrafficLights } from "./AquaTrafficLights";

const HeadingElement = ({ level, className, children }: { level: string; className?: string; children: ReactNode }) => {
  const HeadingTag = level as keyof JSX.IntrinsicElements;
  return <HeadingTag className={className}>{children}</HeadingTag>;
};

type Props = {
  title?: string;
  toolbar?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
};

export const AquaWindow = ({ title, toolbar, footer, className, children, headingLevel = 'h2' }: Props) => {
  return (
    <div className={`aqua-card overflow-hidden ${className || ""}`}>
      {(title || toolbar) && (
        <div className="aqua-titlebar px-3 py-2 flex items-center gap-3 border-b border-aqua-border">
          <AquaTrafficLights />
          {title && (
            <HeadingElement 
              level={headingLevel}
              className="aqua-font font-semibold text-slate-800"
            >
              {title}
            </HeadingElement>
          )}
          <div className="ml-auto">{toolbar}</div>
        </div>
      )}
      <div className="bg-white/92 aqua-pinstripe">{children}</div>
      {footer && (
        <div className="px-3 py-2 border-t border-aqua-border bg-[#f4f7ff] text-xs text-slate-600">
          {footer}
        </div>
      )}
    </div>
  );
};
