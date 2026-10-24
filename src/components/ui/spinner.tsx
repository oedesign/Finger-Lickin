type SpinnerProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-9 border-[3px]",
} as const;

export function Spinner({
  className = "",
  label = "Loading",
  size = "md",
}: SpinnerProps) {
  return (
    <span
      aria-label={label}
      className={`border-brand-200 border-t-brand-700 inline-block animate-spin rounded-full motion-reduce:animate-none ${sizeClasses[size]} ${className}`.trim()}
      role="status"
    />
  );
}
