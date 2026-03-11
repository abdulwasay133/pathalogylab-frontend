import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import api from "api/axios";
import DOMPurify from "dompurify";

/* ─────────────────────────────────────────────────────────────
   Builds the full HTML string for a single A4 report page.
   This is injected into a fresh print window so the modal's
   CSS (overflow, max-width, transform, etc.) cannot interfere.
───────────────────────────────────────────────────────────── */
function buildReportHTML({ report, patient, doctor, formatDate }) {
  const labName = patient.labName || "PATHOLOGY LAB";
  const initial = labName[0].toUpperCase();

  const labNameHTML = patient.labName
    ? patient.labName
        .split(" ")
        .map((w, i) =>
          i === 0 ? `<span style="color:#e8333a">${w} </span>` : w + " "
        )
        .join("")
    : `<span style="color:#e8333a">DR</span>LOGY PATHOLOGY LAB`;

  // decorative barcode bars
  const barHeights = [3,2,4,2,3,1,4,2,3,2,4,1,3,2,4,3,2,1,3,4,2];
  const barsHTML = barHeights
    .map(h => `<span style="display:inline-block;width:2px;height:${h*8}px;background:#222;"></span>`)
    .join("");

  const docName  = doctor?.name  ? `Dr. ${doctor.name}`  : "Dr. Pathologist";
  const docName2 = doctor?.secondName || "Dr. Pathologist";

  return `
    <div class="a4-page">

      <!-- watermark -->
      <div class="watermark">${labName}</div>

      <!-- HEADER -->
      <div class="lab-header">
        <div class="lab-header-top">
          <div class="lab-logo-area">
            <div class="lab-logo-icon">${initial}</div>
            <div>
              <div class="lab-name">${labNameHTML}</div>
              <div class="lab-tagline">Accurate | Caring | Instant</div>
            </div>
          </div>
          <div class="lab-contact">
            <div class="phone">&#128222; ${patient.labPhone || "0123456789"}</div>
            <div>&#9993; ${patient.labEmail || "lab@example.com"}</div>
            <div style="color:#003087">${patient.labWebsite || "www.lab.com"}</div>
          </div>
        </div>
        <div class="lab-address">${patient.labAddress || "Lab Address, City - PIN"}</div>
      </div>
      <div class="header-stripe"></div>

      <!-- PATIENT INFO -->
      <div class="patient-bar">
        <div class="patient-col">
          <div class="patient-name">${patient.name || "Patient Name"}</div>
          <div class="patient-detail">
            Age : ${patient.age || "—"} &nbsp;|&nbsp; Sex : ${patient.gender || "—"}
            <br/>UHID : ${patient.uhid || report.id || "—"}
          </div>
        </div>
        <div class="patient-col" style="border-left:1px solid #ddd;padding-left:18px">
          <div class="patient-detail">
            <strong>Sample Collected At:</strong><br/>
            ${patient.collectionAddress || "—"}<br/>
            <strong>Sample Collected By:</strong> ${patient.collectedBy || "—"}<br/>
            <strong>Ref. By:</strong> ${doctor?.name ? `Dr. ${doctor.name}` : "—"}
          </div>
        </div>
        <div class="patient-col barcode-area" style="border-left:1px solid #ddd;padding-left:18px">
          <div class="barcode-lines">${barsHTML}</div>
          <div class="reg-info">
            <strong>Registered on:</strong> ${formatDate(patient.registeredOn)}<br/>
            <strong>Collected on:</strong>  ${formatDate(patient.collectedOn)}<br/>
            <strong>Reported on:</strong>   ${formatDate(patient.reportedOn || new Date())}
          </div>
        </div>
      </div>

      <!-- REPORT TITLE -->
      <div class="report-title-bar">
        <h2>${report.testName || "Laboratory Test Report"}</h2>
      </div>

      <!-- BODY (server HTML) -->
      <div class="report-body">
        ${DOMPurify.sanitize(report?.html || "")}
      </div>

      <!-- FOOTER -->
      <div class="report-footer">
        <div class="footer-divider-text">****End of Report****</div>
        <div class="signatures">
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-name">Medical Lab Technician</div>
            <div class="signature-title">(DMLT, BMLT)</div>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-name">${docName}</div>
            <div class="signature-title">(MD, Pathologist)</div>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-name">${docName2}</div>
            <div class="signature-title">(MD, Pathologist)</div>
          </div>
        </div>
      </div>

      <!-- BOTTOM BAR -->
      <div class="bottom-bar">
        <div>
          <div class="qr-note">To Check Report Authenticity by Scanning QR Code on Top</div>
          <div style="font-size:11px;color:#aac4f0">
            Generated on: ${formatDate(new Date())} &nbsp;|&nbsp; Page 1 of 1
          </div>
        </div>
        <div class="sample-cta">&#128757; Sample Collection</div>
        <div class="phone-num">&#128222; ${patient.labPhone || "0123456789"}</div>
      </div>

    </div>
  `;
}

