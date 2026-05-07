import api from "api/axios";
import ErrorDialoge from "components/dialogs/ErrorDialoge";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";

/* ── permission module config ── */
const MODULES = {
  test:       { label: "Tests",       icon: "🧪", color: "#5e72e4" },
  doctor:     { label: "Doctors",     icon: "👨‍⚕️", color: "#2dce89" },
  patient:    { label: "Patients",    icon: "🏥", color: "#11cdef" },
  commission: { label: "Commissions", icon: "💰", color: "#fb6340" },
  report:     { label: "Reports",     icon: "📄", color: "#f5365c" },
  settings:   { label: "Settings",    icon: "⚙️", color: "#8898aa" },
  user:       { label: "Users",       icon: "👤", color: "#825ee4" },
  role:       { label: "Roles",       icon: "🛡️", color: "#fbb140" },
};

const ROLE_COLORS = {
  admin:         { bg: "#fff0f3", color: "#f5365c", border: "#fcc" },
  lab:           { bg: "#f0faf5", color: "#1aae6f", border: "#b7ebd9" },
  doctor:        { bg: "#f0f4ff", color: "#5e72e4", border: "#d0d8ff" },
  receptionist:  { bg: "#fff8f0", color: "#fb6340", border: "#ffd4c0" },
};
const getRoleStyle = (name) =>
  ROLE_COLORS[name] || { bg: "#f8f9fe", color: "#525f7f", border: "#e0e6ed" };

/* ── small reusable badge ── */
const RoleBadge = ({ name }) => {
  const s = getRoleStyle(name);
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 999, fontSize: 11, fontWeight: 700,
      padding: "3px 10px", display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      🛡 {name}
    </span>
  );
};

/* ── tab button ── */
const Tab = ({ label, icon, active, onClick, count }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: 7,
      padding: "9px 18px", borderRadius: 9, border: "none",
      cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500,
      background: active ? "linear-gradient(135deg,#5e72e4,#825ee4)" : "#f8f9fe",
      color: active ? "#fff" : "#525f7f",
      boxShadow: active ? "0 4px 12px rgba(94,114,228,.3)" : "none",
      transition: "all .15s",
    }}
  >
    <span>{icon}</span>
    {label}
    {count !== undefined && (
      <span style={{
        background: active ? "rgba(255,255,255,.25)" : "#e9ecef",
        color: active ? "#fff" : "#525f7f",
        borderRadius: 999, fontSize: 10, fontWeight: 700,
        padding: "1px 7px",
      }}>{count}</span>
    )}
  </button>
);

/* ── section heading ── */
const SectionHeading = ({ icon, title }) => (
  <div className="d-flex align-items-center mb-3" style={{ gap: 8 }}>
    <span style={{
      width: 28, height: 28, borderRadius: 7,
      background: "linear-gradient(135deg,#5e72e4,#825ee4)",
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
    }}>{icon}</span>
    <h6 className="mb-0 text-muted" style={{ letterSpacing: 1, fontSize: 11, textTransform: "uppercase" }}>
      {title}
    </h6>
  </div>
);

