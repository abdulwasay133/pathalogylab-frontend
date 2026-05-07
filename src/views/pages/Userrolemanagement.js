import api from "api/axios";
import ErrorDialoge from "components/dialogs/ErrorDialoge";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */
const MODULE_META = {
  test:       { label: "Tests",       icon: "🧪", color: "#5e72e4" },
  doctor:     { label: "Doctors",     icon: "👨‍⚕️", color: "#2dce89" },
  patient:    { label: "Patients",    icon: "🏥", color: "#11cdef" },
  commission: { label: "Commissions", icon: "💰", color: "#fb6340" },
  report:     { label: "Reports",     icon: "📄", color: "#f5365c" },
  settings:   { label: "Settings",    icon: "⚙️", color: "#8898aa" },
  user:       { label: "Users",       icon: "👤", color: "#825ee4" },
  role:       { label: "Roles",       icon: "🛡️", color: "#fbb140" },
};

const ROLE_STYLE = {
  admin:        { bg: "#fff0f3", color: "#f5365c", border: "#fcc"    },
  lab:          { bg: "#f0faf5", color: "#1aae6f", border: "#b7ebd9" },
  doctor:       { bg: "#f0f4ff", color: "#5e72e4", border: "#d0d8ff" },
  receptionist: { bg: "#fff8f0", color: "#fb6340", border: "#ffd4c0" },
};
const getRoleStyle = (name) =>
  ROLE_STYLE[name] || { bg: "#f8f9fe", color: "#525f7f", border: "#e0e6ed" };

/* ══════════════════════════════════════════════════════════
   SHARED STYLES
══════════════════════════════════════════════════════════ */
const iS = {
  borderRadius: 8, border: "1px solid #e0e6ed",
  padding: "10px 13px", fontSize: 14, color: "#32325d",
  background: "#fff", width: "100%", outline: "none",
  transition: "border .15s, box-shadow .15s", boxSizing: "border-box",
};
const iErr   = { border: "1px solid #f5365c" };
const iFocus = (e) => { e.target.style.border = "1px solid #5e72e4"; e.target.style.boxShadow = "0 0 0 3px rgba(94,114,228,.1)"; };
const iBlur  = (e) => { e.target.style.border = "1px solid #e0e6ed"; e.target.style.boxShadow = "none"; };

/* ══════════════════════════════════════════════════════════
   SMALL COMPONENTS
══════════════════════════════════════════════════════════ */
const RoleBadge = ({ name }) => {
  const s = getRoleStyle(name);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 999, fontSize: 11, fontWeight: 700, padding: "3px 10px" }}>
      🛡 {name}
    </span>
  );
};

const TabBtn = ({ icon, label, active, onClick, count }) => (
  <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500, background: active ? "linear-gradient(135deg,#5e72e4,#825ee4)" : "#f0f3ff", color: active ? "#fff" : "#525f7f", boxShadow: active ? "0 4px 12px rgba(94,114,228,.3)" : "none", transition: "all .15s" }}>
    <span>{icon}</span>{label}
    <span style={{ background: active ? "rgba(255,255,255,.25)" : "#e0e6ed", color: active ? "#fff" : "#525f7f", borderRadius: 999, fontSize: 10, fontWeight: 700, padding: "1px 7px" }}>{count}</span>
  </button>
);

const FieldLabel = ({ children, required }) => (
  <label style={{ fontSize: 12, fontWeight: 700, color: "#525f7f", marginBottom: 5, display: "block", letterSpacing: 0.2 }}>
    {children} {required && <span style={{ color: "#f5365c" }}>*</span>}
  </label>
);

const ModalOverlay = ({ children }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)", animation: "fadeIn .15s ease" }}>
    {children}
    <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
  </div>
);

