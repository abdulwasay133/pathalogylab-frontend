import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import api from 'api/axios';
import AppTable from 'components/AppTable'
import ErrorDialoge from 'components/dialogs/ErrorDialoge'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, CardBody, CardHeader, Container, Row } from 'reactstrap'

function DoctorManagement() {
    const [rows, setRows] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [search, setSearch] = useState('');
    const [warn,setWarn]         = useState(false);
    const [record,setRecord]       = useState(null);
    const [openInfo,setOpenInfo]   = useState(false);
    const [doctorInfo,setDoctorInfo] = useState(null);
    const navigate = useNavigate();

    const columns = [
        {field: 'id', headerName: 'ID', width: 70},
        {field: 'name', headerName: 'Name', width: 200},
        {field: 'email', headerName: 'Email', width: 200},
        {field: 'phone', headerName: 'Phone', width: 150},
        {field: 'address', headerName: 'Address', width: 300},
        {field: 'qualifications', headerName: 'Qualification', width: 100},
        // {field: 'commission_percentage', headerName: '%', width: 50},
        
    ]


    const handleEdit = (row) => {
        // toast.info(`Edit row ${row.id}`);
        navigate(`/admin/doctors/edit-doctor/${row.id}`);

    }

    const handleDelete = async (row) => {
        setRecord(row);  // store row
    }

    const handleView = (row) => {
        setOpenInfo(true);
        setDoctorInfo(row);
        console.log(row);
    }
    const handleClose = () => {
        setOpenInfo(false);
    }

    const confirmDelete = async () => {
        try {
            const response = await api.delete(`/doctors/${record.id}`);
            if(response.status!==200){
                toast.error(response.data.message);
                return;
            }
            setWarn(false);
            toast.success(response.message);
            FetchData();
    
            console.log(response.data);
    
        } catch (err) {
            console.error(err);
        }
    }

    const FetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/doctors', {
                params: { page, pageSize, search },
            });
            setRows(response.data.data);
            setTotalRows(response.data[0]);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    }

    useEffect(() => {
        FetchData();
    }, [page, pageSize, search]);

  return (
    <>
            <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
      </div>
      {/* Page content */}
      <Container className="mt--9" fluid>
        {/* Table */}
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <h3 className="mb-0">Test Management</h3>
              </CardHeader>
              <CardBody>

                <div>
      
      <AppTable
        rows={rows}
        addPath="/admin/doctors/add-doctor"
        columns={columns}
        loading={loading}
        pageSize={pageSize}
        rowCount={totalRows}
        onPageChange={setPage}
        filter={search}
        onPageSizeChange={setPageSize}
        searchValue={search}
        onSearchChange={setSearch}
        setWarn={setWarn}
        setRecord={setRecord}
        actions={{ edit: handleEdit, delete: handleDelete, view: handleView }}
      />
    </div>

    <ErrorDialoge
  open={warn}
  handleClose={() => setWarn(false)}
  handleDelete={confirmDelete}
  setRecord={setRecord}
/>



              </CardBody>
            </Card>
          </div>
        </Row>
      </Container>


      <Dialog
      open={openInfo}
      onClose={()=>{setOpenInfo(false)}}
      PaperProps={{
        sx: {
          borderRadius: "12px",
          padding: "10px",
          minWidth: "380px"
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {/* <WarningAmberRoundedIcon
            sx={{ color: "var(--warning)", fontSize: 32 }}
          /> */}
          <Typography
            sx={{
              fontWeight: 700,
              color: "var(--gray-dark)",
              fontSize: "20px"
            }}
          >
            Doctor Details
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>

<Box
  sx={{
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 2,
    mt: 2,
    fontSize: "15px",
    color: "000"
  }}
>
  <Typography>
    <strong>Name:</strong> {doctorInfo?.name}
  </Typography>

  <Typography>
    <strong>Qualification:</strong> {doctorInfo?.qualifications}
  </Typography>

  <Typography>
    <strong>Phone:</strong> {doctorInfo?.phone}
  </Typography>

  <Typography>
    <strong>Email:</strong> {doctorInfo?.email}
  </Typography>

  <Typography>
    <strong>Gender:</strong> {doctorInfo?.gender}
  </Typography>

  <Typography>
    <strong>Age:</strong> {doctorInfo?.age}
  </Typography>

  <Typography>
    <strong>Commission:</strong> {doctorInfo?.commission_percentage}%
  </Typography>

  <Typography>
    <strong>Address:</strong> {doctorInfo?.address}
  </Typography>

<Typography>
  <strong>Speciality:</strong>
</Typography>

<Box sx={{ mt: 1 }}>
  {doctorInfo?.speciality.length > 0? doctorInfo?.speciality?.map((s) => (
    <span
      key={s}
      style={{
        background: "#e3f2fd",
        color: "#1976d2",
        padding: "4px 10px",
        borderRadius: "15px",
        marginRight: "6px",
        fontSize: "13px"
      }}
    >
      {s}
    </span>
  )): <span style={{ background: "#e3f2fd", color: "#1976d2", padding: "4px 10px", borderRadius: "15px", marginRight: "6px", fontSize: "13px" }}>No speciality</span>}
</Box>
</Box>
      </DialogContent>

      <DialogActions sx={{ pr: 2, pb: 2 }}>

        <button
          onClick={handleClose}
          variant="contained"
          className='btn btn-primary'
        >
          OK
        </button>
      </DialogActions>
    </Dialog>

    </>
  )
}

export default DoctorManagement