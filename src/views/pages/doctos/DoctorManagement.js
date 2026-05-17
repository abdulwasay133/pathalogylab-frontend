import {
  Box, Dialog, DialogActions, DialogContent, Typography,
} from "@mui/material";
import api from "api/axios";
import AppTable from "components/AppTable";
import ErrorDialoge from "components/dialogs/ErrorDialoge";
import PageShell from "components/layout/PageShell";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "utils/toast";
import T from "theme/tokens";
import { btnPrimary } from "theme/formStyles";

function DoctorManagement() {
  const [rows,       setRows]       = useState([]);
  const [totalRows,  setTotalRows]  = useState(0);
  const [loading,    setLoading]    = useState(false);
  const [warn,       setWarn]       = useState(false);
  const [record,     setRecord]     = useState(null);
  const [openInfo,   setOpenInfo]   = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);

  const navigate = useNavigate();

  const columns = [
    { field: "id",                    headerName: "ID",            width: 70  },
    { field: "name",                  headerName: "Name",          width: 180 },
    { field: "email",                 headerName: "Email",         flex: 1, minWidth: 180 },
    { field: "phone",                 headerName: "Phone",         width: 140 },
    { field: "qualifications",        headerName: "Qualification", width: 140 },
    {
      field: "commission_percentage",
      headerName: "Commission",
      width: 120,
      renderCell: (params) => (
        <span style={{
          padding: "4px 10px", borderRadius: 999, fontSize: 12,
          fontWeight: 600, background: T.colors.primaryLight,
          color: T.colors.primary, border: "1px solid #c7d7fe",
        }}>
          {params.value ?? 0}%
        </span>
      ),
    },
  ];

  const fetchData = useCallback(async (params) => {
    setLoading(true);
    try {
      const res = await api.get("/doctors", {
        params: {
          page:        params.page,
          per_page:    params.page_size,
          search:      params.search      || undefined,
          filters:     params.filters     || undefined,
          sort_field:  params.sort_field  || undefined,
          sort_dir:    params.sort_dir    || undefined,
          date_column: params.date_column || undefined,
          date_from:   params.date_from   || undefined,
          date_to:     params.date_to     || undefined,
        },
      });
      setRows(res.data.data);
      setTotalRows(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEdit   = (row) => navigate(`/admin/doctors/edit-doctor/${row.id}`);
  const handleDelete = (row) => { setRecord(row); setWarn(true); };
  const handleView   = (row) => { setDoctorInfo(row); setOpenInfo(true); };

  const confirmDelete = async () => {
    try {
      const res = await api.delete(`/doctors/${record.id}`);
      if (res.status !== 200) { toast.error(res.data.message); return; }
      setWarn(false);
      toast.success("Doctor deleted successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete doctor.");
    }
  };

  const InfoBox = ({ label, value, full = false }) => (
    <Box sx={{
      p: 1.5, borderRadius: 2,
      background: "#f8fafc", border: "1px solid #e2e8f0",
      gridColumn: full ? "1 / -1" : undefined,
    }}>
      <Typography fontSize={11} color="text.secondary" fontWeight={600} mb={0.3}
        sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography fontSize={14} fontWeight={500} color="#1e293b">
        {value || "—"}
      </Typography>
    </Box>
  );

  return (
    <>
      <PageShell
        variant="doctor"
        icon="fa-solid fa-user-doctor"
        title="Doctor Management"
        subtitle="Manage all registered doctors and commissions"
        badge={`${totalRows} Doctor${totalRows !== 1 ? "s" : ""}`}
        flushBody
        headerActions={
          <button type="button" style={btnPrimary} onClick={() => navigate("/admin/doctors/add-doctor")}>
            <i className="fa-solid fa-plus" /> Add Doctor
          </button>
        }
      >
        <AppTable
          rows={rows}
          columns={columns}
          loading={loading}
          rowCount={totalRows}
          defaultPageSize={5}
          onFilterChange={fetchData}
          setWarn={setWarn}
          actions={{ edit: handleEdit, delete: handleDelete, view: handleView }}
        />
      </PageShell>

      <ErrorDialoge
        open={warn}
        handleClose={() => setWarn(false)}
        handleDelete={confirmDelete}
        setRecord={setRecord}
      />

      <Dialog open={openInfo} onClose={() => setOpenInfo(false)} fullWidth maxWidth="sm"
        PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}>
        <Box sx={{
          background: "linear-gradient(135deg,#0d9488,#14b8a6)",
          px: 3, py: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(255,255,255,.2)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>
              <i className="fa-solid fa-user-doctor text-white" />
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
          <Box onClick={() => setOpenInfo(false)} sx={{
            width: 32, height: 32, borderRadius: 2,
            background: "rgba(255,255,255,.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "white", fontSize: 18, fontWeight: 700,
            "&:hover": { background: "rgba(255,255,255,.25)" },
          }}>×</Box>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
            <InfoBox label="Phone"      value={doctorInfo?.phone} />
            <InfoBox label="Email"      value={doctorInfo?.email} />
            <InfoBox label="Gender"     value={doctorInfo?.gender} />
            <InfoBox label="Age"        value={doctorInfo?.age} />
            <InfoBox label="Commission" value={doctorInfo?.commission_percentage ? `${doctorInfo.commission_percentage}%` : null} />
            <InfoBox label="Address"    value={doctorInfo?.address} />
            <Box sx={{ p: 1.5, borderRadius: 2, background: "#f8fafc", border: "1px solid #e2e8f0", gridColumn: "1 / -1" }}>
              <Typography fontSize={11} color="text.secondary" fontWeight={600} mb={1}
                sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                Specialities
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.8}>
                {doctorInfo?.speciality?.length > 0
                  ? doctorInfo.speciality.map((s, i) => (
                    <span key={i} style={{
                      background: T.colors.primaryLight, color: T.colors.primary,
                      padding: "4px 12px", borderRadius: 999,
                      fontSize: 12, fontWeight: 600, border: "1px solid #c7d7fe",
                    }}>{s}</span>
                  ))
                  : <span style={{
                    background: "#f8fafc", color: T.colors.textMuted,
                    padding: "4px 12px", borderRadius: 999,
                    fontSize: 12, border: `1px solid ${T.colors.border}`,
                  }}>No speciality added</span>
                }
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 0, borderTop: "1px solid #e2e8f0" }}>
          <button type="button" style={{ ...btnPrimary, background: "linear-gradient(135deg,#0d9488,#14b8a6)" }}
            onClick={() => setOpenInfo(false)}>
            Close
          </button>
          <button type="button" style={btnPrimary}
            onClick={() => { setOpenInfo(false); navigate(`/admin/doctors/edit-doctor/${doctorInfo?.id}`); }}>
            <i className="fa-solid fa-pen" /> Edit
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DoctorManagement;
