import api from "api/axios";
import AppTable from "components/AppTable";
import ErrorDialoge from "components/dialogs/ErrorDialoge";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Card, CardBody, CardHeader, Container, Row } from "reactstrap";

const TestManagement = () => {
  const [rows, setRows]         = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading]   = useState(false);
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch]     = useState("");
  const [warn, setWarn]         = useState(false);
  const [record, setRecord]     = useState(null);

  const navigate = useNavigate();

  /* ── columns ── */
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "test_name", headerName: "Test Name", flex: 1, minWidth: 200 },
    { field: "test_short_name", headerName: "Short Name", width: 160 },
    {
      field: "is_active",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "4px 12px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 600,
          background: params.value == 1 ? "#eafaf3" : "#fff0f3",
          color:      params.value == 1 ? "#1aae6f" : "#f5365c",
          border:     `1px solid ${params.value == 1 ? "#b7ebd9" : "#fcc"}`,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: params.value == 1 ? "#2dce89" : "#f5365c",
            flexShrink: 0,
          }} />
          {params.value == 1 ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      field: "amount",
      headerName: "Price",
      width: 130,
      renderCell: (params) => (
        <span style={{ fontWeight: 600, color: "#32325d" }}>
          PKR {Number(params.value || 0).toLocaleString()}
        </span>
      ),
    },
  ];

  /* ── API ── */
  const FetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/test", {
        params: { page, pageSize, search },
      });
      setRows(res.data.data);
      setTotalRows(res.data[0]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleEdit   = (row) => navigate(`/admin/edit-test/${row.id}`);
  const handleView   = (row) => navigate(`/admin/test-view/${row.id}`);
  const handleDelete = (row) => { setRecord(row); setWarn(true); };

  const confirmDelete = async () => {
    try {
      const res = await api.delete(`/test/${record.id}`);
      if (res.status !== 200) { toast.error(res.data.message); return; }
      setWarn(false);
      toast.success("Test deleted successfully.");
      FetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete test.");
    }
  };

  useEffect(() => { FetchData(); }, [page, pageSize, search]);

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
              {/* ── Card Header ── */}
              <CardHeader
                className="bg-white border-0"
                style={{ padding: "1.25rem 1.5rem" }}
              >
                <div className="d-flex align-items-center justify-content-between flex-wrap"
                  style={{ gap: 12 }}>

                  {/* Title */}
                  <div className="d-flex align-items-center" style={{ gap: 10 }}>
                    <span style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: "linear-gradient(135deg,#11cdef,#1171ef)",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 18,
                    }}>
                      <i className="fa fa-syringe text-white"></i>
                    </span>
                    <div>
                      <h3 className="mb-0" style={{ fontWeight: 700, color: "#32325d" }}>
                        Test Management
                      </h3>
                      <p className="mb-0" style={{ fontSize: 12, color: "#8898aa" }}>
                        Manage all diagnostic tests
                      </p>
                    </div>
                  </div>

                  {/* Add button */}
                  <button
                    className="btn btn-primary btn-sm"
                    style={{
                      borderRadius: 8, fontWeight: 600,
                      padding: "8px 20px",
                      background: "linear-gradient(135deg,#5e72e4,#825ee4)",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(94,114,228,.35)",
                    }}
                    onClick={() => navigate("/admin/add-test")}
                  >
                    + Add New Test
                  </button>
                </div>
              </CardHeader>

              {/* ── Card Body ── */}
              <CardBody style={{ padding: "0rem 2rem 1rem 2rem" }}>
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
                  actions={{
                    edit:   handleEdit,
                    delete: handleDelete,
                    view:   handleView,
                  }}
                />
              </CardBody>
            </Card>
          </div>
        </Row>
      </Container>

      {/* ── Delete confirmation dialog ── */}
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