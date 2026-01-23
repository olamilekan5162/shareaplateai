import { Button } from "./Button";
import { cn } from "../lib/utils";
import { FiInbox } from "react-icons/fi";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = FiInbox,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      <div className="bg-gray-50 p-4 rounded-full mb-4">
        <Icon className="h-8 w-8 text-neutral-muted" />
      </div>
      <h3 className="text-lg font-medium text-neutral-text">{title}</h3>
      <p className="text-sm text-neutral-muted mt-2 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button onClick={onAction} variant="primary">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
