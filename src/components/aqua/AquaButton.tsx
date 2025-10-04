import { ButtonHTMLAttributes } from "react";

export const AquaButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { className="", ...rest } = props;
  return (
    <button
      {...rest}
      className={`aqua-font aqua-pressable rounded-full px-4 py-2 border
        border-[#aab4d0] shadow-[0_1px_0_rgba(255,255,255,.9)_inset,0_2px_6px_rgba(0,0,0,.12)]
        bg-gradient-to-b from-white to-[#e6ecf9] hover:to-[#dfe6fb] active:to-[#d4dbf7]
        text-slate-700 transition-all duration-150 focus:ring-2 focus:ring-[#2563eb] 
        disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    />
  );
};
