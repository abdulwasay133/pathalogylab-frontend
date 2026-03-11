import api from "api/axios";
import AppTable from "components/AppTable";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
} from "reactstrap";
import { toast } from "react-toastify";
import React from "react";
import PatientTestsModal from "components/PatientTestsModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CompletedPatients = () => {

  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
const [dateFrom, setDateFrom] = useState(null);
const [dateTo, setDateTo] = useState(null);


  const toggleModal = () => setModalOpen(!modalOpen);

  const applyQuickFilter = (type) => {
  const today = new Date();
  let start, end;

  if (type === "today") {
    start = today;
    end = today;
  }

  if (type === "yesterday") {
    start = new Date();
    start.setDate(today.getDate() - 1);
    end = start;
  }

  if (type === "week") {
    start = new Date();
    start.setDate(today.getDate() - 7);
    end = today;
  }

  if (type === "month") {
    start = new Date();
    start.setMonth(today.getMonth() - 1);
    end = today;
  }

  setDateFrom(start);
  setDateTo(end);
};

  const columns = [
    { field: "id", headerName: "ID", width: 50 },

    { field: "patient_name", headerName: "Patient Name", width: 250 },

    { field: "phone", headerName: "Mobile", width: 130 },

    { field: "doctor", headerName: "Doctor", width: 250 },

    {
      field: "tests_count",
      headerName: "Tests",
      width: 50
    },

    {
      field: "date",
      headerName: "Date",
      width: 180
    },

    {
      field: "status",
      headerName: "Report Status",
      flex: 1,
      renderCell: () => {
        const style = {
          padding: "5px 10px",
          borderRadius: "12px",
          color: "white",
          fontSize: "0.75rem",
          backgroundColor: "#2dce89"
        };

        return <span style={style}>Completed</span>;
      }
    }
  ];

  const FetchData = async () => {
    setLoading(true);

    try {

const response = await api.get("/completed-patients", {
  params: {
    page,
    pageSize,
    search,
    dateFrom,
    dateTo
  }
});

      setRows(response.data.data);
      setTotalRows(response.data.total);

    } catch (error) {

      console.error(error);
      toast.error("Failed to load reports");

    } finally {
      setLoading(false);
    }
  };

  const handleView = (row) => {

    setSelectedPatient(row);
    setModalOpen(true);

    // navigate(`/admin/patient-report/${row.id}`);

  };

useEffect(() => {
  FetchData();
}, [page, pageSize, search, dateFrom, dateTo]);

  return (
    <>
      <div className="header bg-gradient-success pb-8 pt-5 pt-md-8" />

      <Container className="mt--9" fluid>
        <Row>
          <div className="col">

            <Card className="shadow">

              <CardHeader className="bg-transparent">
                <h3 className="mb-0">Completed Patient Reports</h3>
              </CardHeader>

              <CardBody>

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
        toggle={toggleModal}
      />
    </>
  );
};

export default CompletedPatients;