/* ── input style ── */
const iS = {
  borderRadius: 8, border: "1px solid #e0e6ed", padding: "9px 13px",
  fontSize: 14, color: "#32325d", background: "#fff", width: "100%",
  outline: "none", transition: "border .15s, box-shadow .15s", boxSizing: "border-box",
};
const onFocus = (e) => { e.target.style.border = "1px solid #5e72e4"; e.target.style.boxShadow = "0 0 0 3px rgba(94,114,228,.1)"; };
const onBlur  = (e) => { e.target.style.border = "1px solid #e0e6ed"; e.target.style.boxShadow = "none"; };

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function RoleManagement() {
  const [activeTab, setActiveTab]       = useState("roles");

  /* roles */
  const [roles,       setRoles]         = useState([]);
  const [permissions, setPermissions]   = useState({});
  const [loadingRoles, setLoadingRoles] = useState(false);

  /* users */
  const [users,       setUsers]         = useState([]);
  const [loadingUsers,setLoadingUsers]  = useState(false);

  /* role form modal */
  const [roleModal,   setRoleModal]     = useState(false);
  const [editRole,    setEditRole]      = useState(null);  // null = add
  const [roleName,    setRoleName]      = useState("");
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [savingRole,  setSavingRole]    = useState(false);

  /* user form modal */
  const [userModal,   setUserModal]     = useState(false);
  const [editUser,    setEditUser]      = useState(null);
  const [userForm,    setUserForm]      = useState({ name:"", email:"", password:"", role:"" });
  const [savingUser,  setSavingUser]    = useState(false);

  /* delete */
  const [warnOpen,    setWarnOpen]      = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);  // { type:'role'|'user', id }

  /* ── fetch ── */
  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get("/roles"),
        api.get("/permissions"),
      ]);
      setRoles(rolesRes.data);
      setPermissions(permsRes.data);
    } catch { toast.error("Failed to load roles."); }
    setLoadingRoles(false);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch { toast.error("Failed to load users."); }
    setLoadingUsers(false);
  };

  useEffect(() => { fetchRoles(); fetchUsers(); }, []);

  /* ── role modal helpers ── */
  const openAddRole = () => {
    setEditRole(null); setRoleName(""); setSelectedPerms([]);
    setRoleModal(true);
  };
  const openEditRole = (role) => {
    setEditRole(role); setRoleName(role.name);
    setSelectedPerms(role.permissions || []);
    setRoleModal(true);
  };
  const togglePerm = (perm) =>
    setSelectedPerms(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  const toggleModule = (modulePerms) => {
    const allSelected = modulePerms.every(p => selectedPerms.includes(p));
    setSelectedPerms(prev =>
      allSelected
        ? prev.filter(p => !modulePerms.includes(p))
        : [...new Set([...prev, ...modulePerms])]
    );
  };

  const saveRole = async () => {
    if (!roleName.trim()) { toast.warning("Role name is required."); return; }
    setSavingRole(true);
    try {
      if (editRole) {
        await api.put(`/roles/${editRole.id}`, { name: roleName, permissions: selectedPerms });
        toast.success("Role updated successfully.");
      } else {
        await api.post("/roles", { name: roleName, permissions: selectedPerms });
        toast.success("Role created successfully.");
      }
      setRoleModal(false);
      fetchRoles();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save role.");
    }
    setSavingRole(false);
  };

  /* ── user modal helpers ── */
  const openAddUser = () => {
    setEditUser(null);
    setUserForm({ name:"", email:"", password:"", role:"" });
    setUserModal(true);
  };
  const openEditUser = (user) => {
    setEditUser(user);
    setUserForm({ name: user.name, email: user.email, password:"", role: user.roles?.[0] || "" });
    setUserModal(true);
  };

  const saveUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.role) {
      toast.warning("Name, email and role are required."); return;
    }
    if (!editUser && !userForm.password) {
      toast.warning("Password is required for new users."); return;
    }
    setSavingUser(true);
    try {
      if (editUser) {
        await api.put(`/users/${editUser.id}`, userForm);
        toast.success("User updated successfully.");
      } else {
        await api.post("/users", userForm);
        toast.success("User created successfully.");
      }
      setUserModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save user.");
    }
    setSavingUser(false);
  };

  /* ── delete ── */
  const confirmDelete = async () => {
    try {
      if (deleteTarget.type === "role") {
        await api.delete(`/roles/${deleteTarget.id}`);
        toast.success("Role deleted.");
        fetchRoles();
      } else {
        await api.delete(`/users/${deleteTarget.id}`);
        toast.success("User deleted.");
        fetchUsers();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete.");
    }
    setWarnOpen(false);
  };

  /* ── render ── */
  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8" />

      <Container className="mt--9" fluid>

        {/* ── Page header ── */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow border-0" style={{ borderRadius: 16 }}>
              <CardBody style={{ padding: "1.25rem 1.5rem" }}>
                <div className="d-flex align-items-center justify-content-between flex-wrap" style={{ gap: 12 }}>
                  <div className="d-flex align-items-center" style={{ gap: 12 }}>
                    <span style={{
                      width: 46, height: 46, borderRadius: 12,
                      background: "linear-gradient(135deg,#5e72e4,#825ee4)",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 22,
                      boxShadow: "0 4px 12px rgba(94,114,228,.3)",
                    }}>🛡️</span>
                    <div>
                      <h3 className="mb-0" style={{ fontWeight: 700, color: "#32325d" }}>
                        Roles & Permissions
                      </h3>
                      <p className="mb-0" style={{ fontSize: 12, color: "#8898aa" }}>
                        Manage access control for your LIMS
                      </p>
                    </div>
                  </div>

                  {/* tabs */}
                  <div className="d-flex" style={{ gap: 8 }}>
                    <Tab icon="🛡️" label="Roles"       active={activeTab==="roles"} count={roles.length}  onClick={()=>setActiveTab("roles")} />
                    <Tab icon="👤" label="Users"       active={activeTab==="users"} count={users.length}  onClick={()=>setActiveTab("users")} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ══════════ ROLES TAB ══════════ */}
        {activeTab === "roles" && (
          <Row>
            <Col>
              <Card className="shadow border-0" style={{ borderRadius: 16, overflow: "hidden" }}>
                <CardHeader className="bg-white border-0" style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f0f0f0" }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center" style={{ gap: 8 }}>
                      <span style={{ fontWeight: 700, color: "#32325d", fontSize: 15 }}>All Roles</span>
                      <span style={{ background:"#f0f4ff",color:"#5e72e4",border:"1px solid #d0d8ff",borderRadius:999,fontSize:11,fontWeight:700,padding:"2px 9px" }}>
                        {roles.length}
                      </span>
                    </div>
                    <button
                      onClick={openAddRole}
                      style={{
                        borderRadius: 8, border: "none", fontWeight: 600,
                        fontSize: 13, padding: "8px 18px", cursor: "pointer",
                        background: "linear-gradient(135deg,#5e72e4,#825ee4)",
                        color: "#fff", boxShadow: "0 4px 12px rgba(94,114,228,.3)",
                      }}
                    >
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
                      {roles.map((role) => {
                        const rs = getRoleStyle(role.name);
                        return (
                          <Col xl="4" lg="6" className="mb-4" key={role.id}>
                            <div style={{
                              borderRadius: 14, border: `1px solid ${rs.border}`,
                              background: "#fff", overflow: "hidden",
                              boxShadow: "0 2px 12px rgba(0,0,0,.05)",
                              transition: "box-shadow .15s",
                            }}
                              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.1)"}
                              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.05)"}
                            >
                              {/* card top accent */}
                              <div style={{ height: 4, background: `linear-gradient(90deg,${rs.color},${rs.color}88)` }} />

                              <div style={{ padding: "14px 16px" }}>
                                {/* role name + actions */}
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                  <div className="d-flex align-items-center" style={{ gap: 8 }}>
                                    <div style={{
                                      width: 34, height: 34, borderRadius: 9,
                                      background: rs.bg, border: `1px solid ${rs.border}`,
                                      display: "flex", alignItems: "center",
                                      justifyContent: "center", fontSize: 16,
                                    }}>🛡️</div>
                                    <div>
                                      <div style={{ fontWeight: 700, color: "#32325d", fontSize: 14, textTransform: "capitalize" }}>
                                        {role.name}
                                      </div>
                                      <div style={{ fontSize: 11, color: "#8898aa" }}>
                                        {role.users_count} user{role.users_count !== 1 ? "s" : ""}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="d-flex" style={{ gap: 6 }}>
                                    <button
                                      onClick={() => openEditRole(role)}
                                      style={{ borderRadius: 7, border: "1px solid #e0e6ed", background: "#f8f9fe", color: "#525f7f", padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                                    >✏️</button>
                                    {role.name !== "admin" && (
                                      <button
                                        onClick={() => { setDeleteTarget({ type:"role", id:role.id }); setWarnOpen(true); }}
                                        style={{ borderRadius: 7, border: "1px solid #fcc", background: "#fff0f3", color: "#f5365c", padding: "5px 10px", cursor: "pointer", fontSize: 12 }}
                                      >🗑</button>
                                    )}
                                  </div>
                                </div>

                                {/* permissions */}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                  {(role.permissions || []).slice(0, 8).map((perm) => {
                                    const mod = perm.split(".")[0];
                                    const cfg = MODULES[mod] || { color: "#8898aa" };
                                    return (
                                      <span key={perm} style={{
                                        background: `${cfg.color}15`, color: cfg.color,
                                        border: `1px solid ${cfg.color}30`,
                                        borderRadius: 6, fontSize: 10, fontWeight: 600,
                                        padding: "2px 7px",
                                      }}>
                                        {perm}
                                      </span>
                                    );
                                  })}
                                  {(role.permissions || []).length > 8 && (
                                    <span style={{ background: "#f8f9fe", color: "#8898aa", border: "1px solid #e0e6ed", borderRadius: 6, fontSize: 10, padding: "2px 7px" }}>
                                      +{role.permissions.length - 8} more
                                    </span>
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

        {/* ══════════ USERS TAB ══════════ */}
        {activeTab === "users" && (
          <Row>
            <Col>
              <Card className="shadow border-0" style={{ borderRadius: 16, overflow: "hidden" }}>
                <CardHeader className="bg-white border-0" style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f0f0f0" }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center" style={{ gap: 8 }}>
                      <span style={{ fontWeight: 700, color: "#32325d", fontSize: 15 }}>All Users</span>
                      <span style={{ background:"#f0f4ff",color:"#5e72e4",border:"1px solid #d0d8ff",borderRadius:999,fontSize:11,fontWeight:700,padding:"2px 9px" }}>
                        {users.length}
                      </span>
                    </div>
                    <button
                      onClick={openAddUser}
                      style={{
                        borderRadius: 8, border: "none", fontWeight: 600,
                        fontSize: 13, padding: "8px 18px", cursor: "pointer",
                        background: "linear-gradient(135deg,#2dce89,#2dcecc)",
                        color: "#fff", boxShadow: "0 4px 12px rgba(45,206,137,.3)",
                      }}
                    >
                      + Add User
                    </button>
                  </div>
                </CardHeader>

                <CardBody style={{ padding: 0 }}>
                  {loadingUsers ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" />
                    </div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#f8f9fe" }}>
                          {["#", "Name", "Email", "Role", "Actions"].map(h => (
                            <th key={h} style={{ padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "#8898aa", textAlign: "left", textTransform: "uppercase", letterSpacing: .5, borderBottom: "2px solid #e9ecef" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user, idx) => (
                          <tr key={user.id}
                            style={{ borderBottom: "1px solid #f5f5f5", background: idx % 2 === 0 ? "#fff" : "#fafbff" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"}
                            onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafbff"}
                          >
                            <td style={{ padding: "12px 16px", fontSize: 13, color: "#8898aa", fontWeight: 600 }}>{idx + 1}</td>
                            <td style={{ padding: "12px 16px" }}>
                              <div className="d-flex align-items-center" style={{ gap: 10 }}>
                                <div style={{
                                  width: 34, height: 34, borderRadius: "50%",
                                  background: "linear-gradient(135deg,#5e72e4,#825ee4)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0,
                                }}>
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontWeight: 600, fontSize: 14, color: "#32325d" }}>{user.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: 13, color: "#525f7f" }}>{user.email}</td>
                            <td style={{ padding: "12px 16px" }}>
                              <div className="d-flex flex-wrap" style={{ gap: 4 }}>
                                {(user.roles || []).map(r => <RoleBadge key={r} name={r} />)}
                              </div>
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <div className="d-flex" style={{ gap: 6 }}>
                                <button
                                  onClick={() => openEditUser(user)}
                                  style={{ borderRadius: 7, border: "1px solid #e0e6ed", background: "#f8f9fe", color: "#525f7f", padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                                >✏️ Edit</button>
                                <button
                                  onClick={() => { setDeleteTarget({ type:"user", id:user.id }); setWarnOpen(true); }}
                                  style={{ borderRadius: 7, border: "1px solid #fcc", background: "#fff0f3", color: "#f5365c", padding: "5px 10px", cursor: "pointer", fontSize: 12 }}
                                >🗑</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

      </Container>

      {/* ══════════ ROLE MODAL ══════════ */}
      {roleModal && (
        <div style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(3px)" }}>
          <div style={{ background:"#fff",borderRadius:16,width:"min(680px,95vw)",maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.2)" }}>

            {/* header */}
            <div style={{ background:"linear-gradient(135deg,#5e72e4,#825ee4)",padding:"18px 24px" }}>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center" style={{ gap: 10 }}>
                  <span style={{ fontSize: 22 }}>🛡️</span>
                  <div>
                    <div style={{ color:"#fff",fontWeight:700,fontSize:16 }}>{editRole ? "Edit Role" : "Create New Role"}</div>
                    <div style={{ color:"rgba(255,255,255,.7)",fontSize:12 }}>Assign permissions to this role</div>
                  </div>
                </div>
                <button onClick={()=>setRoleModal(false)} style={{ background:"rgba(255,255,255,.15)",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
              </div>
            </div>

            <div style={{ overflowY:"auto",padding:"20px 24px",flex:1 }}>
              {/* role name */}
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:13,fontWeight:600,color:"#525f7f",marginBottom:6,display:"block" }}>
                  Role Name <span style={{ color:"#f5365c" }}>*</span>
                </label>
                <input
                  value={roleName}
                  onChange={e => setRoleName(e.target.value)}
                  placeholder="e.g. receptionist"
                  style={iS} onFocus={onFocus} onBlur={onBlur}
                />
              </div>

              {/* permissions by module */}
              <SectionHeading icon="🔑" title="Permissions" />
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                {Object.entries(permissions).map(([module, perms]) => {
                  const cfg = MODULES[module] || { label: module, icon: "🔧", color: "#8898aa" };
                  const modulePerms = Array.isArray(perms) ? perms : Object.values(perms);
                  const allSelected = modulePerms.every(p => selectedPerms.includes(p));
                  const someSelected = modulePerms.some(p => selectedPerms.includes(p));

                  return (
                    <div key={module} style={{ border:"1px solid #e9ecf3",borderRadius:10,overflow:"hidden" }}>
                      {/* module header */}
                      <div
                        onClick={() => toggleModule(modulePerms)}
                        style={{
                          display:"flex",alignItems:"center",gap:10,
                          padding:"10px 14px",cursor:"pointer",
                          background: allSelected ? `${cfg.color}10` : someSelected ? "#fafbff" : "#f8f9fe",
                          borderBottom: "1px solid #e9ecf3",
                        }}
                      >
                        <div style={{
                          width:28,height:28,borderRadius:7,flexShrink:0,
                          background:`${cfg.color}15`,border:`1px solid ${cfg.color}30`,
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,
                        }}>{cfg.icon}</div>
                        <span style={{ fontWeight:700,fontSize:13,color:"#32325d",flex:1 }}>{cfg.label}</span>
                        {/* module toggle */}
                        <div style={{
                          width:20,height:20,borderRadius:5,flexShrink:0,
                          border:`2px solid ${allSelected ? cfg.color : "#cbd3da"}`,
                          background: allSelected ? cfg.color : someSelected ? `${cfg.color}30` : "#fff",
                          display:"flex",alignItems:"center",justifyContent:"center",
                        }}>
                          {allSelected && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
                          {someSelected && !allSelected && <div style={{ width:8,height:2,background:cfg.color,borderRadius:1 }}/>}
                        </div>
                      </div>
                      {/* permission checkboxes */}
                      <div style={{ padding:"10px 14px",display:"flex",flexWrap:"wrap",gap:8 }}>
                        {modulePerms.map(perm => {
                          const isChecked = selectedPerms.includes(perm);
                          const action = perm.split(".")[1];
                          return (
                            <label
                              key={perm}
                              onClick={() => togglePerm(perm)}
                              style={{
                                display:"inline-flex",alignItems:"center",gap:6,
                                padding:"5px 12px",borderRadius:999,cursor:"pointer",
                                border:`1px solid ${isChecked ? cfg.color : "#e0e6ed"}`,
                                background: isChecked ? `${cfg.color}12` : "#fff",
                                fontSize:12,fontWeight:isChecked?700:500,
                                color: isChecked ? cfg.color : "#525f7f",
                                transition:"all .12s",userSelect:"none",
                              }}
                            >
                              <div style={{
                                width:14,height:14,borderRadius:4,flexShrink:0,
                                border:`2px solid ${isChecked ? cfg.color : "#cbd3da"}`,
                                background: isChecked ? cfg.color : "#fff",
                                display:"flex",alignItems:"center",justifyContent:"center",
                              }}>
                                {isChecked && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
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

            {/* footer */}
            <div style={{ padding:"16px 24px",borderTop:"1px solid #f0f0f0",display:"flex",gap:10 }}>
              <button onClick={()=>setRoleModal(false)} style={{ flex:1,borderRadius:8,border:"1px solid #e0e6ed",background:"#f8f9fe",color:"#525f7f",fontWeight:600,fontSize:14,padding:"10px 0",cursor:"pointer" }}>
                Cancel
              </button>
              <button
                onClick={saveRole} disabled={savingRole}
                style={{ flex:1,borderRadius:8,border:"none",background:"linear-gradient(135deg,#5e72e4,#825ee4)",color:"#fff",fontWeight:600,fontSize:14,padding:"10px 0",cursor:"pointer",opacity:savingRole?.7:1,boxShadow:"0 4px 12px rgba(94,114,228,.3)",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}
              >
                {savingRole ? <><span className="spinner-border spinner-border-sm"/>Saving…</> : "💾 Save Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ USER MODAL ══════════ */}
      {userModal && (
        <div style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(3px)" }}>
          <div style={{ background:"#fff",borderRadius:16,width:"min(480px,95vw)",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.2)" }}>

            {/* header */}
            <div style={{ background:"linear-gradient(135deg,#2dce89,#2dcecc)",padding:"18px 24px" }}>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center" style={{ gap:10 }}>
                  <span style={{ fontSize:22 }}>👤</span>
                  <div>
                    <div style={{ color:"#fff",fontWeight:700,fontSize:16 }}>{editUser ? "Edit User" : "Add New User"}</div>
                    <div style={{ color:"rgba(255,255,255,.7)",fontSize:12 }}>Fill in user details and assign a role</div>
                  </div>
                </div>
                <button onClick={()=>setUserModal(false)} style={{ background:"rgba(255,255,255,.15)",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
              </div>
            </div>

            <div style={{ padding:"20px 24px" }}>
              {[
                { label:"Full Name",  key:"name",     type:"text",     placeholder:"Dr. John Doe" },
                { label:"Email",      key:"email",    type:"email",    placeholder:"user@lims.com" },
                { label:"Password",   key:"password", type:"password", placeholder: editUser ? "Leave blank to keep current" : "Min 8 characters" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} style={{ marginBottom:14 }}>
                  <label style={{ fontSize:13,fontWeight:600,color:"#525f7f",marginBottom:5,display:"block" }}>
                    {label} {key !== "password" && <span style={{ color:"#f5365c" }}>*</span>}
                  </label>
                  <input
                    type={type} placeholder={placeholder}
                    value={userForm[key]}
                    onChange={e => setUserForm(f => ({ ...f, [key]: e.target.value }))}
                    style={iS} onFocus={onFocus} onBlur={onBlur}
                  />
                </div>
              ))}

              {/* role select */}
              <div style={{ marginBottom:6 }}>
                <label style={{ fontSize:13,fontWeight:600,color:"#525f7f",marginBottom:5,display:"block" }}>
                  Role <span style={{ color:"#f5365c" }}>*</span>
                </label>
                <select
                  value={userForm.role}
                  onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}
                  style={iS}
                >
                  <option value="">Select a role</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ padding:"0 24px 24px",display:"flex",gap:10,borderTop:"1px solid #f0f0f0",paddingTop:16 }}>
              <button onClick={()=>setUserModal(false)} style={{ flex:1,borderRadius:8,border:"1px solid #e0e6ed",background:"#f8f9fe",color:"#525f7f",fontWeight:600,fontSize:14,padding:"10px 0",cursor:"pointer" }}>
                Cancel
              </button>
              <button
                onClick={saveUser} disabled={savingUser}
                style={{ flex:1,borderRadius:8,border:"none",background:"linear-gradient(135deg,#2dce89,#2dcecc)",color:"#fff",fontWeight:600,fontSize:14,padding:"10px 0",cursor:"pointer",boxShadow:"0 4px 12px rgba(45,206,137,.3)",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}
              >
                {savingUser ? <><span className="spinner-border spinner-border-sm"/>Saving…</> : "💾 Save User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* delete confirm */}
      <ErrorDialoge
        open={warnOpen}
        handleClose={() => setWarnOpen(false)}
        handleDelete={confirmDelete}
      />
    </>
  );
}