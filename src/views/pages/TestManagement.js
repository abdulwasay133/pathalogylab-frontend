import api from "api/axios";
import AppTable from "components/AppTable";
import ErrorDialoge from "components/dialogs/ErrorDialoge";
import PageShell from "components/layout/PageShell";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "utils/toast";
import { statusBadge, statusDot } from "theme/formStyles";
import T from "theme/tokens";

const TestManagement = () => {
  const [rows,      setRows]      = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading,   setLoading]   = useState(false);
  const [warn,      setWarn]      = useState(false);
  const [record,    setRecord]    = useState(null);

  const navigate = useNavigate();

  const columns = [
    { field: "id",              headerName: "ID",         width: 70  },
    { field: "test_name",       headerName: "Test Name",  flex: 1, minWidth: 200 },
    { field: "test_short_name", headerName: "Short Name", width: 160 },
    {
      field: "is_active",
      headerName: "Status",
      width: 120,
      filterable: false,
      renderCell: (params) => {
        const active = params.value == 1;
        return (
          <span style={statusBadge(active)}>
            <span style={statusDot(active)} />
            {active ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      field: "amount",
      headerName: "Price",
      width: 130,
      renderCell: (params) => (
        <span style={{ fontWeight: 600, color: T.colors.text }}>
          PKR {Number(params.value || 0).toLocaleString()}
        </span>
      ),
    },
  ];

  const handleFilterChange = useCallback(async (params) => {
    setLoading(true);
    try {
      const res = await api.get("/test", {
        params: {
          page:        params.page,
          page_size:   params.page_size,
          search:      params.search      || undefined,
          sort_field:  params.sort_field  || undefined,
          sort_dir:    params.sort_dir    || undefined,
          date_column: params.date_column || undefined,
          date_from:   params.date_from   || undefined,
          date_to:     params.date_to     || undefined,
          ...Object.fromEntries(
            Object.entries(params.filters || {}).filter(([, v]) => v)
          ),
        },
      });
      setRows(res.data.data);
      setTotalRows(res.data.total);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tests.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleView   = (row) => navigate(`/admin/test-view/${row.id}`);
  const handleEdit   = (row) => navigate(`/admin/edit-test/${row.id}`);
  const handleDelete = (row) => { setRecord(row); setWarn(true); };

  const confirmDelete = async () => {
    try {
      const res = await api.delete(`/test/${record.id}`);
      if (res.status !== 200) { toast.error(res.data.message); return; }
      setWarn(false);
      toast.success("Test deleted successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete test.");
    }
  };

  return (
    <>
      <PageShell
        variant="info"
        icon="fa-solid fa-vial-circle-check"
        title="Test Management"
        subtitle="Manage all diagnostic tests and pricing"
        badge={`${totalRows} Test${totalRows !== 1 ? "s" : ""}`}
        flushBody
      >
        <AppTable
          rows={rows}
          columns={columns}
          loading={loading}
          rowCount={totalRows}
          defaultPageSize={10}
          onFilterChange={handleFilterChange}
          addPath="/admin/add-test"
          setWarn={setWarn}
          actions={{
            view:   handleView,
            edit:   handleEdit,
            delete: handleDelete,
          }}
        />
      </PageShell>

      <ErrorDialoge
        open={warn}
        handleClose={() => setWarn(false)}
        handleDelete={confirmDelete}
        setRecord={setRecord}
      />
    </>
  );
};

export default TestManagement;
