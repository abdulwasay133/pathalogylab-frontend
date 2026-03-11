
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Table,
  Badge
} from "reactstrap";
import api from "api/axios";
import TestReportModal from "./TestReportModal";
import PrintReport from "./PrintReport";
import { Checkbox } from "@mui/material";

export default function PatientTestsModal({ patient, isOpen, toggle }) {

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);

  const [reportModal, setReportModal] = useState(false);
  const [printModal, setPrintModal] = useState(false);

  const [selectedTest, setSelectedTest] = useState(null);
  const [isEdit,setIsEdit] = useState(false);

  // FIXED (must be array)
  const [selectedTests, setSelectedTests] = useState([]);

  const toggleReportModal = () => {setReportModal(!reportModal);fetchTests();};

  const togglePrintModal = () => setPrintModal(!printModal);

  const fetchTests = async () => {
    
    if (!patient) return;

    try {
      setLoading(true);
      const res = await api.get(`/patients/${patient.id}/tests`);
      console.log('fetching tests',res.data.data);
      setTests(res.data.data);
    } catch (error) {
      console.error("Failed to fetch tests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (test) => {
    setSelectedTests((prev) =>
      prev.includes(test.id)
        ? prev.filter((id) => id !== test.id)
        : [...prev, test.id]
    );
  };

  useEffect(() => {
    if (isOpen) {
      fetchTests();
      setSelectedTests([]); // reset selection
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">

      <ModalHeader toggle={toggle} >
        <div className="d-flex justify-content-between">
        <div>
        Tests - {patient?.name}
        </div>

        <button
        style={{marginLeft:"580px"}}
          className="btn btn-sm btn-primary ms-2 flex-end"
          disabled={selectedTests.length === 0}
          onClick={togglePrintModal}
        >
          <i className="fa-solid fa-print"></i>
        </button>
</div>
      </ModalHeader>

      <ModalBody>

        {loading && <p>Loading tests...</p>}

        {!loading && tests.length === 0 && (
          <p>No tests found</p>
        )}

        {!loading && tests.length > 0 && (

          <Table bordered responsive>

            <thead>
              <tr>
                <th>#</th>
                <th>Test Name</th>
                <th>Status</th>
                <th>Action</th>
                <th>Print</th>
              </tr>
            </thead>

            <tbody>

              {tests.map((t, index) => (

                <tr key={t.id}>

                  <td>{index + 1}</td>

                  <td>{t.test.test_name}</td>

                  <td>
                    {t.status === 1 ? (
                      <Badge color="success">Completed</Badge>
                    ) : (
                      <Badge color="warning">Pending</Badge>
                    )}
                  </td>

                  <td>
                    {t.status === 0 ? (<button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        setSelectedTest(t);
                        setReportModal(true);
                        setIsEdit(false);
                      }}
                    >
                      <i className="fa-solid fa-file-circle-plus"></i>
                    </button>):(<button
                      className="btn btn-sm btn-secondry"
                      onClick={() => {
                        setSelectedTest(t);
                        setReportModal(true);
                        setIsEdit(true);
                      }}
                    >
                      <i className="fa-solid fa-pen-clip"></i>
                    </button>)}
                  </td>

                  <td>
                    {t.status === 1 && (
                      <Checkbox
                        checked={selectedTests.includes(t.id)}
                        onChange={() => handleCheck(t)}
                        sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
                      />
                    )}
                  </td>

                </tr>

              ))}

            </tbody>

          </Table>

        )}

      </ModalBody>

      <TestReportModal
        test={selectedTest}
        isOpen={reportModal}
        isEdit={isEdit}
        toggle={toggleReportModal}
      />

      <PrintReport
        testIds={selectedTests}
        isOpen={printModal}
        toggle={togglePrintModal}
      />

    </Modal>
  );
}
