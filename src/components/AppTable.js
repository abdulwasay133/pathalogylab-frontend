// src/components/AppTable.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Menu, MenuItem, IconButton, Chip, Tooltip, Popover, Divider } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloseIcon from "@mui/icons-material/Close";
import TuneIcon from "@mui/icons-material/Tune";
import "assets/scss/custom-datagrid.scss";

// ─── Date helpers ───────────────────────────────────────────────────────────
const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const endOfDay   = (d) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };

const DATE_PRESETS = [
  { label: "Today",        getValue: () => { const n=new Date(); return { from: startOfDay(n), to: endOfDay(n) }; } },
  { label: "Yesterday",    getValue: () => { const n=new Date(); n.setDate(n.getDate()-1); return { from: startOfDay(n), to: endOfDay(n) }; } },
  { label: "This Week",    getValue: () => { const n=new Date(); const day=n.getDay(); const mon=new Date(n); mon.setDate(n.getDate()-day+1); return { from: startOfDay(mon), to: endOfDay(n) }; } },
  { label: "Last Week",    getValue: () => { const n=new Date(); const day=n.getDay(); const lm=new Date(n); lm.setDate(n.getDate()-day-6); const ls=new Date(n); ls.setDate(n.getDate()-day); return { from: startOfDay(lm), to: endOfDay(ls) }; } },
  { label: "This Month",   getValue: () => { const n=new Date(); return { from: new Date(n.getFullYear(),n.getMonth(),1), to: endOfDay(n) }; } },
  { label: "Last Month",   getValue: () => { const n=new Date(); const f=new Date(n.getFullYear(),n.getMonth()-1,1); const t=new Date(n.getFullYear(),n.getMonth(),0); return { from: f, to: endOfDay(t) }; } },
  { label: "This Quarter", getValue: () => { const n=new Date(); const q=Math.floor(n.getMonth()/3); const f=new Date(n.getFullYear(),q*3,1); return { from: f, to: endOfDay(n) }; } },
  { label: "This Year",    getValue: () => { const n=new Date(); return { from: new Date(n.getFullYear(),0,1), to: endOfDay(n) }; } },
  { label: "Last Year",    getValue: () => { const n=new Date(); return { from: new Date(n.getFullYear()-1,0,1), to: new Date(n.getFullYear()-1,11,31,23,59,59) }; } },
];

const fmtDate = (d) => d ? new Date(d).toISOString().slice(0,10) : "";
const parseDate = (s) => s ? new Date(s) : null;

