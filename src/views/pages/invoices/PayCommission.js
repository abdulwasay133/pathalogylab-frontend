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
  Button,
} from "@mui/material";
import api from "api/axios";
import AppTable from "components/AppTable";
import InvoiceDialog from "components/Invoicedialog";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import {
  IconButton,
  Tooltip,
} from "@mui/material";

/* ─────────────────────────────────────────
   Summary Card
───────────────────────────────────────── */
function SummaryCard({ label, value, color, icon }) {
  return (
    <Card
      className="shadow-sm border-0"
      style={{ borderRadius: 14, overflow: "hidden" }}
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

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
function PayCommission() {
  /* ── table state ── */
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");

  /* ── shared data ── */
  const [doctors, setDoctors] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    paid: 0,
    unpaid: 0,
    invoices: 0,
    netAmount: 0
  });

  /* ── view dialog ── */
  const [openInfo, setOpenInfo] = useState(false);
  const [commissionInfo, setCommissionInfo] = useState(null);

  /* ── calculate commissions modal ── */
  const [openCalc, setOpenCalc] = useState(false);
  const [calcDoctor, setCalcDoctor] = useState("");
  const [calcFrom, setCalcFrom] = useState("");
  const [calcTo, setCalcTo] = useState("");
  const [calcResults, setCalcResults] = useState([]);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcSaving, setCalcSaving] = useState(false);
const [openInvoice, setOpenInvoice] = useState(false);
const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  /* ─────────────────────────────────────────
     Table Columns  (all bugs fixed)
  ───────────────────────────────────────── */
