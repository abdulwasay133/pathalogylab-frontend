import React, { useEffect, useState } from "react";
import classnames from "classnames";
import Chart from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Button, Card, CardHeader, CardBody,
  NavItem, NavLink, Nav, Progress,
  Table, Container, Row, Col,
} from "reactstrap";
import { chartOptions, parseOptions } from "variables/charts.js";
import Header from "components/Headers/Header.js";
import api from "api/axios";

// ─── Stat Card Component ──────────────────────────────────────────────────────
const StatCard = ({ title, value, subtitle, icon, iconBg, trend, trendUp }) => (
  <Card className="card-stats mb-4 mb-xl-0 shadow">
    <CardBody>
      <Row>
        <div className="col">
          <h5 className="card-title text-uppercase text-muted mb-0"
            style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>
            {title}
          </h5>
          <span className="h2 font-weight-bold mb-0">{value}</span>
          {subtitle && <p className="mt-2 mb-0 text-muted text-sm">{subtitle}</p>}
        </div>
        <Col className="col-auto">
          <div className={`icon icon-shape ${iconBg} text-white rounded-circle shadow`}
            style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className={icon} />
          </div>
        </Col>
      </Row>
      {trend && (
        <p className="mt-3 mb-0 text-muted text-sm">
          <span className={`text-${trendUp ? "success" : "danger"} mr-2`}>
            <i className={`fa fa-arrow-${trendUp ? "up" : "down"}`} /> {trend}
          </span>
          <span className="text-nowrap">vs last year</span>
        </p>
      )}
    </CardBody>
  </Card>
);

const LegendItem = ({ color, label, pct }) => (
  <div className="d-flex align-items-center mb-2">
    <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", background: color, marginRight: 8, flexShrink: 0 }} />
    <span className="text-sm text-muted flex-grow-1">{label}</span>
    <span className="text-sm font-weight-bold">{pct}%</span>
  </div>
);

// ─── Chart options (static) ───────────────────────────────────────────────────
const revenueChartOptions = {
  scales: {
    yAxes: [{ gridLines: { color: "rgba(255,255,255,0.1)" }, ticks: { fontColor: "rgba(255,255,255,0.7)", callback: (val) => "PKR " + val.toLocaleString() } }],
    xAxes: [{ gridLines: { color: "rgba(255,255,255,0.05)" }, ticks: { fontColor: "rgba(255,255,255,0.7)" } }],
  },
  legend: { display: false },
  tooltips: { mode: "index", intersect: false, callbacks: { label: (item) => " PKR " + parseInt(item.value).toLocaleString() } },
  responsive: true,
  maintainAspectRatio: false,
};

const testsChartOptions = {
  scales: {
    yAxes: [{ gridLines: { color: "rgba(0,0,0,0.05)" }, ticks: { fontColor: "#8898aa" } }],
    xAxes: [{ gridLines: { display: false }, ticks: { fontColor: "#8898aa" } }],
  },
  legend: { display: false },
  tooltips: { mode: "index", intersect: false },
  responsive: true,
  maintainAspectRatio: false,
};

