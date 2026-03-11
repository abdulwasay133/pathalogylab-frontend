import React, { forwardRef } from "react";
import Barcode from "react-barcode";

/* ─────────────────────────────────────────────
   Styles injected once — thermal-optimised
   80mm paper ≈ 302px at 96dpi
───────────────────────────────────────────── */
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@500;600;700&display=swap');

  @media print {
    body * { visibility: hidden; }
    .thermal-receipt, .thermal-receipt * { visibility: visible; }
    .thermal-receipt { position: absolute; left: 0; top: 0; }
    @page { margin: 0; size: 80mm auto; }
  }

  .thermal-receipt {
    font-family: 'Share Tech Mono', monospace;
    width: 302px;
    background: #fff;
    color: #111;
    font-size: 11px;
    line-height: 1.55;
    padding: 0;
    margin: 0 auto;
  }

  .receipt-copy {
    padding: 14px 12px 10px;
  }

  /* ── Header ── */
  .rcp-header {
    text-align: center;
    margin-bottom: 8px;
  }

  .rcp-header .lab-name {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    font-size: 18px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    line-height: 1.2;
    border-bottom: 2px solid #111;
    padding-bottom: 4px;
    margin-bottom: 4px;
  }

  .rcp-header .lab-sub {
    font-size: 10px;
    color: #444;
    letter-spacing: 0.4px;
  }

  /* ── Copy badge ── */
  .copy-badge {
    text-align: center;
    margin: 6px 0;
  }

  .copy-badge span {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 2px;
    border: 1.5px solid #111;
    padding: 2px 14px;
    text-transform: uppercase;
  }

  /* ── Divider ── */
  .rcp-divider {
    border: none;
    border-top: 1px dashed #999;
    margin: 7px 0;
  }

  .rcp-divider-solid {
    border: none;
    border-top: 1.5px solid #111;
    margin: 7px 0;
  }

  /* ── Patient info grid ── */
  .info-grid {
    display: grid;
    grid-template-columns: 90px 1fr;
    gap: 1px 4px;
    margin-bottom: 4px;
  }

  .info-grid .label {
    color: #555;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .info-grid .value {
    font-weight: 600;
    font-size: 11px;
    word-break: break-word;
  }

  .info-grid .value.name-val {
    font-family: 'Rajdhani', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  /* ── Section heading ── */
  .section-heading {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin: 4px 0 2px;
  }

  /* ── Test rows ── */
  .test-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 2px 0;
    font-size: 11px;
    border-bottom: 1px dotted #ddd;
  }

  .test-row:last-child {
    border-bottom: none;
  }

  .test-row .test-name {
    flex: 1;
    padding-right: 8px;
  }

  .test-row .test-amt {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  /* ── Bill rows ── */
  .bill-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 11px;
    padding: 2px 0;
  }

  .bill-row.total-row {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    font-size: 14px;
    border-top: 1.5px solid #111;
    border-bottom: 1.5px solid #111;
    padding: 4px 0;
    margin-top: 4px;
    letter-spacing: 0.5px;
  }

  .bill-row.total-row .amt {
    font-size: 15px;
  }

  /* ── Barcode ── */
  .barcode-wrap {
    text-align: center;
    margin: 10px 0 4px;
  }

  .barcode-wrap svg {
    max-width: 100%;
  }

  .scan-note {
    text-align: center;
    font-size: 9px;
    color: #666;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin: 2px 0 8px;
  }

  /* ── Footer ── */
  .receipt-footer {
    text-align: center;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 1px;
    padding: 6px 0 2px;
    border-top: 2px solid #111;
  }

  /* ── Cut line ── */
  .cut-line {
    text-align: center;
    color: #bbb;
    font-size: 10px;
    letter-spacing: 3px;
    padding: 4px 0;
    border-top: 1px dashed #ccc;
    border-bottom: 1px dashed #ccc;
    margin: 0;
    user-select: none;
  }
`;

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
const ThermalReceipt = forwardRef(({ patient }, ref) => {
  const now = new Date();

  return (
    <>
      <style>{style}</style>
      <div ref={ref} className="thermal-receipt">
        <ReceiptCopy patient={patient} now={now} title="Patient Copy" />

        <div className="cut-line">✂ &nbsp; CUT HERE &nbsp; ✂</div>

        <ReceiptCopy patient={patient} now={now} title="Lab Copy" />
      </div>
    </>
  );
});

/* ─────────────────────────────────────────────
   Single receipt copy
───────────────────────────────────────────── */
const ReceiptCopy = ({ patient, now, title }) => {
  const printedAt = `${now.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}  ${now.toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  return (
    <div className="receipt-copy">

      {/* Header */}
      <div className="rcp-header">
        <div className="lab-name">City Diagnostic Lab</div>
        <div className="lab-sub">Main Road, Lahore &nbsp;|&nbsp; 0300-0000000</div>
      </div>

      {/* Copy badge */}
      <div className="copy-badge">
        <span>{title}</span>
      </div>

      <hr className="rcp-divider-solid" />

      {/* Patient Info */}
      <div className="info-grid">
        <span className="label">Patient ID</span>
        <span className="value">{patient?.id ?? "—"}</span>

        <span className="label">Name</span>
        <span className="value name-val">{patient?.name ?? "—"}</span>

        <span className="label">Age</span>
        <span className="value">{patient?.age ?? "—"} yrs</span>

        <span className="label">Mobile</span>
        <span className="value">{patient?.phone ?? "—"}</span>

        <span className="label">Ref. Doctor</span>
        <span className="value">{patient?.doctor ?? "—"}</span>


        <span className="label">Printed</span>
        <span className="value">{printedAt}</span>
      </div>

      <hr className="rcp-divider" />

      {/* Tests */}
      <div className="section-heading">Tests Ordered</div>

      {patient?.tests?.length > 0 ? (
        patient.tests.map((t, i) => (
          <div key={i} className="test-row">
            <span className="test-name">{t.test_name}</span>
            <span className="test-amt">Rs {Number(t.amount).toLocaleString()}</span>
          </div>
        ))
      ) : (
        <div style={{ fontSize: 10, color: "#888" }}>No tests added</div>
      )}

      <hr className="rcp-divider" />

      {/* Bill summary */}
      <div className="bill-row">
        <span>Subtotal</span>
        <span>Rs {Number(patient?.total_bill ?? 0).toLocaleString()}</span>
      </div>
      <div className="bill-row">
        <span>Discount</span>
        <span>- Rs {Number(patient?.discount ?? 0).toLocaleString()}</span>
      </div>

      <div className="bill-row total-row">
        <span>NET PAYABLE</span>
        <span className="amt">Rs {Number(patient?.net_bill ?? 0).toLocaleString()}</span>
      </div>

      {/* Barcode */}
      {patient?.id && (
        <>
          <div className="barcode-wrap">
            <Barcode
              value={String(patient.id)}
              height={38}
              width={1.4}
              fontSize={11}
              displayValue={true}
              background="#fff"
              lineColor="#111"
            />
          </div>
          <div className="scan-note">Scan barcode to view report</div>
        </>
      )}

      {/* Footer */}
      <div className="receipt-footer">
        Thank You — Visit Again
      </div>

    </div>
  );
};

export default ThermalReceipt;