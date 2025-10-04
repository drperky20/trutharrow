interface WindowControlsProps {
  className?: string;
}

export const WindowControls = ({ className = '' }: WindowControlsProps) => {
  return (
    <div className={`flex gap-2 ${className}`} aria-hidden="true">
      <span className="w-3 h-3 rounded-full bg-destructive opacity-80" />
      <span className="w-3 h-3 rounded-full bg-alert opacity-80" />
      <span className="w-3 h-3 rounded-full bg-success opacity-80" />
    </div>
  );
};

