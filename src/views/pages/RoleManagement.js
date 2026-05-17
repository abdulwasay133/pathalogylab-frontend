import api from "api/axios";
import ErrorDialoge from "components/dialogs/ErrorDialoge";
import { useEffect, useState } from "react";
import { toast } from "utils/toast";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Row,
} from "reactstrap";

/* ── permission module config ── */
const MODULES = {
  test: { label: "Tests", icon: "🧪", color: "#5e72e4" },
  doctor: { label: "Doctors", icon: "👨‍⚕️", color: "#2dce89" },
  patient: { label: "Patients", icon: "🏥", color: "#11cdef" },
  commission: { label: "Commissions", icon: "💰", color: "#fb6340" },
  report: { label: "Reports", icon: "📄", color: "#f5365c" },
  settings: { label: "Settings", icon: "⚙️", color: "#8898aa" },
  user: { label: "Users", icon: "👤", color: "#825ee4" },
  role: { label: "Roles", icon: "🛡️", color: "#fbb140" },
};

const ROLE_COLORS = {
  admin: { bg: "#fff0f3", color: "#f5365c", border: "#fcc" },
  lab: { bg: "#f0faf5", color: "#1aae6f", border: "#b7ebd9" },
  doctor: { bg: "#f0f4ff", color: "#5e72e4", border: "#d0d8ff" },
  receptionist: {
    bg: "#fff8f0",
    color: "#fb6340",
    border: "#ffd4c0",
  },
};

const getRoleStyle = (name) =>
  ROLE_COLORS[name] || {
    bg: "#f8f9fe",
    color: "#525f7f",
    border: "#e0e6ed",
  };

const RoleBadge = ({ name }) => {
  const s = getRoleStyle(name);

  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      🛡 {name}
    </span>
  );
};

const Tab = ({ label, icon, active, onClick, count }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 7,
      padding: "9px 18px",
      borderRadius: 9,
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: active ? 700 : 500,
      background: active
        ? "linear-gradient(135deg,#5e72e4,#825ee4)"
        : "#f8f9fe",
      color: active ? "#fff" : "#525f7f",
      boxShadow: active
        ? "0 4px 12px rgba(94,114,228,.3)"
        : "none",
      transition: "all .15s",
    }}
  >
    <span>{icon}</span>
    {label}

    {count !== undefined && (
      <span
        style={{
          background: active
            ? "rgba(255,255,255,.25)"
            : "#e9ecef",
          color: active ? "#fff" : "#525f7f",
          borderRadius: 999,
          fontSize: 10,
          fontWeight: 700,
          padding: "1px 7px",
        }}
      >
        {count}
      </span>
    )}
  </button>
);

const SectionHeading = ({ icon, title }) => (
  <div
    className="d-flex align-items-center mb-3"
    style={{ gap: 8 }}
  >
    <span
      style={{
        width: 28,
        height: 28,
        borderRadius: 7,
        background:
          "linear-gradient(135deg,#5e72e4,#825ee4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
      }}
    >
      {icon}
    </span>

    <h6
      className="mb-0 text-muted"
      style={{
        letterSpacing: 1,
        fontSize: 11,
        textTransform: "uppercase",
      }}
    >
      {title}
    </h6>
  </div>
);

const iS = {
  borderRadius: 8,
  border: "1px solid #e0e6ed",
  padding: "9px 13px",
  fontSize: 14,
  color: "#32325d",
  background: "#fff",
  width: "100%",
  outline: "none",
  transition: "border .15s, box-shadow .15s",
  boxSizing: "border-box",
};

const onFocus = (e) => {
  e.target.style.border = "1px solid #5e72e4";
  e.target.style.boxShadow =
    "0 0 0 3px rgba(94,114,228,.1)";
};

const onBlur = (e) => {
  e.target.style.border = "1px solid #e0e6ed";
  e.target.style.boxShadow = "none";
};