const patientGrowthOptions = {
  scales: {
    yAxes: [{ gridLines: { color: "rgba(0,0,0,0.05)" }, ticks: { fontColor: "#8898aa" } }],
    xAxes: [{ gridLines: { display: false }, ticks: { fontColor: "#8898aa" } }],
  },
  legend: { display: true, position: "bottom", labels: { fontColor: "#8898aa", padding: 20 } },
  tooltips: { mode: "index", intersect: false },
  responsive: true,
  maintainAspectRatio: false,
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Index = (props) => {
  const [activeNav, setActiveNav]         = useState(1);
  const [loading, setLoading]             = useState(true);

  // Stats state
  const [stats, setStats]                 = useState(null);

  // Chart states
  const [revenueChart, setRevenueChart]   = useState(null);
  const [testsChart, setTestsChart]       = useState(null);
  const [patientGrowth, setPatientGrowth] = useState(null);

  // Table states
  const [recentTests, setRecentTests]     = useState([]);
  const [topDoctors, setTopDoctors]       = useState([]);

  if (window.Chart) parseOptions(Chart, chartOptions());

  // ── Fetch all dashboard data ──────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [statsRes, revenueRes, testsRes, growthRes, recentRes, doctorsRes] =
          await Promise.all([
            api.get("/dashboard/stats"),
            api.get("/dashboard/revenue-chart"),
            api.get("/dashboard/tests-chart"),
            api.get("/dashboard/patient-growth"),
            api.get("/dashboard/recent-tests"),
            api.get("/dashboard/top-doctors"),
          ]);

        setStats(statsRes.data.data);
        setRevenueChart(revenueRes.data.data);
        setTestsChart(testsRes.data.data);
        setPatientGrowth(growthRes.data.data);
        setRecentTests(recentRes.data.data);
        setTopDoctors(doctorsRes.data.data);
        console.log("Dashboard data:", statsRes.data.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ── Build chart data from API ─────────────────────────────────────────
  const revenueChartData = revenueChart
    ? {
        labels: activeNav === 1 ? revenueChart.monthly.labels : revenueChart.weekly.labels,
        datasets: [{
          label: "Revenue (PKR)",
          data: activeNav === 1 ? revenueChart.monthly.values : revenueChart.weekly.values,
          borderColor: "#2dce89",
          backgroundColor: "rgba(45, 206, 137, 0.1)",
          borderWidth: 2,
          fill: true,
          pointBackgroundColor: "#2dce89",
          tension: 0.4,
        }],
      }
    : null;

  const testsChartData = testsChart
    ? {
        labels: testsChart.labels,
        datasets: [{
          label: "Tests",
          data: testsChart.values,
          backgroundColor: "rgba(94, 114, 228, 0.85)",
          borderRadius: 4,
        }],
      }
    : null;

  const patientGrowthChartData = patientGrowth
    ? {
        labels: patientGrowth.labels,
        datasets: [
          {
            label: "New Patients",
            data: patientGrowth.new,
            borderColor: "#fb6340",
            backgroundColor: "rgba(251, 99, 64, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#fb6340",
            pointRadius: 5,
          },
          {
            label: "Returning Patients",
            data: patientGrowth.returning,
            borderColor: "#ffd600",
            backgroundColor: "rgba(255, 214, 0, 0.05)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#ffd600",
            pointRadius: 5,
          },
        ],
      }
    : null;

  if (loading) {
    return (
      <>
        <Header />
        <Container className="mt--7" fluid>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading dashboard...</p>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>

        {/* ── Row 1: Stat Cards ── */}
        <Row className="mb-4">
          <Col lg="6" xl="4" className="mb-4 mb-xl-0">
            <StatCard
              title="Total Patients"
              value={stats?.total_patients?.value?.toLocaleString() ?? "-"}
              subtitle={stats?.total_patients?.subtitle}
              icon="fas fa-user-injured"
              iconBg="bg-gradient-primary"
              trend={stats?.total_patients?.trend}
              trendUp={stats?.total_patients?.trend_up}
            />
          </Col>
          <Col lg="6" xl="4" className="mb-4 mb-xl-0">
            <StatCard
              title="Total Invoices"
              value={stats?.total_invoices?.formatted ?? "-"}
              subtitle={stats?.total_invoices?.subtitle}
              icon="fas fa-file-invoice-dollar"
              iconBg="bg-gradient-success"
              trend={stats?.total_invoices?.trend}
              trendUp={stats?.total_invoices?.trend_up}
            />
          </Col>
          <Col lg="6" xl="4" className="mb-4 mb-xl-0">
            <StatCard
              title="Commissions Paid"
              value={stats?.commissions_paid?.formatted ?? "-"}
              subtitle={stats?.commissions_paid?.subtitle}
              icon="fas fa-hand-holding-usd"
              iconBg="bg-gradient-warning"
              trend={stats?.commissions_paid?.trend}
              trendUp={stats?.commissions_paid?.trend_up}
            />
          </Col>
        </Row>

        {/* ── Row 2: Stat Cards ── */}
        <Row className="mb-5">
          <Col lg="6" xl="4" className="mb-4 mb-xl-0">
            <StatCard
              title="Tests Conducted"
              value={stats?.tests_conducted?.value?.toLocaleString() ?? "-"}
              subtitle={stats?.tests_conducted?.subtitle}
              icon="fas fa-vials"
              iconBg="bg-gradient-info"
              trend={stats?.tests_conducted?.trend}
              trendUp={stats?.tests_conducted?.trend_up}
            />
          </Col>
          <Col lg="6" xl="4" className="mb-4 mb-xl-0">
            <StatCard
              title="Active Doctors"
              value={stats?.active_doctors?.value ?? "-"}
              subtitle={stats?.active_doctors?.subtitle}
              icon="fas fa-user-md"
              iconBg="bg-gradient-danger"
              trend={stats?.active_doctors?.trend}
              trendUp={stats?.active_doctors?.trend_up}
            />
          </Col>
          <Col lg="6" xl="4" className="mb-4 mb-xl-0">
            <StatCard
              title="Pending Reports"
              value={stats?.pending_reports?.value ?? "-"}
              subtitle={stats?.pending_reports?.subtitle}
              icon="fas fa-clock"
              iconBg="bg-gradient-default"
              trend={stats?.pending_reports?.trend}
              trendUp={stats?.pending_reports?.trend_up}
            />
          </Col>
        </Row>

        {/* ── Sales Revenue + Tests Bar ── */}
        <Row className="mb-5">
          <Col className="mb-5 mb-xl-0" xl="8">
            <Card className="bg-gradient-default shadow" style={{ minHeight: 380 }}>
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-light ls-1 mb-1" style={{ fontSize: "0.7rem" }}>Overview</h6>
                    <h2 className="text-white mb-0">Sales Revenue</h2>
                  </div>
                  <div className="col">
                    <Nav className="justify-content-end" pills>
                      <NavItem>
                        <NavLink className={classnames("py-2 px-3", { active: activeNav === 1 })}
                          href="#" onClick={(e) => { e.preventDefault(); setActiveNav(1); }}>
                          <span className="d-none d-md-block">Monthly</span>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink className={classnames("py-2 px-3", { active: activeNav === 2 })}
                          href="#" onClick={(e) => { e.preventDefault(); setActiveNav(2); }}>
                          <span className="d-none d-md-block">Weekly</span>
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: 280 }}>
                  {revenueChartData && (
                    <Line data={revenueChartData} options={revenueChartOptions} />
                  )}
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xl="4">
            <Card className="shadow" style={{ minHeight: 380 }}>
              <CardHeader className="bg-transparent">
                <h6 className="text-uppercase text-muted ls-1 mb-1" style={{ fontSize: "0.7rem" }}>Performance</h6>
                <h2 className="mb-0">Tests Conducted</h2>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: 280 }}>
                  {testsChartData && (
                    <Bar data={testsChartData} options={testsChartOptions} />
                  )}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ── Patient Growth ── */}
        <Row className="mb-5">
          <Col xl="8">
            <Card className="shadow" style={{ minHeight: 360 }}>
              <CardHeader className="bg-transparent border-0">
                <h6 className="text-uppercase text-muted ls-1 mb-1" style={{ fontSize: "0.7rem" }}>Analytics</h6>
                <h2 className="mb-0">Patient Growth</h2>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: 260 }}>
                  {patientGrowthChartData && (
                    <Line data={patientGrowthChartData} options={patientGrowthOptions} />
                  )}
                </div>
              </CardBody>
            </Card>
          </Col>
                    <Col xl="4">
            <Card className="shadow">
              <CardHeader className="border-0">
                <h3 className="mb-0">Top Doctors</h3>
              </CardHeader>
              <CardBody>
                {topDoctors.map((doc, i) => (
                  <div key={i} className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div>
                        <span className="font-weight-bold text-sm">{doc.name}</span>
                        <br />
                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>{doc.specialty}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-weight-bold text-success">{doc.commission}</span>
                        <br />
                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>{doc.referrals} referrals</span>
                      </div>
                    </div>
                    <Progress max="100" value={doc.progress} barClassName={doc.color} style={{ height: 6, borderRadius: 4 }} />
                  </div>
                ))}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ── Recent Tests + Top Doctors ── */}


      </Container>
    </>
  );
};

export default Index;