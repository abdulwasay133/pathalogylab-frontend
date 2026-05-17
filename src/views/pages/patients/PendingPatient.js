import api from "api/axios";
import PatientTestsModal from "components/PatientTestsModal";
import { useEffect, useMemo, useState } from "react";
import { PageToolbarCard, searchInputStyle } from "components/layout/PageShell";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import T from "theme/tokens";
import { btnPrimary, btnGhost } from "theme/formStyles";
import { getVariant } from "theme/pageVariants";

const PATIENTS_PER_PAGE = 8;

/* ── info row inside patient card ── */
const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
    <span style={{ fontSize: 11, fontWeight: 700, color: T.colors.textMuted, minWidth: 52, textTransform: "uppercase", letterSpacing: 0.3, paddingTop: 1 }}>
      {label}
    </span>
    <span style={{ fontSize: 13, color: T.colors.text, fontWeight: 500 }}>
      {value || "—"}
    </span>
  </div>
);

/* ═══════════════════════════════════════ */

export default function PendingPatients() {
  const [patients, setPatients]             = useState([]);
  const [loading, setLoading]               = useState(false);
  const [search, setSearch]                 = useState("");
  const [page, setPage]                     = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalOpen, setModalOpen]           = useState(false);
  const [autoRefresh, setAutoRefresh]       = useState(false);
  const [secondsLeft, setSecondsLeft]       = useState(300);

  /* ── fetch ── */
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get("/patients");
      setPatients(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  /* ── auto-refresh ── */
  useEffect(() => {
    if (!autoRefresh) return;
    setSecondsLeft(300);
    const fetchInterval = setInterval(() => {
      fetchPatients();
      setSecondsLeft(300);
    }, 300000);
    const countdown = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => { clearInterval(fetchInterval); clearInterval(countdown); };
  }, [autoRefresh]);

  /* ── filter + paginate ── */
  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter((p) =>
      (p.name?.toLowerCase() || "").includes(q) ||
      (p.phone || "").includes(search) ||
      String(p.id).includes(search)
    );
  }, [patients, search]);

  const totalPages       = Math.ceil(filteredPatients.length / PATIENTS_PER_PAGE);
  const paginatedPatients = useMemo(() => {
    const start = (page - 1) * PATIENTS_PER_PAGE;
    return filteredPatients.slice(start, start + PATIENTS_PER_PAGE);
  }, [filteredPatients, page]);

  const fmtTime = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  /* ── render ── */
  return (
    <>
      <div className="header bg-gradient-warning pb-8 pt-5 pt-md-8" />

      <Container className="mt--9" fluid>

        {/* ── Top bar ── */}
        <Row className="mb-4">
          <Col>
            <PageToolbarCard>
                <div className="d-flex align-items-center justify-content-between flex-wrap" style={{ gap: 12 }}>

                  {/* title */}
                  <div className="d-flex align-items-center" style={{ gap: 10 }}>
                    <span style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: getVariant("warning").gradient,
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 18,
                    }}><i className="fa-solid fa-user text-white"></i></span>
                    <div>
                      <h3 className="mb-0 lims-page-title">Pending Patients</h3>
                      <p className="mb-0 lims-page-subtitle">
                        Patients awaiting test results
                      </p>
                    </div>
                  </div>

                  {/* right controls */}
                  <div className="d-flex align-items-center flex-wrap" style={{ gap: 10 }}>

                    {/* search */}
                    <div style={{ position: "relative" }}>
                      <span style={{
                        position: "absolute", left: 11, top: "50%",
                        transform: "translateY(-50%)", fontSize: 14, color: "#adb5bd",
                        pointerEvents: "none",
                      }}><i className="fa-solid fa-magnifying-glass"></i></span>
                      <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search name / phone / ID"
                        className="lims-search-input"
                        style={{ ...searchInputStyle, width: 240 }}
                      />
                    </div>

                    {/* total badge */}
                    <span style={{
                      background: "#fff8f0", color: "#fb6340",
                      border: "1px solid #ffd4c0", borderRadius: 999,
                      fontSize: 12, fontWeight: 700, padding: "5px 12px",
                    }}>
                      {filteredPatients.length} Patient{filteredPatients.length !== 1 ? "s" : ""}
                    </span>

                    {/* auto-refresh toggle */}
                    <button
                      onClick={() => setAutoRefresh((v) => !v)}
                      style={{
                        borderRadius: 8, border: "none", fontWeight: 600, fontSize: 12,
                        padding: "7px 14px", cursor: "pointer",
                        background: autoRefresh
                          ? "linear-gradient(135deg,#f5365c,#f56036)"
                          : "linear-gradient(135deg,#2dce89,#2dcecc)",
                        color: "#fff",
                        boxShadow: autoRefresh
                          ? "0 4px 10px rgba(245,54,92,.25)"
                          : "0 4px 10px rgba(45,206,137,.25)",
                      }}
                    >
                      {autoRefresh ? "⏹ Stop Auto-Refresh" : "▶ Auto-Refresh"}
                    </button>

                    {/* countdown */}
                    {autoRefresh && (
                      <span style={{
                        background: "#e8f4fd", color: "#1976d2",
                        border: "1px solid #bde0fa", borderRadius: 999,
                        fontSize: 12, fontWeight: 700, padding: "5px 12px",
                        display: "flex", alignItems: "center", gap: 5,
                      }}>
                        🔄 {fmtTime(secondsLeft)}
                      </span>
                    )}

                    {/* manual refresh */}
                    <button
                      onClick={fetchPatients}
                      disabled={loading}
                      style={{ ...btnGhost, fontSize: 12, padding: "7px 14px" }}
                    >
                      {loading ? "…" : "↺ Refresh"}
                    </button>

                  </div>
                </div>
            </PageToolbarCard>
          </Col>
        </Row>

        {/* ── Patient cards ── */}
        <Row>
          {loading && [...Array(4)].map((_, i) => (
            <Col xl="3" lg="4" md="6" sm="12" key={i} className="mb-4">
              <Card className="shadow border-0" style={{ borderRadius: 14, minHeight: 180 }}>
                <CardBody style={{ padding: 16 }}>
                  {[80, 60, 70, 50, 65].map((w, j) => (
                    <div key={j} style={{
                      height: 10, width: `${w}%`, borderRadius: 6,
                      background: "#f0f0f0", marginBottom: 10,
                      animation: "pulse 1.5s ease-in-out infinite",
                    }} />
                  ))}
                </CardBody>
              </Card>
            </Col>
          ))}

          {!loading && paginatedPatients.length === 0 && (
            <Col>
              <Card className="shadow border-0" style={{ borderRadius: 14 }}>
                <CardBody style={{ textAlign: "center", padding: "48px 24px" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}><i className="fa-solid fa-users"></i></div>
                  <h5 style={{ color: "#525f7f", fontWeight: 600 }}>No patients found</h5>
                  <p style={{ color: "#adb5bd", fontSize: 13 }}>
                    {search ? `No results for "${search}"` : "No pending patients at the moment"}
                  </p>
                </CardBody>
              </Card>
            </Col>
          )}

          {!loading && paginatedPatients.map((p) => (
            <Col xl="3" lg="4" md="6" sm="12" key={p.id} className="mb-4">
              <Card className="lims-patient-card shadow border-0 h-100">
                <div className="lims-patient-card-accent" style={{ background: getVariant("warning").gradient }} />

                <CardBody style={{ padding: 16 }}>
                  {/* name + status */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="mb-0" style={{ fontWeight: 700, color: "#32325d", fontSize: 15 }}>
                        {p.name}
                      </h5>
                      <span style={{ fontSize: 11, color: "#8898aa" }}>
                        Lab: {String(p.id).padStart(4, "0")}
                      </span>
                    </div>
                    <span style={{
                      background: "#fff0f3", color: "#f5365c",
                      border: "1px solid #fcc", borderRadius: 999,
                      fontSize: 11, fontWeight: 700, padding: "3px 10px",
                    }}>
                      <i className='fa-solid fa-load'></i> Pending
                    </span>
                  </div>

                  {/* info rows */}
                  <div style={{
                    background: "#f8f9fe", borderRadius: 8,
                    padding: "10px 12px", marginBottom: 12,
                    border: "1px solid #e9ecf3",
                  }}>
                    <InfoRow label="Ref"    value={p.doctor?.name} />
                    <InfoRow label="Age"    value={p.age} />
                    <InfoRow label="Mobile" value={p.phone} />
                    <InfoRow label="Date"   value={`${p.date || ""}${p.time ? " · " + p.time : ""}`} />
                  </div>

                  {/* tests count */}
                  {p.tests?.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <span style={{
                        background: "#e8f4fd", color: "#1976d2",
                        border: "1px solid #bde0fa", borderRadius: 999,
                        fontSize: 11, fontWeight: 600, padding: "3px 10px",
                      }}>
                        🧪 {p.tests.length} Test{p.tests.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    style={{ ...btnPrimary, width: "100%", justifyContent: "center", padding: "9px 0" }}
                    onClick={() => { setSelectedPatient(p); setModalOpen(true); }}
                  >
                    View Tests →
                  </button>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <Row className="mt-2 mb-4">
            <Col className="d-flex justify-content-center align-items-center" style={{ gap: 8 }}>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                style={{
                  borderRadius: 8, border: "1px solid #e0e6ed",
                  background: page === 1 ? "#f8f9fe" : "#fff",
                  color: page === 1 ? "#adb5bd" : "#525f7f",
                  fontWeight: 600, fontSize: 13, padding: "7px 16px",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                }}
              >
                ← Prev
              </button>

              {/* page numbers */}
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  style={{
                    width: 34, height: 34, borderRadius: 8, border: "none",
                    fontWeight: 600, fontSize: 13, cursor: "pointer",
                    background: page === i + 1
                      ? "linear-gradient(135deg,#fb6340,#fbb140)"
                      : "#f8f9fe",
                    color: page === i + 1 ? "#fff" : "#525f7f",
                    boxShadow: page === i + 1 ? "0 4px 10px rgba(251,99,64,.3)" : "none",
                  }}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  borderRadius: 8, border: "1px solid #e0e6ed",
                  background: page === totalPages ? "#f8f9fe" : "#fff",
                  color: page === totalPages ? "#adb5bd" : "#525f7f",
                  fontWeight: 600, fontSize: 13, padding: "7px 16px",
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next →
              </button>
            </Col>
          </Row>
        )}

      </Container>

      <PatientTestsModal
        patient={selectedPatient}
        isOpen={modalOpen}
        toggle={() => setModalOpen((v) => !v)}
      />
    </>
  );
}