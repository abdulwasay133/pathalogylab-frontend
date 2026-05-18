import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Green-family accents — distinct but on-brand for medical LIMS */
const ACCENTS = {
  patients: {
    stripe: "from-emerald-500 to-emerald-400",
    iconWrap: "bg-gradient-to-br from-emerald-50 to-emerald-100/80 ring-emerald-200/60",
    icon: "text-emerald-700",
  },
  invoices: {
    stripe: "from-teal-500 to-emerald-400",
    iconWrap: "bg-gradient-to-br from-teal-50 to-emerald-50 ring-teal-200/60",
    icon: "text-teal-700",
  },
  commissions: {
    stripe: "from-green-600 to-teal-500",
    iconWrap: "bg-gradient-to-br from-green-50 to-teal-50 ring-green-200/60",
    icon: "text-green-700",
  },
  tests: {
    stripe: "from-teal-600 to-cyan-500",
    iconWrap: "bg-gradient-to-br from-teal-50 to-cyan-50/80 ring-teal-200/60",
    icon: "text-teal-800",
  },
  doctors: {
    stripe: "from-emerald-600 to-green-500",
    iconWrap: "bg-gradient-to-br from-emerald-50 to-green-50 ring-emerald-200/60",
    icon: "text-emerald-800",
  },
  pending: {
    stripe: "from-slate-400 to-emerald-400",
    iconWrap: "bg-gradient-to-br from-slate-50 to-emerald-50/50 ring-slate-200/80",
    icon: "text-slate-600",
  },
};

function TrendPill({ trend, trendUp }) {
  if (trend == null || trend === "") return null;

  const positive = trendUp !== false;

  return (
    <div
      className={cn(
        "mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border/60 pt-4"
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
          positive
            ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80"
            : "bg-amber-50 text-amber-800 ring-1 ring-amber-200/80"
        )}
      >
        {positive ? (
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />
        )}
        {trend}
      </span>
      <span className="text-xs text-muted-foreground">vs last year</span>
    </div>
  );
}

export default function DashboardStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "patients",
  trend,
  trendUp,
}) {
  const a = ACCENTS[accent] || ACCENTS.patients;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-emerald-100/80 bg-card",
        "shadow-sm transition-all duration-200",
        "hover:border-emerald-200 hover:shadow-md"
      )}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-1 bg-gradient-to-b opacity-90 transition-opacity group-hover:opacity-100",
          a.stripe
        )}
        aria-hidden
      />

      <CardContent className="p-5 pl-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums sm:text-[1.65rem]">
              {value}
            </p>
            {subtitle && (
              <p className="text-sm leading-snug text-muted-foreground">{subtitle}</p>
            )}
          </div>

          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
              a.iconWrap
            )}
          >
            <Icon className={cn("h-5 w-5", a.icon)} aria-hidden />
          </div>
        </div>

        <TrendPill trend={trend} trendUp={trendUp} />
      </CardContent>
    </Card>
  );
}

export { ACCENTS };
