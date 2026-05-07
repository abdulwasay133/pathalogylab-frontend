import api from "api/axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Card, CardBody, CardHeader, Container, Row } from "reactstrap";

/* ── reusable field wrapper ── */
const Field = ({ label, required, error, children }) => (
  <div className="col-md-6 mb-4">
    <label style={{
      fontSize: 13, fontWeight: 600, color: "#525f7f",
      marginBottom: 6, display: "block",
    }}>
      {label} {required && <span style={{ color: "#f5365c" }}>*</span>}
    </label>
    {children}
    {error && (
      <small style={{ color: "#f5365c", fontSize: 11, marginTop: 4, display: "block" }}>
        ⚠ {error}
      </small>
    )}
  </div>
);

const inputStyle = {
  borderRadius: 8, border: "1px solid #e0e6ed",
  padding: "10px 14px", fontSize: 14, color: "#32325d",
  background: "#fff", width: "100%", outline: "none",
  transition: "border .15s, box-shadow .15s",
};

const inputFocus = (e) => {
  e.target.style.border = "1px solid #5e72e4";
  e.target.style.boxShadow = "0 0 0 3px rgba(94,114,228,.1)";
};
const inputBlur = (e) => {
  e.target.style.border = "1px solid #e0e6ed";
  e.target.style.boxShadow = "none";
};
const inputError = { border: "1px solid #f5365c" };

/* ═══════════════════════════════════════ */

