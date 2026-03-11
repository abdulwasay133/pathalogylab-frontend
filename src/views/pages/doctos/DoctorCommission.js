
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import api from "api/axios";
import AppTable from "components/AppTable";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Card, CardBody, CardHeader, Container, Row } from "reactstrap";

function DoctorCommissions() {

  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const [summary, setSummary] = useState({
    total: 0,
    paid: 0,
    unpaid: 0
  });

  const [openInfo, setOpenInfo] = useState(false);
  const [commissionInfo, setCommissionInfo] = useState(null);

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "doctor_name", headerName: "Doctor", width: 200 },
    { field: "patient_name", headerName: "Patient", width: 200 },
    { field: "receipt_id", headerName: "Receipt", width: 120 },
    { field: "receipt_amount", headerName: "Amount", width: 120 },
    { field: "commission_percentage", headerName: "%", width: 80 },
    { field: "commission_amount", headerName: "Commission", width: 150 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "created_at", headerName: "Date", width: 150 },
  ];

  const handleView = (row) => {
    setCommissionInfo(row);
    setOpenInfo(true);
  };

  const handleClose = () => {
    setOpenInfo(false);
  };

  const markPaid = async (row) => {
    try {
      await api.post(`/doctor-commissions/pay/${row.id}`);
      toast.success("Commission marked as Paid");
      FetchData();
      fetchSummary();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update commission");
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get("/doctors");
      setDoctors(response.data.data || response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get("/doctor-commissions/summary", {
        params: { doctor_id: selectedDoctor }
      });
      setSummary(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const FetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/doctor-commissions", {
        params: {
          page,
          pageSize,
          search,
          doctor_id: selectedDoctor
        }
      });

      setRows(response.data.data);
      setTotalRows(response.data.total);

    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    FetchData();
    fetchSummary();
  }, [page, pageSize, search, selectedDoctor]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8"></div>

      <Container className="mt--9" fluid>

        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <h3 className="mb-0">Doctor Commissions</h3>
              </CardHeader>

              <CardBody>

                {/* SUMMARY CARDS */}

                <Row style={{ marginBottom: "20px" }}>

                  {/* <div className="col-xl-4 col-lg-6">
                    <Card className="card-stats shadow">
                      <CardBody>
                        <Typography variant="h6">Total Commission (Month)</Typography>
                        <Typography variant="h4" style={{ fontWeight: "bold" }}>
                          Rs {summary.total}
                        </Typography>
                      </CardBody>
                    </Card>
                  </div> */}

                  {/* <div className="col-xl-4 col-lg-6">
                    <Card className="card-stats shadow">
                      <CardBody>
                        <Typography variant="h6">Paid Commission</Typography>
                        <Typography variant="h4" style={{ fontWeight: "bold", color: "green" }}>
                          Rs {summary.paid}
                        </Typography>
                      </CardBody>
                    </Card>
                  </div> */}

                  {/* <div className="col-xl-4 col-lg-6">
                    <Card className="card-stats shadow">
                      <CardBody>
                        <Typography variant="h6">Pending Commission</Typography>
                        <Typography variant="h4" style={{ fontWeight: "bold", color: "red" }}>
                          Rs {summary.unpaid}
                        </Typography>
                      </CardBody>
                    </Card>
                  </div> */}

                </Row>

                {/* DOCTOR FILTER */}

                <Box sx={{ mb: 3, width: 300 }}>
                  <Typography sx={{ mb: 1, fontWeight: 600 }}>
                    Select Doctor
                  </Typography>

                  <select
                    className="form-control"
                    value={selectedDoctor}
                    onChange={(e) => {
                      setSelectedDoctor(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All Doctors</option>

                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </Box>

                {/* TABLE */}

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
                  actions={{
                    view: handleView,
                    pay: markPaid
                  }}
                />

              </CardBody>
            </Card>
          </div>
        </Row>

      </Container>

      {/* DETAILS DIALOG */}

      <Dialog
        open={openInfo}
        onClose={() => setOpenInfo(false)}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            padding: "10px",
            minWidth: "400px"
          }
        }}
      >

        <DialogTitle>
          <Typography fontWeight={700} fontSize="20px">
            Commission Details
          </Typography>
        </DialogTitle>

        <DialogContent>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 2,
              mt: 2
            }}
          >

            <Typography>
              <strong>Doctor:</strong> {commissionInfo?.doctor_name}
            </Typography>

            <Typography>
              <strong>Patient:</strong> {commissionInfo?.patient_name}
            </Typography>

            <Typography>
              <strong>Receipt ID:</strong> {commissionInfo?.receipt_id}
            </Typography>

            <Typography>
              <strong>Receipt Amount:</strong> {commissionInfo?.receipt_amount}
            </Typography>

            <Typography>
              <strong>Commission %:</strong> {commissionInfo?.commission_percentage}
            </Typography>

            <Typography>
              <strong>Commission Amount:</strong> {commissionInfo?.commission_amount}
            </Typography>

            <Typography>
              <strong>Status:</strong> {commissionInfo?.status}
            </Typography>

            <Typography>
              <strong>Date:</strong> {commissionInfo?.created_at}
            </Typography>

          </Box>

        </DialogContent>

        <DialogActions sx={{ pr: 2, pb: 2 }}>
          <button className="btn btn-primary" onClick={handleClose}>
            OK
          </button>
        </DialogActions>

      </Dialog>
    </>
  );
}

export default DoctorCommissions;

