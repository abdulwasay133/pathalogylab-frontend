import React from "react";
import { useForm } from "react-hook-form";
import "./FormModal.css";

function FormModal({ title, type, fields, onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <div className="form-backdrop">
      <div className="form-modal">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={`form-modal-header ${type}`}>{title}</div>

          <div className="form-modal-body">
            {fields.map((field, idx) => (
              <div className="form-group" key={idx}>
                <label className="form-label">{field.label}</label>
                <input
                  className={`form-control ${errors[field.name] ? "is-invalid" : ""}`}
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  {...register(field.name, { required: `${field.label} is required` })}
                />
                {errors[field.name] && (
                  <span style={{ color: "var(--danger)", fontSize: "12px" }}>
                    {errors[field.name].message}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="form-modal-footer px-3 pb-3">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormModal;