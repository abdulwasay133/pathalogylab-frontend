import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "api/axios";
import { showError, showSuccess } from "utils/alert";
import LimsModal, { LimsModalFooter } from "./LimsModal";

export default function UserFormModal({
  open,
  editUser,
  roles,
  onClose,
  onSaved,
}) {
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const isEdit = !!editUser;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      role: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    reset(
      editUser
        ? {
            name: editUser.name || "",
            email: editUser.email || "",
            role: editUser.roles?.[0] || "",
            password: "",
          }
        : {
            name: "",
            email: "",
            role: "",
            password: "",
          }
    );
  }, [open, editUser, reset]);

  const onSubmit = async (data) => {
    setSaving(true);

    try {
      // Remove empty password in edit mode
      if (isEdit && !data.password) {
        delete data.password;
      }

      if (isEdit) {
        await api.put(`/users/${editUser.id}`, data);
        showSuccess("User updated successfully.");
      } else {
        await api.post("/users", data);
        showSuccess("User created successfully.");
      }

      onSaved();
      onClose();
    } catch (err) {
      showError(
        err?.response?.data?.message || "Failed to save user."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <LimsModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit User" : "Add New User"}
      subtitle={
        isEdit
          ? `Editing ${editUser?.name}`
          : "Fill details and assign a role"
      }
      icon={
        isEdit
          ? "fa-solid fa-user-pen"
          : "fa-solid fa-user-plus"
      }
      variant={isEdit ? "warning" : "success"}
      size="md"
      footer={
        <LimsModalFooter
          onCancel={onClose}
          confirmLabel={
            isEdit ? "Update User" : "Create User"
          }
          saving={saving}
          confirmType="submit"
          formId="user-form-modal"
        />
      }
    >
      <form
        id="user-form-modal"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {/* Name */}
        <div className="lims-form-field">
          <label className="lims-form-label">
            Full Name <span className="required">*</span>
          </label>

          <input
            className={`lims-form-input ${
              errors.name ? "is-invalid" : ""
            }`}
            placeholder="e.g. Dr. John Doe"
            {...register("name", {
              required: "Name is required",
              minLength: {
                value: 3,
                message: "Minimum 3 characters",
              },
            })}
          />

          {errors.name && (
            <span className="lims-form-error">
              {errors.name.message}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="lims-form-field">
          <label className="lims-form-label">
            Email <span className="required">*</span>
          </label>

          <input
            type="email"
            className={`lims-form-input ${
              errors.email ? "is-invalid" : ""
            }`}
            placeholder="user@lims.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Enter a valid email",
              },
            })}
          />

          {errors.email && (
            <span className="lims-form-error">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Password */}
        <div className="lims-form-field">
          <label className="lims-form-label">
            Password{" "}
            {!isEdit && (
              <span className="required">*</span>
            )}

            {isEdit && (
              <span
                style={{
                  fontWeight: 400,
                  color: "var(--lims-text-muted)",
                }}
              >
                {" "}
                (leave blank to keep current password)
              </span>
            )}
          </label>

          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              className={`lims-form-input ${
                errors.password ? "is-invalid" : ""
              }`}
              style={{ paddingRight: 40 }}
              placeholder={
                isEdit
                  ? "••••••••"
                  : "Minimum 8 characters"
              }
              {...register("password", {
                ...(!isEdit && {
                  required: "Password is required",
                }),
                minLength: {
                  value: 8,
                  message: "Minimum 8 characters",
                },
              })}
            />

            <button
              type="button"
              onClick={() => setShowPass((prev) => !prev)}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--lims-text-muted)",
              }}
            >
              <i
                className={
                  showPass
                    ? "fa-solid fa-eye-slash"
                    : "fa-solid fa-eye"
                }
              />
            </button>
          </div>

          {errors.password && (
            <span className="lims-form-error">
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Role */}
        <div className="lims-form-field">
          <label className="lims-form-label">
            Role <span className="required">*</span>
          </label>

          <select
            className={`lims-form-input ${
              errors.role ? "is-invalid" : ""
            }`}
            {...register("role", {
              required: "Please select a role",
            })}
          >
            <option value="">— Select a role —</option>

            {roles?.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>

          {errors.role && (
            <span className="lims-form-error">
              {errors.role.message}
            </span>
          )}
        </div>
      </form>
    </LimsModal>
  );
}