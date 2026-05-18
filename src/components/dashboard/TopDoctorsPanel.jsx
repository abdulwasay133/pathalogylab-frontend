import { Progress } from "@/components/ui/progress";
import {
  PanelCard,
  PanelCardContent,
  PanelCardHeader,
} from "@/components/dashboard/DashboardCards";
import { CardDescription, CardTitle } from "@/components/ui/card";

const BAR_COLORS = [
  "bg-emerald-600",
  "bg-teal-600",
  "bg-green-600",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-green-500",
];

export default function TopDoctorsPanel({ doctors = [] }) {
  return (
    <PanelCard>
      <PanelCardHeader>
        <CardTitle className="text-lg">Top Doctors</CardTitle>
        <CardDescription>By referrals and commission</CardDescription>
      </PanelCardHeader>
      <PanelCardContent className="space-y-4">
        {doctors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No doctor data yet.</p>
        ) : (
          doctors.map((doc, i) => (
            <div
              key={doc.id ?? i}
              className="rounded-lg border border-border/60 bg-muted/30 p-3"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-xs font-bold text-emerald-800">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {doc.name}
                    </p>
                    {doc.specialty && (
                      <p className="truncate text-xs text-muted-foreground">
                        {doc.specialty}
                      </p>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-emerald-700">
                    {doc.commission}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {doc.referrals} referral{doc.referrals !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <Progress
                value={doc.progress}
                className="h-2 bg-emerald-100/80"
                indicatorClassName={BAR_COLORS[i % BAR_COLORS.length]}
              />
            </div>
          ))
        )}
      </PanelCardContent>
    </PanelCard>
  );
}
