import { useEffect, useRef, useState } from "react";
import api from "api/axios";
import AppTable from "components/AppTable";
import PatientTestsModal from "components/PatientTestsModal";
import { toast } from "react-toastify";
import { Card, CardBody, CardHeader, Container, Row } from "reactstrap";

const CompletedPatients = () => {
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 🔥 prevents infinite API loop
  const lastQueryRef = useRef("");
  const requestIdRef = useRef(0);

  const columns = [
    { field: "id", headerName: "ID", width: 60 },
    { field: "patient_name", headerName: "Patient Name", flex: 1, minWidth: 180 },
    { field: "phone", headerName: "Mobile", width: 140 },
    { field: "doctor", headerName: "Doctor", width: 180 },
    { field: "tests_count", headerName: "Tests", width: 80 },
    { field: "date", headerName: "Date", width: 140 },
    {
      field: "status",
      headerName: "Report Status",
      width: 150,
      renderCell: () => (
        <span
          style={{
            padding: "4px 12px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            background: "#eafaf3",
            color: "#1aae6f",
            border: "1px solid #b7ebd9",
          }}
        >
          Completed
        </span>
      ),
    },
  ];

  const handleFilterChange = async (params = {}) => {
    const queryKey = JSON.stringify(params);

    // 🔥 BLOCK DUPLICATE REQUESTS (THIS FIXES YOUR LOOP)
    if (lastQueryRef.current === queryKey) return;
    lastQueryRef.current = queryKey;

    const requestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const res = await api.get("/completed-patients", {
        params: {
          page: params.page ?? 1,
          page_size: params.page_size ?? 10,
          search: params.search || "",
          date_column: params.date_column || "",
          date_from: params.date_from || "",
          date_to: params.date_to || "",
          sort_field: params.sort_field || "",
          sort_dir: params.sort_dir || "",
          ...Object.fromEntries(
            Object.entries(params.filters || {}).filter(([, v]) => v)
          ),
        },
      });

      // ignore stale responses
      if (requestId !== requestIdRef.current) return;

      const response = res.data || {};
      const data = response.data || response.results || [];
      const total = response.total || response.count || data.length || 0;

      setRows(
        Array.isArray(data)
          ? data.map((item, i) => ({
              ...item,
              id: item.id ?? item._id ?? i + 1,
            }))
          : []
      );

      setTotalRows(total);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reports.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    handleFilterChange({ page: 1, page_size: 10 });
  }, []);

  return (
    <>
      <div className="header bg-gradient-success pb-8 pt-5 pt-md-8" />

      <Container className="mt--9" fluid>
        <Row>
          <div className="col">
            <Card className="shadow border-0">
              <CardHeader>
                Completed Patient Reports ({totalRows})
              </CardHeader>

              <CardBody>
                <AppTable
                  rows={rows}
                  columns={columns}
                  loading={loading}
                  rowCount={totalRows}
                  defaultPageSize={10}
                  onFilterChange={handleFilterChange}
                  actions={{
                    view: (row) => {
                      setSelectedPatient(row);
                      setModalOpen(true);
                    },
                  }}
                  dateColumnFields={["date"]}
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