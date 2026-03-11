
import { ThemeProvider } from "@mui/material";
import api from "api/axios";
import AppTable from "components/AppTable";
import { use, useEffect, useState } from "react";

import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
} from "reactstrap";
// src/theme.js
import { createTheme } from '@mui/material/styles';
import { toast } from "react-toastify";
import { Height } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ErrorDialoge from "components/dialogs/ErrorDialoge";


const TestManagement = () => {
    const [rows, setRows] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [search, setSearch] = useState('');
    const [warn,setWarn]         = useState(false);
    const [record,setRecord]       = useState(null);
    
    const navigate = useNavigate();

    const columns = [
        {field: 'id', headerName: 'ID', width: 70},
        {field: 'test_name', headerName: 'Test Name', width: 300},
        {field: 'test_short_name', headerName: 'Short Name', width: 300},
        // {field: 'test_category', headerName: 'Category', width: 130},
        {
    field: "is_active",
    headerName: "Status",
    flex: 1,
    renderCell: (params) => {
      const status = params.value;
      const badgeStyle = {
        padding: "5px 10px",
        borderRadius: "12px",
        color: "white",
        fontWeight: 130,
        textAlign: "center",
        
        fontSize: "0.75rem",
        backgroundColor: status == 1 ? "#2dce89" : "#f5365c", // green for active, red for inactive
      };
      return <span style={badgeStyle}>{status == 1 ? "Active" : "Inactive"}</span>;
    },
  },
        {field: 'amount', headerName: 'Price', width: 130},
        
    ]

    const FetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/test',{
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
    const handleEdit = (row) => {
    // toast.info(`Edit row ${row.id}`);
    navigate(`/admin/edit-test/${row.id}`);
  };
  const confirmDelete = async () => {
  try {
     const response = await api.delete(`/test/${record.id}`);
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
};

  const handleDelete = async (row) => {
  setRecord(row);  // store row
  };
  const handleView = (row) => {
    toast.info(`View Test Template`);
    navigate(`/admin/test-view/${row.id}`);
  };

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
    </>
  );
};

export default TestManagement;
