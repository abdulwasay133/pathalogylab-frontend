import React, { useEffect, useMemo, useState } from "react";
import Chart from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  Activity,
  Clock,
  FileText,
  FlaskConical,
  HandCoins,
  Stethoscope,
  Users,
} from "lucide-react";
import api from "api/axios";
import { chartOptions, parseOptions } from "variables/charts.js";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import {
  ChartCard,
  ChartCardContent,
  ChartCardHeader,
  ChartPlot,
  ChartSectionLabel,
  ChartSectionTitle,
} from "@/components/dashboard/DashboardCards";
import TopDoctorsPanel from "@/components/dashboard/TopDoctorsPanel";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STAT_CARDS = [
  {
    key: "total_patients",
    title: "Total Patients",
    icon: Users,
    accent: "patients",
  },
  {
    key: "total_invoices",
    title: "Total Invoices",
    icon: FileText,
    accent: "invoices",
    formatted: true,
  },
  {
    key: "commissions_paid",
    title: "Commissions Paid",
    icon: HandCoins,
    accent: "commissions",
    formatted: true,
  },
  {
    key: "tests_conducted",
    title: "Tests Conducted",
    icon: FlaskConical,
    accent: "tests",
  },
  {
    key: "active_doctors",
    title: "Active Doctors",
    icon: Stethoscope,
    accent: "doctors",
  },
  {
    key: "pending_reports",
    title: "Pending Reports",
    icon: Clock,
    accent: "pending",
  },
];

const CHART_TICK = "hsl(160 12% 42%)";
const CHART_GRID = "hsl(152 22% 88%)";

const chartLayout = {
  padding: { top: 0, right: 8, bottom: 0, left: 4 },
};

const revenueChartOptions = {
  layout: chartLayout,
  scales: {
    yAxes: [
      {
        gridLines: { color: "rgba(255,255,255,0.12)" },
        ticks: {
          fontColor: "rgba(255,255,255,0.75)",
          callback: (val) => "PKR " + val.toLocaleString(),
        },
      },
    ],
    xAxes: [
      {
        gridLines: { color: "rgba(255,255,255,0.06)" },
        ticks: { fontColor: "rgba(255,255,255,0.75)" },
      },
    ],
  },
  legend: { display: false },
  tooltips: {
    mode: "index",
    intersect: false,
    callbacks: {
      label: (item) => " PKR " + parseInt(item.value, 10).toLocaleString(),
    },
  },
  responsive: true,
  maintainAspectRatio: false,
};

const testsChartOptions = {
  layout: chartLayout,
  scales: {
    yAxes: [
      {
        gridLines: { color: CHART_GRID, zeroLineColor: CHART_GRID },
        ticks: {
          fontColor: CHART_TICK,
          beginAtZero: true,
          padding: 8,
          fontSize: 11,
        },
      },
    ],
    xAxes: [
      {
        gridLines: { display: false },
        ticks: {
          fontColor: CHART_TICK,
          maxRotation: 45,
          minRotation: 45,
          fontSize: 10,
          autoSkip: true,
          maxTicksLimit: 12,
        },
      },
    ],
  },
  legend: { display: false },
  tooltips: {
    mode: "index",
    intersect: false,
    backgroundColor: "rgba(6, 78, 59, 0.92)",
    titleFontColor: "#ecfdf5",
    bodyFontColor: "#ecfdf5",
    borderColor: "#14b8a6",
    borderWidth: 1,
  },
  responsive: true,
  maintainAspectRatio: false,
};

const patientGrowthOptions = {
  layout: {
    padding: { top: 0, right: 8, bottom: 0, left: 4 },
  },
  scales: {
    yAxes: [
      {
        gridLines: { color: CHART_GRID, zeroLineColor: CHART_GRID },
        ticks: {
          fontColor: CHART_TICK,
          beginAtZero: true,
          padding: 8,
          fontSize: 11,
        },
      },
    ],
    xAxes: [
      {
        gridLines: { display: false },
        ticks: { fontColor: CHART_TICK, fontSize: 11 },
      },
    ],
  },
  legend: {
    display: true,
    position: "bottom",
    labels: {
      fontColor: CHART_TICK,
      padding: 4,
      boxWidth: 8,
      usePointStyle: true,
      fontSize: 10,
    },
  },
  tooltips: {
    mode: "index",
    intersect: false,
    backgroundColor: "rgba(6, 78, 59, 0.92)",
    titleFontColor: "#ecfdf5",
    bodyFontColor: "#ecfdf5",
    borderColor: "#14b8a6",
    borderWidth: 1,
  },
  responsive: true,
  maintainAspectRatio: false,
};

function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[152px] rounded-xl border border-emerald-100/60" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-[260px] rounded-none xl:col-span-2" />
        <Skeleton className="h-[260px] rounded-none" />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-[260px] rounded-none xl:col-span-2" />
        <Skeleton className="h-[280px] rounded-xl" />
      </div>
    </div>
  );
}