function AddDoctor() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const isEdit     = Boolean(id);

  const [specializations, setSpecializations] = useState([]);
  const [specInput, setSpecInput]             = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm({ mode: "onChange", reValidateMode: "onChange" });

  /* ── specialization tag input ── */
  const handleSpecKeyDown = (e) => {
    if (e.key === "Enter" && specInput.trim()) {
      e.preventDefault();
      if (!specializations.includes(specInput.trim())) {
        setSpecializations((prev) => [...prev, specInput.trim()]);
      }
      setSpecInput("");
    }
  };

  const removeSpec = (i) =>
    setSpecializations((prev) => prev.filter((_, idx) => idx !== i));

  /* ── fetch doctor for edit ── */
  const fetchDoctor = async () => {
    try {
      const res    = await api.get(`/doctors/${id}`);
      const doctor = res.data.data;
      setValue("doctor_name",  doctor.name);
      setValue("email",        doctor.email);
      setValue("phone",        doctor.phone);
      setValue("qualification",doctor.qualifications);
      setValue("gender",       doctor.gender);
      setValue("commission",   doctor.commission_percentage);
      setValue("address",      doctor.address);
      if (doctor.speciality) setSpecializations(doctor.speciality);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load doctor data.");
    }
  };

  useEffect(() => { if (id) fetchDoctor(); }, [id]);

  /* ── submit ── */
  const onSubmit = async (data) => {
    try {
      const payload = { ...data, specializations };
      const res = id
        ? await api.put(`/doctors/${id}`, payload)
        : await api.post("/doctors", payload);
      toast.success(res.data.message || `Doctor ${isEdit ? "updated" : "added"} successfully.`);
      navigate("/admin/doctors-management");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  /* ── render ── */
  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8" />

      <Container className="mt--9" fluid>
        <Row>
          <div className="col">
            <Card className="shadow border-0" style={{ borderRadius: 16, overflow: "hidden" }}>

              {/* ── Header ── */}
              <CardHeader
                className="bg-white border-0"
                style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f0f0f0" }}
              >
                <div className="d-flex align-items-center justify-content-between flex-wrap" style={{ gap: 12 }}>
                  <div className="d-flex align-items-center" style={{ gap: 10 }}>
                    <span style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: isEdit
                        ? "linear-gradient(135deg,#fb6340,#fbb140)"
                        : "linear-gradient(135deg,#2dce89,#2dcecc)",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 18,
                    }}>
                      <i className={isEdit ? "fa-solid fa-pen-to-square text-white" : "fa-solid fa-stethoscope text-white"} />
                    </span>
                    <div>
                      <h3 className="mb-0" style={{ fontWeight: 700, color: "#32325d" }}>
                        {isEdit ? "Update Doctor" : "Add New Doctor"}
                      </h3>
                      <p className="mb-0" style={{ fontSize: 12, color: "#8898aa" }}>
                        {isEdit ? `Editing Doctor ID #${id}` : "Fill in the details to register a new doctor"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    style={{
                      borderRadius: 8, fontWeight: 600, fontSize: 13,
                      background: "#f8f9fe", border: "1px solid #e0e6ed",
                      color: "#525f7f", padding: "7px 16px", cursor: "pointer",
                    }}
                    onClick={() => navigate("/admin/doctors-management")}
                  >
                    ← Back to Doctors
                  </button>
                </div>
              </CardHeader>

              {/* ── Body ── */}
              <CardBody style={{ padding: "2rem 1.75rem" }}>
                <form onSubmit={handleSubmit(onSubmit)}>

                  {/* ─ Personal Info ─ */}
                  <SectionLabel icon="fa-solid fa-user text-white" title="PERSONAL INFORMATION" />
                  <div className="row mb-2">

                    <Field label="Doctor Name" required error={errors.doctor_name?.message}>
                      <input
                        type="text"
                        placeholder="e.g. Dr. John Doe"
                        style={errors.doctor_name ? { ...inputStyle, ...inputError } : inputStyle}
                        onFocus={inputFocus} onBlur={inputBlur}
                        {...register("doctor_name", {
                          required: "Doctor name is required",
                          minLength: { value: 3, message: "Minimum 3 characters" },
                        })}
                      />
                    </Field>

                    <Field label="Email Address" required error={errors.email?.message}>
                      <input
                        type="email"
                        placeholder="doctor@example.com"
                        style={errors.email ? { ...inputStyle, ...inputError } : inputStyle}
                        onFocus={inputFocus} onBlur={inputBlur}
                        {...register("email", {
                          required: "Email is required",
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
                        })}
                      />
                    </Field>

                    <Field label="Phone Number" required error={errors.phone?.message}>
                      <input
                        type="text"
                        placeholder="0300-0000000"
                        style={errors.phone ? { ...inputStyle, ...inputError } : inputStyle}
                        onFocus={inputFocus} onBlur={inputBlur}
                        {...register("phone", { required: "Phone number is required" })}
                      />
                    </Field>

                    <Field label="Qualification" required error={errors.qualification?.message}>
                      <input
                        type="text"
                        placeholder="e.g. MBBS, MD"
                        style={errors.qualification ? { ...inputStyle, ...inputError } : inputStyle}
                        onFocus={inputFocus} onBlur={inputBlur}
                        {...register("qualification", { required: "Qualification is required" })}
                      />
                    </Field>

                    <Field label="Gender" required error={errors.gender?.message}>
                      <select
                        style={errors.gender ? { ...inputStyle, ...inputError } : inputStyle}
                        {...register("gender", { required: "Gender is required" })}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </Field>

                  </div>

                  <hr style={{ borderColor: "#f0f0f0", margin: "0.5rem 0 1.5rem" }} />

                  {/* ─ Specializations ─ */}
                  <SectionLabel icon="fa-solid fa-suitcase text-white" title="SPECIALIZATIONS" />
                  <div className="row mb-2">
                    <div className="col-12 mb-4">
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#525f7f", marginBottom: 6, display: "block" }}>
                        Specializations
                        <span style={{ fontSize: 11, color: "#8898aa", fontWeight: 400, marginLeft: 8 }}>
                          (Type and press Enter to add)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={specInput}
                        onChange={(e) => setSpecInput(e.target.value)}
                        onKeyDown={handleSpecKeyDown}
                        placeholder="e.g. Cardiology, Neurology…"
                        style={inputStyle}
                        onFocus={inputFocus} onBlur={inputBlur}
                      />
                      {/* tags */}
                      {specializations.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                          {specializations.map((spec, i) => (
                            <span key={i} style={{
                              display: "inline-flex", alignItems: "center", gap: 6,
                              background: "#e8f4fd", color: "#1976d2",
                              padding: "5px 12px", borderRadius: 999,
                              fontSize: 13, fontWeight: 600,
                              border: "1px solid #bde0fa",
                            }}>
                              {spec}
                              <button
                                type="button"
                                onClick={() => removeSpec(i)}
                                style={{
                                  background: "transparent", border: "none",
                                  color: "#1976d2", cursor: "pointer",
                                  fontWeight: 700, fontSize: 15, lineHeight: 1,
                                  padding: 0,
                                }}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <hr style={{ borderColor: "#f0f0f0", margin: "0.5rem 0 1.5rem" }} />

                  {/* ─ Commission & Address ─ */}
                  <SectionLabel icon="fa-solid fa-location-dot text-white" title="COMMISSION & ADDRESS" />
                  <div className="row mb-2">

                    <div className="col-md-6 mb-4">
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#525f7f", marginBottom: 6, display: "block" }}>
                        Commission Percentage <span style={{ color: "#f5365c" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="number"
                          placeholder="0"
                          style={errors.commission
                            ? { ...inputStyle, ...inputError, paddingRight: 40 }
                            : { ...inputStyle, paddingRight: 40 }}
                          onFocus={inputFocus} onBlur={inputBlur}
                          {...register("commission", {
                            required: "Commission is required",
                            valueAsNumber: true,
                            min: { value: 0,   message: "Minimum is 0%"   },
                            max: { value: 100, message: "Maximum is 100%" },
                          })}
                        />
                        <span style={{
                          position: "absolute", right: 12, top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: 14, fontWeight: 700, color: "#8898aa",
                          pointerEvents: "none",
                        }}>%</span>
                      </div>
                      {errors.commission && (
                        <small style={{ color: "#f5365c", fontSize: 11, marginTop: 4, display: "block" }}>
                          ⚠ {errors.commission.message}
                        </small>
                      )}

                      {/* info hint */}
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        marginTop: 10, padding: "9px 12px", borderRadius: 8,
                        background: "#fff8e1", border: "1px solid #ffe082",
                        color: "#856404", fontSize: 12,
                      }}>
                        <span>⚠️</span>
                        <span>Enter commission between <strong>0%</strong> and <strong>100%</strong></span>
                      </div>
                    </div>

                    <div className="col-md-12 mb-4">
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#525f7f", marginBottom: 6, display: "block" }}>
                        Address <span style={{ color: "#f5365c" }}>*</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Full address…"
                        style={errors.address
                          ? { ...inputStyle, resize: "vertical", ...inputError }
                          : { ...inputStyle, resize: "vertical" }}
                        onFocus={inputFocus} onBlur={inputBlur}
                        {...register("address", { required: "Address is required" })}
                      />
                      {errors.address && (
                        <small style={{ color: "#f5365c", fontSize: 11, marginTop: 4, display: "block" }}>
                          ⚠ {errors.address.message}
                        </small>
                      )}
                    </div>

                  </div>

                  {/* ── Action buttons ── */}
                  <hr style={{ borderColor: "#f0f0f0", margin: "0.5rem 0 1.5rem" }} />
                  <div className="d-flex align-items-center" style={{ gap: 12 }}>
                    <button
                      type="submit"
                      disabled={!isValid || isSubmitting}
                      style={{
                        borderRadius: 8, fontWeight: 600, fontSize: 14,
                        padding: "10px 32px", border: "none",
                        background: isEdit
                          ? "linear-gradient(135deg,#fb6340,#fbb140)"
                          : "linear-gradient(135deg,#2dce89,#2dcecc)",
                        color: "#fff", cursor: (!isValid || isSubmitting) ? "not-allowed" : "pointer",
                        boxShadow: isEdit
                          ? "0 4px 12px rgba(251,99,64,.35)"
                          : "0 4px 12px rgba(45,206,137,.35)",
                        opacity: (!isValid || isSubmitting) ? 0.65 : 1,
                        transition: "opacity .2s",
                        display: "flex", alignItems: "center", gap: 8,
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" />
                          Submitting…
                        </>
                      ) : (
                        isEdit ? "Update Doctor" : "Add Doctor"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/admin/doctors-management")}
                      style={{
                        borderRadius: 8, fontWeight: 600, fontSize: 14,
                        padding: "10px 24px", cursor: "pointer",
                        background: "#f8f9fe", border: "1px solid #e0e6ed", color: "#525f7f",
                      }}
                    >
                      Cancel
                    </button>
                  </div>

                </form>
              </CardBody>
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
}

/* ── section label helper ── */
function SectionLabel({ icon, title }) {
  return (
    <div className="d-flex align-items-center mb-3" style={{ gap: 8 }}>
      <span style={{
        width: 28, height: 28, borderRadius: 7,
        background: "linear-gradient(135deg,#5e72e4,#825ee4)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
      }}><i className={icon}></i></span>
      <h6 className="mb-0 text-muted" style={{ letterSpacing: 1, fontSize: 11 }}>{title}</h6>
    </div>
  );
}

export default AddDoctor;