/* ─────────────────────────────────────────────────────────────
   Full CSS injected into the print window.
   Uses mm units throughout so it maps 1-to-1 to A4.
───────────────────────────────────────────────────────────── */
const PRINT_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  @page { size: A4 portrait; margin: 0; }

  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 13px;
    color: #222;
    background: #fff;
  }

  /* ── A4 page ── */
  .a4-page {
    width: 210mm;
    height: 297mm;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    page-break-after: always;
    break-after: page;
  }
  .a4-page:last-child {
    page-break-after: avoid;
    break-after: avoid;
  }

  /* ── Watermark ── */
  .watermark {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%) rotate(-30deg);
    font-size: 52px; font-weight: 900;
    color: rgba(0,48,135,0.04);
    white-space: nowrap;
    pointer-events: none;
    z-index: 0;
    letter-spacing: 6px;
  }

  /* ── Header ── */
  .lab-header {
    padding: 14px 20px 0;
    border-bottom: 3px solid #003087;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .lab-header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .lab-logo-area { display: flex; align-items: center; gap: 12px; }
  .lab-logo-icon {
    width: 48px; height: 48px;
    background: #003087;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 20px; font-weight: bold;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .lab-name {
    font-size: 24px; font-weight: 800;
    color: #003087; letter-spacing: 1px;
  }
  .lab-tagline { font-size: 11px; color: #555; font-style: italic; margin-top: 2px; }
  .lab-contact { text-align: right; font-size: 12px; color: #333; line-height: 1.7; }
  .lab-contact .phone { font-weight: 700; color: #003087; font-size: 13px; }
  .lab-address {
    font-size: 11px; color: #666;
    padding: 5px 0 7px;
    border-top: 1px solid #ddd;
  }

  .header-stripe {
    height: 6px;
    background: repeating-linear-gradient(
      90deg, #003087 0px, #003087 10px, #e8333a 10px, #e8333a 20px
    );
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Patient bar ── */
  .patient-bar {
    display: flex;
    padding: 10px 20px;
    border-bottom: 1px solid #ddd;
    background: #f9f9f9;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .patient-col { flex: 1; }
  .patient-name { font-size: 16px; font-weight: 800; color: #003087; margin-bottom: 4px; }
  .patient-detail { font-size: 11px; color: #444; line-height: 1.8; }
  .patient-detail strong { color: #222; }
  .barcode-area { text-align: right; }
  .barcode-lines {
    display: inline-flex; gap: 2px; align-items: flex-end;
    height: 34px; margin-bottom: 4px;
  }
  .reg-info { font-size: 10px; color: #555; line-height: 1.7; text-align: right; }
  .reg-info strong { color: #003087; }

  /* ── Report title ── */
  .report-title-bar {
    text-align: center;
    padding: 8px 20px 6px;
    border-bottom: 2px solid #003087;
  }
  .report-title-bar h2 {
    font-size: 14px; font-weight: 800;
    letter-spacing: 1.5px; color: #003087;
    text-transform: uppercase;
  }

  /* ── Body ── */
  .report-body {
    padding: 14px 20px;
    flex: 1;
  }

  /* Common table styles for server-rendered HTML inside report-body */
  .report-body table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 14px;
    font-size: 12px;
  }
  .report-body table th {
    background: #003087;
    color: #fff;
    padding: 7px 9px;
    font-size: 11px;
    font-weight: 700;
    border: 1px solid #003087;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .report-body table td {
    padding: 6px 9px;
    border: 1px solid #ccc;
    vertical-align: middle;
  }
  .report-body table tr:nth-child(even) td {
    background: #f4f7fb;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Footer ── */
  .report-footer {
    border-top: 1px solid #ddd;
    padding: 8px 20px 6px;
    margin-top: auto;
  }
  .footer-divider-text {
    text-align: center;
    font-size: 11px; color: #888;
    margin-bottom: 10px;
  }
  .signatures {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .signature-block { text-align: center; }
  .signature-line {
    width: 110px;
    border-top: 1px solid #333;
    margin: 0 auto 4px;
  }
  .signature-name { font-size: 11px; font-weight: 700; color: #003087; }
  .signature-title { font-size: 10px; color: #666; }

  /* ── Bottom bar ── */
  .bottom-bar {
    background: #003087;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 20px;
    font-size: 11px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .bottom-bar .qr-note { font-size: 9px; color: #aac4f0; }
  .bottom-bar .sample-cta {
    background: #e8333a;
    color: #fff;
    padding: 3px 12px;
    border-radius: 20px;
    font-weight: 700;
    font-size: 12px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .bottom-bar .phone-num { font-weight: 800; font-size: 13px; }
`;

/* ─────────────────────────────────────────────────────────────
   Opens a NEW WINDOW with only the report HTML + CSS and
   immediately calls print(). This completely bypasses the
   modal's overflow / transform constraints.
───────────────────────────────────────────────────────────── */
function printInNewWindow({ reports, patient, doctor, formatDate }) {
  const pagesHTML = reports
    .map((report) => buildReportHTML({ report, patient, doctor, formatDate }))
    .join("\n");

  const fullHTML = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <title>Lab Report</title>
        <style>${PRINT_CSS}</style>
      </head>
      <body>${pagesHTML}</body>
    </html>
  `;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    alert("Please allow popups for this site to print reports.");
    return;
  }
  win.document.open();
  win.document.write(fullHTML);
  win.document.close();

  // Wait for resources to load, then print
  win.onload = () => {
    win.focus();
    win.print();
    // Close the window after print dialog is dismissed
    win.onafterprint = () => win.close();
  };
}

/* ─────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────── */
export default function PrintReport({ testIds = [], isOpen, toggle }) {
  const [reports, setReports] = useState([]);
  const [patient, setPatient] = useState({});
  const [doctor, setDoctor] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    if (!testIds.length) return;
    try {
      setLoading(true);
      const res = await api.post("/patient-report-print", { testIds });
      setReports(res.data.data.tests);
      setPatient(res.data.data.patient);
      setDoctor(res.data.data.doctor);
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchReports();
  }, [isOpen]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const handlePrint = () => {
    printInNewWindow({ reports, patient, doctor, formatDate });
  };

  /* ── Screen preview styles (modal only) ── */
  const previewCSS = `
    .lab-modal-body-preview {
      background: #d0d0d0;
      padding: 24px;
      max-height: 80vh;
      overflow-y: auto;
    }
    .preview-page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto 24px;
      background: #fff;
      box-shadow: 0 4px 24px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      color: #222;
      position: relative;
      overflow: hidden;
      border-radius: 2px;
    }
    .preview-page .lab-header {
      padding: 14px 20px 0;
      border-bottom: 3px solid #003087;
    }
    .preview-page .lab-header-top {
      display: flex; align-items: center;
      justify-content: space-between; margin-bottom: 8px;
    }
    .preview-page .lab-logo-area { display: flex; align-items: center; gap: 12px; }
    .preview-page .lab-logo-icon {
      width: 48px; height: 48px; background: #003087;
      border-radius: 50%; display: flex; align-items: center;
      justify-content: center; color: #fff; font-size: 20px; font-weight: bold;
    }
    .preview-page .lab-name { font-size: 24px; font-weight: 800; color: #003087; letter-spacing: 1px; }
    .preview-page .lab-name span { color: #e8333a; }
    .preview-page .lab-tagline { font-size: 11px; color: #555; font-style: italic; margin-top: 2px; }
    .preview-page .lab-contact { text-align: right; font-size: 12px; color: #333; line-height: 1.7; }
    .preview-page .lab-contact .phone { font-weight: 700; color: #003087; font-size: 13px; }
    .preview-page .lab-address { font-size: 11px; color: #666; padding: 5px 0 7px; border-top: 1px solid #ddd; }
    .preview-page .header-stripe {
      height: 6px;
      background: repeating-linear-gradient(90deg, #003087 0px, #003087 10px, #e8333a 10px, #e8333a 20px);
    }
    .preview-page .patient-bar {
      display: flex; padding: 10px 20px;
      border-bottom: 1px solid #ddd; background: #f9f9f9;
    }
    .preview-page .patient-col { flex: 1; }
    .preview-page .patient-col + .patient-col { border-left: 1px solid #ddd; padding-left: 18px; }
    .preview-page .patient-name { font-size: 16px; font-weight: 800; color: #003087; margin-bottom: 4px; }
    .preview-page .patient-detail { font-size: 11px; color: #444; line-height: 1.8; }
    .preview-page .patient-detail strong { color: #222; }
    .preview-page .barcode-area { text-align: right; }
    .preview-page .barcode-lines {
      display: inline-flex; gap: 2px; align-items: flex-end; height: 34px; margin-bottom: 4px;
    }
    .preview-page .barcode-lines span { display: inline-block; width: 2px; background: #222; }
    .preview-page .reg-info { font-size: 10px; color: #555; line-height: 1.7; text-align: right; }
    .preview-page .reg-info strong { color: #003087; }
    .preview-page .report-title-bar {
      text-align: center; padding: 8px 20px 6px; border-bottom: 2px solid #003087;
    }
    .preview-page .report-title-bar h2 {
      font-size: 14px; font-weight: 800; letter-spacing: 1.5px;
      color: #003087; text-transform: uppercase; margin: 0;
    }
    .preview-page .report-body { padding: 14px 20px; flex: 1; }
    .preview-page .report-footer {
      border-top: 1px solid #ddd; padding: 8px 20px 6px; margin-top: auto;
    }
    .preview-page .footer-divider-text {
      text-align: center; font-size: 11px; color: #888; margin-bottom: 10px;
    }
    .preview-page .signatures { display: flex; justify-content: space-between; align-items: flex-end; }
    .preview-page .signature-block { text-align: center; }
    .preview-page .signature-line { width: 110px; border-top: 1px solid #333; margin: 0 auto 4px; }
    .preview-page .signature-name { font-size: 11px; font-weight: 700; color: #003087; }
    .preview-page .signature-title { font-size: 10px; color: #666; }
    .preview-page .bottom-bar {
      background: #003087; color: #fff;
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 20px; font-size: 11px;
    }
    .preview-page .bottom-bar .qr-note { font-size: 9px; color: #aac4f0; }
    .preview-page .bottom-bar .sample-cta {
      background: #e8333a; color: #fff;
      padding: 3px 12px; border-radius: 20px;
      font-weight: 700; font-size: 12px;
    }
    .preview-page .bottom-bar .phone-num { font-weight: 800; font-size: 13px; }
    .preview-page .watermark {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 52px; font-weight: 900;
      color: rgba(0,48,135,0.04);
      white-space: nowrap; pointer-events: none; z-index: 0;
      letter-spacing: 6px;
    }
  `;

  const barHeights = [3,2,4,2,3,1,4,2,3,2,4,1,3,2,4,3,2,1,3,4,2];

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl">
      <style>{previewCSS}</style>

      <ModalHeader toggle={toggle}>Print Test Reports</ModalHeader>

      <ModalBody className="lab-modal-body-preview">
        {/* Print button */}
        <div className="mb-3">
          <button
            className="btn btn-primary"
            onClick={handlePrint}
            disabled={loading || reports.length === 0}
          >
            🖨️ Print A4
          </button>
        </div>

        {loading && <p className="text-center py-3">Loading reports…</p>}

        {/* ── SCREEN PREVIEW (scoped under .preview-page) ── */}
        {!loading && reports.map((report) => {
          const labName = patient.labName || "PATHOLOGY LAB";
          const docName  = doctor?.name  ? `Dr. ${doctor.name}`  : "Dr. Pathologist";
          const docName2 = doctor?.secondName || "Dr. Pathologist";

          return (
            <div key={report.id} className="preview-page">
              <div className="watermark">{labName}</div>

              {/* HEADER */}
              <div className="lab-header">
                <div className="lab-header-top">
                  <div className="lab-logo-area">
                    <div className="lab-logo-icon">{labName[0]}</div>
                    <div>
                      <div className="lab-name">
                        {patient.labName
                          ? patient.labName.split(" ").map((w, i) =>
                              i === 0 ? <span key={i}>{w} </span> : w + " "
                            )
                          : <><span>DR</span>LOGY PATHOLOGY LAB</>}
                      </div>
                      <div className="lab-tagline">Accurate | Caring | Instant</div>
                    </div>
                  </div>
                  <div className="lab-contact">
                    <div className="phone">📞 {patient.labPhone || "0123456789"}</div>
                    <div>✉ {patient.labEmail || "lab@example.com"}</div>
                    <div style={{ color: "#003087" }}>{patient.labWebsite || "www.lab.com"}</div>
                  </div>
                </div>
                <div className="lab-address">{patient.labAddress || "Lab Address, City - PIN"}</div>
              </div>
              <div className="header-stripe" />

              {/* PATIENT INFO */}
              <div className="patient-bar">
                <div className="patient-col">
                  <div className="patient-name">{patient.name || "Patient Name"}</div>
                  <div className="patient-detail">
                    Age : {patient.age || "—"} &nbsp;|&nbsp; Sex : {patient.gender || "—"}
                    <br />UHID : {patient.uhid || report.id || "—"}
                  </div>
                </div>
                <div className="patient-col">
                  <div className="patient-detail">
                    <strong>Sample Collected At:</strong><br />
                    {patient.collectionAddress || "—"}<br />
                    <strong>Sample Collected By:</strong> {patient.collectedBy || "—"}<br />
                    <strong>Ref. By:</strong> {doctor?.name ? `Dr. ${doctor.name}` : "—"}
                  </div>
                </div>
                <div className="patient-col barcode-area">
                  <div className="barcode-lines">
                    {barHeights.map((h, i) => (
                      <span key={i} style={{ height: `${h * 8}px` }} />
                    ))}
                  </div>
                  <div className="reg-info">
                    <strong>Registered on:</strong> {formatDate(patient.registeredOn)}<br />
                    <strong>Collected on:</strong> {formatDate(patient.collectedOn)}<br />
                    <strong>Reported on:</strong> {formatDate(patient.reportedOn || new Date())}
                  </div>
                </div>
              </div>

              {/* TITLE */}
              <div className="report-title-bar">
                <h2>{report.testName || "Laboratory Test Report"}</h2>
              </div>

              {/* BODY */}
              <div
                className="report-body"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(report?.html || ""),
                }}
              />

              {/* FOOTER */}
              <div className="report-footer">
                <div className="footer-divider-text">****End of Report****</div>
                <div className="signatures">
                  <div className="signature-block">
                    <div className="signature-line" />
                    <div className="signature-name">Medical Lab Technician</div>
                    <div className="signature-title">(DMLT, BMLT)</div>
                  </div>
                  <div className="signature-block">
                    <div className="signature-line" />
                    <div className="signature-name">{docName}</div>
                    <div className="signature-title">(MD, Pathologist)</div>
                  </div>
                  <div className="signature-block">
                    <div className="signature-line" />
                    <div className="signature-name">{docName2}</div>
                    <div className="signature-title">(MD, Pathologist)</div>
                  </div>
                </div>
              </div>

              {/* BOTTOM BAR */}
              <div className="bottom-bar">
                <div>
                  <div className="qr-note">To Check Report Authenticity by Scanning QR Code on Top</div>
                  <div style={{ fontSize: 9, color: "#aac4f0" }}>
                    Generated on: {formatDate(new Date())} &nbsp;|&nbsp; Page 1 of 1
                  </div>
                </div>
                <div className="sample-cta">🛵 Sample Collection</div>
                <div className="phone-num">📞 {patient.labPhone || "0123456789"}</div>
              </div>
            </div>
          );
        })}
      </ModalBody>
    </Modal>
  );
}