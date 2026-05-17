import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "api/axios";
import { showError, showSuccess, showWarning } from "utils/alert";
import LimsModal, { LimsModalFooter } from "./LimsModal";

const MODULE_META = {
  test:       { label: "Tests",       icon: "fa-solid fa-vial-circle-check", color: "#3b6cf4" },
  doctor:     { label: "Doctors",     icon: "fa-solid fa-user-doctor", color: "#0d9488" },
  patient:    { label: "Patients",    icon: "fa-solid fa-user-injured", color: "#0ea5e9" },
  commission: { label: "Commissions", icon: "fa-solid fa-coins", color: "#f59e0b" },
  report:     { label: "Reports",     icon: "fa-solid fa-file-lines", color: "#ef4444" },
  settings:   { label: "Settings",    icon: "fa-solid fa-gear", color: "#64748b" },
  user:       { label: "Users",       icon: "fa-solid fa-users", color: "#6366f1" },
  role:       { label: "Roles",       icon: "fa-solid fa-shield-halved", color: "#8b5cf6" },
};

export default function RoleFormModal({ open, editRole, allPermissions, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState([]);
  const isEdit = !!editRole;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    mode: "onChange",
    defaultValues: { roleName: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset({ roleName: editRole?.name || "" });
    setSelected(editRole?.permissions || []);
  }, [open, editRole, reset]);

  const togglePerm = (perm) =>
    setSelected((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));

  const toggleModule = (modulePerms) => {
    const allSelected = modulePerms.every((p) => selected.includes(p));
    setSelected((prev) =>
      allSelected ? prev.filter((p) => !modulePerms.includes(p)) : [...new Set([...prev, ...modulePerms])]
    );
  };

  const onSubmit = async ({ roleName }) => {
    if (!roleName?.trim()) {
      showWarning("Role name is required.");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/roles/${editRole.id}`, { name: roleName.trim(), permissions: selected });
        showSuccess("Role updated successfully.");
      } else {
        await api.post("/roles", { name: roleName.trim(), permissions: selected });
        showSuccess("Role created successfully.");
      }
      onSaved();
      onClose();
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to save role.");
    }
    setSaving(false);
  };

  return (
    <LimsModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Role" : "Create New Role"}
      subtitle="Set role name and assign permissions"
      icon="fa-solid fa-shield-halved"
      variant="primary"
      size="xl"
      footer={
        <LimsModalFooter
          onCancel={onClose}
          confirmLabel={isEdit ? "Update Role" : "Create Role"}
          saving={saving}
          confirmType="submit"
          formId="role-form-modal"
        />
      }
    >
      <form id="role-form-modal" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="lims-form-field">
          <label className="lims-form-label">Role Name <span className="required">*</span></label>
          <input
            className={`lims-form-input ${errors.roleName ? "is-invalid" : ""}`}
            placeholder="e.g. receptionist"
            {...register("roleName", {
              required: "Role name is required",
              minLength: { value: 2, message: "Min 2 characters" },
            })}
          />
          {errors.roleName && <span className="lims-form-error">{errors.roleName.message}</span>}
        </div>

        <div className="d-flex align-items-center mb-3" style={{ gap: 8 }}>
          <span className="lims-section-icon" style={{ background: "linear-gradient(135deg,#3b6cf4,#6366f1)", width: 28, height: 28, borderRadius: 8 }}>
            <i className="fa-solid fa-key text-white" style={{ fontSize: 12 }} />
          </span>
          <h6 className="lims-section-title" style={{ margin: 0 }}>Permissions</h6>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--lims-text-muted)" }}>{selected.length} selected</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Object.entries(allPermissions || {}).map(([module, perms]) => {
            const cfg = MODULE_META[module] || { label: module, icon: "fa-solid fa-wrench", color: "#64748b" };
            const modulePerms = Array.isArray(perms) ? perms : Object.values(perms);
            const allSel = modulePerms.every((p) => selected.includes(p));
            const someSel = modulePerms.some((p) => selected.includes(p));

            return (
              <div key={module} style={{ border: "1px solid var(--lims-border)", borderRadius: 10, overflow: "hidden" }}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleModule(modulePerms)}
                  onKeyDown={(e) => e.key === "Enter" && toggleModule(modulePerms)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                    cursor: "pointer", background: allSel ? `${cfg.color}10` : "#f8fafc",
                    borderBottom: "1px solid var(--lims-border)", userSelect: "none",
                  }}
                >
                  <i className={cfg.icon} style={{ color: cfg.color }} />
                  <span style={{ fontWeight: 700, fontSize: 13, flex: 1 }}>{cfg.label}</span>
                  <span style={{ fontSize: 11, color: "var(--lims-text-muted)" }}>
                    {modulePerms.filter((p) => selected.includes(p)).length}/{modulePerms.length}
                  </span>
                </div>
                <div style={{ padding: "10px 14px", display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {modulePerms.map((perm) => {
                    const checked = selected.includes(perm);
                    const action = perm.split(".")[1];
                    return (
                      <label
                        key={perm}
                        onClick={() => togglePerm(perm)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px",
                          borderRadius: 999, cursor: "pointer",
                          border: `1px solid ${checked ? cfg.color : "var(--lims-border)"}`,
                          background: checked ? `${cfg.color}12` : "#fff",
                          fontSize: 12, fontWeight: checked ? 700 : 500,
                          color: checked ? cfg.color : "var(--lims-text-secondary)",
                        }}
                      >
                        {action}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </form>
    </LimsModal>
  );
}
