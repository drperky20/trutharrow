import { ReactNode } from "react";
import { AquaTrafficLights } from "./AquaTrafficLights";

type Props = {
  title?: string;
  toolbar?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
};

export const AquaWindow = ({ title, toolbar, footer, className, children }: Props) => {
  return (
    <div className={`aqua-card overflow-hidden ${className || ""}`}>
      {(title || toolbar) && (
        <div className="aqua-titlebar px-3 py-2 flex items-center gap-3 border-b border-aqua-border">
          <AquaTrafficLights />
          {title && <div className="aqua-font font-semibold text-slate-800">{title}</div>}
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
