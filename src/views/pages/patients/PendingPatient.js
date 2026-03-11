
import React, { useEffect, useState, useMemo } from "react";
import api from "api/axios";
import {
  Card,
  CardBody,
  CardHeader,
  Container,
  Row,
  Col,
  Badge,
  Button,
  Input
} from "reactstrap";
import PatientTestsModal from "components/PatientTestsModal";

const PATIENTS_PER_PAGE = 8;

export default function PendingPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
const [modalOpen, setModalOpen] = useState(false);
const [autoRefresh, setAutoRefresh] = useState(false);
const [secondsLeft, setSecondsLeft] = useState(300);

const toggleModal = () => setModalOpen(!modalOpen);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get("/patients");
      setPatients(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
  if (!autoRefresh) return;

  setSecondsLeft(300);

  const fetchInterval = setInterval(() => {
    fetchPatients();
    setSecondsLeft(300);
  }, 300000); // 5 minutes

  const timer = setInterval(() => {
    setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
  }, 1000);

  return () => {
    clearInterval(fetchInterval);
    clearInterval(timer);
  };
}, [autoRefresh]);

  // Search filtering
  const filteredPatients = useMemo(() => {
    if (!search) return patients;

    return patients.filter((p) => {
      const name = p.name?.toLowerCase() || "";
      const phone = p.phone || "";
      const id = String(p.id);

      return (
        name.includes(search.toLowerCase()) ||
        phone.includes(search) ||
        id.includes(search)
      );
    });
  }, [patients, search]);

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / PATIENTS_PER_PAGE);

  const paginatedPatients = useMemo(() => {
    const start = (page - 1) * PATIENTS_PER_PAGE;
    return filteredPatients.slice(start, start + PATIENTS_PER_PAGE);
  }, [filteredPatients, page]);

  return (
    <>
      <div className="header bg-gradient-warning pb-8 pt-5 pt-md-8" />

      <Container className="mt--9" fluid>
        {/* Header */}
        <Row>
          <Col>
            <Card className="shadow mb-4">
<CardHeader className="d-flex justify-content-between align-items-center flex-wrap">
  <h3 className="mb-0">Pending Patients</h3>

  <Input
    style={{ maxWidth: 250 }}
    placeholder="Search name / phone / id"
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setPage(1);
    }}
  />

  <Badge color="warning">
    Total: {filteredPatients.length}
  </Badge>

  <div className="d-flex align-items-center">
    <Button
      size="sm"
      color={autoRefresh ? "danger" : "success"}
      onClick={() => setAutoRefresh(!autoRefresh)}
      className="mr-2"
    >
      {autoRefresh ? "Disable Auto Refresh" : "Enable Auto Refresh"}
    </Button>

    {autoRefresh && (
      <Badge color="info">
        Refresh in {Math.floor(secondsLeft / 60)}:
        {String(secondsLeft % 60).padStart(2, "0")}
      </Badge>
    )}
  </div>
</CardHeader>
            </Card>
          </Col>
        </Row>

        {/* Cards */}
        <Row>
          {loading && (
            <Col>
              <p>Loading patients...</p>
            </Col>
          )}

          {!loading && paginatedPatients.length === 0 && (
            <Col>
              <Card className="shadow-sm">
                <CardBody className="text-center">
                  No patients found
                </CardBody>
              </Card>
            </Col>
          )}

          {paginatedPatients.map((p) => (
            <Col xl="3" lg="4" md="6" sm="12" key={p.id} className="mb-3">
              <Card className="shadow-sm h-100">
                <CardBody style={{ padding: 14 }}>
                  <div className="d-flex justify-content-between">
                    <h5 className="mb-1">{p.name}</h5>
                    <Badge color="danger">Pending</Badge>
                  </div>

                  <small>
                    <strong>Booking:</strong> Lab:0{p.id}
                  </small>
                  <br />

                  <small>
                    <strong>Ref:</strong> {p.doctor?.name || "-"}
                  </small>
                  <br />

                  <small>
                    <strong>Age:</strong> {p.age}
                  </small>
                  <br />

                  <small>
                    <strong>Mobile:</strong> {p.phone}
                  </small>
                  <br />

                  <small>
                    <strong>Date:</strong> {p.date} / {p.time}
                  </small>

                  <div className="mt-2">
                    <Button
  size="sm"
  color="info"
  block
  onClick={() => {
    setSelectedPatient(p);
    setModalOpen(true);
  }}
>
  View Tests
</Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Pagination */}
        {totalPages > 1 && (
          <Row className="mt-3">
            <Col className="text-center">
              <Button
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="mr-2"
              >
                Prev
              </Button>

              <span>
                Page {page} / {totalPages}
              </span>

              <Button
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="ml-2"
              >
                Next
              </Button>
            </Col>
          </Row>
        )}
      </Container>
      <PatientTestsModal
  patient={selectedPatient}
  isOpen={modalOpen}
  toggle={toggleModal}
/>
    </>
  );
}


