import { Card, CardContent } from "./Card";
import { cn } from "../lib/utils";

export function StatCard({ title, value, icon: Icon, trend, className }) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-muted">{title}</p>
            <h4 className="text-2xl font-bold mt-2 text-neutral-text">
              {value}
            </h4>
          </div>
          {Icon && (
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Icon size={24} />
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <span
              className={cn(
                "font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-neutral-muted ml-2">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
