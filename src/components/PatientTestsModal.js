import api from "api/axios";
import PrintReport from "./PrintReport";
import TestReportModal from "./TestReportModal";
import { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

export default function PatientTestsModal({ patient, isOpen, toggle }) {
  const [tests, setTests]                 = useState([]);
  const [loading, setLoading]             = useState(false);
  const [reportModal, setReportModal]     = useState(false);
  const [printModal, setPrintModal]       = useState(false);
  const [selectedTest, setSelectedTest]   = useState(null);
  const [isEdit, setIsEdit]               = useState(false);
  const [selectedTests, setSelectedTests] = useState([]);

  /* ── fetch ── */
  const fetchTests = async () => {
    if (!patient) return;
    try {
      setLoading(true);
      const res = await api.get(`/patients/${patient.id}/tests`);
      setTests(res.data.data);
    } catch (err) {
      console.error("Failed to fetch tests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) { fetchTests(); setSelectedTests([]); }
  }, [isOpen]);

  const handleCheck = (test) =>
    setSelectedTests((prev) =>
      prev.includes(test.id)
        ? prev.filter((id) => id !== test.id)
        : [...prev, test.id]
    );

  const completedCount = tests.filter((t) => t.status === 1).length;
  const pendingCount   = tests.filter((t) => t.status === 0).length;

  return (
    <>
      {/* ── Scoped styles injected inside the component ── */}
      <style>{`
        #patient-tests-modal .modal-content {
          border-radius: 16px;
          overflow: hidden;
          border: none;
        }
        #patient-tests-modal .modal-header {
          border-bottom: none;
          padding: 0;
        }
        #patient-tests-modal .modal-header .close {
          padding: 1.25rem;
          position: absolute;
          right: 0px;
          top: 0px;
          margin: 0;
          color: #ffffff;
          opacity: 0.75;
          text-shadow: none;
          z-index: 10;
          background: transparent;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        #patient-tests-modal .modal-header .close:hover {
          opacity: 1;
          color: #ffffff;
        }
        #patient-tests-modal .modal-header .close span {
          color: #ffffff;
        }
      `}</style>

      <Modal
        isOpen={isOpen}
        toggle={toggle}
        size="lg"
        centered
        contentClassName="border-0"
        id="patient-tests-modal"
      >
        {/* ── Header ── */}
        <ModalHeader
          toggle={toggle}
          cssModule={{ "modal-title": "w-100" }}
        >
          <div style={{
            background: "linear-gradient(135deg,#11cdef,#1171ef)",
            padding: "18px 24px",
            borderRadius: "12px 12px 0 0",
          }}>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center" style={{ gap: 12 }}>
                <span style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "rgba(255,255,255,.2)",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 18,
                }}><i className="ni ni-single-02 text-white"></i></span>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
                    {patient?.name || "Patient"}
                  </div>
                  <div style={{ color: "rgba(255,255,255,.7)", fontSize: 12 }}>
                    Test Results Overview
                  </div>
                </div>
              </div>

              {/* print button — pushed left of the × close button */}
              <button
                disabled={selectedTests.length === 0}
                onClick={() => setPrintModal(true)}
                style={{
                  borderRadius: 8, border: "none", fontWeight: 600,
                  fontSize: 13, padding: "8px 16px",
                  cursor: selectedTests.length === 0 ? "not-allowed" : "pointer",
                  background: selectedTests.length === 0
                    ? "rgba(255,255,255,.2)"
                    : "rgba(255,255,255,.95)",
                  color: selectedTests.length === 0 ? "rgba(255,255,255,.5)" : "#1171ef",
                  display: "flex", alignItems: "center", gap: 6,
                  transition: "all .15s",
                  marginRight: 40,   /* leave room for the × close button */
                }}
              >
                <i className="fa-solid fa-print"></i> Print
                {selectedTests.length > 0 && (
                  <span style={{
                    background: "#1171ef", color: "#fff",
                    borderRadius: 999, fontSize: 11, fontWeight: 700,
                    width: 18, height: 18,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {selectedTests.length}
                  </span>
                )}
              </button>
            </div>

            {/* summary pills */}
            {!loading && tests.length > 0 && (
              <div className="d-flex" style={{ gap: 8, marginTop: 12 }}>
                <span style={{
                  background: "rgba(255,255,255,.15)", color: "#fff",
                  borderRadius: 999, fontSize: 11, fontWeight: 600, padding: "3px 12px",
                }}>
                  Total: {tests.length}
                </span>
                <span style={{
                  background: "rgba(45,206,137,.25)", color: "#d4f7ea",
                  borderRadius: 999, fontSize: 11, fontWeight: 600, padding: "3px 12px",
                }}>
                   Completed: {completedCount}
                </span>
                <span style={{
                  background: "rgba(251,99,64,.25)", color: "#ffd4c0",
                  borderRadius: 999, fontSize: 11, fontWeight: 600, padding: "3px 12px",
                }}>
                   Pending: {pendingCount}
                </span>
              </div>
            )}
          </div>
        </ModalHeader>

        {/* ── Body ── */}
        <ModalBody style={{ padding: "20px 24px", maxHeight: "65vh", overflowY: "auto" }}>

          {/* loading skeleton */}
          {loading && (
            <div>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                  {[30, 200, 80, 80, 40].map((w, j) => (
                    <div key={j} style={{ height: 14, width: w, borderRadius: 6, background: "#f0f0f0" }} />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* empty state */}
          {!loading && tests.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#adb5bd" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🧪</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>No tests found for this patient</div>
            </div>
          )}

          {/* table */}
          {!loading && tests.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fe" }}>
                  {["#", "Test Name", "Status", "Action", "Print"].map((h) => (
                    <th key={h} style={{
                      padding: "10px 14px", fontSize: 11, fontWeight: 700,
                      color: "#8898aa", textAlign: "left",
                      textTransform: "uppercase", letterSpacing: 0.5,
                      borderBottom: "2px solid #e9ecef",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tests.map((t, index) => (
                  <tr key={t.id}
                    style={{
                      borderBottom: "1px solid #f5f5f5",
                      background: index % 2 === 0 ? "#fff" : "#fafbff",
                      transition: "background .1s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"}
                    onMouseLeave={e => e.currentTarget.style.background = index % 2 === 0 ? "#fff" : "#fafbff"}
                  >
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#8898aa", fontWeight: 600, width: 40 }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 14, fontWeight: 600, color: "#32325d" }}>
                      {t.test?.test_name}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "4px 12px", borderRadius: 999,
                        fontSize: 12, fontWeight: 600,
                        background: t.status === 1 ? "#eafaf3" : "#fff8f0",
                        color:      t.status === 1 ? "#1aae6f" : "#fb6340",
                        border:     `1px solid ${t.status === 1 ? "#b7ebd9" : "#ffd4c0"}`,
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                          background: t.status === 1 ? "#2dce89" : "#fb6340",
                        }} />
                        {t.status === 1 ? "Completed" : "Pending"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {t.status === 0 ? (
                        <button
                          title="Add Report"
                          onClick={() => { setSelectedTest(t); setIsEdit(false); setReportModal(true); }}
                          style={{
                            borderRadius: 7, border: "none", fontWeight: 600,
                            fontSize: 12, padding: "6px 14px", cursor: "pointer",
                            background: "linear-gradient(135deg,#5e72e4,#825ee4)",
                            color: "#fff", boxShadow: "0 3px 8px rgba(94,114,228,.3)",
                            display: "flex", alignItems: "center", gap: 5,
                          }}
                        >
                          <i className="fa fa-plus" /> Add Report
                        </button>
                      ) : (
                        <button
                          title="Edit Report"
                          onClick={() => { setSelectedTest(t); setIsEdit(true); setReportModal(true); }}
                          style={{
                            borderRadius: 7, border: "1px solid #e0e6ed",
                            fontWeight: 600, fontSize: 12, padding: "6px 14px",
                            cursor: "pointer", background: "#f8f9fe", color: "#525f7f",
                            display: "flex", alignItems: "center", gap: 5,
                          }}
                        >
                          ✏️ Edit
                        </button>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {t.status === 1 && (
                        <label style={{ display: "flex", alignItems: "center", cursor: "pointer", marginBottom: 0 }}>
                          <div
                            onClick={() => handleCheck(t)}
                            style={{
                              width: 20, height: 20, borderRadius: 5,
                              border: selectedTests.includes(t.id) ? "2px solid #5e72e4" : "2px solid #cbd3da",
                              background: selectedTests.includes(t.id) ? "#5e72e4" : "#fff",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all .15s", cursor: "pointer", flexShrink: 0,
                            }}
                          >
                            {selectedTests.includes(t.id) && (
                              <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                                <path d="M1 4l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                        </label>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </ModalBody>
      </Modal>

      <TestReportModal
        test={selectedTest}
        isOpen={reportModal}
        isEdit={isEdit}
        toggle={() => { setReportModal((v) => !v); fetchTests(); }}
      />

      <PrintReport
        testIds={selectedTests}
        isOpen={printModal}
        toggle={() => setPrintModal((v) => !v)}
      />
    </>
  );
}