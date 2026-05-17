import { useEffect } from "react";
import { useForm } from "react-hook-form";
import LimsModal, { LimsModalFooter } from "./LimsModal";

const isNameField = (name = "") => /name/i.test(name);

function buildRules(field) {
  const rules = {};
  if (field.required !== false) {
    rules.required = `${field.label} is required`;
  }
  if (field.type === "email") {
    rules.pattern = {
      value: /^\S+@\S+\.\S+$/,
      message: "Enter a valid email address",
    };
  }
  if (field.type === "number") {
    rules.valueAsNumber = true;
    if (field.min != null) rules.min = { value: field.min, message: `Minimum ${field.min}` };
  }
  if (field.minLength) {
    rules.minLength = { value: field.minLength, message: `Minimum ${field.minLength} characters` };
  }
  if (field.validate) rules.validate = field.validate;
  if (isNameField(field.name)) {
    const prev = rules.validate;
    rules.validate = (val) => {
      if (prev) {
        const r = prev(val);
        if (r !== true) return r;
      }
      if (/^\d+$/.test(String(val || "").trim())) return `${field.label} cannot be only numbers`;
      return true;
    };
  }
  return rules;
}

/**
 * Form modal with react-hook-form validation.
 * fields: { name, label, type?, placeholder?, required?, options?, min?, minLength?, validate? }
 */
export default function LimsFormModal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  variant = "primary",
  fields = [],
  defaultValues = {},
  onSubmit,
  submitLabel = "Save",
  size = "md",
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onChange", defaultValues });

  useEffect(() => {
    if (open) reset(defaultValues);
  }, [open,  reset]);

  const submit = async (data) => {
    await onSubmit(data);
  };

  return (
    <LimsModal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={icon}
      variant={variant}
      size={size}
      footer={
        <LimsModalFooter
          onCancel={onClose}
          confirmLabel={submitLabel}
          saving={isSubmitting}
          confirmType="submit"
          formId="lims-form-modal"
        />
      }
    >
      <form id="lims-form-modal" onSubmit={handleSubmit(submit)} noValidate>
        {fields.map((field) => (
          <div key={field.name} className="lims-form-field">
            <label className="lims-form-label" htmlFor={field.name}>
              {field.label}
              {field.required !== false && <span className="required"> *</span>}
            </label>

            {field.type === "select" ? (
              <select
                id={field.name}
                className={`lims-form-input ${errors[field.name] ? "is-invalid" : ""}`}
                {...register(field.name, buildRules(field))}
              >
                {(field.options || []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                type={field.type || "text"}
                placeholder={field.placeholder || ""}
                className={`lims-form-input ${errors[field.name] ? "is-invalid" : ""}`}
                {...register(field.name, buildRules(field))}
              />
            )}

            {errors[field.name] && (
              <span className="lims-form-error">{errors[field.name].message}</span>
            )}
          </div>
        ))}
      </form>
    </LimsModal>
  );
}