const columns = [
  { field: "id", headerName: "ID", width: 70 },

  {
    field: "doctor_name",
    headerName: "Doctor",
    width: 200,
    valueGetter: (value, row) => row?.doctor?.name || "-",
  },

  {
    field: "total_net_amount",
    headerName: "Net Total",
    width: 150,
    valueGetter: (value, row) =>
      Number(row?.total_net_amount || 0).toLocaleString(),
  },



  {
    field: "updated_at",
    headerName: "Date",
    width: 150,
    valueGetter: (value, row) =>
      row?.updated_at
        ? new Date(row.updated_at).toLocaleDateString("en-PK", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-",
  },

  {
    field: "commission_percentage",
    headerName: "%",
    width: 80,
    valueGetter: (value, row) => row?.doctor?.commission_percentage || 0,
  },

  {
    field: "total_commission",
    headerName: "Commission",
    width: 150,
    valueGetter: (value, row) =>
      Number(row?.total_commission || 0).toLocaleString(),
  },
  {
  field: "invoice_status",
  headerName: "Invoice Status",
  width: 180,
  renderCell: (params) => {
    const isPaid = params.row?.status === "paid";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Tooltip title={`Mark as ${isPaid ? "Unpaid" : "Paid"}`}>
          <div
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              toggleInvoiceStatus(params.row);
            }}
            
          >
            <button className={`btn btn-sm ${isPaid ? "btn-success" : "btn-danger"}`}>
  {isPaid ? "Paid" : "Unpaid"}
</button>
            {/* <i
              className={`fa-solid ${isPaid ? "fa-rotate-left" : "fa-check"}`}
              style={{ fontSize: 12 }}
            /> */}
          </div>
        </Tooltip>
      </div>
    );
  },
},
];

  /* ─────────────────────────────────────────
     Handlers
  ───────────────────────────────────────── */
  const handleView = (row) => {
    setSelectedInvoiceId(row.id);
    setOpenInvoice(true);
  };

  const toggleInvoiceStatus = async (row) => {
  try {
    const res = await api.post(`/invoices/${row.id}/toggle-status`);
    const newStatus = res.data.data?.status;
    toast.success(`Invoice marked as ${newStatus}`);
    fetchData();
    fetchSummary();
  } catch {
    toast.error("Failed to update invoice status");
  }
};

  const markPaid = async (row) => {
    try {
      await api.post(`/doctor-commissions/pay/${row.id}`);
      toast.success("Commission marked as Paid");
      fetchData();
      fetchSummary();
    } catch {
      toast.error("Failed to update commission");
    }
  };

  /* ─────────────────────────────────────────
     API Calls
  ───────────────────────────────────────── */
  const fetchDoctors = async () => {
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data.data || res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get("/doctor-commissions/summary", {
        params: { doctor_id: selectedDoctor },
      });
setSummary({
    total: res.data.total_commission,
    paid: res.data.paid_commission,
    unpaid: res.data.unpaid_commission,
    invoices: res.data.total_invoices,
    netAmount: res.data.total_net_amount
  });
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/doctor-commissions", {
        params: { page, pageSize, search, doctor_id: selectedDoctor },
      });
      setRows(res.data.data || []);
      setTotalRows(res.data.total || 0);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch data");
    }
    setLoading(false);
  };

  /* ─────────────────────────────────────────
     Calculate Modal Actions
  ───────────────────────────────────────── */
  const handleCalculate = async () => {
    if (!calcDoctor) return toast.warning("Please select a doctor first");
    setCalcLoading(true);
    try {
      const res = await api.get("/doctor-commissions/calculate", {
        params: { doctor_id: calcDoctor, from: calcFrom, to: calcTo },
      });
      setCalcResults(res.data.data || res.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to calculate commissions");
    }
    setCalcLoading(false);
  };

  const handleSaveCommissions = async () => {
    if (!calcResults.length) return toast.warning("No records to save");
    setCalcSaving(true);
    try {
      await api.post("/doctor-commissions/bulk-store", {
        doctor_id: calcDoctor,
        from: calcFrom,
        to: calcTo,
        records: calcResults,
      });
      toast.success("Commissions saved successfully!");
      handleCloseCalc();
      fetchData();
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

  /* ─────────────────────────────────────────
     Effects
  ───────────────────────────────────────── */
  useEffect(() => {
    fetchData();
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search, selectedDoctor]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  /* ─────────────────────────────────────────
     Helpers
  ───────────────────────────────────────── */
  const calcTotal = calcResults.reduce(
    (sum, r) => sum + parseFloat(r.commission_amount || 0),
    0
  );
  const selectedDoctorName =
    doctors.find((d) => d.id === calcDoctor)?.name || "";

  /* ─────────────────────────────────────────
     Render
  ───────────────────────────────────────── */
  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8" />

      <Container className="mt--9" fluid>
        {/* ── Summary Cards ── */}
        <Row className="mb-3">
          <Col xs="12" sm="3" className="mb-3 mb-sm-0">
            <SummaryCard
              label="Total Commission"
              value={`PKR ${Number(summary.total || 0).toLocaleString()}`}
              color="#5e72e4"
              icon="💰"
            />
          </Col>
          <Col xs="12" sm="3" className="mb-3 mb-sm-0">
            <SummaryCard
              label="Paid"
              value={`PKR ${summary.paid || 0}`}
              color="#2dce89"
              icon="✅"
            />
          </Col>
          <Col xs="12" sm="3">
            <SummaryCard
              label="Unpaid"
              value={`PKR ${Number(summary.unpaid || 0).toLocaleString()}`}
              color="#fb6340"
              icon="⏳"
            />
          </Col>
          <Col xs="12" sm="3">
            <SummaryCard
              label="Invoices"
              value={`No. ${Number(summary.invoices || 0).toLocaleString()}`}
              color="#920abb"
              icon="⏳"
            />
          </Col>
        </Row>

        {/* ── Commission Table ── */}
        <Row>
          <div className="col">
            <Card className="shadow border-0" style={{ borderRadius: 14 }}>
              <CardHeader
                className="bg-transparent d-flex align-items-center justify-content-between flex-wrap gap-2"
                style={{
                  borderBottom: "1px solid #f0f0f0",
                  padding: "1rem 1.5rem",
                }}
              >
                <h3 className="mb-0" style={{ fontWeight: 700 }}>
                  Pay Commissions
                </h3>

                <div className="d-flex align-items-center gap-3 flex-wrap">
                  {/* Doctor filter */}
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

                  {/* Calculate button */}
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
                    <i className="fa-solid fa-calculator mx-2" />
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

      {/* ════════════════════════════════════════
          View Commission Dialog
      ════════════════════════════════════════ */}
      <Dialog
        open={openInfo}
        onClose={() => setOpenInfo(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ style: { borderRadius: 14 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Commission Details
        </DialogTitle>
        <Divider />
        <DialogContent>
          {commissionInfo ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <InfoRow label="ID" value={commissionInfo.id} />
              <InfoRow
                label="Doctor"
                value={commissionInfo.doctor?.name || "-"}
              />
              <InfoRow
                label="Commission %"
                value={`${commissionInfo.doctor?.commission_percentage || 0}%`}
              />
              <InfoRow
                label="Net Total"
                value={`PKR ${Number(
                  commissionInfo.total_net_amount || 0
                ).toLocaleString()}`}
              />
              <InfoRow
                label="Commission"
                value={`PKR ${Number(
                  commissionInfo.total_commission || 0
                ).toLocaleString()}`}
              />
              <InfoRow
                label="Status"
                value={
                  <Chip
                    label={commissionInfo.status || "unpaid"}
                    size="small"
                    color={
                      commissionInfo.status === "paid" ? "success" : "warning"
                    }
                    variant="outlined"
                    sx={{ textTransform: "capitalize", fontWeight: 600 }}
                  />
                }
              />
              <InfoRow
                label="Date"
                value={
                  commissionInfo.updated_at
                    ? new Date(commissionInfo.updated_at).toLocaleDateString(
                        "en-PK",
                        { day: "2-digit", month: "short", year: "numeric" }
                      )
                    : "-"
                }
              />
            </Box>
          ) : (
            <Typography>No data</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenInfo(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════════════════════════════════════════
          Calculate Commissions Dialog
      ════════════════════════════════════════ */}
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
              🧮 Calculate Commissions
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
                      {["#", "Patient", "Receipt ID", "Net Total", "Commission %", "Commission", "Date"].map(
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
                        <td style={tdStyle}>{r.receipt_id || "—"}</td>
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
                  📊
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
            <InvoiceDialog
  open={openInvoice}
  invoiceId={selectedInvoiceId}
  onClose={() => setOpenInvoice(false)}
/>
    </>
  );
}

/* ─────────────────────────────────────────
   Small helpers
───────────────────────────────────────── */
function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Typography
        sx={{
          minWidth: 140,
          fontSize: 13,
          color: "#8898aa",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: 14, color: "#32325d", fontWeight: 500 }}>
        {value}
      </Typography>



    </Box>
  );
}

const thStyle = {
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 700,
  color: "#8898aa",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  textAlign: "left",
  borderBottom: "2px solid #e9ecef",
};

const tdStyle = {
  padding: "9px 12px",
  fontSize: 13,
  color: "#525f7f",
};

export default PayCommission;