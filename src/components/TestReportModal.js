import api from "api/axios";
import { useEffect, useRef, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { toast } from "react-toastify";

export default function TestReportModal({ test, isOpen, toggle, isEdit }) {
  const [html,    setHtml]    = useState("");
  const [saving,  setSaving]  = useState(false);
  const [confirm, setConfirm] = useState(false);

  /* ── fetch existing report html ── */
  const getTest = async () => {
    try {
      const res = await api.get(`/patient-tests/${test.id}`);
      setHtml(res.data.data.html);
    } catch (err) {
      console.error("Failed to fetch test", err);
      toast.error("Failed to load report data.");
    }
  };

  useEffect(() => {
    if (!test) return;
    if (isEdit === false) {
      setHtml(test.test.html);
    } else {
      getTest();
    }
  }, [test]);

  if (!test) return null;

  /* ── save ── */
  const handleSave = async () => {
    setSaving(true);
    setConfirm(false);
    try {
      const report = document.getElementById("editable-report-content").innerHTML;
      await api.put(`/patient-tests/${test.id}`, { html: report });
      toast.success("Report saved successfully! ✅");
      toggle();
    } catch (err) {
      console.error("Failed to save report", err);
      toast.error("Failed to save report. Please try again.");
    }
    setSaving(false);
  };

  const testName = test?.test?.test_name || "Test Report";

  /* ─────────────────────────────────────────────────────────
     ALL styles are inline or scoped with unique IDs.
     No @keyframes, no global class names — zero leakage.
  ───────────────────────────────────────────────────────── */
  return (
    <>
      {/*
        Scoped only to #trm-modal — does NOT affect any other modal.
        No keyframes here. Animations are handled with inline style below.
      */}
      <style>{`
        #trm-modal .modal-content {
          border-radius: 16px !important;
          overflow: hidden !important;
          border: none !important;
          box-shadow: 0 20px 60px rgba(0,0,0,.15) !important;
        }
        #trm-modal .modal-header {
          border-bottom: none !important;
          padding: 0 !important;
        }
        #trm-modal .modal-header .close {
          padding: 1.25rem !important;
          position: absolute !important;
          right: 0 !important;
          top: 0 !important;
          margin: 0 !important;
          color: #fff !important;
          opacity: .8 !important;
          text-shadow: none !important;
          z-index: 10 !important;
          background: transparent !important;
          border: none !important;
          font-size: 1.5rem !important;
          cursor: pointer !important;
        }
        #trm-modal .modal-header .close:hover {
          opacity: 1 !important;
        }
        #trm-modal .modal-header .close span {
          color: #fff !important;
        }
        #editable-report-content [contenteditable="true"]:focus {
          outline: 2px solid #5e72e4;
          border-radius: 4px;
        }
        #editable-report-content input[type="text"]:focus {
          outline: 2px solid #5e72e4;
          border-radius: 4px;
        }
      `}</style>

      <Modal
        isOpen={isOpen}
        toggle={toggle}
        size="lg"
        centered
        id="trm-modal"
      >
        {/* ── Header ── */}
        <ModalHeader toggle={toggle} cssModule={{ "modal-title": "w-100" }}>
          <div style={{
            background: "linear-gradient(135deg,#5e72e4,#825ee4)",
            padding: "18px 24px",
            borderRadius: "12px 12px 0 0",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "rgba(255,255,255,.2)",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 18,
                  flexShrink: 0,
                }}>
                  <i className={isEdit ? "fa fa-edit text-white" : "fa fa-plus text-white"} />
                </span>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
                    {isEdit ? "Edit Report" : "Add Report"}
                  </div>
                  <div style={{ color: "rgba(255,255,255,.7)", fontSize: 12 }}>
                    {testName}
                  </div>
                </div>
              </div>

              {/* save button */}
              <button
                onClick={() => setConfirm(true)}
                disabled={saving}
                style={{
                  borderRadius: 8, border: "none", fontWeight: 700,
                  fontSize: 13, padding: "9px 20px",
                  cursor: saving ? "not-allowed" : "pointer",
                  background: saving ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.95)",
                  color: saving ? "rgba(255,255,255,.5)" : "#5e72e4",
                  display: "flex", alignItems: "center", gap: 8,
                  transition: "background .15s",
                  marginRight: 40,
                  flexShrink: 0,
                }}
              >
                {saving
                  ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14 }} /> Saving…</>
                  : <><i className="fa fa-save" /> Save Report</>
                }
              </button>
            </div>
          </div>
        </ModalHeader>

        {/* ── Body ── */}
        <ModalBody style={{ padding: "20px 24px", maxHeight: "70vh", overflowY: "auto", background: "#f8f9fe" }}>

          {/* info hint */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", borderRadius: 8, marginBottom: 16,
            background: "#f0f4ff", border: "1px solid #d0d8ff",
            fontSize: 12, color: "#5e72e4", fontWeight: 500,
          }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>💡</span>
            Click on any field inside the report to edit its value directly.
          </div>

          {/* report card */}
          <div style={{
            background: "#fff", borderRadius: 12,
            border: "1px solid #e9ecf3",
            boxShadow: "0 2px 12px rgba(0,0,0,.06)",
            overflow: "hidden",
          }}>
            {/* report title strip */}
            <div style={{
              padding: "12px 20px",
              borderBottom: "2px solid #5e72e4",
              background: "linear-gradient(135deg,#5e72e4,#825ee4)",
              textAlign: "center",
            }}>
              <h5 style={{
                color: "#fff", fontWeight: 800, margin: 0,
                letterSpacing: 1, textTransform: "uppercase", fontSize: 13,
              }}>
                {testName}
              </h5>
            </div>

            {/* editable content */}
            <div id="editable-report-content" style={{ padding: "20px 24px" }}>
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </div>

        </ModalBody>
      </Modal>

      {/* ══════════════════════════════════════════════════
          CONFIRMATION DIALOG
          — rendered as a plain fixed div, NOT a Modal.
          — all styles 100% inline, zero class dependencies.
      ══════════════════════════════════════════════════ */}
      {confirm && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 99999,
            background: "rgba(0,0,0,.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div style={{
            background: "#fff", borderRadius: 16,
            minWidth: 360, maxWidth: 440, width: "90%",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,.2)",
          }}>

            {/* accent bar */}
            <div style={{ height: 5, background: "linear-gradient(90deg,#5e72e4,#825ee4)" }} />

            {/* dialog header */}
            <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: "linear-gradient(135deg,#5e72e4,#825ee4)",
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 20,
                boxShadow: "0 4px 12px rgba(94,114,228,.3)",
              }}>💾</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, color: "#32325d" }}>
                  Save Report
                </div>
                <div style={{ fontSize: 12, color: "#8898aa", marginTop: 2 }}>
                  Please confirm before saving
                </div>
              </div>
            </div>

            {/* message box */}
            <div style={{ padding: "16px 24px" }}>
              <div style={{
                background: "#f0f4ff", border: "1px solid #d0d8ff",
                borderRadius: 10, padding: "12px 14px",
                display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
                <p style={{ margin: 0, fontSize: 13, color: "#525f7f", lineHeight: 1.6 }}>
                  Are you sure you want to save the report for{" "}
                  <strong style={{ color: "#5e72e4" }}>{testName}</strong>?
                  This will overwrite the existing data.
                </p>
              </div>
            </div>

            {/* action buttons */}
            <div style={{
              padding: "4px 24px 24px",
              display: "flex", gap: 10,
              borderTop: "1px solid #f0f0f0", paddingTop: 16,
            }}>
              <button
                onClick={() => setConfirm(false)}
                style={{
                  flex: 1, borderRadius: 8, border: "1px solid #e0e6ed",
                  background: "#f8f9fe", color: "#525f7f",
                  fontWeight: 600, fontSize: 14,
                  padding: "10px 0", cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  flex: 1, borderRadius: 8, border: "none",
                  background: "linear-gradient(135deg,#5e72e4,#825ee4)",
                  color: "#fff", fontWeight: 600, fontSize: 14,
                  padding: "10px 0", cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(94,114,228,.35)",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 6,
                }}
              >
                ✅ Yes, Save Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}