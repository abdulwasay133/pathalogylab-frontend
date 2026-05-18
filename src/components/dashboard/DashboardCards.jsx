import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Graph / chart containers — square corners, compact padding */
export function ChartCard({ className, children, ...props }) {
  return (
    <Card
      className={cn(
        "rounded-none border-border bg-card shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}

export function ChartCardHeader({ className, ...props }) {
  return (
    <CardHeader
      className={cn("space-y-0.5 p-3 pb-1", className)}
      {...props}
    />
  );
}

export function ChartCardContent({ className, ...props }) {
  return (
    <CardContent className={cn("p-3 pt-0 pb-2", className)} {...props} />
  );
}

/** Fixed-height chart canvas — avoids empty stretch space */
export function ChartPlot({ className, children, tall = false, ...props }) {
  return (
    <div
      className={cn(
        "relative w-full [&_canvas]:!h-full [&_canvas]:!w-full",
        tall ? "h-[200px]" : "h-[180px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Non-chart panels (lists, tables) — rounded corners */
export function PanelCard({ className, children, ...props }) {
  return (
    <Card
      className={cn(
        "rounded-xl border-emerald-100/80 bg-card shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}

export function PanelCardHeader({ className, ...props }) {
  return <CardHeader className={cn("space-y-0.5 p-4 pb-2", className)} {...props} />;
}

export function PanelCardContent({ className, ...props }) {
  return <CardContent className={cn("p-4 pt-0 pb-4", className)} {...props} />;
}

export function ChartSectionLabel({ children, className }) {
  return (
    <p
      className={cn(
        "text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none",
        className
      )}
    >
      {children}
    </p>
  );
}

export function ChartSectionTitle({ children, className }) {
  return (
    <CardTitle className={cn("text-base font-semibold leading-tight text-foreground", className)}>
      {children}
    </CardTitle>
  );
}

export { CardDescription, CardTitle };