// ─── Column Filter Popover ───────────────────────────────────────────────────
function ColumnFilterPopover({ columns, filters, onChange, onClose, anchorEl }) {
  const open = Boolean(anchorEl);
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      PaperProps={{ style: { width: 320, maxHeight: 480, padding: "16px", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" } }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>Filter by Column</span>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {columns.filter(c => c.field !== "actions" && c.filterable !== false).map((col) => (
          <div key={col.field}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {col.headerName || col.field}
            </label>
            <input
              type="text"
              placeholder={`Search ${col.headerName || col.field}...`}
              value={filters[col.field] || ""}
              onChange={(e) => onChange(col.field, e.target.value)}
              style={{
                width: "100%", marginTop: 4, padding: "7px 10px",
                border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 13,
                outline: "none", boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#4f46e5"}
              onBlur={e => e.target.style.borderColor = "#e0e0e0"}
            />
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange("__clear__", "")}
        style={{
          marginTop: 16, width: "100%", padding: "8px", background: "#f5f5f5",
          border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13,
          fontWeight: 600, color: "#666", transition: "background 0.2s",
        }}
        onMouseEnter={e => e.target.style.background = "#ede9fe"}
        onMouseLeave={e => e.target.style.background = "#f5f5f5"}
      >
        Clear All Filters
      </button>
    </Popover>
  );
}

// ─── Date Filter Popover ─────────────────────────────────────────────────────
function DateFilterPopover({ dateColumns, dateFilter, onChange, onClose, anchorEl }) {
  const open = Boolean(anchorEl);
  const [activePreset, setActivePreset] = useState(null);

  const handlePreset = (preset) => {
    setActivePreset(preset.label);
    const range = preset.getValue();
    onChange({ column: dateFilter.column, from: range.from, to: range.to });
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      PaperProps={{ style: { width: 360, padding: "16px", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" } }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>Date Filter</span>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </div>

      {/* Date column selector */}
      {dateColumns.length > 1 && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>Date Column</label>
          <select
            value={dateFilter.column || ""}
            onChange={(e) => onChange({ ...dateFilter, column: e.target.value })}
            style={{ width: "100%", marginTop: 4, padding: "7px 10px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff" }}
          >
            <option value="">Select a column…</option>
            {dateColumns.map(c => <option key={c.field} value={c.field}>{c.headerName || c.field}</option>)}
          </select>
        </div>
      )}

      {/* Quick presets */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quick Select</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
          {DATE_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => handlePreset(p)}
              style={{
                padding: "4px 10px", borderRadius: 20, border: "1.5px solid",
                borderColor: activePreset === p.label ? "#4f46e5" : "#e0e0e0",
                background: activePreset === p.label ? "#ede9fe" : "#fff",
                color: activePreset === p.label ? "#4f46e5" : "#555",
                fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      {/* Custom range */}
      <label style={{ fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>Custom Range</label>
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: "#999" }}>From</label>
          <input
            type="date"
            value={fmtDate(dateFilter.from)}
            onChange={(e) => { setActivePreset(null); onChange({ ...dateFilter, from: parseDate(e.target.value) }); }}
            style={{ width: "100%", marginTop: 2, padding: "7px 8px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: "#999" }}>To</label>
          <input
            type="date"
            value={fmtDate(dateFilter.to)}
            onChange={(e) => { setActivePreset(null); onChange({ ...dateFilter, to: endOfDay(parseDate(e.target.value)) }); }}
            style={{ width: "100%", marginTop: 2, padding: "7px 8px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
        </div>
      </div>

      <button
        onClick={() => { setActivePreset(null); onChange({ column: dateFilter.column, from: null, to: null }); }}
        style={{
          marginTop: 14, width: "100%", padding: "8px", background: "#f5f5f5",
          border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13,
          fontWeight: 600, color: "#666",
        }}
      >
        Clear Date Filter
      </button>
    </Popover>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AppTable({
  rows,
  columns,
  loading = false,
  rowCount,
  onPageChange,
  onPageSizeChange,
  searchValue = "",
  onSearchChange,
  actions,
  defaultPageSize = 10,
  setWarn,
  addPath,
  // NEW: pass field names of date columns for auto-detection override
  dateColumnFields,
}) {
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRow, setCurrentRow] = useState(null);

  // Advanced search state
  const [globalSearch, setGlobalSearch] = useState(searchValue);
  const [columnFilters, setColumnFilters] = useState({});
  const [dateFilter, setDateFilter] = useState({ column: "", from: null, to: null });

  // Popover anchors
  const [colFilterAnchor, setColFilterAnchor] = useState(null);
  const [dateFilterAnchor, setDateFilterAnchor] = useState(null);

  // Detect date columns automatically (or use provided list)
  const dateColumns = useMemo(() => {
    if (dateColumnFields) return columns.filter(c => dateColumnFields.includes(c.field));
    // Auto-detect: field name contains "date", "time", "at", "on", "created", "updated"
    const dateKeywords = /date|time|_at|_on|created|updated|timestamp/i;
    const detected = columns.filter(c => dateKeywords.test(c.field));
    // Also sniff first non-empty row value
    if (detected.length === 0 && rows.length > 0) {
      return columns.filter(c => {
        const val = rows[0][c.field];
        return val && !isNaN(Date.parse(val)) && isNaN(Number(val));
      });
    }
    return detected;
  }, [columns, dateColumnFields, rows]);

  // Auto-select first date column
  useEffect(() => {
    if (dateColumns.length === 1 && !dateFilter.column) {
      setDateFilter(f => ({ ...f, column: dateColumns[0].field }));
    }
  }, [dateColumns]);

  // Sync external searchValue
  useEffect(() => { setGlobalSearch(searchValue); }, [searchValue]);

  // Count active filters
  const activeColFilters = Object.values(columnFilters).filter(Boolean).length;
  const activeDateFilter = dateFilter.from || dateFilter.to ? 1 : 0;
  const totalActive = activeColFilters + activeDateFilter;

  // ── Row menu ──
  const handleClick = (event, row) => { setAnchorEl(event.currentTarget); setCurrentRow(row); };
  const handleClose = () => { setAnchorEl(null); setCurrentRow(null); };

  // ── Column filter handler ──
  const handleColumnFilter = (field, value) => {
    if (field === "__clear__") { setColumnFilters({}); return; }
    setColumnFilters(prev => ({ ...prev, [field]: value }));
  };

  // ── Build columns with actions ──
  const allColumns = [...columns];
  if (actions) {
    allColumns.push({
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      flex: 1,
      renderCell: (params) => (
        <IconButton onClick={(e) => handleClick(e, params.row)} size="small">
          <MoreVertIcon />
        </IconButton>
      ),
    });
  }

  // ── Filter logic ──
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // 1. Global search
      if (globalSearch) {
        const match = Object.values(row).some(val =>
          String(val).toLowerCase().includes(globalSearch.toLowerCase())
        );
        if (!match) return false;
      }

      // 2. Per-column filters
      for (const [field, val] of Object.entries(columnFilters)) {
        if (!val) continue;
        const cellVal = String(row[field] ?? "").toLowerCase();
        if (!cellVal.includes(val.toLowerCase())) return false;
      }

      // 3. Date range filter
      if ((dateFilter.from || dateFilter.to) && dateFilter.column) {
        const rawVal = row[dateFilter.column];
        if (!rawVal) return false;
        const cellDate = new Date(rawVal);
        if (isNaN(cellDate)) return false;
        if (dateFilter.from && cellDate < dateFilter.from) return false;
        if (dateFilter.to && cellDate > dateFilter.to) return false;
      }

      return true;
    });
  }, [rows, globalSearch, columnFilters, dateFilter]);

  // ── Active filter chips ──
  const renderChips = () => {
    const chips = [];
    if (globalSearch) chips.push(
      <Chip key="global" size="small" label={`Search: "${globalSearch}"`}
        onDelete={() => { setGlobalSearch(""); if (onSearchChange) onSearchChange(""); }}
        style={chipStyle} />
    );
    Object.entries(columnFilters).filter(([,v]) => v).forEach(([field, val]) => {
      const col = columns.find(c => c.field === field);
      chips.push(
        <Chip key={field} size="small"
          label={`${col?.headerName || field}: "${val}"`}
          onDelete={() => handleColumnFilter(field, "")}
          style={chipStyle} />
      );
    });
    if (activeDateFilter) {
      const col = columns.find(c => c.field === dateFilter.column);
      const fromStr = dateFilter.from ? dateFilter.from.toLocaleDateString() : "…";
      const toStr   = dateFilter.to   ? dateFilter.to.toLocaleDateString()   : "…";
      chips.push(
        <Chip key="date" size="small"
          label={`${col?.headerName || dateFilter.column}: ${fromStr} → ${toStr}`}
          onDelete={() => setDateFilter(f => ({ ...f, from: null, to: null }))}
          style={{ ...chipStyle, background: "#ede9fe", color: "#4f46e5", borderColor: "#c4b5fd" }} />
      );
    }
    return chips;
  };

  return (
    <div>
      {/* ── Toolbar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>

        {/* Add New button */}
        {addPath && (
          <button className="btn btn-primary" onClick={() => (window.location.href = addPath)}>
            Add New
          </button>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Global search */}
        <div style={{ position: "relative", width: 240 }}>
          <SearchIcon style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 18 }} />
          <input
            type="text"
            placeholder="Search all columns…"
            value={globalSearch}
            onChange={(e) => { setGlobalSearch(e.target.value); if (onSearchChange) onSearchChange(e.target.value); }}
            style={{
              width: "100%", padding: "8px 8px 8px 32px", boxSizing: "border-box",
              border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 13,
              outline: "none", transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "#4f46e5"}
            onBlur={e => e.target.style.borderColor = "#e0e0e0"}
          />
          {globalSearch && (
            <IconButton size="small" onClick={() => { setGlobalSearch(""); if (onSearchChange) onSearchChange(""); }}
              style={{ position: "absolute", right: 2, top: "50%", transform: "translateY(-50%)" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </div>

        {/* Column filter button */}
        <Tooltip title="Filter by column">
          <button
            onClick={(e) => setColFilterAnchor(e.currentTarget)}
            style={{
              ...toolbarBtn,
              borderColor: activeColFilters ? "#4f46e5" : "#e0e0e0",
              background: activeColFilters ? "#ede9fe" : "#fff",
              color: activeColFilters ? "#4f46e5" : "#555",
            }}
          >
            <TuneIcon style={{ fontSize: 16, marginRight: 4 }} />
            Filters
            {activeColFilters > 0 && (
              <span style={{ marginLeft: 4, background: "#4f46e5", color: "#fff", borderRadius: 10, padding: "0 6px", fontSize: 11 }}>
                {activeColFilters}
              </span>
            )}
          </button>
        </Tooltip>

        {/* Date filter button */}
        {dateColumns.length > 0 && (
          <Tooltip title="Filter by date">
            <button
              onClick={(e) => setDateFilterAnchor(e.currentTarget)}
              style={{
                ...toolbarBtn,
                borderColor: activeDateFilter ? "#4f46e5" : "#e0e0e0",
                background: activeDateFilter ? "#ede9fe" : "#fff",
                color: activeDateFilter ? "#4f46e5" : "#555",
              }}
            >
              <CalendarTodayIcon style={{ fontSize: 15, marginRight: 4 }} />
              Date
              {activeDateFilter > 0 && (
                <span style={{ marginLeft: 4, background: "#4f46e5", color: "#fff", borderRadius: 10, padding: "0 6px", fontSize: 11 }}>
                  1
                </span>
              )}
            </button>
          </Tooltip>
        )}

        {/* Clear all */}
        {totalActive > 0 && (
          <Tooltip title="Clear all filters">
            <IconButton size="small" onClick={() => { setGlobalSearch(""); setColumnFilters({}); setDateFilter(f => ({ ...f, from: null, to: null })); if (onSearchChange) onSearchChange(""); }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </div>

      {/* ── Active filter chips ── */}
      {totalActive > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {renderChips()}
        </div>
      )}

      {/* ── Results count ── */}
      <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>
        Showing <strong>{filteredRows.length}</strong> of <strong>{rows.length}</strong> records
        {totalActive > 0 && " (filtered)"}
      </div>

      {/* ── DataGrid ── */}
      <div style={{ height: 630, width: "100%" }}>
        <DataGrid
          rows={filteredRows}
          columns={allColumns}
          loading={loading}
          pagination
          paginationMode="server"
          pageSizeOptions={[10, 25, 50, 100]}
          paginationModel={{ page: page - 1, pageSize }}
          rowCount={rowCount}
          onPaginationModelChange={(model) => {
            setPage(model.page + 1);
            setPageSize(model.pageSize);
            if (onPageChange) onPageChange(model.page + 1);
            if (onPageSizeChange) onPageSizeChange(model.pageSize);
          }}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? "even-row" : "odd-row"
          }
          disableRowSelectionOnClick
        />
      </div>

      {/* ── 3-dot action menu ── */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}>
        {actions?.view && (
          <MenuItem onClick={() => { actions.view(currentRow); handleClose(); }}>
            <RemoveRedEyeIcon className="px-1" /> View
          </MenuItem>
        )}
        {actions?.edit && (
          <MenuItem onClick={() => { actions.edit(currentRow); handleClose(); }}>
            <EditIcon className="px-1" /> Edit
          </MenuItem>
        )}
        {actions?.delete && (
          <MenuItem onClick={() => { actions.delete(currentRow); setWarn(true); handleClose(); }}>
            <DeleteIcon className="px-1" /> Delete
          </MenuItem>
        )}
      </Menu>

      {/* ── Column Filter Popover ── */}
      <ColumnFilterPopover
        columns={columns}
        filters={columnFilters}
        onChange={handleColumnFilter}
        onClose={() => setColFilterAnchor(null)}
        anchorEl={colFilterAnchor}
      />

      {/* ── Date Filter Popover ── */}
      <DateFilterPopover
        dateColumns={dateColumns}
        dateFilter={dateFilter}
        onChange={setDateFilter}
        onClose={() => setDateFilterAnchor(null)}
        anchorEl={dateFilterAnchor}
      />
    </div>
  );
}

// ─── Shared styles ───────────────────────────────────────────────────────────
const toolbarBtn = {
  display: "inline-flex", alignItems: "center", padding: "7px 12px",
  border: "1.5px solid", borderRadius: 8, background: "#fff",
  cursor: "pointer", fontSize: 13, fontWeight: 600,
  transition: "all 0.15s", outline: "none",
};

const chipStyle = {
  background: "#f0f0f0", border: "1px solid #e0e0e0",
  fontSize: 12, height: 26,
};