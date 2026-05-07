import api from "api/axios";
import ThermalReceipt from "components/ThermalReceipt";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";

/* ── shared input style ── */
const iS = {
  borderRadius: 8, border: "1px solid #e0e6ed",
  padding: "9px 13px", fontSize: 14, color: "#32325d",
  background: "#fff", width: "100%", outline: "none",
  transition: "border .15s, box-shadow .15s",
};
const iErr = { border: "1px solid #f5365c" };
const onFocus = (e) => {
  e.target.style.border = "1px solid #5e72e4";
  e.target.style.boxShadow = "0 0 0 3px rgba(94,114,228,.1)";
};
const onBlur = (e) => {
  e.target.style.border = "1px solid #e0e6ed";
  e.target.style.boxShadow = "none";
};

/* ── field wrapper ── */
const Field = ({ label, required, error, half, quarter, children }) => (
  <Col md={quarter ? 3 : half ? 6 : 12} className="mb-3">
    <label style={{ fontSize: 13, fontWeight: 600, color: "#525f7f", marginBottom: 5, display: "block" }}>
      {label} {required && <span style={{ color: "#f5365c" }}>*</span>}
    </label>
    {children}
    {error && (
      <small style={{ color: "#f5365c", fontSize: 11, marginTop: 3, display: "block" }}>
        ⚠ {error}
      </small>
    )}
  </Col>
);

/* ── section label ── */
const SectionLabel = ({ icon, title }) => (
  <div className="d-flex align-items-center mb-3 mt-2" style={{ gap: 8 }}>
    <span style={{
      width: 26, height: 26, borderRadius: 7,
      background: "linear-gradient(135deg,#5e72e4,#825ee4)",
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
    }}><i className={icon}></i></span>
    <h6 className="mb-0 text-muted" style={{ letterSpacing: 1, fontSize: 11 }}>{title}</h6>
  </div>
);

/* ═══════════════════════════════════════════ */

