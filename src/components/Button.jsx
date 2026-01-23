import { cn } from "../lib/utils";

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}) {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark shadow-sm",
    outline: "border-2 border-primary text-primary hover:bg-primary/10",
    ghost: "text-neutral-muted hover:text-primary hover:bg-neutral-bg",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    icon: "p-2",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
