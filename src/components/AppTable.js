import React, { useState, useMemo, useEffect, useRef } from "react";

const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const endOfDay   = (d) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };

const DATE_PRESETS = [
  { label: "Today",        getValue: () => { const n = new Date(); return { from: startOfDay(n), to: endOfDay(n) }; } },
  { label: "Yesterday",    getValue: () => { const n = new Date(); n.setDate(n.getDate() - 1); return { from: startOfDay(n), to: endOfDay(n) }; } },
  { label: "This Week",    getValue: () => { const n = new Date(); const d = n.getDay(); const m = new Date(n); m.setDate(n.getDate() - d + 1); return { from: startOfDay(m), to: endOfDay(n) }; } },
  { label: "Last Week",    getValue: () => { const n = new Date(); const d = n.getDay(); const start = new Date(n); start.setDate(n.getDate() - d - 6); const end = new Date(n); end.setDate(n.getDate() - d); return { from: startOfDay(start), to: endOfDay(end) }; } },
  { label: "This Month",   getValue: () => { const n = new Date(); return { from: new Date(n.getFullYear(), n.getMonth(), 1), to: endOfDay(n) }; } },
  { label: "Last Month",   getValue: () => { const n = new Date(); const first = new Date(n.getFullYear(), n.getMonth() - 1, 1); const last = new Date(n.getFullYear(), n.getMonth(), 0); return { from: first, to: endOfDay(last) }; } },
  { label: "This Quarter", getValue: () => { const n = new Date(); const q = Math.floor(n.getMonth() / 3); return { from: new Date(n.getFullYear(), q * 3, 1), to: endOfDay(n) }; } },
  { label: "This Year",    getValue: () => { const n = new Date(); return { from: new Date(n.getFullYear(), 0, 1), to: endOfDay(n) }; } },
  { label: "Last Year",    getValue: () => { const n = new Date(); return { from: new Date(n.getFullYear() - 1, 0, 1), to: new Date(n.getFullYear() - 1, 11, 31, 23, 59, 59) }; } },
];

const fmtDate = (d) => d ? new Date(d).toISOString().slice(0, 10) : "";
const parseDate = (s) => s ? new Date(s) : null;
const toISOOrNull = (d) => d ? new Date(d).toISOString() : null;

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const toolbarButton = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  borderRadius: 10,
  border: "1px solid var(--lims-border, #e2e8f0)",
  background: "var(--lims-surface, #fff)",
  color: "var(--lims-text, #1e293b)",
  padding: "9px 14px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all .18s ease",
};

const pillBtn = { ...toolbarButton, minWidth: 110, borderRadius: 999 };
const chipStyle = { display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: "#f3f4f6", color: "#334155", fontSize: 12 };
const chipCloseButtonStyle = { border: "none", background: "transparent", color: "#475569", cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1 };
const filterInputStyle = { width: "100%", marginTop: 6, padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 10, outline: "none", fontSize: 13, color: "#111827", background: "#f8fafc", boxSizing: "border-box" };
const tableHeaderCell = { textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "var(--lims-text-secondary, #64748b)", borderBottom: "1px solid var(--lims-border, #e2e8f0)", cursor: "pointer", userSelect: "none", textTransform: "uppercase", letterSpacing: "0.04em" };
const tableCell = { padding: "12px 16px", color: "var(--lims-text, #1e293b)", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle", fontSize: 14 };
const summaryStyle = { fontSize: 12, color: "#6b7280", marginBottom: 10 };
const navButton = { border: "1px solid #d1d5db", background: "#fff", color: "#374151", padding: "9px 12px", borderRadius: 10, cursor: "pointer", fontSize: 13, transition: "background .18s" };
const pageControlStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 16, flexWrap: "wrap" };
const menuItemStyle = { border: "none", background: "transparent", width: "100%", padding: "10px 14px", textAlign: "left", fontSize: 13, color: "#111827", cursor: "pointer", borderRadius: 10 };
const menuDangerStyle = { ...menuItemStyle, color: "#b91c1c" };

