import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import api from "api/axios";
import AppTable from "components/AppTable";
import ErrorDialoge from "components/dialogs/ErrorDialoge";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Card, CardBody, CardHeader, Container, Row } from "reactstrap";

function DoctorManagement() {
  const [rows, setRows]           = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading]     = useState(false);
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(5);
  const [search, setSearch]       = useState("");
  const [warn, setWarn]           = useState(false);
  const [record, setRecord]       = useState(null);
  const [openInfo, setOpenInfo]   = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);

  const navigate = useNavigate();

  /* ── columns ── */
  const columns = [
    { field: "id",             headerName: "ID",            width: 70  },
    { field: "name",           headerName: "Name",          width: 180 },
    { field: "email",          headerName: "Email",         flex: 1, minWidth: 180 },
    { field: "phone",          headerName: "Phone",         width: 140 },
    { field: "qualifications", headerName: "Qualification", width: 140 },
    {
      field: "commission_percentage",
      headerName: "Commission",
      width: 120,
      renderCell: (params) => (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "4px 10px", borderRadius: 999, fontSize: 12,
          fontWeight: 600, background: "#f0f4ff",
          color: "#5e72e4", border: "1px solid #d0d8ff",
        }}>
          {params.value ?? 0}%
        </span>
      ),
    },
  ];

  /* ── handlers ── */
  const handleEdit   = (row) => navigate(`/admin/doctors/edit-doctor/${row.id}`);
  const handleDelete = (row) => { setRecord(row); setWarn(true); };
  const handleView   = (row) => { setDoctorInfo(row); setOpenInfo(true); };

  const confirmDelete = async () => {
    try {
      const res = await api.delete(`/doctors/${record.id}`);
      if (res.status !== 200) { toast.error(res.data.message); return; }
      setWarn(false);
      toast.success("Doctor deleted successfully.");
      FetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete doctor.");
    }
  };

  /* ── fetch ── */
  const FetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/doctors", {
        params: { page, pageSize, search },
      });
      setRows(res.data.data);
      setTotalRows(res.data[0]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { FetchData(); }, [page, pageSize, search]);

  /* ── info box helper ── */
  const InfoBox = ({ label, value, full = false }) => (
    <Box sx={{
      p: 1.5, borderRadius: 2,
      background: "#f8f9fe",
      border: "1px solid #e9ecf3",
      gridColumn: full ? "1 / -1" : undefined,
    }}>
      <Typography fontSize={11} color="text.secondary" fontWeight={600} mb={0.3}
        sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography fontSize={14} fontWeight={500} color="#32325d">
        {value || "—"}
      </Typography>
    </Box>
  );

  /* ── render ── */
  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8" />

      <Container className="mt--9" fluid>
        <Row>
          <div className="col">
            <Card
              className="shadow border-0"
              style={{ borderRadius: 16, overflow: "hidden" }}
            >
              {/* ── Header ── */}
              <CardHeader
                className="bg-white border-0"
                style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f0f0f0" }}
              >
                <div className="d-flex align-items-center justify-content-between flex-wrap"
                  style={{ gap: 12 }}>

                  <div className="d-flex align-items-center" style={{ gap: 10 }}>
                    <span style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: "linear-gradient(135deg,#2dce89,#2dcecc)",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 18,
                    }}>
                      <i className="fa-solid fa-stethoscope text-white"></i>
                    </span>
                    <div>
                      <h3 className="mb-0" style={{ fontWeight: 700, color: "#32325d" }}>
                        Doctor Management
                      </h3>
                      <p className="mb-0" style={{ fontSize: 12, color: "#8898aa" }}>
                        Manage all registered doctors
                      </p>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    style={{
                      borderRadius: 8, fontWeight: 600, padding: "8px 20px",
                      background: "linear-gradient(135deg,#5e72e4,#825ee4)",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(94,114,228,.35)",
                    }}
                    onClick={() => navigate("/admin/doctors/add-doctor")}
                  >
                    + Add New Doctor
                  </button>
                </div>
              </CardHeader>

              {/* ── Body ── */}
              <CardBody style={{ padding: "0rem 2rem 2rem 2rem" }}>
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
                  setWarn={setWarn}
                  setRecord={setRecord}
                  actions={{ edit: handleEdit, delete: handleDelete, view: handleView }}
                />
              </CardBody>
            </Card>
          </div>
        </Row>
      </Container>

      {/* ── Delete dialog ── */}
      <ErrorDialoge
        open={warn}
        handleClose={() => setWarn(false)}
        handleDelete={confirmDelete}
        setRecord={setRecord}
      />

      {/* ══════════════════════════════════════
          DOCTOR DETAILS DIALOG
      ══════════════════════════════════════ */}
      <Dialog
        open={openInfo}
        onClose={() => setOpenInfo(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: "16px", overflow: "hidden" },
        }}
      >
        {/* dialog header */}
        <Box sx={{
          background: "linear-gradient(135deg,#2dce89,#2dcecc)",
          px: 3, py: 2.5,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(255,255,255,.2)",
              display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 20,
            }}>
              👨‍⚕️
            </Box>
            <Box>
              <Typography color="white" fontWeight={700} fontSize="17px">
                {doctorInfo?.name || "Doctor Details"}
              </Typography>
              <Typography color="rgba(255,255,255,.75)" fontSize="12px">
                {doctorInfo?.qualifications || ""}
              </Typography>
            </Box>
          </Box>
          <Box
            onClick={() => setOpenInfo(false)}
            sx={{
              width: 32, height: 32, borderRadius: 2,
              background: "rgba(255,255,255,.15)",
              display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer",
              color: "white", fontSize: 18, fontWeight: 700,
              "&:hover": { background: "rgba(255,255,255,.25)" },
            }}
          >
            ×
          </Box>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 1.5,
          }}>
            <InfoBox label="Phone"      value={doctorInfo?.phone} />
            <InfoBox label="Email"      value={doctorInfo?.email} />
            <InfoBox label="Gender"     value={doctorInfo?.gender} />
            <InfoBox label="Age"        value={doctorInfo?.age} />
            <InfoBox label="Commission" value={doctorInfo?.commission_percentage ? `${doctorInfo.commission_percentage}%` : null} />
            <InfoBox label="Address"    value={doctorInfo?.address} />

            {/* Specialities — full width */}
            <Box sx={{
              p: 1.5, borderRadius: 2,
              background: "#f8f9fe", border: "1px solid #e9ecf3",
              gridColumn: "1 / -1",
            }}>
              <Typography fontSize={11} color="text.secondary" fontWeight={600} mb={1}
                sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                Specialities
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.8}>
                {doctorInfo?.speciality?.length > 0
                  ? doctorInfo.speciality.map((s, i) => (
                    <span key={i} style={{
                      background: "#e8f4fd", color: "#1976d2",
                      padding: "4px 12px", borderRadius: 999,
                      fontSize: 12, fontWeight: 600,
                      border: "1px solid #bde0fa",
                    }}>
                      {s}
                    </span>
                  ))
                  : <span style={{
                    background: "#f8f9fe", color: "#8898aa",
                    padding: "4px 12px", borderRadius: 999,
                    fontSize: 12, border: "1px solid #e9ecef",
                  }}>
                    No speciality added
                  </span>
                }
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{
          px: 3, pb: 3, pt: 0,
          borderTop: "1px solid #f0f0f0",
        }}>
          <button
            className="btn btn-primary btn-sm"
            style={{
              borderRadius: 8, minWidth: 90, fontWeight: 600,
              background: "linear-gradient(135deg,#2dce89,#2dcecc)",
              border: "none",
              boxShadow: "0 4px 10px rgba(45,206,137,.3)",
            }}
            onClick={() => setOpenInfo(false)}
          >
            Close
          </button>
          <button
            className="btn btn-primary btn-sm"
            style={{
              borderRadius: 8, minWidth: 90, fontWeight: 600,
              background: "linear-gradient(135deg,#5e72e4,#825ee4)",
              border: "none",
              boxShadow: "0 4px 10px rgba(94,114,228,.3)",
            }}
            onClick={() => {
              setOpenInfo(false);
              navigate(`/admin/doctors/edit-doctor/${doctorInfo?.id}`);
            }}
          >
            ✏️ Edit
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DoctorManagement;