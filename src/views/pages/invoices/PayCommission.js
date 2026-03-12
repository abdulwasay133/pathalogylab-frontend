import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import api from "api/axios";
import AppTable from "components/AppTable";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";

/* ─────────────────────────────────────────────
   Small reusable summary card
───────────────────────────────────────────── */
function SummaryCard({ label, value, color, icon }) {
  return (
    <Card
      className="shadow-sm border-0"
      style={{ borderRadius: 12, overflow: "hidden" }}
    >
      <CardBody className="p-3">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <p
              className="text-uppercase font-weight-bold mb-1"
              style={{ fontSize: 11, color: "#8898aa", letterSpacing: 1 }}
            >
              {label}
            </p>
            <h4 className="mb-0" style={{ color, fontWeight: 700 }}>
              {value}
            </h4>
          </div>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: `${color}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            {icon}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
function PayCommission() {
  /* table state */
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");

  /* shared doctors list */
  const [doctors, setDoctors] = useState([]);

  /* summary */
  const [summary, setSummary] = useState({ total: 0, paid: 0, unpaid: 0 });

  /* view dialog */
  const [openInfo, setOpenInfo] = useState(false);
  const [commissionInfo, setCommissionInfo] = useState(null);

  /* ── Calculate Commissions modal ── */
  const [openCalc, setOpenCalc] = useState(false);
  const [calcDoctor, setCalcDoctor] = useState("");
  const [calcFrom, setCalcFrom] = useState("");
  const [calcTo, setCalcTo] = useState("");
  const [calcResults, setCalcResults] = useState([]);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcSaving, setCalcSaving] = useState(false);

  /* ─────────────── columns ─────────────── */
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "doctor_name", headerName: "Doctor", width: 200 },
    { field: "net_total", headerName: "Net Total", width: 150 },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === "paid" ? "success" : "warning"}
          variant="outlined"
          sx={{ textTransform: "capitalize", fontWeight: 600 }}
        />
      ),
    },
    { field: "date", headerName: "Date", width: 120 },
    { field: "commission_percentage", headerName: "%", width: 80 },
    { field: "commission_amount", headerName: "Commission", width: 150 },
  ];

  /* ─────────────── handlers ─────────────── */
  const handleView = (row) => {
    setCommissionInfo(row);
    setOpenInfo(true);
  };

  const markPaid = async (row) => {
    try {
      await api.post(`/doctor-commissions/pay/${row.id}`);
      toast.success("Commission marked as Paid");
      FetchData();
      fetchSummary();
    } catch {
      toast.error("Failed to update commission");
    }
  };

  /* ─────────────── API calls ─────────────── */
  const fetchDoctors = async () => {
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data.data || res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get("/doctor-commissions/summary", {
        params: { doctor_id: selectedDoctor },
      });
      setSummary(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const FetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/doctor-commissions", {
        params: { page, pageSize, search, doctor_id: selectedDoctor },
      });
      setRows(res.data.data);
      setTotalRows(res.data.total);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  /* ─────────────── Calculate modal actions ─────────────── */
  const handleCalculate = async () => {
    if (!calcDoctor) {
      toast.warning("Please select a doctor first");
      return;
    }
    setCalcLoading(true);
    try {
      const res = await api.get("/doctor-commissions/calculate", {
        params: {
          doctor_id: calcDoctor,
          from: calcFrom,
          to: calcTo,
        },
      });
      setCalcResults(res.data.data || res.data);
      console.log(res.data.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to calculate commissions");
    }
    setCalcLoading(false);
  };

  const handleSaveCommissions = async () => {
    if (!calcResults.length) {
      toast.warning("No records to save");
      return;
    }
    setCalcSaving(true);
    try {
      const res = await api.post("/doctor-commissions/bulk-store", {
        doctor_id: calcDoctor,
        from: calcFrom,
        to: calcTo,
        records: calcResults,
      });
      console.log(res);
      toast.success("Commissions saved successfully!");
      setOpenCalc(false);
      setCalcResults([]);
      setCalcDoctor("");
      setCalcFrom("");
      setCalcTo("");
      FetchData();
      fetchSummary();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save commissions");
    }
    setCalcSaving(false);
  };

  const handleCloseCalc = () => {
    setOpenCalc(false);
    setCalcResults([]);
    setCalcDoctor("");
    setCalcFrom("");
    setCalcTo("");
  };

  /* ─────────────── effects ─────────────── */
  useEffect(() => {
    FetchData();
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search, selectedDoctor]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  /* ─────────────── helpers ─────────────── */
  const calcTotal = calcResults.reduce(
    (sum, r) => sum + parseFloat(r.commission_amount || 0),
    0
  );
  const selectedDoctorName =
    doctors.find((d) => d.id === calcDoctor)?.name || "";

  /* ─────────────── render ─────────────── */
  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8" />

      <Container className="mt--9" fluid>
        {/* ── SUMMARY CARDS ── */}
        <Row className="mb-4">
          <Col xs="12" sm="4" className="mb-3 mb-sm-0">
            <SummaryCard
              label="Total Commission"
              value={`PKR ${Number(summary.total || 0).toLocaleString()}`}
              color="#5e72e4"
              icon="💰"
            />
          </Col>
          <Col xs="12" sm="4" className="mb-3 mb-sm-0">
            <SummaryCard
              label="Paid"
              value={`PKR ${Number(summary.paid || 0).toLocaleString()}`}
              color="#2dce89"
              icon="✅"
            />
          </Col>
          <Col xs="12" sm="4">
            <SummaryCard
              label="Unpaid"
              value={`PKR ${Number(summary.unpaid || 0).toLocaleString()}`}
              color="#fb6340"
              icon="⏳"
            />
          </Col>
        </Row>

        <Row>
          <div className="col">
            <Card className="shadow border-0" style={{ borderRadius: 14 }}>
              <CardHeader
                className="bg-transparent d-flex align-items-center justify-content-between flex-wrap gap-2"
                style={{ borderBottom: "1px solid #f0f0f0", padding: "1rem 1.5rem" }}
              >
                <h3 className="mb-0" style={{ fontWeight: 700 }}>
                  Pay Commissions
                </h3>

                <div className="d-flex align-items-center gap-3 flex-wrap">
                  {/* ── Doctor filter ── */}
                  <FormControl size="small" style={{ minWidth: 200 }}>
                    <InputLabel>Filter by Doctor</InputLabel>
                    <Select
                      value={selectedDoctor}
                      label="Filter by Doctor"
                      onChange={(e) => {
                        setSelectedDoctor(e.target.value);
                        setPage(1);
                      }}
                      sx={{ borderRadius: "8px" }}
                    >
                      <MenuItem value="">
                        <em>All Doctors</em>
                      </MenuItem>
                      {doctors.map((d) => (
                        <MenuItem key={d.id} value={d.id}>
                          {d.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* ── Calculate button ── */}
                  <button
                    className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                    style={{
                      borderRadius: 8,
                      fontWeight: 600,
                      padding: "8px 16px",
                      background: "linear-gradient(135deg,#5e72e4,#825ee4)",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(94,114,228,.35)",
                    }}
                    onClick={() => setOpenCalc(true)}
                  >
                    <span style={{ fontSize: 16 }} className="mx-2"><i class="fa-solid fa-calculator"></i></span>
                    Calculate Commissions
                  </button>
                </div>
              </CardHeader>

              <CardBody className="px-4 pt-3">
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
                  actions={{ view: handleView, pay: markPaid }}
                />
              </CardBody>
            </Card>
          </div>
        </Row>
      </Container>

      {/* ══════════════════════════════════════
          VIEW DETAILS DIALOG
      ══════════════════════════════════════ */}
      <Dialog
        open={openInfo}
        onClose={() => setOpenInfo(false)}
        PaperProps={{
          sx: { borderRadius: "14px", padding: "8px", minWidth: "420px" },
        }}
      >
        <DialogTitle>
          <Typography fontWeight={700} fontSize="18px">
            Commission Details
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 2,
              mt: 1,
            }}
          >
            {[
              ["Doctor", commissionInfo?.doctor_name],
              ["Patient", commissionInfo?.patient_name],
              ["Receipt ID", commissionInfo?.receipt_id],
              ["Receipt Amount", commissionInfo?.receipt_amount],
              ["Commission %", commissionInfo?.commission_percentage],
              ["Commission Amount", commissionInfo?.commission_amount],
              ["Status", commissionInfo?.status],
              ["Date", commissionInfo?.created_at],
            ].map(([label, val]) => (
              <Box
                key={label}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  background: "#f8f9fe",
                  border: "1px solid #e9ecf3",
                }}
              >
                <Typography fontSize={11} color="text.secondary" fontWeight={600} mb={0.3}>
                  {label}
                </Typography>
                <Typography fontSize={14} fontWeight={500}>
                  {val || "—"}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>

        <DialogActions sx={{ pr: 2, pb: 2 }}>
          <button
            className="btn btn-primary btn-sm"
            style={{ borderRadius: 8, minWidth: 80 }}
            onClick={() => setOpenInfo(false)}
          >
            Close
          </button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════
          CALCULATE COMMISSIONS DIALOG
      ══════════════════════════════════════ */}
      <Dialog
        open={openCalc}
        onClose={handleCloseCalc}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: "16px", overflow: "hidden" },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg,#5e72e4,#825ee4)",
            px: 3,
            py: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography color="white" fontWeight={700} fontSize="18px">
              <i class="fa-solid fa-calculator"></i> Calculate Commissions
            </Typography>
            <Typography color="rgba(255,255,255,.7)" fontSize="13px" mt={0.3}>
              Select a doctor and date range to preview commissions
            </Typography>
          </Box>
          <button
            onClick={handleCloseCalc}
            style={{
              background: "rgba(255,255,255,.15)",
              border: "none",
              borderRadius: 8,
              color: "white",
              width: 34,
              height: 34,
              cursor: "pointer",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {/* Filters row */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr auto" },
              gap: 2,
              mb: 3,
              alignItems: "flex-end",
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>Select Doctor *</InputLabel>
              <Select
                value={calcDoctor}
                label="Select Doctor *"
                onChange={(e) => {
                  setCalcDoctor(e.target.value);
                  setCalcResults([]);
                }}
                sx={{ borderRadius: "8px" }}
              >
                <MenuItem value="">
                  <em>Choose a doctor</em>
                </MenuItem>
                {doctors.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="From Date"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={calcFrom}
              onChange={(e) => {
                setCalcFrom(e.target.value);
                setCalcResults([]);
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />

            <TextField
              label="To Date"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={calcTo}
              onChange={(e) => {
                setCalcTo(e.target.value);
                setCalcResults([]);
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />

            <button
              className="btn btn-info btn-sm"
              style={{
                borderRadius: 8,
                fontWeight: 600,
                whiteSpace: "nowrap",
                padding: "9px 20px",
                height: 40,
              }}
              onClick={handleCalculate}
              disabled={calcLoading}
            >
              {calcLoading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                "Apply Filter"
              )}
            </button>
          </Box>

          {/* Results table */}
          {calcResults.length > 0 ? (
            <>
              {/* Summary strip */}
              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  background: "#f0f4ff",
                  border: "1px solid #d0d8ff",
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Typography fontSize={11} color="text.secondary" fontWeight={600}>
                    DOCTOR
                  </Typography>
                  <Typography fontWeight={700}>{selectedDoctorName}</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box>
                  <Typography fontSize={11} color="text.secondary" fontWeight={600}>
                    RECORDS
                  </Typography>
                  <Typography fontWeight={700}>{calcResults.length}</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box>
                  <Typography fontSize={11} color="text.secondary" fontWeight={600}>
                    TOTAL COMMISSION
                  </Typography>
                  <Typography fontWeight={700} color="#5e72e4">
                    PKR {calcTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
                {calcFrom && calcTo && (
                  <>
                    <Divider orientation="vertical" flexItem />
                    <Box>
                      <Typography fontSize={11} color="text.secondary" fontWeight={600}>
                        DATE RANGE
                      </Typography>
                      <Typography fontWeight={700}>
                        {calcFrom} → {calcTo}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>

              {/* Scrollable table */}
              <Box
                sx={{
                  maxHeight: 320,
                  overflowY: "auto",
                  borderRadius: 2,
                  border: "1px solid #e9ecef",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        background: "#f8f9fe",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                      }}
                    >
                      {["#", "Patient", "Tests", "Net Total", "Commission %", "Commission", "Date"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              padding: "10px 12px",
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#8898aa",
                              textAlign: "left",
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                              borderBottom: "2px solid #e9ecef",
                            }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {calcResults.map((r, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          background: idx % 2 === 0 ? "#fff" : "#fafbff",
                        }}
                      >
                        <td style={tdStyle}>{idx + 1}</td>
                        <td style={tdStyle}>{r.patient_name || "—"}</td>
                        <td style={tdStyle}>{r.tests || "—"}</td>
                        <td style={tdStyle}>
                          {Number(r.net_total || 0).toLocaleString()}
                        </td>
                        <td style={tdStyle}>{r.commission_percentage}%</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: "#5e72e4" }}>
                          {Number(r.commission_amount || 0).toLocaleString()}
                        </td>
                        <td style={tdStyle}>{r.date || r.created_at || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </>
          ) : (
            !calcLoading && (
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                  color: "#adb5bd",
                  background: "#fafbff",
                  borderRadius: 2,
                  border: "1px dashed #dee2e6",
                }}
              >
                <Typography fontSize={36} mb={1}>
                  <i class="fa-solid fa-calculator"></i>
                </Typography>
                <Typography fontWeight={600} color="text.secondary">
                  Select a doctor and apply filter to see commissions
                </Typography>
              </Box>
            )
          )}

          {calcLoading && (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <CircularProgress size={36} />
              <Typography mt={2} color="text.secondary">
                Calculating commissions…
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 0,
            gap: 1.5,
            justifyContent: "flex-end",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <button
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 8, minWidth: 90 }}
            onClick={handleCloseCalc}
          >
            Cancel
          </button>

          <button
            className="btn btn-success btn-sm d-flex align-items-center gap-1"
            style={{
              borderRadius: 8,
              minWidth: 130,
              fontWeight: 600,
              background: "linear-gradient(135deg,#2dce89,#2dcecc)",
              border: "none",
              boxShadow: "0 4px 12px rgba(45,206,137,.35)",
            }}
            onClick={handleSaveCommissions}
            disabled={calcSaving || !calcResults.length}
          >
            {calcSaving ? (
              <>
                <CircularProgress size={13} color="inherit" /> Saving…
              </>
            ) : (
              <>✅ Add to Database</>
            )}
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/* tiny helper */
const tdStyle = {
  padding: "9px 12px",
  fontSize: 13,
  color: "#525f7f",
};

export default PayCommission;