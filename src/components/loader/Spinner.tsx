import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export const Spinner = ({ size = 24, className = "", label }: SpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2
        size={size}
        className={`animate-spin text-emerald-600 ${className}`}
      />
      {label && <span className="text-sm text-gray-500">{label}</span>}
    </div>
  );
};