const Index = () => {
  const [revenuePeriod, setRevenuePeriod] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [revenueChart, setRevenueChart] = useState(null);
  const [testsChart, setTestsChart] = useState(null);
  const [patientGrowth, setPatientGrowth] = useState(null);
  const [topDoctors, setTopDoctors] = useState([]);

  if (window.Chart) parseOptions(Chart, chartOptions());

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [statsRes, revenueRes, testsRes, growthRes, doctorsRes] =
          await Promise.all([
            api.get("/dashboard/stats"),
            api.get("/dashboard/revenue-chart"),
            api.get("/dashboard/tests-chart"),
            api.get("/dashboard/patient-growth"),
            api.get("/dashboard/top-doctors"),
          ]);

        setStats(statsRes.data.data);
        setRevenueChart(revenueRes.data.data);
        setTestsChart(testsRes.data.data);
        setPatientGrowth(growthRes.data.data);
        setTopDoctors(doctorsRes.data.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const revenueChartData = useMemo(() => {
    if (!revenueChart) return null;
    const isMonthly = revenuePeriod === "monthly";
    return {
      labels: isMonthly ? revenueChart.monthly.labels : revenueChart.weekly.labels,
      datasets: [
        {
          label: "Revenue (PKR)",
          data: isMonthly ? revenueChart.monthly.values : revenueChart.weekly.values,
          borderColor: "hsl(160 84% 45%)",
          backgroundColor: "rgba(16, 185, 129, 0.12)",
          borderWidth: 2,
          fill: true,
          pointBackgroundColor: "hsl(160 84% 45%)",
          tension: 0.4,
        },
      ],
    };
  }, [revenueChart, revenuePeriod]);

  const testsChartData = testsChart
    ? {
        labels: testsChart.labels,
        datasets: [
          {
            label: "Tests",
            data: testsChart.values,
            backgroundColor: "rgba(13, 148, 136, 0.85)",
            hoverBackgroundColor: "rgba(15, 118, 110, 0.95)",
            borderColor: "transparent",
            borderWidth: 0,
            borderRadius: 8,
            barThickness: "flex",
            maxBarThickness: 36,
          },
        ],
      }
    : null;

  const patientGrowthChartData = patientGrowth
    ? {
        labels: patientGrowth.labels,
        datasets: [
          {
            label: "New Patients",
            data: patientGrowth.new,
            borderColor: "#059669",
            backgroundColor: "rgba(5, 150, 105, 0.12)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#059669",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 4,
          },
          {
            label: "Returning Patients",
            data: patientGrowth.returning,
            borderColor: "#0d9488",
            backgroundColor: "rgba(13, 148, 136, 0.08)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#0d9488",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 4,
          },
        ],
      }
    : null;

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex justify-end">
        <Badge
          variant="secondary"
          className="w-fit gap-1.5 border-emerald-200/80 bg-emerald-50 text-emerald-800"
        >
          <Activity className="h-3.5 w-3.5" aria-hidden />
          Live data
        </Badge>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {STAT_CARDS.map(({ key, title, icon, accent, formatted }) => {
          const item = stats?.[key];
          const value = formatted
            ? item?.formatted ?? "—"
            : item?.value?.toLocaleString?.() ?? item?.value ?? "—";

          return (
            <DashboardStatCard
              key={key}
              title={title}
              value={value}
              subtitle={item?.subtitle}
              icon={icon}
              accent={accent}
              trend={item?.trend}
              trendUp={item?.trend_up}
            />
          );
        })}
      </div>

      {/* Revenue + tests */}
      <div className="grid items-start gap-4 xl:grid-cols-3">
        <ChartCard
          className="overflow-hidden border-0 text-white shadow-lg xl:col-span-2"
          style={{
            background:
              "linear-gradient(135deg, #064e3b 0%, #0f766e 45%, #14b8a6 100%)",
          }}
        >
          <ChartCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                Overview
              </p>
              <h3 className="text-base font-semibold text-white">Sales Revenue</h3>
            </div>
            <Tabs
              value={revenuePeriod}
              onValueChange={setRevenuePeriod}
              className="w-auto"
            >
              <TabsList className="bg-white/10 text-white/80 h-8">
                <TabsTrigger
                  value="monthly"
                  className="text-xs data-[state=active]:bg-white data-[state=active]:text-emerald-900"
                >
                  Monthly
                </TabsTrigger>
                <TabsTrigger
                  value="weekly"
                  className="text-xs data-[state=active]:bg-white data-[state=active]:text-emerald-900"
                >
                  Weekly
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </ChartCardHeader>
          <ChartCardContent>
            <ChartPlot tall>
              {revenueChartData && (
                <Line data={revenueChartData} options={revenueChartOptions} />
              )}
            </ChartPlot>
          </ChartCardContent>
        </ChartCard>

        <ChartCard>
          <ChartCardHeader>
            <ChartSectionLabel>Performance</ChartSectionLabel>
            <ChartSectionTitle>Tests Conducted</ChartSectionTitle>
          </ChartCardHeader>
          <ChartCardContent>
            <ChartPlot>
              {testsChartData && (
                <Bar data={testsChartData} options={testsChartOptions} />
              )}
            </ChartPlot>
          </ChartCardContent>
        </ChartCard>
      </div>

      {/* Patient growth + top doctors */}
      <div className="grid items-start gap-4 xl:grid-cols-3">
        <ChartCard className="xl:col-span-2">
          <ChartCardHeader>
            <ChartSectionLabel>Analytics</ChartSectionLabel>
            <ChartSectionTitle>Patient Growth</ChartSectionTitle>
          </ChartCardHeader>
          <ChartCardContent>
            <ChartPlot tall>
              {patientGrowthChartData && (
                <Line data={patientGrowthChartData} options={patientGrowthOptions} />
              )}
            </ChartPlot>
          </ChartCardContent>
        </ChartCard>

        <TopDoctorsPanel doctors={topDoctors} />
      </div>
    </div>
  );
};

export default Index;
