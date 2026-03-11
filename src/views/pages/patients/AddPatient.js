import React, { useEffect, useRef, useState } from "react";
import api from "api/axios";
import { useForm } from "react-hook-form";
import { Card, CardBody, CardHeader, Container, Row, Col } from "reactstrap";
import { useReactToPrint } from "react-to-print";
import ThermalReceipt from "components/ThermalReceipt";
import { toast } from "react-toastify";

export default function AddPatient() {
  const { register, handleSubmit, setValue } = useForm();
  const [doctors, setDoctors] = useState([]);
  const [tests, setTests] = useState([]);
  const [searchTest, setSearchTest] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTests, setSelectedTests] = useState([]);
  const [totalBill, setTotalBill] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [netBill, setNetBill] = useState(0);
  const [loading, setLoading] = useState(false);
  const [savedPatient, setSavedPatient] = useState(null);

  // Ref for the hidden receipt to print
  const receiptRef = useRef();

  // ✅ FIX: useReactToPrint with contentRef (modern API)
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
  });

  // ✅ FIX: Only trigger print once when savedPatient is set
  useEffect(() => {
    if (savedPatient) {
      // Small delay to ensure ThermalReceipt has rendered with new data
      const timer = setTimeout(() => {
        handlePrint();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [savedPatient]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTest), 400);
    return () => clearTimeout(timer);
  }, [searchTest]);

  // ✅ FIX: Removed setInterval from render body — was causing memory leaks.
  // Date/time auto-refresh every 2 minutes using useEffect with setInterval
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setValue("date", now.toISOString().split("T")[0]);
      setValue("time", now.toTimeString().slice(0, 5));
    };

    updateDateTime(); // set immediately on mount
    setValue("collection_point", "Main");

    const interval = setInterval(updateDateTime, 120000);
    return () => clearInterval(interval); // cleanup on unmount
  }, [setValue]);

  // Fetch doctors and tests
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRes = await api.get("/doctors");
        setDoctors(docRes.data.data);
        const testRes = await api.get("/test");
        setTests(testRes.data.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  // Calculate bill whenever tests or discount changes
  useEffect(() => {
    const total = selectedTests.reduce((sum, t) => sum + Number(t.amount), 0);
    setTotalBill(total);
    setNetBill(total - discount);
  }, [selectedTests, discount]);

  const filteredTests =
    debouncedSearch.trim() === ""
      ? []
      : tests.filter((t) =>
          t.test_name.toLowerCase().includes(debouncedSearch.toLowerCase())
        );

  const addTest = (test) => {
    if (!selectedTests.find((t) => t.id === test.id)) {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const removeTest = (id) => {
    setSelectedTests(selectedTests.filter((t) => t.id !== id));
  };

  // ✅ FIX: onSubmit now sets savedPatient which triggers the print useEffect
  const onSubmit = async (data) => {
    setLoading(true);
    const payload = {
      ...data,
      tests: selectedTests.map((t) => t.id),
      total_bill: totalBill,
      discount,
      net_bill: netBill,
    };
    console.log(payload);
    try {
      const response = await api.post("/patients", payload);
      console.log('response',response.data.data);
    //   if(response.status===200){
        
        const patientData = {
        ...response.data.data,
        doctor: response.data.data.doctor.name,
        tests: selectedTests,
        total_bill: totalBill,
        discount,
        net_bill: netBill,
      };
    //   }

      // Build full patient data object for the receipt

        // console.log(patientData);
      // ✅ Setting this triggers the useEffect above which calls handlePrint once
      setSavedPatient(patientData);
      alert("Patient saved successfully");
    } catch (err) {
      console.error(err);
      alert("Error saving patient");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8"></div>
      <Container className="mt--9" fluid>
        <Row>
          {/* LEFT FORM */}
          <Col xl="8">
            <Card className="shadow">
              <CardHeader>
                <h3 className="mb-0">Patient Entry</h3>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Row>
                    <Col md="6" className="mt-3">
                      <label>Booking No</label>
                      <input className="form-control" {...register("booking_no")} />
                    </Col>
                    <Col md="6" className="mt-3">
                      <label>Patient Name</label>
                      <input className="form-control" {...register("patient_name")} />
                    </Col>
                    <Col md="3" className="mt-3">
                      <label>Age</label>
                      <input type="number" className="form-control" {...register("age")} />
                    </Col>
                    <Col md="3" className="mt-3">
                      <label>Mobile</label>
                      <input className="form-control" {...register("mobile")} />
                    </Col>
                    <Col md="3" className="mt-3">
                      <label>Date</label>
                      <input type="date" className="form-control" {...register("date")} />
                    </Col>
                    <Col md="3" className="mt-3">
                      <label>Time</label>
                      <input type="time" className="form-control" {...register("time")} />
                    </Col>
                    <Col md="6" className="mt-3">
                      <label>Referred Doctor</label>
                      <select className="form-control" {...register("doctor_id")}>
                        <option value="">Select Doctor</option>
                        {doctors.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name}
                          </option>
                        ))}
                      </select>
                    </Col>
                    <Col md="6" className="mt-3">
                      <label>Collection Point</label>
                      <input className="form-control" {...register("collection_point")} />
                    </Col>

                    {/* Test Search */}
                    <Col md="6" className="mt-4">
                      <label>Search Test</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Start typing test name..."
                        value={searchTest}
                        onChange={(e) => setSearchTest(e.target.value)}
                      />
                      <div
                        className="card mt-2"
                        style={{ maxHeight: "200px", overflowY: "auto" }}
                      >
                        <div className="card-body p-2">
                          {searchTest !== debouncedSearch && (
                            <div className="text-center p-2">Searching...</div>
                          )}
                          {debouncedSearch.trim() !== "" &&
                            filteredTests.length === 0 && (
                              <div className="text-center p-2 text-muted">
                                No tests found
                              </div>
                            )}
                          {filteredTests.map((test) => (
                            <div
                              key={test.id}
                              className="d-flex justify-content-between align-items-center border-bottom py-2"
                            >
                              <div>
                                <strong>{test.test_name}</strong>
                                <div style={{ fontSize: "12px", color: "#888" }}>
                                  Rs {test.amount}
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-success"
                                onClick={() => addTest(test)}
                              >
                                +
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Col>

                    <Col md="3" className="mt-3">
                    <label>Age</label>
                    <input type="number" className="form-control" {...register("age")} />
                    </Col>

                    <Col md="3" className="mt-3">
                    <label>Gender</label>
                    <select className="form-control" {...register("gender")}>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    </Col>

                    <Col md="6" className="mt-4">
                      <label>Discount</label>
                      <input
                        type="number"
                        className="form-control"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                      />
                    </Col>
                    <Col md="6" className="mt-4">
                      <label>Payment Status</label>
                      <select className="form-control" {...register("payment_status")}>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                      </select>
                    </Col>

                    <Col className="mt-4 d-flex gap-2">
                      <button className="btn btn-primary px-5" disabled={loading}>
                        {loading ? "Saving..." : "Save Patient"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary px-5"
                        onClick={() => window.history.back()}
                      >
                        Cancel
                      </button>
                    </Col>
                  </Row>
                </form>
              </CardBody>
            </Card>
          </Col>

          {/* RIGHT SIDE */}
          <Col xl="4">
            {/* Selected Tests Card */}
            <Card className="shadow mb-3">
              <CardHeader>
                <h4>Selected Tests</h4>
              </CardHeader>
              <CardBody>
                {selectedTests.length === 0 && <p>No tests selected</p>}
                {selectedTests.map((test) => (
                  <div
                    key={test.id}
                    className="d-flex justify-content-between align-items-center border-bottom py-2"
                  >
                    <div>
                      <strong>{test.test_name}</strong>
                      <div style={{ fontSize: "12px", color: "#888" }}>
                        Rs {test.amount}
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => removeTest(test.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </CardBody>
            </Card>

            {/* Bill Summary */}
            <Card className="shadow">
              <CardHeader>
                <h4>Bill Summary</h4>
              </CardHeader>
              <CardBody>
                <p>Tests Selected: {selectedTests.length}</p>
                <p>Total Bill: Rs {totalBill}</p>
                <p>Discount: Rs {discount}</p>
                <h3 style={{ color: "#2dce89" }}>Net Payable: Rs {netBill}</h3>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* ✅ FIX: Receipt moved OUTSIDE all cards, hidden off-screen for printing */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        {savedPatient && (
          <div ref={receiptRef}>
            <ThermalReceipt patient={savedPatient} />
          </div>
        )}
      </div>
    </>
  );
}