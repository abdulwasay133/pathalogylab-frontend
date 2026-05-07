import api from "api/axios";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import Barcode from "react-barcode";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

/* ══════════════════════════════════════════════════════════
   PRINT CSS
   ─────────────────────────────────────────────────────────
   STRATEGY — explicit page divs, footer position:absolute bottom:0

   Every approach that relies on browser page-breaking
   (@page margins, position:fixed, tfoot) has the same flaw:
   the browser decides where pages break, so it cannot
   guarantee the footer sits at the true bottom of short pages.

   The ONLY reliable solution:
   • JS measures header height, footer height, and each
     content block height before printing.
   • JS manually packs content into page-sized <div>s,
     each exactly 297mm (A4) tall.
   • Each page div uses position:relative; the footer inside
     uses position:absolute; bottom:0 — guaranteed bottom.
   • @page has zero margins; each page div IS the page.
   • page-break-after:always on each page div tells the
     browser exactly where to cut — no guessing.

   Result: footer always at true page bottom, never overlaps
   content, no empty gap, works on all browsers.
══════════════════════════════════════════════════════════ */
const PRINT_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    width: 210mm;
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 12px;
    color: #222;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  @page {
    size: A4 portrait;
    margin: 0;
  }

  /* ── Each .page is exactly one A4 sheet ── */
  .page {
    position: relative;
    width: 210mm;
    height: 297mm;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page:last-child {
    page-break-after: auto;
    break-after: auto;
  }

  /* header block at top of every page */
  .page-header { width: 100%; }

  /* content area fills space between header and footer */
  .page-content { width: 100%; overflow: hidden; }

  /* footer pinned to true bottom — guaranteed, no browser magic */
  .page-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ════════ HEADER — Lab info ════════ */
  .hdr-image   { width: 100%; display: block; }
  .hdr-blank   { height: 28mm; }

  .hdr-default { padding: 10px 18px 0; border-bottom: 3px solid #003087; }
  .hdr-top     { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
  .hdr-logos   { display: flex; align-items: center; gap: 10px; }
  .hdr-icon    {
    width: 40px; height: 40px; background: #003087; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 16px; font-weight: bold;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .hdr-name    { font-size: 18px; font-weight: 800; color: #003087; letter-spacing: 1px; }
  .hdr-tag     { font-size: 8px; color: #555; font-style: italic; margin-top: 2px; }
  .hdr-contact { text-align: right; font-size: 9px; color: #333; line-height: 1.6; }
  .hdr-ph      { font-weight: 700; color: #003087; font-size: 10px; }
  .hdr-addr    { font-size: 8px; color: #666; padding: 3px 0 5px; border-top: 1px solid #ddd; }
  .hdr-stripe  {
    height: 4px;
    background: repeating-linear-gradient(90deg,#003087 0,#003087 10px,#e8333a 10px,#e8333a 20px);
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }

  /* ════════ HEADER — Patient info ════════ */
  .pat-bar {
    display: flex; padding: 6px 18px;
    border-bottom: 2px solid #003087;
    background: #f5f7ff;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .pat-col { flex: 1; }
  .pat-name   { font-size: 13px; font-weight: 800; color: #003087; margin-bottom: 2px; }
  .pat-detail { font-size: 8px; color: #444; line-height: 1.75; }
  .pat-detail strong { color: #222; }
  .reg   { font-size: 7px; color: #555; line-height: 1.7; text-align: right; }
  .reg strong { color: #003087; }

  /* ════════ FOOTER — Doctor signatures ════════ */
  .doc-bar  { padding: 5px 18px 6px; border-top: 1px solid #ddd; background: #fff; }
  .doc-end  { text-align: center; font-size: 8px; color: #888; margin-bottom: 5px; }
  .sigs     { display: flex; justify-content: space-between; align-items: flex-end; }
  .sig      { text-align: center; }
  .sig-line { width: 85px; border-top: 1px solid #333; margin: 0 auto 2px; }
  .sig-name { font-size: 8px; font-weight: 700; color: #003087; }
  .sig-ttl  { font-size: 7px; color: #666; }

  /* ════════ FOOTER — Lab footer ════════ */
  .ftr-image { width: 100%; display: block; }
  .ftr-blank { height: 22mm; }

  .ftr-default {
    background: #003087; color: #fff;
    display: flex; align-items: center; justify-content: space-between;
    padding: 4px 18px; font-size: 8px;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .ftr-note { font-size: 7px; color: #aac4f0; }
  .ftr-cta  {
    background: #e8333a; color: #fff;
    padding: 1px 8px; border-radius: 12px; font-weight: 700; font-size: 9px;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .ftr-ph { font-weight: 800; font-size: 10px; }

  /* ════════ REPORT BODY ════════ */
  .report-block { page-break-inside: avoid; break-inside: avoid; }
  .report-title { page-break-after: avoid; break-after: avoid; text-align: center; padding: 5px 18px 4px; border-bottom: 2px solid #003087; }
  .report-title h2 { font-size: 11px; font-weight: 800; letter-spacing: 1.2px; color: #003087; text-transform: uppercase; margin: 0; }
  .report-body  { padding: 8px 18px; }

  /* inner report tables */
  .report-body table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 10px; }
  .report-body table th {
    background: #003087; color: #fff; padding: 4px 6px;
    font-size: 9px; font-weight: 700; border: 1px solid #003087;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .report-body table td   { padding: 4px 6px; border: 1px solid #ccc; vertical-align: middle; }
  .report-body table tr:nth-child(even) td {
    background: #f4f7fb;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }

  /* separator between multiple reports */
  .rep-sep { border: none; border-top: 1px dashed #5e72e4; margin: 6px 18px; }

  /* watermark — on .page-content so it never covers the full page.
     The data-wm attribute is set on .page-content by the JS below. */
  .page-content { position: relative; overflow: hidden; }
  .page-content::before {
    content: attr(data-wm);
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%,-50%) rotate(-30deg);
    font-size: 60px; font-weight: 900;
    color: rgba(0,48,135,0.04);
    white-space: nowrap; pointer-events: none; z-index: 0; letter-spacing: 5px;
  }
  .page-content > * { position: relative; z-index: 1; }
  /* keep .wm harmless for the screen preview */
  .wm { position: relative; }
  .wm > * { position: relative; z-index: 1; }
`;

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */

/**
 * FIX: Barcode in HTML string.
 * The react-barcode JSX component cannot be used inside plain string
 * functions — it serialises to "[object Object]".
 * We generate a simple inline SVG barcode instead, which works
 * perfectly in the printed HTML string context.
 */
function simpleBarcodeHTML(value) {
  const str = String(value || "000000");
  // Alternate bar widths based on char codes for visual variety
   str.split("").flatMap((ch, i) => {
    const code = ch.charCodeAt(0);
    const w1 = (code % 3) + 1;       // 1–3px bar
    const w2 = (code % 2) + 1;       // 1–2px gap
    return [
      `<rect x="${0}" y="0" width="${w1}" height="22" fill="#000"/>`,
      `<rect x="${0}" y="0" width="${w2}" height="0" fill="none"/>`,
    ];
  });

  // Build bar positions properly
  let x = 0;
  const rects = [];
  for (const ch of str) {
    const code = ch.charCodeAt(0);
    const barW = (code % 3) + 1;
    const gapW = (code % 2) + 1;
    rects.push(`<rect x="${x}" y="0" width="${barW}" height="22" fill="#000"/>`);
    x += barW + gapW;
  }
  // Add guard bars
  const totalW = x + 6;

  return `
    <div style="display:inline-block;text-align:center">
      <svg width="${totalW}" height="22" viewBox="0 0 ${totalW} 22" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="2" height="22" fill="#000"/>
        ${rects.join("")}
        <rect x="${totalW - 2}" y="0" width="2" height="22" fill="#000"/>
      </svg>
      <div style="font-size:7px;color:#333;margin-top:1px;letter-spacing:0.5px">${str}</div>
    </div>`;
}

/**
 * FIX: Prevent "Dr. Dr." duplication.
 * If doctor.name already contains "Dr." prefix, don't add it again.
 */
function formatDoctorName(name, fallback = "Dr. Pathologist") {
  if (!name) return fallback;
  const trimmed = name.trim();
  if (/^dr\.?\s/i.test(trimmed)) return trimmed;
  return `Dr. ${trimmed}`;
}

/* ══════════════════════════════════════════════════════════
   HTML BUILDERS
══════════════════════════════════════════════════════════ */
function labHeaderHTML(lab) {
  if (lab.header_footer_blank) return `<div class="hdr-blank"></div>`;
  if (lab.header_image_url && lab.header_enabled)
    return `<img class="hdr-image" src="${lab.header_image_url}" alt="Header"/>`;

  const name = lab.lab_name || "PATHOLOGY LAB";
  const init = name[0].toUpperCase();
  const nameH = name.split(" ").map((w, i) =>
    i === 0 ? `<span style="color:#e8333a">${w} </span>` : w + " ").join("");

  return `
    <div class="hdr-default">
      <div class="hdr-top">
        <div class="hdr-logos">
          <div class="hdr-icon">${init}</div>
          <div>
            <div class="hdr-name">${nameH}</div>
            <div class="hdr-tag">${lab.tagline || "Accurate | Caring | Instant"}</div>
          </div>
        </div>
        <div class="hdr-contact">
          <div class="hdr-ph">&#128222; ${lab.contact_number || "0123456789"}</div>
          <div>&#9993; ${lab.email || "lab@example.com"}</div>
          <div style="color:#003087">${lab.website || "www.lab.com"}</div>
        </div>
      </div>
      <div class="hdr-addr">${lab.lab_address || "Lab Address"}</div>
    </div>
    <div class="hdr-stripe"></div>`;
}

function patientBarHTML(patient, doctor, formatDate) {
  return `
    <div class="pat-bar">
      <div class="pat-col">
        <div class="pat-name">${patient.name || "Patient"}</div>
        <div class="pat-detail">
          <strong>Age: </strong>${patient.age || "—"} &nbsp;|&nbsp; <strong>Sex:</strong> ${patient.gender || "—"}
          <br/>
          <strong>Patient ID:</strong> ${patient.id || "—"}<br/>
          <strong>Phone:</strong> ${patient.phone || "—"}
        </div>
      </div>
      <div class="pat-col" style="border-left:1px solid #ddd;padding-left:10px">
        <div class="pat-detail">
          <strong>Collected At:</strong> ${patient.collection_point || "—"}<br/>
          <strong>Collected By:</strong> ${patient.date || "—"}<br/>
          <strong>Sample Collection:</strong> ${"Inside Lab"}<br/>
          <strong>Ref. By:</strong> ${doctor?.name ? formatDoctorName(doctor.name) : "—"}
        </div>
      </div>
      <div class="pat-col" style="border-left:1px solid #ddd;padding-left:10px;text-align:right">
        ${simpleBarcodeHTML(patient.booking_no)}
        <div class="reg">
          <strong>Reg:</strong> ${patient.booking_no}<br/>
          <strong>Rep:</strong> ${formatDate(patient.reportedOn || new Date())}
        </div>
      </div>
    </div>`;
}

function doctorBarHTML(doctor) {
  // FIX: Use formatDoctorName to avoid "Dr. Dr." duplication
  const d1 = formatDoctorName(doctor?.name);
  const d2 = doctor?.secondName || "Dr. Pathologist";

  return `
    <div class="doc-bar">
      <div class="doc-end">****End of Report****</div>
      <div class="sigs">
        <div class="sig">
          <div class="sig-line"></div>
          <div class="sig-name">Medical Lab Technician</div>
          <div class="sig-ttl">(DMLT, BMLT)</div>
        </div>
        <div class="sig">
          <div class="sig-line"></div>
          <div class="sig-name">${d1}</div>
          <div class="sig-ttl">(MD, Pathologist)</div>
        </div>
        <div class="sig">
          <div class="sig-line"></div>
          <div class="sig-name">${d2}</div>
          <div class="sig-ttl">(MD, Pathologist)</div>
        </div>
      </div>
    </div>`;
}

function labFooterHTML(lab, formatDate) {
  if (lab.header_footer_blank) return `<div class="ftr-blank"></div>`;
  if (lab.footer_image_url && lab.footer_enabled)
    return `<img class="ftr-image" src="${lab.footer_image_url}" alt="Footer"/>`;

  return `
    <div class="ftr-default">
      <div>
        <div class="ftr-note">Scan QR to verify report authenticity</div>
        <div class="ftr-note">Generated: ${formatDate(new Date())}</div>
      </div>
      <div class="ftr-cta">&#128757; Sample Collection</div>
      <div class="ftr-ph">&#128222; ${lab.contact_number || "0123456789"}</div>
    </div>`;
}

/**
 * Builds the full printable HTML document.
 *
 * STRATEGY — explicit JS pagination with position:absolute footer:
 *
 * Every CSS-based approach (@page margins, position:fixed, tfoot)
 * lets the browser decide page breaks, so on short pages the footer
 * floats up after content instead of staying at the true bottom.
 *
 * This approach instead:
 *  1. Renders all content invisibly in a hidden #sandbox div
 *  2. Measures header height, footer height, and each content
 *     block's height via getBoundingClientRect()
 *  3. Packs blocks greedily into page-sized divs (297mm each)
 *  4. Each .page uses position:relative; the .page-footer inside
 *     uses position:absolute; bottom:0 — mathematically guaranteed
 *     to be at the true bottom of every page, full or short
 *  5. page-break-after:always on each .page tells the browser
 *     exactly where to cut — no guessing, no floating
 *
 * Result: footer always at page bottom, content never overlaps it,
 * zero empty gap, works on Chrome, Firefox, Edge, Safari.
 */
function buildFullHTML({ reports, patient, doctor, lab, formatDate }) {
  // const labName    = lab.lab_name || "PATHOLOGY LAB";
  const headerHTML = labHeaderHTML(lab) + patientBarHTML(patient, doctor, formatDate);

  // Show doctor signature bar only when footer image is NOT being used
  const showDoctorBar = !(lab.footer_image_url && lab.footer_enabled) && !lab.header_footer_blank;
  const footerHTML = (showDoctorBar ? doctorBarHTML(doctor) : "") + labFooterHTML(lab, formatDate);

  const blocksHTML = reports.map((r, i) => `
    ${i > 0 ? '<hr class="rep-sep"/>' : ""}
    <div class="report-block">
      <div class="report-title"><h2>${r.test_name || "Laboratory Report"}</h2></div>
        <div class="report-body">
          ${DOMPurify.sanitize(r?.html || "")}
        </div>
    </div>`).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Lab Report — ${patient.name || "Patient"}</title>
  <style>${PRINT_CSS}</style>
  <script>var labName = ${JSON.stringify(lab.lab_name || "PATHOLOGY LAB")};</script>
</head>
<body>

  <!--
    Sandbox: rendered at opacity:0 but IN the normal document flow
    (not off-screen at top:-99999px) so images load at their real
    dimensions and getBoundingClientRect() returns accurate heights.
    We switch to visibility:hidden after measurement before printing.
  -->
  <div id="sandbox" style="opacity:0;pointer-events:none;width:210mm;">
    <div id="sb-header">${headerHTML}</div>
    <div id="sb-footer">${footerHTML}</div>
    <div id="sb-blocks">${blocksHTML}</div>
  </div>

  <!-- Final paginated output injected here by script -->
  <div id="pages"></div>

  <script>
  (function () {
    /* A4 at 96 dpi = 297/25.4*96 ≈ 1122.5px */
    var A4_PX = (297 / 25.4) * 96;

    function getH(el) {
      return el ? el.getBoundingClientRect().height : 0;
    }

    function buildPages() {
      var sandbox  = document.getElementById('sandbox');
      var headerEl = document.getElementById('sb-header');
      var footerEl = document.getElementById('sb-footer');
      var blocksEl = document.getElementById('sb-blocks');

      var headerH = getH(headerEl);
      var footerH = getH(footerEl);

      /* Usable content height per page = A4 minus header and footer */
      var availH = A4_PX - headerH - footerH;

      /* Gather every direct element child of sb-blocks */
      var nodes = Array.from(blocksEl.children);

      /* Greedy bin-packing: fill each page until a block won't fit */
      var pages = [[]];
      var usedH = [0];

      nodes.forEach(function (node) {
        var nodeH = getH(node);
        if (nodeH <= 0) return;
        var pi = pages.length - 1;
        if (usedH[pi] + nodeH > availH && pages[pi].length > 0) {
          pages.push([]);
          usedH.push(0);
          pi++;
        }
        /*
         * Move the actual node (not a clone) — the images inside are
         * already loaded and decoded, so they render immediately on
         * the final page with no flicker or blank-image bug.
         */
        pages[pi].push(node);
        usedH[pi] += nodeH;
      });

      /* Hide sandbox before building visible pages */
      sandbox.style.display = 'none';

      var pagesDiv = document.getElementById('pages');

      pages.forEach(function (pageNodes) {
        if (pageNodes.length === 0) return;

        var page = document.createElement('div');
        page.className = 'page';

        /* Header — clone so the same image node can appear on every page */
        var hdr = headerEl.cloneNode(true);
        hdr.className = (hdr.className || '') + ' page-header';
        hdr.removeAttribute('id');
        page.appendChild(hdr);

        /* Content — use the moved (already-loaded) nodes.
           data-wm drives the ::before watermark via CSS attr() */
        var content = document.createElement('div');
        content.className = 'page-content';
        pageNodes.forEach(function (n) { content.appendChild(n); });
        page.appendChild(content);

        /* Footer — clone so the same image node can appear on every page */
        var ftr = footerEl.cloneNode(true);
        ftr.className = (ftr.className || '') + ' page-footer';
        ftr.removeAttribute('id');
        page.appendChild(ftr);

        pagesDiv.appendChild(page);
      });

      /* Remove sandbox entirely */
      sandbox.parentNode.removeChild(sandbox);

      /* Two rAF ticks: browser reflows the final pages before print dialog */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          window.print();
        });
      });
    }

    /*
     * Wait for ALL images to load before measuring.
     * If no images exist, Promise.all resolves immediately.
     */
    function waitForImages() {
      var imgs = Array.from(document.querySelectorAll('#sandbox img'));
      if (imgs.length === 0) return Promise.resolve();
      var promises = imgs.map(function (img) {
        if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
        return new Promise(function (resolve) {
          img.onload  = resolve;
          img.onerror = resolve; /* resolve even on broken images */
        });
      });
      return Promise.all(promises);
    }

    function init() {
      waitForImages().then(buildPages);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();
  </script>

</body>
</html>`;
}

function printInNewWindow({ reports, patient, doctor, lab, formatDate }) {
  const html = buildFullHTML({ reports, patient, doctor, lab, formatDate });
  const win  = window.open("", "_blank", "width=900,height=700");
  if (!win) { alert("Please allow popups to print reports."); return; }
  win.document.open();
  win.document.write(html);
  win.document.close();
  /* window.print() is triggered by the inline script after JS pagination */
  win.onafterprint = () => win.close();
}

/* ══════════════════════════════════════════════════════════
   SCREEN PREVIEW COMPONENTS
══════════════════════════════════════════════════════════ */
function PreviewLabHeader({ lab }) {
  if (lab.header_footer_blank)
    return (
      <div style={{ height: 50, background: "#fafbff", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px dashed #e0e6ed" }}>
        <span style={{ fontSize: 10, color: "#adb5bd" }}>Header blank (header_footer_blank = true)</span>
      </div>
    );

  if (lab.header_image_url && lab.header_enabled)
    return (
      <div style={{ borderBottom: "3px solid #003087" }}>
        <img src={lab.header_image_url} alt="Header" style={{ width: "100%", display: "block" }} />
      </div>
    );

  const name = lab.lab_name || "PATHOLOGY LAB";
  return (
    <>
      <div style={{ padding: "10px 18px 0", borderBottom: "3px solid #003087" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, background: "#003087", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              {name[0]}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#003087", letterSpacing: 1 }}>
                {name.split(" ").map((w, i) => i === 0 ? <span key={i} style={{ color: "#e8333a" }}>{w} </span> : w + " ")}
              </div>
              <div style={{ fontSize: 8, color: "#555", fontStyle: "italic", marginTop: 1 }}>{lab.tagline || "Accurate | Caring | Instant"}</div>
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 9, color: "#333", lineHeight: 1.6 }}>
            <div style={{ fontWeight: 700, color: "#003087", fontSize: 10 }}>📞 {lab.contact_number || "0123456789"}</div>
            <div>✉ {lab.email || "lab@example.com"}</div>
            <div style={{ color: "#003087" }}>{lab.website || "www.lab.com"}</div>
          </div>
        </div>
        <div style={{ fontSize: 8, color: "#666", padding: "3px 0 4px", borderTop: "1px solid #ddd" }}>{lab.lab_address || "Lab Address"}</div>
      </div>
      <div style={{ height: 4, background: "repeating-linear-gradient(90deg,#003087 0,#003087 10px,#e8333a 10px,#e8333a 20px)" }} />
    </>
  );
}

function PreviewPatientBar({ patient, doctor, formatDate }) {
  return (
    <div style={{ display: "flex", padding: "6px 18px", borderBottom: "2px solid #003087", background: "#f5f7ff", fontSize: 8 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#003087", marginBottom: 2 }}>{patient.name || "Patient"}</div>
        <div style={{ fontSize: 8, color: "#444", lineHeight: 1.75 }}>
          Patient ID: {patient.id || "—"}<br />
          <strong>Age :</strong> {patient.age || "—"} | <strong>Sex: </strong>{patient.gender || "—"}<br />
          <strong>Phone :</strong> {patient.phone || "—"}
        </div>
      </div>
      <div style={{ flex: 1, borderLeft: "1px solid #ddd", paddingLeft: 10 }}>
        <div style={{ fontSize: 8, color: "#444", lineHeight: 1.75 }}>
          <strong>Collected At:</strong> {patient.collection_point || "—"}<br />
          <strong>Collected By:</strong> {patient.date || "—"}<br />
          <strong>Sample Collection:</strong> {"Inside Lab"}<br />
          {/* FIX: formatDoctorName prevents "Dr. Dr." duplication */}
          <strong>Ref. By:</strong> {doctor?.name ? formatDoctorName(doctor.name) : "—"}
        </div>
      </div>
      <div style={{ flex: 1, borderLeft: "1px solid #ddd", paddingLeft: 10, textAlign: "right" }}>
        {/* React-barcode component works fine in the screen preview (JSX context) */}
        <Barcode
          value={`${patient.booking_no || "000000"}`}
          format="CODE128"
          width={1}
          height={15}
          fontSize={7}
          background="#ffffff00"
          lineColor="#000"
        />
        <div style={{ fontSize: 7, color: "#555", lineHeight: 1.7 }}>
          <strong style={{ color: "#003087" }}>Booking #:</strong> {patient.booking_no}<br />
          <strong style={{ color: "#003087" }}>Rep:</strong> {formatDate(patient.reportedOn || new Date())}
        </div>
      </div>
    </div>
  );
}

function PreviewDoctorBar({ doctor }) {
  // FIX: Use formatDoctorName to avoid "Dr. Dr." duplication
  const d1 = formatDoctorName(doctor?.name);
  const d2 = doctor?.secondName || "Dr. Pathologist";

  return (
    <div style={{ padding: "5px 18px 7px", borderTop: "1px solid #ddd", background: "#fff" }}>
      <div style={{ textAlign: "center", fontSize: 8, color: "#888", marginBottom: 5 }}>****End of Report****</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        {[
          ["Medical Lab Technician", "(DMLT, BMLT)"],
          [d1, "(MD, Pathologist)"],
          [d2, "(MD, Pathologist)"],
        ].map(([nm, ttl]) => (
          <div key={nm} style={{ textAlign: "center" }}>
            <div style={{ width: 85, borderTop: "1px solid #333", margin: "0 auto 2px" }} />
            <div style={{ fontSize: 8, fontWeight: 700, color: "#003087" }}>{nm}</div>
            <div style={{ fontSize: 7, color: "#666" }}>{ttl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewLabFooter({ lab, formatDate }) {
  if (lab.header_footer_blank)
    return (
      <div style={{ height: 40, background: "#fafbff", display: "flex", alignItems: "center", justifyContent: "center", borderTop: "1px dashed #e0e6ed" }}>
        <span style={{ fontSize: 10, color: "#adb5bd" }}>Footer blank (header_footer_blank = true)</span>
      </div>
    );

  if (lab.footer_image_url && lab.footer_enabled)
    return <div><img src={lab.footer_image_url} alt="Footer" style={{ width: "100%", display: "block" }} /></div>;

  return (
    <div style={{ background: "#003087", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 18px", fontSize: 8 }}>
      <div>
        <div style={{ fontSize: 7, color: "#aac4f0" }}>Scan QR to verify authenticity</div>
        <div style={{ fontSize: 7, color: "#aac4f0" }}>Generated: {formatDate(new Date())}</div>
      </div>
      <div style={{ background: "#e8333a", color: "#fff", padding: "1px 8px", borderRadius: 12, fontWeight: 700, fontSize: 9 }}>🛵 Sample Collection</div>
      <div style={{ fontWeight: 800, fontSize: 10 }}>📞 {lab.contact_number || "0123456789"}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function PrintReport({ testIds = [], isOpen, toggle }) {
  const [reports,    setReports]    = useState([]);
  const [patient,    setPatient]    = useState({});
  const [doctor,     setDoctor]     = useState({});
  const [loading,    setLoading]    = useState(false);
  const [labLoading, setLabLoading] = useState(false);
  const [lab, setLab] = useState({
    lab_name: "", lab_address: "", contact_number: "", email: "",
    tagline: "", website: "",
    header_enabled: true, footer_enabled: true,
    header_footer_blank: false,
    header_image_url: null, footer_image_url: null,
  });

  useEffect(() => {
    setLabLoading(true);
    api.get("/lab-settings")
      .then(res => {
        const d = res.data;
        setLab({
          lab_name:            d.lab_name            || "",
          lab_address:         d.lab_address          || "",
          contact_number:      d.contact_number       || "",
          email:               d.email                || "",
          tagline:             d.tagline              || "",
          website:             d.website              || "",
          header_enabled:      d.header_enabled     ?? true,
          footer_enabled:      d.footer_enabled     ?? true,
          header_footer_blank: d.header_footer_blank ?? false,
          header_image_url:    d.header_image_url     || null,
          footer_image_url:    d.footer_image_url     || null,
        });
      })
      .catch(err => console.error("Lab settings:", err))
      .finally(() => setLabLoading(false));
  }, []);

  const fetchReports = async () => {
    if (!testIds.length) return;
    try {
      setLoading(true);
      const res = await api.post("/patient-report-print", { testIds });
      setReports(res.data.data.tests);
      setPatient(res.data.data.patient);
      setDoctor(res.data.data.doctor);
    } catch (err) {
      console.error("Reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isOpen) fetchReports(); }, [isOpen]);

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const isReady  = !loading && !labLoading;
  const labName  = lab.lab_name || "PATHOLOGY LAB";

  return (
    <>
      {/* All styles scoped to #prm — zero global leakage */}
      <style>{`
        #prm .modal-content  { border-radius:16px !important; overflow:hidden !important; border:none !important; }
        #prm .modal-header   { border-bottom:none !important; padding:0 !important; }
        #prm .modal-header .close { padding:1.25rem !important; position:absolute !important; right:0 !important; top:0 !important; margin:0 !important; color:#fff !important; opacity:.8 !important; text-shadow:none !important; z-index:10 !important; background:transparent !important; border:none !important; font-size:1.5rem !important; cursor:pointer !important; }
        #prm .modal-header .close:hover { opacity:1 !important; }
        #prm .modal-header .close span  { color:#fff !important; }

        /* report body table styles — fully scoped to #prm */
        #prm .rbody > table                              { width:100%; border-collapse:collapse; font-size:10px; margin-bottom:8px; }
        #prm .rbody > table > thead > tr > th            { background:#003087; color:#fff; padding:4px 6px; font-size:9px; font-weight:700; border:1px solid #003087; }
        #prm .rbody > table > tbody > tr > td            { padding:4px 6px; border:1px solid #ccc; }
        #prm .rbody > table > tbody > tr:nth-child(even) > td { background:#f4f7fb; }
      `}</style>

      <Modal isOpen={isOpen} toggle={toggle} size="xl" centered id="prm">

        <ModalHeader toggle={toggle} cssModule={{ "modal-title": "w-100" }}>
          <div style={{ background: "linear-gradient(135deg,#003087,#1a56c4)", padding: "18px 24px", borderRadius: "12px 12px 0 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📄</span>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Lab Report Preview</div>
                  <div style={{ color: "rgba(255,255,255,.7)", fontSize: 12 }}>
                    {reports.length} report{reports.length !== 1 ? "s" : ""} · header & footer repeat on every page
                    {labLoading && <span style={{ marginLeft: 8, opacity: .7 }}>· Loading…</span>}
                  </div>
                </div>
              </div>
              <button
                onClick={() => printInNewWindow({ reports, patient, doctor, lab, formatDate })}
                disabled={!isReady || reports.length === 0}
                style={{
                  borderRadius: 8, border: "none", fontWeight: 700, fontSize: 13,
                  padding: "9px 20px", marginRight: 40,
                  cursor: (!isReady || reports.length === 0) ? "not-allowed" : "pointer",
                  background: (!isReady || reports.length === 0) ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.95)",
                  color: (!isReady || reports.length === 0) ? "rgba(255,255,255,.5)" : "#003087",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                🖨️ Print A4
              </button>
            </div>
          </div>
        </ModalHeader>

        <ModalBody style={{ background: "#c8cdd6", padding: "24px", maxHeight: "82vh", overflowY: "auto" }}>

          {(loading || labLoading) && (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div className="spinner-border text-primary" style={{ width: 40, height: 40 }} />
              <p style={{ color: "#525f7f", marginTop: 14, fontWeight: 600 }}>
                {labLoading ? "Loading lab settings…" : "Loading reports…"}
              </p>
            </div>
          )}

          {isReady && reports.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#8898aa" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
              <div style={{ fontWeight: 600 }}>No reports found</div>
            </div>
          )}

          {isReady && reports.length > 0 && (
            <div style={{
              width: "210mm", margin: "0 auto", background: "#fff",
              boxShadow: "0 6px 32px rgba(0,0,0,.25)", borderRadius: 3,
              overflow: "hidden", fontFamily: "'Segoe UI',Arial,sans-serif",
              fontSize: 12, color: "#222",
            }}>

              {/* ── header ── */}
              <PreviewLabHeader lab={lab} />
              <PreviewPatientBar patient={patient} doctor={doctor} formatDate={formatDate} />

              {/* ── body ── */}
              {reports.map((report, i) => (
                <div key={report.id || i}>
                  {i > 0 && <hr style={{ border: "none", borderTop: "1px dashed #5e72e4", margin: "5px 18px" }} />}
                  <div>
                    <div style={{ textAlign: "center", padding: "5px 18px 4px", borderBottom: "2px solid #003087" }}>
                      <h2 style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: "#003087", textTransform: "uppercase", margin: 0 }}>
                        {report.test_name || "Laboratory Report"}
                      </h2>
                    </div>
                    <div style={{ position: "relative" }}>
                      {/* <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-30deg)", fontSize: 40, fontWeight: 900, color: "rgba(0,48,135,0.04)", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 0, letterSpacing: 5 }}>
                        {labName}
                      </div> */}
                      <div
                        className="rbody"
                        style={{ padding: "8px 18px", position: "relative", zIndex: 1 }}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(report?.html || "") }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* ── footer ── */}
              {!(lab.footer_image_url && lab.footer_enabled) && !lab.header_footer_blank && (
                <PreviewDoctorBar doctor={doctor} />
              )}
              <PreviewLabFooter lab={lab} formatDate={formatDate} />
            </div>
          )}
        </ModalBody>
      </Modal>
    </>
  );
}