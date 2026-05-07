import api from "api/axios";
import AppTable from "components/AppTable";
import PatientTestsModal from "components/PatientTestsModal";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { Card, CardBody, CardHeader, Container, Row } from "reactstrap";

/* ── quick filter button ── */
const QuickBtn = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      borderRadius: 7, border: "none", fontWeight: 600,
      fontSize: 12, padding: "6px 14px", cursor: "pointer",
      background: active
        ? "linear-gradient(135deg,#2dce89,#2dcecc)"
        : "#f0f4ff",
      color: active ? "#fff" : "#525f7f",
      boxShadow: active ? "0 3px 8px rgba(45,206,137,.3)" : "none",
      transition: "all .15s",
    }}
  >
    {label}
  </button>
);

/* ── date picker input style ── */
const dpStyle = {
  borderRadius: 8, border: "1px solid #e0e6ed",
  padding: "8px 12px", fontSize: 13, color: "#32325d",
  outline: "none", width: "100%", cursor: "pointer",
  background: "#fff",
};

/* ═══════════════════════════════════════════ */

const CompletedPatients = () => {
  const [rows, setRows]           = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading]     = useState(false);
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(5);
  const [search, setSearch]       = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [dateFrom, setDateFrom]   = useState(null);
  const [dateTo, setDateTo]       = useState(null);
  const [activeFilter, setActiveFilter] = useState("");

  /* ── quick filters ── */
  const applyQuickFilter = (type) => {
    const today = new Date();
    let start, end;

    if (type === "today") {
      start = today; end = today;
    } else if (type === "yesterday") {
      start = new Date();
      start.setDate(today.getDate() - 1);
      end = new Date(start);
    } else if (type === "week") {
      start = new Date();
      start.setDate(today.getDate() - 7);
      end = today;
    } else if (type === "month") {
      start = new Date();
      start.setMonth(today.getMonth() - 1);
      end = today;
    }

    setDateFrom(start);
    setDateTo(end);
    setActiveFilter(type);
    setPage(1);
  };

  const clearFilters = () => {
    setDateFrom(null);
    setDateTo(null);
    setActiveFilter("");
    setPage(1);
  };

  /* ── columns ── */
  const columns = [
    { field: "id",           headerName: "ID",           width: 60  },
    { field: "patient_name", headerName: "Patient Name", flex: 1, minWidth: 180 },
    { field: "phone",        headerName: "Mobile",       width: 140 },
    { field: "doctor",       headerName: "Doctor",       width: 180 },
    { field: "tests_count",  headerName: "Tests",        width: 80  },
    { field: "date",         headerName: "Date",         width: 140 },
    {
      field: "status",
      headerName: "Report Status",
      width: 140,
      renderCell: () => (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
          background: "#eafaf3", color: "#1aae6f", border: "1px solid #b7ebd9",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#2dce89", flexShrink: 0,
          }} />
          Completed
        </span>
      ),
    },
  ];

  /* ── fetch ── */
  const FetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/completed-patients", {
        params: { page, pageSize, search, dateFrom, dateTo },
      });
      setRows(res.data.data);
      setTotalRows(res.data.total);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    FetchData();
   }, [page, pageSize, search, dateFrom, dateTo]);

  const handleView = (row) => { setSelectedPatient(row); setModalOpen(true); };

  /* ── render ── */
  return (
    <>
      <div className="header bg-gradient-success pb-8 pt-5 pt-md-8" />

      <Container className="mt--9" fluid>
        <Row>
          <div className="col">
            <Card className="shadow border-0" style={{ borderRadius: 16, overflow: "hidden" }}>

              {/* ── Header ── */}
              <CardHeader
                className="bg-white border-0"
                style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f0f0f0" }}
              >
                <div className="d-flex align-items-center justify-content-between flex-wrap" style={{ gap: 12 }}>
                  <div className="d-flex align-items-center" style={{ gap: 10 }}>
                    <span style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: "linear-gradient(135deg,#2dce89,#2dcecc)",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 18,
                    }}><i class="fa-solid fa-user-check text-white"></i></span>
                    <div>
                      <h3 className="mb-0" style={{ fontWeight: 700, color: "#32325d" }}>
                        Completed Patient Reports
                      </h3>
                      <p className="mb-0" style={{ fontSize: 12, color: "#8898aa" }}>
                        All patients with completed test results
                      </p>
                    </div>
                  </div>

                  {/* total count */}
                  <span style={{
                    background: "#eafaf3", color: "#1aae6f",
                    border: "1px solid #b7ebd9", borderRadius: 999,
                    fontSize: 12, fontWeight: 700, padding: "5px 14px",
                  }}>
                    {totalRows} Report{totalRows !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* ── Date filters ── */}
                <div style={{
                  marginTop: 16, padding: "14px 16px", borderRadius: 10,
                  background: "#f8f9fe", border: "1px solid #e9ecf3",
                }}>
                  <div className="d-flex align-items-center flex-wrap" style={{ gap: 10 }}>

                    {/* quick filters */}
                    <div className="d-flex" style={{ gap: 6, flexShrink: 0 }}>
                      {[
                        { key: "today",     label: "Today"     },
                        { key: "yesterday", label: "Yesterday" },
                        { key: "week",      label: "Last 7 Days" },
                        { key: "month",     label: "Last Month"  },
                      ].map(({ key, label }) => (
                        <QuickBtn
                          key={key}
                          label={label}
                          active={activeFilter === key}
                          onClick={() => applyQuickFilter(key)}
                        />
                      ))}
                    </div>

                    {/* divider */}
                    <div style={{ width: 1, height: 28, background: "#e0e6ed", flexShrink: 0 }} />

                    {/* date pickers */}
                    <div className="d-flex align-items-center" style={{ gap: 8 }}>
                      <span style={{ fontSize: 12, color: "#8898aa", fontWeight: 600, whiteSpace: "nowrap" }}>
                        From
                      </span>
                      <DatePicker
                        selected={dateFrom}
                        onChange={(d) => { setDateFrom(d); setActiveFilter("custom"); setPage(1); }}
                        placeholderText="Start date"
                        dateFormat="dd/MM/yyyy"
                        customInput={<input style={dpStyle} />}
                      />
                      <span style={{ fontSize: 12, color: "#8898aa", fontWeight: 600 }}>To</span>
                      <DatePicker
                        selected={dateTo}
                        onChange={(d) => { setDateTo(d); setActiveFilter("custom"); setPage(1); }}
                        placeholderText="End date"
                        minDate={dateFrom}
                        dateFormat="dd/MM/yyyy"
                        customInput={<input style={dpStyle} />}
                      />
                    </div>

                    {/* clear */}
                    {(dateFrom || dateTo) && (
                      <button
                        onClick={clearFilters}
                        style={{
                          borderRadius: 7, border: "1px solid #e0e6ed",
                          background: "#fff", color: "#f5365c",
                          fontWeight: 600, fontSize: 12, padding: "6px 12px",
                          cursor: "pointer",
                        }}
                      >
                        ✕ Clear
                      </button>
                    )}

                  </div>
                </div>
              </CardHeader>

              {/* ── Body ── */}
              <CardBody style={{ padding: "0 2rem 1rem 2rem" }}>
                <AppTable
                  rows={rows}
                  columns={columns}
                  loading={loading}
                  pageSize={pageSize}
                  rowCount={totalRows}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  searchValue={search}
                  onSearchChange={setSearch}
                  actions={{ view: handleView }}
                />
              </CardBody>

            </Card>
          </div>
        </Row>
      </Container>

      <PatientTestsModal
        patient={selectedPatient}
        isOpen={modalOpen}
        toggle={() => setModalOpen((v) => !v)}
      />
    </>
  );
};

export default CompletedPatients;