export default function AddPatient() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onChange" });

  const [doctors, setDoctors]             = useState([]);
  const [tests, setTests]                 = useState([]);
  const [searchTest, setSearchTest]       = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTests, setSelectedTests] = useState([]);
  const [totalBill, setTotalBill]         = useState(0);
  const [discount, setDiscount]           = useState(0);
  const [netBill, setNetBill]             = useState(0);
  const [savedPatient, setSavedPatient]   = useState(null);
  const [testError, setTestError]         = useState("");

  const receiptRef = useRef();

  const handlePrint = useReactToPrint({ contentRef: receiptRef });

  /* ── auto-print on save ── */
  useEffect(() => {
    if (savedPatient) {
      const t = setTimeout(() => handlePrint(), 300);
      return () => clearTimeout(t);
    }
  }, [savedPatient, handlePrint]);

  /* ── debounce search ── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTest), 400);
    return () => clearTimeout(t);
  }, [searchTest]);

  /* ── set default date/time ── */
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setValue("date", now.toISOString().split("T")[0]);
      setValue("time", now.toTimeString().slice(0, 5));
    };
    update();
    setValue("collection_point", "Main");
    const interval = setInterval(update, 120000);
    return () => clearInterval(interval);
  }, [setValue]);

  /* ── fetch doctors + tests ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, testRes] = await Promise.all([
          api.get("/doctors"),
          api.get("/test"),
        ]);
        setDoctors(docRes.data.data);
        setTests(testRes.data.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load doctors/tests.");
      }
    };
    fetchData();
  }, []);

  /* ── recalculate bill ── */
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
      setSelectedTests((prev) => [...prev, test]);
      setTestError("");
    }
    setSearchTest("");
  };

  const removeTest = (id) =>
    setSelectedTests((prev) => prev.filter((t) => t.id !== id));

  /* ── submit ── */
  const onSubmit = async (data) => {
    if (selectedTests.length === 0) {
      setTestError("Please add at least one test.");
      return;
    }
    try {
      const payload = {
        ...data,
        tests: selectedTests.map((t) => t.id),
        total_bill: totalBill,
        discount,
        net_bill: netBill,
      };
      const res = await api.post("/patients", payload);
      const patientData = {
        ...res.data.data,
        doctor: res.data.data.doctor.name,
        tests: selectedTests,
        total_bill: totalBill,
        discount,
        net_bill: netBill,
      };
      setSavedPatient(patientData);
      toast.success("Patient saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save patient. Please try again.");
    }
  };

  /* ── render ── */
  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8" />

      <Container className="mt--9" fluid>
        <Row>

          {/* ══════════ LEFT — FORM ══════════ */}
          <Col xl="8" className="mb-4">
            <Card className="shadow border-0" style={{ borderRadius: 16, overflow: "hidden" }}>
              <CardHeader
                className="bg-white border-0"
                style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f0f0f0" }}
              >
                <div className="d-flex align-items-center justify-content-between flex-wrap" style={{ gap: 12 }}>
                  <div className="d-flex align-items-center" style={{ gap: 10 }}>
                    <span style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: "linear-gradient(135deg,#11cdef,#1171ef)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                    }}><i class="fa-solid fa-bed text-white"></i></span>
                    <div>
                      <h3 className="mb-0" style={{ fontWeight: 700, color: "#32325d" }}>
                        Patient Entry
                      </h3>
                      <p className="mb-0" style={{ fontSize: 12, color: "#8898aa" }}>
                        Register a new patient and assign tests
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    style={{
                      borderRadius: 8, fontWeight: 600, fontSize: 13,
                      background: "#f8f9fe", border: "1px solid #e0e6ed",
                      color: "#525f7f", padding: "7px 16px", cursor: "pointer",
                    }}
                    onClick={() => window.history.back()}
                  >
                    ← Back
                  </button>
                </div>
              </CardHeader>

              <CardBody style={{ padding: "1.5rem 1.75rem" }}>
                <form onSubmit={handleSubmit(onSubmit)}>

                  {/* ─ Patient Info ─ */}
                  <SectionLabel icon="fa-solid fa-user-injured text-white" title="PATIENT INFORMATION" />
                  <Row>
                    <Field label="Booking No" half error={errors.booking_no?.message}>
                      <input
                        style={errors.booking_no ? { ...iS, ...iErr } : iS}
                        placeholder="e.g. BK-0001"
                        onFocus={onFocus} onBlur={onBlur}
                        {...register("booking_no", { required: "Booking number is required" })}
                      />
                    </Field>

                    <Field label="Patient Name" required half error={errors.patient_name?.message}>
                      <input
                        style={errors.patient_name ? { ...iS, ...iErr } : iS}
                        placeholder="Full name"
                        onFocus={onFocus} onBlur={onBlur}
                        {...register("patient_name", {
                          required: "Patient name is required",
                          minLength: { value: 3, message: "Minimum 3 characters" },
                        })}
                      />
                    </Field>

                    <Field label="Age" required quarter error={errors.age?.message}>
                      <input
                        type="number"
                        style={errors.age ? { ...iS, ...iErr } : iS}
                        placeholder="0"
                        onFocus={onFocus} onBlur={onBlur}
                        {...register("age", {
                          required: "Age is required",
                          min: { value: 0, message: "Invalid age" },
                          max: { value: 150, message: "Invalid age" },
                        })}
                      />
                    </Field>

                    <Field label="Gender" required quarter error={errors.gender?.message}>
                      <select
                        style={errors.gender ? { ...iS, ...iErr } : iS}
                        {...register("gender", { required: "Gender is required" })}
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </Field>

                    <Field label="Mobile" required quarter error={errors.mobile?.message}>
                      <input
                        style={errors.mobile ? { ...iS, ...iErr } : iS}
                        placeholder="0300-0000000"
                        onFocus={onFocus} onBlur={onBlur}
                        {...register("mobile", {
                          required: "Mobile is required",
                          pattern: { value: /^[0-9\-+\s]{7,15}$/, message: "Invalid mobile number" },
                        })}
                      />
                    </Field>

                    <Field label="Date" required quarter error={errors.date?.message}>
                      <input
                        type="date"
                        style={errors.date ? { ...iS, ...iErr } : iS}
                        onFocus={onFocus} onBlur={onBlur}
                        {...register("date", { required: "Date is required" })}
                      />
                    </Field>
                  </Row>

                  <hr style={{ borderColor: "#f0f0f0", margin: "0.5rem 0 1.25rem" }} />

                  {/* ─ Referral ─ */}
                  <SectionLabel icon="fa fa-handshake text-white" title="REFERRAL & COLLECTION" />
                  <Row>
                    <Field label="Referred Doctor" half error={errors.doctor_id?.message}>
                      <select
                        style={errors.doctor_id ? { ...iS, ...iErr } : iS}
                        {...register("doctor_id", { required: "Please select a doctor" })}
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Collection Point" half error={errors.collection_point?.message}>
                      <input
                        style={errors.collection_point ? { ...iS, ...iErr } : iS}
                        placeholder="e.g. Main"
                        onFocus={onFocus} onBlur={onBlur}
                        {...register("collection_point", { required: "Collection point is required" })}
                      />
                    </Field>
                  </Row>

                  <hr style={{ borderColor: "#f0f0f0", margin: "0.5rem 0 1.25rem" }} />

                  {/* ─ Test Search ─ */}
                  <SectionLabel icon="fa-solid fa-dna text-white" title="ADD TESTS" />
                  <Row>
                    <Col md="12" className="mb-3">
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#525f7f", marginBottom: 5, display: "block" }}>
                        Search Test <span style={{ color: "#f5365c" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={searchTest}
                        onChange={(e) => setSearchTest(e.target.value)}
                        placeholder="Type test name to search…"
                        style={testError ? { ...iS, ...iErr } : iS}
                        onFocus={onFocus} onBlur={onBlur}
                      />
                      {testError && (
                        <small style={{ color: "#f5365c", fontSize: 11, marginTop: 3, display: "block" }}>
                          ⚠ {testError}
                        </small>
                      )}

                      {/* dropdown results */}
                      {(searchTest !== "" || debouncedSearch !== "") && (
                        <div style={{
                          border: "1px solid #e0e6ed", borderRadius: 8,
                          maxHeight: 200, overflowY: "auto",
                          marginTop: 6, background: "#fff",
                          boxShadow: "0 4px 16px rgba(0,0,0,.08)",
                        }}>
                          {searchTest !== debouncedSearch && (
                            <div style={{ padding: "10px 14px", color: "#8898aa", fontSize: 13 }}>
                              🔍 Searching…
                            </div>
                          )}
                          {debouncedSearch.trim() !== "" && filteredTests.length === 0 && (
                            <div style={{ padding: "10px 14px", color: "#8898aa", fontSize: 13 }}>
                              No tests found for "{debouncedSearch}"
                            </div>
                          )}
                          {filteredTests.map((test) => (
                            <div
                              key={test.id}
                              className="d-flex justify-content-between align-items-center"
                              style={{
                                padding: "10px 14px",
                                borderBottom: "1px solid #f5f5f5",
                                cursor: "pointer",
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = "#f8f9fe"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 14, color: "#32325d" }}>
                                  {test.test_name}
                                </div>
                                <div style={{ fontSize: 12, color: "#8898aa" }}>
                                  PKR {test.amount}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => addTest(test)}
                                disabled={!!selectedTests.find((t) => t.id === test.id)}
                                style={{
                                  borderRadius: 6, border: "none", fontWeight: 700,
                                  fontSize: 13, padding: "5px 14px", cursor: "pointer",
                                  background: selectedTests.find((t) => t.id === test.id)
                                    ? "#f0f0f0" : "#2dce89",
                                  color: selectedTests.find((t) => t.id === test.id)
                                    ? "#aaa" : "#fff",
                                }}
                              >
                                {selectedTests.find((t) => t.id === test.id) ? "Added" : "+ Add"}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </Col>
                  </Row>

                  <hr style={{ borderColor: "#f0f0f0", margin: "0.5rem 0 1.25rem" }} />

                  {/* ─ Payment ─ */}
                  <SectionLabel icon="fa-regular fa-credit-card text-white" title="PAYMENT" />
                  <Row>
                    <Field label="Discount (PKR)" half error={errors.discount?.message}>
                      <div style={{ position: "relative" }}>
                        <span style={{
                          position: "absolute", left: 12, top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: 12, color: "#8898aa", fontWeight: 600, pointerEvents: "none",
                        }}>PKR</span>
                        <input
                          type="number"
                          value={discount}
                          onChange={(e) => setDiscount(Number(e.target.value))}
                          style={{ ...iS, paddingLeft: 44 }}
                          placeholder="0"
                          onFocus={onFocus} onBlur={onBlur}
                          min={0}
                        />
                      </div>
                    </Field>

                    <Field label="Payment Status" required half error={errors.payment_status?.message}>
                      <select
                        style={errors.payment_status ? { ...iS, ...iErr } : iS}
                        {...register("payment_status", { required: "Payment status is required" })}
                      >
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                      </select>
                    </Field>
                  </Row>

                  {/* ── buttons ── */}
                  <hr style={{ borderColor: "#f0f0f0", margin: "0.5rem 0 1.25rem" }} />
                  <div className="d-flex align-items-center" style={{ gap: 12 }}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        borderRadius: 8, fontWeight: 600, fontSize: 14,
                        padding: "10px 32px", border: "none",
                        background: "linear-gradient(135deg,#11cdef,#1171ef)",
                        color: "#fff", cursor: isSubmitting ? "not-allowed" : "pointer",
                        boxShadow: "0 4px 12px rgba(17,193,239,.35)",
                        opacity: isSubmitting ? 0.7 : 1,
                        display: "flex", alignItems: "center", gap: 8,
                      }}
                    >
                      {isSubmitting ? (
                        <><span className="spinner-border spinner-border-sm" /> Saving…</>
                      ) : (
                        "Save"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => window.history.back()}
                      style={{
                        borderRadius: 8, fontWeight: 600, fontSize: 14,
                        padding: "10px 24px", cursor: "pointer",
                        background: "#f8f9fe", border: "1px solid #e0e6ed", color: "#525f7f",
                      }}
                    >
                      Cancel
                    </button>
                  </div>

                </form>
              </CardBody>
            </Card>
          </Col>

          {/* ══════════ RIGHT — SELECTED TESTS + BILL ══════════ */}
          <Col xl="4">

            {/* Selected Tests */}
            <Card className="shadow border-0 mb-4" style={{ borderRadius: 16, overflow: "hidden" }}>
              <CardHeader
                className="bg-white border-0"
                style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f0f0f0" }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center" style={{ gap: 8 }}>
                    <span style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: "linear-gradient(135deg,#5e72e4,#825ee4)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
                    }}><i class="fa-solid fa-vials text-white"></i></span>
                    <h4 className="mb-0" style={{ fontWeight: 700, fontSize: 15, color: "#32325d" }}>
                      Selected Tests
                    </h4>
                  </div>
                  {selectedTests.length > 0 && (
                    <span style={{
                      background: "#5e72e4", color: "#fff",
                      borderRadius: 999, fontSize: 11, fontWeight: 700,
                      padding: "2px 9px",
                    }}>
                      {selectedTests.length}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardBody style={{ padding: "0.75rem 1rem" }}>
                {selectedTests.length === 0 ? (
                  <div style={{
                    textAlign: "center", padding: "24px 0",
                    color: "#adb5bd", fontSize: 13,
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}><i class="fa-solid fa-vial"></i></div>
                    No tests selected yet
                  </div>
                ) : (
                  selectedTests.map((test) => (
                    <div
                      key={test.id}
                      className="d-flex justify-content-between align-items-center"
                      style={{
                        padding: "9px 6px",
                        borderBottom: "1px solid #f5f5f5",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#32325d" }}>
                          {test.test_name}
                        </div>
                        <div style={{ fontSize: 12, color: "#8898aa" }}>
                          PKR {Number(test.amount).toLocaleString()}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTest(test.id)}
                        style={{
                          width: 26, height: 26, borderRadius: 6,
                          background: "#fff0f3", border: "1px solid #fcc",
                          color: "#f5365c", cursor: "pointer",
                          fontWeight: 700, fontSize: 15, lineHeight: 1,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>

            {/* Bill Summary */}
            <Card className="shadow border-0" style={{ borderRadius: 16, overflow: "hidden" }}>
              <CardHeader
                className="bg-white border-0"
                style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f0f0f0" }}
              >
                <div className="d-flex align-items-center" style={{ gap: 8 }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "linear-gradient(135deg,#2dce89,#2dcecc)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
                  }}><i class="fa-solid fa-hand-holding-dollar text-white"></i></span>
                  <h4 className="mb-0" style={{ fontWeight: 700, fontSize: 15, color: "#32325d" }}>
                    Bill Summary
                  </h4>
                </div>
              </CardHeader>
              <CardBody style={{ padding: "1rem 1.25rem" }}>
                {[
                  { label: "Tests Selected", value: selectedTests.length, unit: "" },
                  { label: "Total Bill",     value: `PKR ${totalBill.toLocaleString()}`, unit: "" },
                  { label: "Discount",       value: `PKR ${discount.toLocaleString()}`, unit: "", color: "#f5365c" },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="d-flex justify-content-between align-items-center"
                    style={{ padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}
                  >
                    <span style={{ fontSize: 13, color: "#8898aa", fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: color || "#32325d" }}>
                      {value}
                    </span>
                  </div>
                ))}

                {/* Net payable */}
                <div style={{
                  marginTop: 12, padding: "12px 14px", borderRadius: 10,
                  background: "linear-gradient(135deg,#f0faf5,#e8f8f1)",
                  border: "1px solid #b7ebd9",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1aae6f" }}>
                    Net Payable
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#1aae6f" }}>
                    PKR {netBill.toLocaleString()}
                  </span>
                </div>
              </CardBody>
            </Card>

          </Col>
        </Row>
      </Container>

      {/* hidden receipt for printing */}
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