function FilterPanel({ visible, title, children, onClose }) {
  if (!visible) return null;
  return (
    <div style={{ position: "absolute", right: 0, top: 52, width: 340, zIndex: 20, padding: 16, background: "#fff", borderRadius: 14, border: "1px solid rgba(15,23,42,.08)", boxShadow: "0 30px 60px rgba(15,23,42,.12)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{title}</span>
        <button onClick={onClose} style={{ border: "none", background: "transparent", color: "#6b7280", fontSize: 18, cursor: "pointer" }}>×</button>
      </div>
      {children}
    </div>
  );
}

export default function AppTable({ rows = [], columns = [], loading = false, rowCount = 0, defaultPageSize = 10, onFilterChange, actions, setWarn, addPath, dateColumnFields }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortModel, setSortModel] = useState([]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState({});
  const [dateFilter, setDateFilter] = useState({ column: "", from: null, to: null });
  const [searchFocused, setSearchFocused] = useState(false);
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuRow, setMenuRow] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const debouncedSearch = useDebounce(globalSearch, 300);
  const debouncedFilters = useDebounce(columnFilters, 300);

  const dateColumns = useMemo(() => {
    if (dateColumnFields) return columns.filter((col) => dateColumnFields.includes(col.field));
    const kw = /date|time|_at|_on|created|updated|timestamp/i;
    const detected = columns.filter((col) => kw.test(col.field));
    if (detected.length === 0 && rows.length > 0) return columns.filter((col) => { const value = rows[0][col.field]; return value && !isNaN(Date.parse(value)) && isNaN(Number(value)); });
    return detected;
  }, [columns, dateColumnFields, rows]);

  useEffect(() => {
    if (dateColumns.length === 1 && !dateFilter.column) setDateFilter((current) => ({ ...current, column: dateColumns[0].field }));
  }, [dateColumns, dateFilter.column]);

  const firstRender = useRef(true);
  useEffect(() => { if (firstRender.current) { firstRender.current = false; return; } setPage(1); }, [debouncedSearch, debouncedFilters, dateFilter]);

  useEffect(() => {
    if (!onFilterChange) return;
    onFilterChange({ page, page_size: pageSize, search: debouncedSearch || undefined, filters: debouncedFilters, date_column: dateFilter.column || undefined, date_from: toISOOrNull(dateFilter.from), date_to: toISOOrNull(dateFilter.to), sort_field: sortModel[0]?.field || undefined, sort_dir: sortModel[0]?.sort || undefined });
  }, [page, pageSize, debouncedSearch, debouncedFilters, dateFilter, sortModel, onFilterChange]);

  const activeColFilters = Object.values(columnFilters).filter(Boolean).length;
  const activeDateFilter = dateFilter.from || dateFilter.to ? 1 : 0;
  const totalActive = activeColFilters + activeDateFilter + (globalSearch ? 1 : 0);
  const totalPages = Math.max(1, Math.ceil(rowCount / pageSize));

  const openMenu = (event, row) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX - 10 });
    setMenuRow(row);
    setMenuVisible(true);
  };

  const handleColumnFilter = (field, value) => {
    if (field === "__clear__") { setColumnFilters({}); return; }
    setColumnFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSort = (field) => {
    const current = sortModel[0];
    if (current?.field !== field) { setSortModel([{ field, sort: "asc" }]); return; }
    if (current.sort === "asc") { setSortModel([{ field, sort: "desc" }]); return; }
    setSortModel([]);
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {addPath && <button onClick={() => (window.location.href = addPath)} style={{ ...toolbarButton, background: "#4f46e5", borderColor: "#4f46e5", color: "#fff" }}>+ Add New</button>}
        <div style={{ flex: 1, minWidth: 240, position: "relative" }}>
          <i className="fa fa-search" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: searchFocused ? "#4f46e5" : "#9ca3af" }} />
          <input type="text" placeholder="Search…" value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} style={{ width: "100%", height: 40, padding: "0 36px 0 40px", border: "1.5px solid" , borderRadius: 999, background: "#fff", outline: "none", fontSize: 13, color: "#111827", boxShadow: searchFocused ? "0 0 0 4px rgba(79,70,229,0.08)" : "none", transition: "border-color .18s, box-shadow .18s" }} />
          {globalSearch && <button type="button" onClick={() => setGlobalSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 24, height: 24, borderRadius: "50%", border: "none", background: "#e5e7eb", color: "#334155", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>×</button>}
        </div>
        <button type="button" onClick={() => setShowColumnFilters((value) => !value)} style={{ ...pillBtn, borderColor: activeColFilters ? "#4f46e5" : "#e0e0e0", background: activeColFilters ? "#eef2ff" : "#fff", color: activeColFilters ? "#4338ca" : "#374151" }}><i className="fa fa-filter" /> Filters {activeColFilters > 0 && <span style={{ marginLeft: 6, background: "#4f46e5", color: "#fff", borderRadius: 999, padding: "2px 8px", fontSize: 11 }}>{activeColFilters}</span>}</button>
        {dateColumns.length > 0 && <button type="button" onClick={() => setShowDateFilters((value) => !value)} style={{ ...pillBtn, borderColor: activeDateFilter ? "#4f46e5" : "#e0e0e0", background: activeDateFilter ? "#eef2ff" : "#fff", color: activeDateFilter ? "#4338ca" : "#374151" }}><i className="fa fa-calendar-alt" /> Date {activeDateFilter > 0 && <span style={{ marginLeft: 6, background: "#4f46e5", color: "#fff", borderRadius: 999, padding: "2px 8px", fontSize: 11 }}>1</span>}</button>}
        {totalActive > 0 && <button type="button" onClick={() => { setGlobalSearch(""); setColumnFilters({}); setDateFilter((current) => ({ ...current, from: null, to: null })); }} style={{ ...pillBtn, borderColor: "#e0e0e0", color: "#8b98ab" }}><i className="fa fa-times" /> Clear</button>}
      </div>
      {totalActive > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>{globalSearch && <span style={chipStyle}>Search: "{globalSearch}" <button onClick={() => setGlobalSearch("")} style={chipCloseButtonStyle}>×</button></span>}{Object.entries(columnFilters).filter(([, value]) => value).map(([field, value]) => { const column = columns.find((col) => col.field === field); return <span key={field} style={chipStyle}>{column?.headerName || field}: "{value}" <button onClick={() => handleColumnFilter(field, "")} style={chipCloseButtonStyle}>×</button></span>; })}{activeDateFilter > 0 && <span style={{ ...chipStyle, background: "#eef2ff", color: "#4338ca", borderColor: "#c4b5fd" }}>{(columns.find((c) => c.field === dateFilter.column)?.headerName || dateFilter.column) || "Date"}: {dateFilter.from ? new Date(dateFilter.from).toLocaleDateString() : "…"} → {dateFilter.to ? new Date(dateFilter.to).toLocaleDateString() : "…"} <button onClick={() => setDateFilter((current) => ({ ...current, from: null, to: null }))} style={chipCloseButtonStyle}>×</button></span>}</div>}
      <div style={summaryStyle}>Showing <strong>{rows.length}</strong> of <strong>{rowCount}</strong> records{totalActive > 0 && <span style={{ color: "#4f46e5" }}> (filtered)</span>}</div>
      <div style={{ overflowX: "auto", borderRadius: 18, border: "1px solid #e5e7eb", background: "#fff" }}>
        <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc" }}><tr>{columns.map((col) => <th key={col.field} style={tableHeaderCell} onClick={() => col.sortable === false ? null : handleSort(col.field)}><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{col.headerName || col.field}{sortModel[0]?.field === col.field && <span style={{ fontSize: 12, color: "#4f46e5" }}>{sortModel[0]?.sort === "asc" ? "▲" : "▼"}</span>}</span></th>)}{actions && <th style={tableHeaderCell}>Actions</th>}</tr></thead>
          <tbody>{loading ? <tr><td colSpan={columns.length + (actions ? 1 : 0)} style={{ ...tableCell, textAlign: "center", padding: 40 }}><div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "#4f46e5" }}><span className="spinner-border spinner-border-sm" /> Loading…</div></td></tr> : rows.length === 0 ? <tr><td colSpan={columns.length + (actions ? 1 : 0)} style={{ ...tableCell, textAlign: "center", padding: 40, color: "#6b7280" }}>No records found.</td></tr> : rows.map((row, rowIndex) => <tr key={row.id ?? rowIndex} style={{ background: rowIndex % 2 === 0 ? "#fff" : "#f8fafc" }}>{columns.map((col) => <td key={col.field} style={tableCell}>{col.renderCell ? col.renderCell({ row, value: row[col.field], field: col.field }) : (row[col.field] ?? "")}</td>)}{actions && <td style={tableCell}><button type="button" onClick={(e) => openMenu(e, row)} style={{ ...toolbarButton, minWidth: 36, width: 36, height: 36, justifyContent: "center", padding: 0 }}>⋮</button></td>}</tr>)}</tbody>
        </table>
      </div>
      <div style={pageControlStyle}><div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}><button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} style={{ ...navButton, opacity: page === 1 ? 0.5 : 1 }}>Previous</button><span style={{ color: "#374151", fontSize: 13 }}>Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} style={{ ...navButton, opacity: page >= totalPages ? 0.5 : 1 }}>Next</button></div><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#6b7280", fontSize: 13 }}>Rows per page</span><select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} style={{ ...filterInputStyle, width: 96, padding: "8px 10px" }}>{[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}</select></div></div>
      <FilterPanel visible={showColumnFilters} title="Filter by column" onClose={() => setShowColumnFilters(false)}>{columns.filter((col) => col.field !== "actions" && col.filterable !== false).map((col) => <div key={col.field} style={{ marginBottom: 12 }}><label style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>{col.headerName || col.field}</label><input type="text" value={columnFilters[col.field] || ""} onChange={(e) => handleColumnFilter(col.field, e.target.value)} style={filterInputStyle} /></div>)}<button type="button" onClick={() => handleColumnFilter("__clear__", "")} style={{ ...toolbarButton, width: "100%", marginTop: 10, background: "#f3f4f6", color: "#374151" }}>Clear All</button></FilterPanel>
      <FilterPanel visible={showDateFilters} title="Date Filter" onClose={() => setShowDateFilters(false)}>{dateColumns.length > 1 && <div style={{ marginBottom: 12 }}><label style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>Date Column</label><select value={dateFilter.column || ""} onChange={(e) => setDateFilter((current) => ({ ...current, column: e.target.value }))} style={filterInputStyle}><option value="">Select…</option>{dateColumns.map((col) => <option key={col.field} value={col.field}>{col.headerName || col.field}</option>)}</select></div>}<div style={{ marginBottom: 12 }}><label style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>Presets</label><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{DATE_PRESETS.map((preset) => <button type="button" key={preset.label} onClick={() => { const range = preset.getValue(); setDateFilter((current) => ({ ...current, ...range })); }} style={{ padding: "6px 10px", borderRadius: 20, border: "1px solid #e5e7eb", background: "#fff", color: "#334155", fontSize: 12, cursor: "pointer" }}>{preset.label}</button>)}</div></div><div style={{ display: "flex", gap: 8, marginBottom: 12 }}><div style={{ flex: 1 }}><label style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>From</label><input type="date" value={fmtDate(dateFilter.from)} onChange={(e) => setDateFilter((current) => ({ ...current, from: parseDate(e.target.value) }))} style={filterInputStyle} /></div><div style={{ flex: 1 }}><label style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>To</label><input type="date" value={fmtDate(dateFilter.to)} onChange={(e) => { const parsed = parseDate(e.target.value); setDateFilter((current) => ({ ...current, to: parsed ? endOfDay(parsed) : null })); }} style={filterInputStyle} /></div></div><button type="button" onClick={() => setDateFilter((current) => ({ ...current, from: null, to: null }))} style={{ ...toolbarButton, width: "100%", background: "#f3f4f6", color: "#374151" }}>Clear</button></FilterPanel>
      {menuVisible && menuRow && <div style={{ position: "fixed", top: menuPosition.top, left: menuPosition.left, zIndex: 30, minWidth: 160, padding: 8, background: "#fff", borderRadius: 14, border: "1px solid rgba(15,23,42,.08)", boxShadow: "0 20px 45px rgba(15,23,42,.14)" }}>{actions?.view && <button type="button" onClick={() => { actions.view(menuRow); setMenuVisible(false); }} style={menuItemStyle}>View</button>}{actions?.edit && <button type="button" onClick={() => { actions.edit(menuRow); setMenuVisible(false); }} style={menuItemStyle}>Edit</button>}{actions?.delete && <button type="button" onClick={() => { actions.delete(menuRow); setWarn(true); setMenuVisible(false); }} style={menuDangerStyle}>Delete</button>}</div>}
    </div>
  );
}