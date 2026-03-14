import React, { useEffect, useRef, useState } from "react";
import {
  CircularProgress,
  Dialog,
  DialogContent,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { toast } from "react-toastify";
import api from "api/axios";

/* ─────────────────────────────────────────
   Print styles injected once into <head>
───────────────────────────────────────── */
const PRINT_STYLE_ID = "invoice-print-styles";
function injectPrintStyles() {
  if (document.getElementById(PRINT_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = PRINT_STYLE_ID;
  style.innerHTML = `
    @media print {
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      @page { size: A4; margin: 12mm; }
    }
  `;
  document.head.appendChild(style);
}

/* ─────────────────────────────────────────
   InvoiceDialog
   Props:
     open        – boolean
     invoiceId   – number | null
     onClose     – () => void
───────────────────────────────────────── */
export default function InvoiceDialog({ open, invoiceId, onClose }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    injectPrintStyles();
  }, []);

  useEffect(() => {
    console.log(invoiceId);
    if (!open || !invoiceId) return;
    setInvoice(null);
    setLoading(true);
    api
      .get(`/invoices/${invoiceId}`)
      .then((res) => { console.log(res.data.data); setInvoice(res.data.data || res.data);})
      .catch(() => toast.error("Failed to load invoice"))
      .finally(() => setLoading(false));
  }, [open, invoiceId]);

  /* ── Print handler ── */
/* ── Print handler ── */
const handlePrint = () => {
  const el = printRef.current;
  if (!el) return;

  const printWindow = window.open("", "_blank", "width=900,height=700");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice #${String(invoice?.id || "").padStart(5, "0")}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Georgia', 'Times New Roman', serif; background: #fff; }
          @page { size: A4; margin: 12mm; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        ${el.outerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();

  // Wait for content to fully render before printing
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

  /* ── Derived totals ── */
  const details = invoice?.details || [];
  const totalNet = details.reduce((s, r) => s + Number(r.net_amount || 0), 0);
  const totalCommission = details.reduce(
    (s, r) => s + Number(r.commission || 0),
    0
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,.18)",
        },
      }}
    >
      {/* ── Top action bar (hidden on print) ── */}
      <div
        className="no-print"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          background: "linear-gradient(135deg,#1a1f3c,#2d3561)",
        }}
      >
        <span
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: 0.5,
          }}
        >
          Invoice Preview
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <Tooltip title="Print / Save PDF">
            <IconButton
              onClick={handlePrint}
              size="small"
              style={{
                background: "rgba(255,255,255,.12)",
                color: "#fff",
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 600,
                gap: 6,
              }}
            >
              <i className="fa-solid fa-print" style={{ fontSize: 14 }} />
              <span style={{ marginLeft: 6 }}>Print</span>
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton
              onClick={onClose}
              size="small"
              style={{
                background: "rgba(255,255,255,.12)",
                color: "#fff",
                borderRadius: 8,
              }}
            >
              <i className="fa-solid fa-xmark" />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <DialogContent style={{ padding: 0, background: "#f4f6fb" }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 300,
            }}
          >
            <CircularProgress />
          </div>
        ) : invoice ? (
          /* ════════════════════════════════════════
             Printable Invoice Sheet
          ════════════════════════════════════════ */
          <div
            ref={printRef}
            style={{
              background: "#fff",
              margin: "24px auto",
              maxWidth: 760,
              borderRadius: 12,
              boxShadow: "0 4px 24px rgba(0,0,0,.08)",
              overflow: "hidden",
              fontFamily: "'Georgia', 'Times New Roman', serif",
            }}
          >
            {/* ── Invoice Header ── */}
            <div
              style={{
                background: "linear-gradient(135deg,#1a1f3c,#2d3561)",
                padding: "32px 36px 28px",
                color: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                {/* Clinic / Brand */}
                <div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      letterSpacing: 1,
                      fontFamily: "'Georgia', serif",
                    }}
                  >
                    MedLab
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,.65)",
                      marginTop: 4,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                    }}
                  >
                    Doctor Commission Invoice
                  </div>
                </div>

                {/* Invoice meta */}
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    #{String(invoice.id).padStart(5, "0")}
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 8,
                      background:
                        invoice.status === "paid"
                          ? "rgba(45,206,137,.25)"
                          : "rgba(251,99,64,.25)",
                      border: `1px solid ${
                        invoice.status === "paid"
                          ? "rgba(45,206,137,.6)"
                          : "rgba(251,99,64,.6)"
                      }`,
                      borderRadius: 20,
                      padding: "3px 14px",
                      fontSize: 12,
                      fontWeight: 700,
                      color:
                        invoice.status === "paid" ? "#2dce89" : "#fb6340",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    {invoice.status}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,.6)",
                      marginTop: 8,
                    }}
                  >
                    {new Date(invoice.created_at).toLocaleDateString("en-PK", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Doctor Info Strip ── */}
            <div
              style={{
                background: "#f8f9fe",
                padding: "18px 36px",
                borderBottom: "1px solid #e8ecf8",
                display: "flex",
                gap: 40,
                flexWrap: "wrap",
              }}
            >
              <InfoBlock
                label="Billed To"
                value={invoice.doctor?.name || "-"}
              />
              <InfoBlock
                label="Email"
                value={invoice.doctor?.email || "-"}
              />
              <InfoBlock
                label="Phone"
                value={invoice.doctor?.phone || "-"}
              />
              <InfoBlock
                label="Commission Rate"
                value={`${invoice.doctor?.commission_percentage || 0}%`}
              />
            </div>

            {/* ── Line Items Table ── */}
            <div style={{ padding: "24px 36px" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr>
                    {[
                      "#",
                      "Patient Name",
                      "Test",
                      "Date",
                      "Net Amount",
                      "Commission",
                    ].map((h, i) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 12px",
                          background: "#1a1f3c",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: 11,
                          letterSpacing: 0.8,
                          textTransform: "uppercase",
                          textAlign: i >= 4 ? "right" : "left",
                          borderRadius:
                            i === 0
                              ? "6px 0 0 6px"
                              : i === 5
                              ? "0 6px 6px 0"
                              : 0,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {details.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          textAlign: "center",
                          padding: "28px 0",
                          color: "#aab0cc",
                          fontStyle: "italic",
                        }}
                      >
                        No line items found
                      </td>
                    </tr>
                  ) : (
                    details.map((d, i) => (
                      <tr
                        key={d.id}
                        style={{
                          background: i % 2 === 0 ? "#fff" : "#f8f9fe",
                          borderBottom: "1px solid #eef0f8",
                        }}
                      >
                        <td style={td()}>{i + 1}</td>
                        <td style={td()}>{d.patient_name || "-"}</td>
                        <td style={td()}>{d.test_name || "-"}</td>
                        <td style={td()}>
                          {d.date
                            ? new Date(d.date).toLocaleDateString("en-PK", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                        <td style={td("right")}>
                          PKR {Number(d.net_amount || 0).toLocaleString()}
                        </td>
                        <td
                          style={{
                            ...td("right"),
                            color: "#2d3561",
                            fontWeight: 600,
                          }}
                        >
                          PKR {Number(d.commission || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Totals ── */}
            <div
              style={{
                padding: "0 36px 32px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <div style={{ minWidth: 280 }}>
                <Divider style={{ marginBottom: 12 }} />
                <TotalRow
                  label="Total Net Amount"
                  value={`PKR ${totalNet.toLocaleString()}`}
                />
                <TotalRow
                  label="Total Commission"
                  value={`PKR ${totalCommission.toLocaleString()}`}
                  highlight
                />
              </div>
            </div>

            {/* ── Footer ── */}
            <div
              style={{
                background: "#f8f9fe",
                borderTop: "1px solid #e8ecf8",
                padding: "16px 36px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 11, color: "#aab0cc" }}>
                Generated on{" "}
                {new Date().toLocaleDateString("en-PK", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "#aab0cc",
                  fontStyle: "italic",
                }}
              >
                This is a system-generated invoice.
              </span>
            </div>
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              color: "#aab0cc",
              fontStyle: "italic",
            }}
          >
            No invoice data.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────────────────────
   Tiny helpers
───────────────────────────────────────── */
function InfoBlock({ label, value }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          color: "#aab0cc",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 3,
          fontFamily: "'Helvetica Neue', sans-serif",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          color: "#1a1f3c",
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function TotalRow({ label, value, highlight }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: highlight ? "10px 14px" : "6px 14px",
        marginBottom: highlight ? 0 : 2,
        background: highlight ? "linear-gradient(135deg,#1a1f3c,#2d3561)" : "transparent",
        borderRadius: highlight ? 8 : 0,
        color: highlight ? "#fff" : "#525f7f",
        fontWeight: highlight ? 700 : 500,
        fontSize: highlight ? 15 : 13,
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* cell style helper */
const td = (align = "left") => ({
  padding: "10px 12px",
  fontSize: 13,
  color: "#525f7f",
  textAlign: align,
});