export default function RoleManagement() {
  const [activeTab, setActiveTab] =
    useState("roles");

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] =
    useState({});
  const [loadingRoles, setLoadingRoles] =
    useState(false);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] =
    useState(false);

  const [roleModal, setRoleModal] =
    useState(false);
  const [editRole, setEditRole] =
    useState(null);
  const [roleName, setRoleName] =
    useState("");
  const [selectedPerms, setSelectedPerms] =
    useState([]);
  const [savingRole, setSavingRole] =
    useState(false);

  const [userModal, setUserModal] =
    useState(false);
  const [editUser, setEditUser] =
    useState(null);

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [savingUser, setSavingUser] =
    useState(false);

  const [warnOpen, setWarnOpen] =
    useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const fetchRoles = async () => {
    setLoadingRoles(true);

    try {
      const [rolesRes, permsRes] =
        await Promise.all([
          api.get("/roles"),
          api.get("/permissions"),
        ]);

      setRoles(rolesRes.data);
      setPermissions(permsRes.data);
    } catch {
      toast.error("Failed to load roles.");
    }

    setLoadingRoles(false);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);

    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users.");
    }

    setLoadingUsers(false);
  };

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const openAddUser = () => {
    setEditUser(null);

    setUserForm({
      name: "",
      email: "",
      password: "",
      role: "",
    });

    setUserModal(true);
  };

  const saveUser = async () => {
    if (
      !userForm.name ||
      !userForm.email ||
      !userForm.role
    ) {
      toast.warning(
        "Name, email and role are required."
      );
      return;
    }

    if (!editUser && !userForm.password) {
      toast.warning(
        "Password is required for new users."
      );
      return;
    }

    setSavingUser(true);

    try {
      if (editUser) {
        await api.put(
          `/users/${editUser.id}`,
          userForm
        );

        toast.success(
          "User updated successfully."
        );
      } else {
        await api.post("/users", userForm);

        toast.success(
          "User created successfully."
        );
      }

      setUserModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to save user."
      );
    }

    setSavingUser(false);
  };

  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8" />

      <Container className="mt--9" fluid>
        <Row className="mb-4">
          <Col>
            <Card
              className="shadow border-0"
              style={{ borderRadius: 16 }}
            >
              <CardBody
                style={{
                  padding: "1.25rem 1.5rem",
                }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <h3
                    className="mb-0"
                    style={{
                      fontWeight: 700,
                      color: "#32325d",
                    }}
                  >
                    Roles & Permissions
                  </h3>

                  <div
                    className="d-flex"
                    style={{ gap: 8 }}
                  >
                    <Tab
                      icon="🛡️"
                      label="Roles"
                      active={
                        activeTab === "roles"
                      }
                      count={roles.length}
                      onClick={() =>
                        setActiveTab("roles")
                      }
                    />

                    <Tab
                      icon="👤"
                      label="Users"
                      active={
                        activeTab === "users"
                      }
                      count={users.length}
                      onClick={() =>
                        setActiveTab("users")
                      }
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {activeTab === "users" && (
          <Row>
            <Col>
              <Card
                className="shadow border-0"
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                <CardHeader
                  className="bg-white border-0"
                  style={{
                    padding: "1.25rem 1.5rem",
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#32325d",
                      }}
                    >
                      All Users
                    </span>

                    <button
                      onClick={openAddUser}
                      style={{
                        borderRadius: 8,
                        border: "none",
                        fontWeight: 600,
                        fontSize: 13,
                        padding: "8px 18px",
                        cursor: "pointer",
                        background:
                          "linear-gradient(135deg,#2dce89,#2dcecc)",
                        color: "#fff",
                        boxShadow:
                          "0 4px 12px rgba(45,206,137,.3)",
                      }}
                    >
                      + Add User
                    </button>
                  </div>
                </CardHeader>

                <CardBody>
                  {loadingUsers ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" />
                    </div>
                  ) : (
                    <table
                      style={{
                        width: "100%",
                        borderCollapse:
                          "collapse",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            background:
                              "#f8f9fe",
                          }}
                        >
                          <th
                            style={{
                              padding:
                                "11px 16px",
                            }}
                          >
                            Name
                          </th>

                          <th
                            style={{
                              padding:
                                "11px 16px",
                            }}
                          >
                            Email
                          </th>

                          <th
                            style={{
                              padding:
                                "11px 16px",
                            }}
                          >
                            Role
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td
                              style={{
                                padding:
                                  "12px 16px",
                              }}
                            >
                              {user.name}
                            </td>

                            <td
                              style={{
                                padding:
                                  "12px 16px",
                              }}
                            >
                              {user.email}
                            </td>

                            <td
                              style={{
                                padding:
                                  "12px 16px",
                              }}
                            >
                              {(user.roles ||
                                []).map(
                                (r) => (
                                  <RoleBadge
                                    key={r}
                                    name={r}
                                  />
                                )
                              )}
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

      {/* USER MODAL */}
      {userModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background:
              "rgba(0,0,0,.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "min(480px,95vw)",
              overflow: "hidden",
              boxShadow:
                "0 20px 60px rgba(0,0,0,.2)",
            }}
          >
            <div
              style={{
                background:
                  "linear-gradient(135deg,#2dce89,#2dcecc)",
                padding: "18px 24px",
              }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div
                    style={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    Add New User
                  </div>
                </div>

                <button
                  onClick={() =>
                    setUserModal(false)
                  }
                  style={{
                    background:
                      "rgba(255,255,255,.15)",
                    border: "none",
                    borderRadius: 8,
                    width: 32,
                    height: 32,
                    cursor: "pointer",
                    color: "#fff",
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            <div
              style={{
                padding: "20px 24px",
              }}
            >
              <input
                placeholder="Name"
                value={userForm.name}
                onChange={(e) =>
                  setUserForm((f) => ({
                    ...f,
                    name:
                      e.target.value,
                  }))
                }
                style={{
                  ...iS,
                  marginBottom: 12,
                }}
                onFocus={onFocus}
                onBlur={onBlur}
              />

              <input
                placeholder="Email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm((f) => ({
                    ...f,
                    email:
                      e.target.value,
                  }))
                }
                style={{
                  ...iS,
                  marginBottom: 12,
                }}
                onFocus={onFocus}
                onBlur={onBlur}
              />

              <input
                type="password"
                placeholder="Password"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm((f) => ({
                    ...f,
                    password:
                      e.target.value,
                  }))
                }
                style={{
                  ...iS,
                  marginBottom: 12,
                }}
                onFocus={onFocus}
                onBlur={onBlur}
              />

              <select
                value={userForm.role}
                onChange={(e) =>
                  setUserForm((f) => ({
                    ...f,
                    role:
                      e.target.value,
                  }))
                }
                style={iS}
              >
                <option value="">
                  Select Role
                </option>

                {roles.map((r) => (
                  <option
                    key={r.id}
                    value={r.name}
                  >
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                padding: "0 24px 24px",
                display: "flex",
                gap: 10,
              }}
            >
              <button
                onClick={() =>
                  setUserModal(false)
                }
                style={{
                  flex: 1,
                  borderRadius: 8,
                  border:
                    "1px solid #e0e6ed",
                  background:
                    "#f8f9fe",
                  color: "#525f7f",
                  fontWeight: 600,
                  padding: "10px 0",
                }}
              >
                Cancel
              </button>

              <button
                onClick={saveUser}
                disabled={savingUser}
                style={{
                  flex: 1,
                  borderRadius: 8,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#2dce89,#2dcecc)",
                  color: "#fff",
                  fontWeight: 600,
                  padding: "10px 0",
                  cursor: "pointer",
                  opacity: savingUser
                    ? 0.7
                    : 1,
                  boxShadow:
                    "0 4px 12px rgba(45,206,137,.3)",
                }}
              >
                {savingUser
                  ? "Saving..."
                  : "Save User"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ErrorDialoge
        open={warnOpen}
        handleClose={() =>
          setWarnOpen(false)
        }
        handleDelete={() => {}}
      />
    </>
  );
}