const ModalBox = ({ children, width = 480 }) => (
  <div style={{ background: "#fff", borderRadius: 16, width: `min(${width}px,95vw)`, maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.2)", animation: "slideUp .2s ease" }}>
    {children}
  </div>
);

const ModalHeader = ({ gradient, icon, title, subtitle, onClose }) => (
  <div style={{ background: gradient, padding: "18px 24px", flexShrink: 0 }}>
    <div className="d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center" style={{ gap: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{title}</div>
          <div style={{ color: "rgba(255,255,255,.7)", fontSize: 12 }}>{subtitle}</div>
        </div>
      </div>
      <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
    </div>
  </div>
);

const ModalFooter = ({ onCancel, onSave, saving, saveLabel = "💾 Save" }) => (
  <div style={{ padding: "14px 24px", borderTop: "1px solid #f0f0f0", display: "flex", gap: 10, flexShrink: 0 }}>
    <button onClick={onCancel} style={{ flex: 1, borderRadius: 8, border: "1px solid #e0e6ed", background: "#f8f9fe", color: "#525f7f", fontWeight: 600, fontSize: 14, padding: "10px 0", cursor: "pointer" }}>Cancel</button>
    <button onClick={onSave} disabled={saving} style={{ flex: 1, borderRadius: 8, border: "none", background: saving ? "#e0e6ed" : "linear-gradient(135deg,#5e72e4,#825ee4)", color: saving ? "#adb5bd" : "#fff", fontWeight: 600, fontSize: 14, padding: "10px 0", cursor: saving ? "not-allowed" : "pointer", boxShadow: saving ? "none" : "0 4px 12px rgba(94,114,228,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
      {saving ? <><span className="spinner-border spinner-border-sm" />Saving…</> : saveLabel}
    </button>
  </div>
);

/* ══════════════════════════════════════════════════════════
   USER MODAL
══════════════════════════════════════════════════════════ */
function UserModal({ editUser, roles, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const isEdit = !!editUser;

  const { register, handleSubmit, formState: { errors } } = useForm({
    mode: "onChange",
    defaultValues: editUser
      ? { name: editUser.name, email: editUser.email, role: editUser.roles?.[0] || "", password: "" }
      : { name: "", email: "", role: "", password: "" },
  });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/users/${editUser.id}`, data);
        toast.success("User updated successfully.");
      } else {
        await api.post("/users", data);
        toast.success("User created successfully.");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save user.");
    }
    setSaving(false);
  };

  return (
    <ModalOverlay>
      <ModalBox width={480}>
        <ModalHeader
          gradient={isEdit ? "linear-gradient(135deg,#fb6340,#fbb140)" : "linear-gradient(135deg,#2dce89,#2dcecc)"}
          icon={isEdit ? "✏️" : "👤"}
          title={isEdit ? "Edit User" : "Add New User"}
          subtitle={isEdit ? `Editing ${editUser.name}` : "Fill details and assign a role"}
          onClose={onClose}
        />

        <div style={{ overflowY: "auto", padding: "20px 24px" }}>
          <form id="userForm" onSubmit={handleSubmit(onSubmit)}>
            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <FieldLabel required>Full Name</FieldLabel>
              <input style={errors.name ? { ...iS, ...iErr } : iS} placeholder="e.g. Dr. John Doe" onFocus={iFocus} onBlur={iBlur}
                {...register("name", { required: "Name is required", minLength: { value: 3, message: "Min 3 characters" } })} />
              {errors.name && <small style={{ color: "#f5365c", fontSize: 11, marginTop: 3, display: "block" }}>⚠ {errors.name.message}</small>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <FieldLabel required>Email Address</FieldLabel>
              <input type="email" style={errors.email ? { ...iS, ...iErr } : iS} placeholder="user@lims.com" onFocus={iFocus} onBlur={iBlur}
                {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" } })} />
              {errors.email && <small style={{ color: "#f5365c", fontSize: 11, marginTop: 3, display: "block" }}>⚠ {errors.email.message}</small>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 14 }}>
              <FieldLabel required={!isEdit}>Password {isEdit && <span style={{ color: "#8898aa", fontWeight: 400 }}>(leave blank to keep current)</span>}</FieldLabel>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} style={errors.password ? { ...iS, ...iErr, paddingRight: 40 } : { ...iS, paddingRight: 40 }} placeholder={isEdit ? "••••••••" : "Min. 8 characters"} onFocus={iFocus} onBlur={iBlur}
                  {...register("password", { ...(!isEdit && { required: "Password is required" }), minLength: { value: 8, message: "Minimum 8 characters" } })} />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "#8898aa" }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <small style={{ color: "#f5365c", fontSize: 11, marginTop: 3, display: "block" }}>⚠ {errors.password.message}</small>}
            </div>

            {/* Role */}
            <div style={{ marginBottom: 6 }}>
              <FieldLabel required>Assign Role</FieldLabel>
              <select style={errors.role ? { ...iS, ...iErr } : iS}
                {...register("role", { required: "Please select a role" })}>
                <option value="">— Select a role —</option>
                {roles.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
              {errors.role && <small style={{ color: "#f5365c", fontSize: 11, marginTop: 3, display: "block" }}>⚠ {errors.role.message}</small>}
            </div>
          </form>
        </div>

        <ModalFooter
          onCancel={onClose}
          onSave={handleSubmit(onSubmit)}
          saving={saving}
          saveLabel={isEdit ? "💾 Update User" : "✅ Create User"}
        />
      </ModalBox>
    </ModalOverlay>
  );
}

/* ══════════════════════════════════════════════════════════
   ROLE MODAL
══════════════════════════════════════════════════════════ */
function RoleModal({ editRole, allPermissions, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [roleName, setRoleName] = useState(editRole?.name || "");
  const [selected, setSelected] = useState(editRole?.permissions || []);
  const isEdit = !!editRole;

  const togglePerm = (perm) =>
    setSelected(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);

  const toggleModule = (modulePerms) => {
    const allSelected = modulePerms.every(p => selected.includes(p));
    setSelected(prev => allSelected ? prev.filter(p => !modulePerms.includes(p)) : [...new Set([...prev, ...modulePerms])]);
  };

  const save = async () => {
    if (!roleName.trim()) { toast.warning("Role name is required."); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/roles/${editRole.id}`, { name: roleName, permissions: selected });
        toast.success("Role updated successfully.");
      } else {
        await api.post("/roles", { name: roleName, permissions: selected });
        toast.success("Role created successfully.");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save role.");
    }
    setSaving(false);
  };

  return (
    <ModalOverlay>
      <ModalBox width={660}>
        <ModalHeader
          gradient="linear-gradient(135deg,#5e72e4,#825ee4)"
          icon="🛡️"
          title={isEdit ? "Edit Role" : "Create New Role"}
          subtitle="Set role name and assign permissions"
          onClose={onClose}
        />

        <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
          {/* Role Name */}
          <div style={{ marginBottom: 20 }}>
            <FieldLabel required>Role Name</FieldLabel>
            <input
              value={roleName}
              onChange={e => setRoleName(e.target.value)}
              placeholder="e.g. receptionist"
              style={iS} onFocus={iFocus} onBlur={iBlur}
            />
          </div>

          {/* Permissions */}
          <div className="d-flex align-items-center mb-3" style={{ gap: 8 }}>
            <span style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#5e72e4,#825ee4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🔑</span>
            <h6 className="mb-0 text-muted" style={{ letterSpacing: 1, fontSize: 11, textTransform: "uppercase" }}>Permissions</h6>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#8898aa" }}>{selected.length} selected</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(allPermissions).map(([module, perms]) => {
              const cfg = MODULE_META[module] || { label: module, icon: "🔧", color: "#8898aa" };
              const modulePerms = Array.isArray(perms) ? perms : Object.values(perms);
              const allSel  = modulePerms.every(p => selected.includes(p));
              const someSel = modulePerms.some(p => selected.includes(p));

              return (
                <div key={module} style={{ border: "1px solid #e9ecf3", borderRadius: 10, overflow: "hidden" }}>
                  {/* module header */}
                  <div onClick={() => toggleModule(modulePerms)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer", background: allSel ? `${cfg.color}10` : someSel ? "#fafbff" : "#f8f9fe", borderBottom: "1px solid #e9ecf3", userSelect: "none" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: `${cfg.color}15`, border: `1px solid ${cfg.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{cfg.icon}</div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#32325d", flex: 1 }}>{cfg.label}</span>
                    <span style={{ fontSize: 11, color: "#8898aa" }}>{modulePerms.filter(p => selected.includes(p)).length}/{modulePerms.length}</span>
                    {/* module checkbox */}
                    <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${allSel ? cfg.color : "#cbd3da"}`, background: allSel ? cfg.color : someSel ? `${cfg.color}30` : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {allSel && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>}
                      {someSel && !allSel && <div style={{ width: 8, height: 2, background: cfg.color, borderRadius: 1 }} />}
                    </div>
                  </div>

                  {/* permission pills */}
                  <div style={{ padding: "10px 14px", display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {modulePerms.map(perm => {
                      const checked = selected.includes(perm);
                      const action  = perm.split(".")[1];
                      return (
                        <label key={perm} onClick={() => togglePerm(perm)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, cursor: "pointer", border: `1px solid ${checked ? cfg.color : "#e0e6ed"}`, background: checked ? `${cfg.color}12` : "#fff", fontSize: 12, fontWeight: checked ? 700 : 500, color: checked ? cfg.color : "#525f7f", transition: "all .12s", userSelect: "none" }}>
                          <div style={{ width: 14, height: 14, borderRadius: 4, border: `2px solid ${checked ? cfg.color : "#cbd3da"}`, background: checked ? cfg.color : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {checked && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                          </div>
                          {action}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <ModalFooter onCancel={onClose} onSave={save} saving={saving} saveLabel={isEdit ? "💾 Update Role" : "✅ Create Role"} />
      </ModalBox>
    </ModalOverlay>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function UserRoleManagement() {
  const [tab,          setTab]          = useState("users");
  const [users,        setUsers]        = useState([]);
  const [roles,        setRoles]        = useState([]);
  const [permissions,  setPermissions]  = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState("");

  /* modals */
  const [userModal,  setUserModal]  = useState(false);
  const [roleModal,  setRoleModal]  = useState(false);
  const [editUser,   setEditUser]   = useState(null);
  const [editRole,   setEditRole]   = useState(null);
  const [warnOpen,   setWarnOpen]   = useState(false);
  const [delTarget,  setDelTarget]  = useState(null);

  /* ── fetch ── */
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get("/users", { params: { search, role: roleFilter } });
      setUsers(res.data);
    } catch { toast.error("Failed to load users."); }
    setLoadingUsers(false);
  };

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([api.get("/roles"), api.get("/permissions")]);
      setRoles(rolesRes.data);
      setPermissions(permsRes.data);
    } catch { toast.error("Failed to load roles."); }
    setLoadingRoles(false);
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);
  useEffect(() => { fetchRoles(); }, []);

  /* ── delete ── */
  const confirmDelete = async () => {
    try {
      if (delTarget.type === "user") {
        await api.delete(`/users/${delTarget.id}`);
        toast.success("User deleted."); fetchUsers();
      } else {
        await api.delete(`/roles/${delTarget.id}`);
        toast.success("Role deleted."); fetchRoles();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete.");
    }
    setWarnOpen(false);
  };

  /* ── helpers ── */
  const openAddUser  = () => { setEditUser(null);  setUserModal(true); };
  const openEditUser = (u) => { setEditUser(u);    setUserModal(true); };
  const openAddRole  = () => { setEditRole(null);  setRoleModal(true); };
  const openEditRole = (r) => { setEditRole(r);    setRoleModal(true); };

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8" />

      <Container className="mt--9" fluid>

        {/* ── Page title card ── */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow border-0" style={{ borderRadius: 16 }}>
              <CardBody style={{ padding: "1.25rem 1.5rem" }}>
                <div className="d-flex align-items-center justify-content-between flex-wrap" style={{ gap: 14 }}>
                  <div className="d-flex align-items-center" style={{ gap: 12 }}>
                    <span style={{ width: 48, height: 48, borderRadius: 13, background: "linear-gradient(135deg,#5e72e4,#825ee4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 14px rgba(94,114,228,.35)", flexShrink: 0 }}>🛡️</span>
                    <div>
                      <h3 className="mb-0" style={{ fontWeight: 800, color: "#32325d" }}>Users & Roles</h3>
                      <p className="mb-0" style={{ fontSize: 12, color: "#8898aa" }}>Manage system access, users and role permissions</p>
                    </div>
                  </div>
                  <div className="d-flex" style={{ gap: 8 }}>
                    <TabBtn icon="👤" label="Users" active={tab === "users"} count={users.length}  onClick={() => setTab("users")} />
                    <TabBtn icon="🛡️" label="Roles" active={tab === "roles"} count={roles.length}  onClick={() => setTab("roles")} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ══════════ USERS TAB ══════════ */}
        {tab === "users" && (
          <Row>
            <Col>
              <Card className="shadow border-0" style={{ borderRadius: 16, overflow: "hidden" }}>
                <CardHeader className="bg-white border-0" style={{ padding: "1.1rem 1.5rem", borderBottom: "1px solid #f0f0f0" }}>
                  <div className="d-flex align-items-center justify-content-between flex-wrap" style={{ gap: 12 }}>
                    <div className="d-flex align-items-center" style={{ gap: 8 }}>
                      <span style={{ fontWeight: 700, color: "#32325d", fontSize: 15 }}>All Users</span>
                      <span style={{ background: "#f0f4ff", color: "#5e72e4", border: "1px solid #d0d8ff", borderRadius: 999, fontSize: 11, fontWeight: 700, padding: "2px 9px" }}>{users.length}</span>
                    </div>

                    <div className="d-flex align-items-center flex-wrap" style={{ gap: 8 }}>
                      {/* search */}
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#adb5bd", fontSize: 13, pointerEvents: "none" }}>🔍</span>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
                          style={{ ...iS, paddingLeft: 30, width: 200, padding: "7px 12px 7px 28px" }} onFocus={iFocus} onBlur={iBlur} />
                      </div>

                      {/* role filter */}
                      <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                        style={{ ...iS, width: 150, padding: "7px 12px" }}>
                        <option value="">All Roles</option>
                        {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                      </select>

                      {/* add user */}
                      <button onClick={openAddUser} style={{ borderRadius: 8, border: "none", fontWeight: 600, fontSize: 13, padding: "8px 18px", cursor: "pointer", background: "linear-gradient(135deg,#2dce89,#2dcecc)", color: "#fff", boxShadow: "0 4px 12px rgba(45,206,137,.3)", whiteSpace: "nowrap" }}>
                        + Add User
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardBody style={{ padding: 0 }}>
                  {loadingUsers ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" />
                    </div>
                  ) : users.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "48px 0", color: "#adb5bd" }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>👤</div>
                      <div style={{ fontWeight: 600 }}>No users found</div>
                      {search && <div style={{ fontSize: 12, marginTop: 4 }}>Try a different search term</div>}
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                        <thead>
                          <tr style={{ background: "#f8f9fe" }}>
                            {["#", "User", "Email", "Role", "Joined", "Actions"].map(h => (
                              <th key={h} style={{ padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "#8898aa", textAlign: "left", textTransform: "uppercase", letterSpacing: .5, borderBottom: "2px solid #e9ecef", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u, idx) => (
                            <tr key={u.id} style={{ borderBottom: "1px solid #f5f5f5", background: idx % 2 === 0 ? "#fff" : "#fafbff", transition: "background .1s" }}
                              onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"}
                              onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafbff"}>
                              <td style={{ padding: "12px 16px", fontSize: 13, color: "#adb5bd", fontWeight: 600 }}>{idx + 1}</td>
                              <td style={{ padding: "12px 16px" }}>
                                <div className="d-flex align-items-center" style={{ gap: 10 }}>
                                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#5e72e4,#825ee4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                                    {u.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span style={{ fontWeight: 600, fontSize: 14, color: "#32325d" }}>{u.name}</span>
                                </div>
                              </td>
                              <td style={{ padding: "12px 16px", fontSize: 13, color: "#525f7f" }}>{u.email}</td>
                              <td style={{ padding: "12px 16px" }}>
                                <div className="d-flex flex-wrap" style={{ gap: 4 }}>
                                  {(u.roles || []).map(r => <RoleBadge key={r} name={r} />)}
                                  {(!u.roles || u.roles.length === 0) && <span style={{ fontSize: 11, color: "#adb5bd" }}>No role</span>}
                                </div>
                              </td>
                              <td style={{ padding: "12px 16px", fontSize: 12, color: "#8898aa" }}>{u.created_at || "—"}</td>
                              <td style={{ padding: "12px 16px" }}>
                                <div className="d-flex" style={{ gap: 6 }}>
                                  <button onClick={() => openEditUser(u)} style={{ borderRadius: 7, border: "1px solid #e0e6ed", background: "#f8f9fe", color: "#525f7f", padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✏️ Edit</button>
                                  <button onClick={() => { setDelTarget({ type: "user", id: u.id }); setWarnOpen(true); }} style={{ borderRadius: 7, border: "1px solid #fcc", background: "#fff0f3", color: "#f5365c", padding: "5px 10px", cursor: "pointer", fontSize: 12 }}>🗑</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

        {/* ══════════ ROLES TAB ══════════ */}
        {tab === "roles" && (
          <Row>
            <Col>
              <Card className="shadow border-0" style={{ borderRadius: 16, overflow: "hidden" }}>
                <CardHeader className="bg-white border-0" style={{ padding: "1.1rem 1.5rem", borderBottom: "1px solid #f0f0f0" }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center" style={{ gap: 8 }}>
                      <span style={{ fontWeight: 700, color: "#32325d", fontSize: 15 }}>All Roles</span>
                      <span style={{ background: "#f0f4ff", color: "#5e72e4", border: "1px solid #d0d8ff", borderRadius: 999, fontSize: 11, fontWeight: 700, padding: "2px 9px" }}>{roles.length}</span>
                    </div>
                    <button onClick={openAddRole} style={{ borderRadius: 8, border: "none", fontWeight: 600, fontSize: 13, padding: "8px 18px", cursor: "pointer", background: "linear-gradient(135deg,#5e72e4,#825ee4)", color: "#fff", boxShadow: "0 4px 12px rgba(94,114,228,.3)" }}>
                      + Add Role
                    </button>
                  </div>
                </CardHeader>

                <CardBody style={{ padding: "1.5rem" }}>
                  {loadingRoles ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" />
                    </div>
                  ) : (
                    <Row>
                      {roles.map(role => {
                        const rs = getRoleStyle(role.name);
                        return (
                          <Col xl="4" lg="6" className="mb-4" key={role.id}>
                            <div style={{ borderRadius: 14, border: `1px solid ${rs.border}`, background: "#fff", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.05)", transition: "box-shadow .15s, transform .15s" }}
                              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.05)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                              {/* top accent */}
                              <div style={{ height: 4, background: `linear-gradient(90deg,${rs.color},${rs.color}66)` }} />
                              <div style={{ padding: "14px 16px" }}>
                                {/* role header */}
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                  <div className="d-flex align-items-center" style={{ gap: 10 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: rs.bg, border: `1px solid ${rs.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🛡️</div>
                                    <div>
                                      <div style={{ fontWeight: 700, color: "#32325d", fontSize: 14, textTransform: "capitalize" }}>{role.name}</div>
                                      <div style={{ fontSize: 11, color: "#8898aa" }}>{role.users_count} user{role.users_count !== 1 ? "s" : ""} · {(role.permissions || []).length} permissions</div>
                                    </div>
                                  </div>
                                  <div className="d-flex" style={{ gap: 6 }}>
                                    <button onClick={() => openEditRole(role)} style={{ borderRadius: 7, border: "1px solid #e0e6ed", background: "#f8f9fe", color: "#525f7f", padding: "5px 10px", cursor: "pointer", fontSize: 12 }}>✏️</button>
                                    {role.name !== "admin" && (
                                      <button onClick={() => { setDelTarget({ type: "role", id: role.id }); setWarnOpen(true); }} style={{ borderRadius: 7, border: "1px solid #fcc", background: "#fff0f3", color: "#f5365c", padding: "5px 8px", cursor: "pointer", fontSize: 12 }}>🗑</button>
                                    )}
                                  </div>
                                </div>

                                {/* permission pills */}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                  {(role.permissions || []).slice(0, 9).map(perm => {
                                    const mod = perm.split(".")[0];
                                    const cfg = MODULE_META[mod] || { color: "#8898aa" };
                                    return (
                                      <span key={perm} style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}28`, borderRadius: 6, fontSize: 10, fontWeight: 600, padding: "2px 7px" }}>
                                        {perm}
                                      </span>
                                    );
                                  })}
                                  {(role.permissions || []).length > 9 && (
                                    <span style={{ background: "#f8f9fe", color: "#8898aa", border: "1px solid #e0e6ed", borderRadius: 6, fontSize: 10, padding: "2px 7px" }}>
                                      +{role.permissions.length - 9} more
                                    </span>
                                  )}
                                  {(!role.permissions || role.permissions.length === 0) && (
                                    <span style={{ color: "#adb5bd", fontSize: 12 }}>No permissions assigned</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

      </Container>

      {/* ── Modals ── */}
      {userModal && (
        <UserModal
          editUser={editUser}
          roles={roles}
          onClose={() => setUserModal(false)}
          onSaved={fetchUsers}
        />
      )}

      {roleModal && (
        <RoleModal
          editRole={editRole}
          allPermissions={permissions}
          onClose={() => setRoleModal(false)}
          onSaved={fetchRoles}
        />
      )}

      <ErrorDialoge
        open={warnOpen}
        handleClose={() => setWarnOpen(false)}
        handleDelete={confirmDelete}
      />
    </>
  );
}